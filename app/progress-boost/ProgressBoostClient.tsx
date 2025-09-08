"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, Target, Trophy, RefreshCw, CheckCircle2, XCircle, SkipForward } from "lucide-react"
import { toast } from "sonner"

import type { Question, ProgressBoostPlanRow, ProgressMaps, DbQuestionResult, RawPlanRow, DbMatchingQuestion, Answer } from "@/lib/types"
import { MultipleChoiceQuestion } from "@/components/question-components/question-type/multiple-choice-question"
import { FillInTheBlankQuestion } from "@/components/question-components/question-type/fill-in-the-blank-question"
import { TextQuestion } from "@/components/question-components/question-type/text-question"
import { CodeQuestion } from "@/components/question-components/question-type/code-question"
import { MatchingQuestion } from "@/components/question-components/question-type/matching-question"
import { TrueFalseQuestion } from "@/components/question-components/question-type/true-false-question"
import { EssayQuestion } from "@/components/question-components/question-type/essay-question"
import { SelfAssessment } from "@/components/question-components/self-assessment"
import { FeedbackDisplay } from "@/components/question-components/feedback-display"

import Link from "next/link"

// ---- Utils ----
import { PROGRESS_BOOST_RULES, NEW_DAYS, MID_DAYS, thisWeekBoundsLondon } from "@/lib/progressBoost"

// ---------- Types ----------
type ScoreType = "green" | "amber" | "red"

// Use the imported type instead of local definition

// Normalize backend question type strings to the UI’s canonical set
function normalizeQuestionType(raw: string | null | undefined): Question["type"] {
    const t = String(raw || "").toLowerCase()
    if (t === "multiple_choice" || t === "multiple-choice") return "multiple-choice"
    if (t === "fill_in_the_blank" || t === "fill-in-the-blank" || t === "fitb") return "fill-in-the-blank"
    if (t === "true_false" || t === "true-false") return "true-false"
    if (t === "short-answer" || t === "short_answer" || t === "text") return "text"
    if (t === "essay") return "essay"
    if (t === "matching") return "matching"
    if (t === "code" || t === "coding") return "code"
    if (t === "algorithm") return "algorithm"
    if (t === "sql") return "sql"
    return t as Question["type"]
}

const explain = (e: unknown) => {
    if (e instanceof Error) return e.message
    if (typeof e === "object" && e) {
        try { return JSON.stringify(e, null, 2) } catch { }
    }
    return String(e)
}

const toISODate = (d: Date) => d.toISOString().slice(0, 10)
const getNum = (m: Record<string, number> | undefined, k: string) => Number((m && m[k]) ?? 0)

// Coerce arbitrary RPC rows into our strict PlanRow shape (narrow literal unions)
function normalizePlanRows(raw: RawPlanRow[]): ProgressBoostPlanRow[] {
    return (raw || []).map((r) => {
        const s = r?.status;
        const status: ProgressBoostPlanRow["status"] =
            s === "pending" || s === "answered" || s === "skipped" ? s : "pending";
        const b = r?.bucket;
        const bucket: ProgressBoostPlanRow["bucket"] = b === "new" || b === "mid" || b === "old" ? b : "new";
        return {
            week_id: String(r.week_id),
            target_counts: (r.target_counts ?? {}) as Record<string, number>,
            item_id: String(r.item_id),
            question_id: String(r.question_id),
            bucket,
            difficulty: String(r.difficulty),
            order_index: Number(r.order_index ?? 0),
            status,
        };
    });
}

// Find the next index to show: prefer pending (forward, circular), then skipped
function findNextIndex(from: number, rows: ProgressBoostPlanRow[]): number {
    const n = rows.length
    if (n === 0) return -1
    // scan forward circularly for the next pending
    for (let step = 1; step <= n; step++) {
        const idx = (from + step) % n
        if (rows[idx]?.status === "pending") return idx
    }
    // if none pending, scan for skipped
    for (let step = 1; step <= n; step++) {
        const idx = (from + step) % n
        if (rows[idx]?.status === "skipped") return idx
    }
    return -1
}

export default function ProgressBoostClient() {
    const supabase = createClient()
    const router = useRouter()

    // --- Auth & class context ---
    const [authLoading, setAuthLoading] = useState(true)
    const [isAllowed, setIsAllowed] = useState(false)
    const [classId, setClassId] = useState<string>("")

    // --- Plan & questions ---
    const [plan, setPlan] = useState<ProgressBoostPlanRow[]>([])
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    // --- Progress + UI state ---
    const [loading, setLoading] = useState(true)
    const [completed, setCompleted] = useState(false)
    const [answerId, setAnswerId] = useState<string | null>(null)
    const [autoScore, setAutoScore] = useState<ScoreType | null>(null)
    const [selfScore, setSelfScore] = useState<ScoreType | null>(null)
    const [answerPayload, setAnswerPayload] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [progressMaps, setProgressMaps] = useState<ProgressMaps>({ done: {}, target: {} })

    const [isFinalQuestion, setIsFinalQuestion] = useState(false)

    // ------------- Auth bootstrap -------------
    useEffect(() => {
        const run = async () => {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error || !user) {
                router.replace("/login")
                return
            }

            // Teacher? send home
            const { data: profile } = await supabase
                .from("profiles")
                .select("user_type")
                .eq("userid", user.id)
                .single()

            if (profile?.user_type?.startsWith("teacher")) {
                router.replace("/")
                return
            }

            // Find the class
            const { data: memberships, error: mErr } = await supabase
                .from("class_members")
                .select("class_id")
                .eq("student_id", user.id)

            if (mErr) {
                toast.error("Failed to load classes: " + explain(mErr))
                return
            }

            if (!memberships || memberships.length === 0) {
                setIsAllowed(true)
                setAuthLoading(false)
                setLoading(false)
                toast("You’re not enrolled in a class yet.")
                return
            }

            setClassId(memberships[0].class_id)
            setIsAllowed(true)
            setAuthLoading(false)
        }

        run()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ------------- Fetch (or create) this week's frozen plan -------------
    useEffect(() => {
        if (!isAllowed || !classId) return
        void fetchWeek()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAllowed, classId])

    const recomputeProgressFromPlan = (rows: ProgressBoostPlanRow[]) => {
        if (!rows || rows.length === 0) {
            setProgressMaps({ done: {}, target: {} })
            setCompleted(false)
            return
        }
        // target from the week header (identical on every row)
        const target = rows[0].target_counts || {}

        // count done per (difficulty:bucket)
        const done: Record<string, number> = {}
        for (const r of rows) {
            if (r.status === "answered") {
                const key = `${r.difficulty}:${r.bucket}`
                done[key] = (done[key] || 0) + 1
            }
        }

        setProgressMaps({ done, target })

        const totalDone = Object.values(done).reduce((a, b) => a + Number(b || 0), 0)
        const totalTarget = Object.values(target).reduce((a, b) => a + Number(b || 0), 0)
        setCompleted(totalTarget > 0 && totalDone >= totalTarget)
    }

    const mapDbQuestionToUI = (q: DbQuestionResult): Question => {
        const norm = normalizeQuestionType(q.type)
        const base: Partial<Question> = {
            id: q.id,
            type: norm,
            difficulty: q.difficulty as "low" | "medium" | "high",
            question_text: q.question_text,
            explanation: q.explanation,
        }

        if (norm === "multiple-choice") {
            base.options = q.multiple_choice_questions?.options
            base.correctAnswerIndex = q.multiple_choice_questions?.correct_answer_index
        } else if (norm === "fill-in-the-blank") {
            base.options = q.fill_in_the_blank_questions?.options
            base.order_important = q.fill_in_the_blank_questions?.order_important
            base.model_answer = q.fill_in_the_blank_questions?.correct_answers
        } else if (norm === "matching") {
            base.pairs = (q.matching_questions || []).map((m: DbMatchingQuestion) => ({
                statement: m.statement, match: m.match,
            }))
        } else if (norm === "true-false") {
            base.model_answer = q.true_false_questions?.correct_answer ?? false
        } else if (norm === "text" || norm === "short-answer") {
            base.model_answer = q.short_answer_questions?.model_answer ?? ""
        } else if (norm === "essay") {
            base.model_answer = q.essay_questions?.model_answer ?? ""
            base.rubric = q.essay_questions?.rubric ?? ""
        } else if (norm === "code" || norm === "algorithm" || norm === "sql") {
            base.language = q.code_questions?.language
            base.model_answer = q.code_questions?.model_answer ?? ""
            base.model_answer_code = q.code_questions?.model_answer_code
        }

        return base as Question
    }

    const fetchWeek = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.replace("/login")
                return
            }

            const { start, end } = thisWeekBoundsLondon()

            // Frozen, idempotent plan for the week
            const { data: planRows, error: planErr } = await supabase.rpc("get_or_create_progressboost_week_v1", {
                p_student: user.id,
                p_class: classId,
                p_week_start: toISODate(start),
                p_week_end: toISODate(end),
                p_new_days: NEW_DAYS,
                p_mid_days: MID_DAYS,
                p_targets: {
                    "low:new": PROGRESS_BOOST_RULES.low.new,
                    "low:mid": PROGRESS_BOOST_RULES.low.mid,
                    "low:old": PROGRESS_BOOST_RULES.low.old,
                    "medium:new": PROGRESS_BOOST_RULES.medium.new,
                    "medium:mid": PROGRESS_BOOST_RULES.medium.mid,
                    "medium:old": PROGRESS_BOOST_RULES.medium.old,
                    "high:new": PROGRESS_BOOST_RULES.high.new,
                    "high:mid": PROGRESS_BOOST_RULES.high.mid,
                    "high:old": PROGRESS_BOOST_RULES.high.old,
                },
                p_recent_exclude_days: 7,
            })
            if (planErr) throw planErr

            const rows = normalizePlanRows(planRows as RawPlanRow[])
            // Order by frozen order_index and de-duplicate by question_id (belt & braces)
            const ordered = [...rows].sort((a, b) => a.order_index - b.order_index)
            const seenQ = new Set<string>()
            const dedupPlan: ProgressBoostPlanRow[] = ordered.filter((r) => {
                if (seenQ.has(r.question_id)) return false
                seenQ.add(r.question_id)
                return true
            })

            setPlan(dedupPlan)
            recomputeProgressFromPlan(dedupPlan)

            if (dedupPlan.length === 0) {
                setQuestions([])
                setCurrentIndex(0)
                return
            }

            // Load questions & order by the frozen plan's order_index
            const qIds = dedupPlan.map(r => r.question_id)
            const { data: qData, error: qErr } = await supabase
                .from("questions")
                .select(`
          id, type, difficulty, question_text, explanation, created_at,
          multiple_choice_questions (options, correct_answer_index, model_answer),
          fill_in_the_blank_questions (options, correct_answers, order_important, model_answer),
          matching_questions (statement, match, model_answer),
          true_false_questions (correct_answer, model_answer),
          short_answer_questions (model_answer),
          essay_questions (model_answer, rubric),
          code_questions (language, model_answer, model_answer_code)
        `)
                .in("id", qIds)
            if (qErr) throw qErr

            const byId = new Map((qData || []).map((q: unknown) => [(q as { id: string }).id, q as DbQuestionResult]))
            const orderedPlan = dedupPlan // already ordered & deduped
            const orderedQuestions = orderedPlan
                .map(r => byId.get(r.question_id))
                .filter((q): q is DbQuestionResult => q !== undefined)
                .map(mapDbQuestionToUI)

            setQuestions(orderedQuestions)

            // Jump to first pending (so students can return mid-week)
            const firstPendingIdx = orderedPlan.findIndex(r => r.status === "pending")
            const firstSkippedIdx = orderedPlan.findIndex(r => r.status === "skipped")
            setCurrentIndex(firstPendingIdx >= 0 ? firstPendingIdx : (firstSkippedIdx >= 0 ? firstSkippedIdx : 0))

            // Reset answer state for new batch
            setAnswerId(null)
            setAutoScore(null)
            setSelfScore(null)
            setAnswerPayload(null)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load ProgressBoost: " + explain(e))
        } finally {
            setLoading(false)
        }
    }

    // ---------- Save answer & mark the frozen plan item ----------
    const afterAnswered = async () => {
        // Show review/self-assess. Next button advances.
    }

    const saveAnswer = async (payload: { response_text: string; autoScore?: ScoreType | null }) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.replace("/login")
            return null
        }

        const q = questions[currentIndex]
        if (!q) return null

        const { data: row, error } = await supabase
            .from("student_answers")
            .insert({
                student_id: user.id,
                question_id: q.id,
                response_text: payload.response_text,
                student_score: payload.autoScore ?? null,
                self_assessed: payload.autoScore ? true : false,
                submitted_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (error) {
            console.error(error)
            toast.error("Failed to save answer: " + explain(error))
            return null
        }

        // `plan` is already ordered & deduped for the UI
        const planItem = plan[currentIndex]
        if (planItem?.item_id) {
            const { error: updErr } = await supabase
                .from("progressboost_items")
                .update({ status: "answered", answer_id: row.id, completed_at: new Date().toISOString() })
                .eq("id", planItem.item_id)
            if (updErr) {
                console.error("Mark item answered failed:", updErr)
                toast.error(`Mark answered failed: ${explain(updErr)}`)
            } else {
                // reflect locally
                const newPlan: ProgressBoostPlanRow[] = plan.map((p) =>
                    p.item_id === planItem.item_id ? { ...p, status: "answered" as const } : p
                )
                setPlan(newPlan)
                recomputeProgressFromPlan(newPlan)
            }
        }

        setAnswerId(row.id)
        setAnswerPayload(payload.response_text)
        if (payload.autoScore) setAutoScore(payload.autoScore)
        return row.id as string
    }

    // ---------- Handlers ----------
    const handleMultipleChoiceAnswer = async (selectedIndex: number, isCorrect: boolean) => {
        if (currentIndex >= questions.length) return
        setIsSubmitting(true)
        await saveAnswer({ response_text: String(selectedIndex), autoScore: isCorrect ? "green" : "red" })
        setIsSubmitting(false)
        await afterAnswered()
    }

    const handleFillInTheBlankAnswer = async (isCorrect: boolean, selectedIndexes: number[]) => {
        if (currentIndex >= questions.length) return
        setIsSubmitting(true)
        await saveAnswer({ response_text: JSON.stringify(selectedIndexes), autoScore: isCorrect ? "green" : "red" })
        setIsSubmitting(false)
        await afterAnswered()
    }

    const handleMatchingAnswer = async (selections: Record<string, string[]>) => {
        if (currentIndex >= questions.length) return
        setIsSubmitting(true)
        await saveAnswer({ response_text: JSON.stringify(selections), autoScore: null })
        setIsSubmitting(false)
        await afterAnswered()
    }

    const handleTrueFalseAnswer = async (answerValue: boolean) => {
        if (currentIndex >= questions.length) return
        const q = questions[currentIndex]
        const isCorrect = String(answerValue) === String(q.model_answer)
        setIsSubmitting(true)
        await saveAnswer({ response_text: answerValue ? "true" : "false", autoScore: isCorrect ? "green" : "red" })
        setIsSubmitting(false)
        await afterAnswered()
    }

    const handleSubmitAnswer = async (responseText: string) => {
        if (currentIndex >= questions.length) return
        setIsSubmitting(true)
        await saveAnswer({ response_text: responseText, autoScore: null })
        setIsSubmitting(false)
        await afterAnswered()
    }

    const handleSelfAssess = async (score: ScoreType) => {
        if (!answerId) return
        const { error } = await supabase
            .from("student_answers")
            .update({ student_score: score, self_assessed: true })
            .eq("id", answerId)
        if (error) {
            console.error(error)
            toast.error("Failed to save self-assessment: " + explain(error))
            return
        }
        setSelfScore(score)

        // If this was the final question, now we can refresh to show completion
        if (isFinalQuestion) {
            await fetchWeek()
        }
    }

    const handleNext = async () => {
        setAnswerId(null)
        setAnswerPayload(null)
        setAutoScore(null)
        setSelfScore(null)
        setIsFinalQuestion(false)


        const next = findNextIndex(currentIndex, plan)
        if (next >= 0) {
            setCurrentIndex(next)
            return
        }
        // Check if this was the final question and we need to wait for self-assessment
        const currentQuestion = questions[currentIndex]
        if (currentQuestion && (currentQuestion.type === "text" || currentQuestion.type === "code" || currentQuestion.type === "algorithm" || currentQuestion.type === "sql" || currentQuestion.type === "essay" || currentQuestion.type === "matching")) {
            // For questions that require self-assessment, wait for it to be completed
            setIsFinalQuestion(true)
            return
        }
        await fetchWeek()
    }

    const handleSkip = async () => {
        const item = plan[currentIndex]
        if (!item) return
        // Mark as skipped in DB
        const { error } = await supabase
            .from("progressboost_items")
            .update({ status: "skipped" })
            .eq("id", item.item_id)
        if (error) {
            console.error(error)
            toast.error("Failed to skip: " + explain(error))
            return
        }
        // Update local plan and advance
        const newPlan: ProgressBoostPlanRow[] = plan.map((p) =>
            p.item_id === item.item_id ? { ...p, status: "skipped" as const } : p
        )
        setPlan(newPlan)
        recomputeProgressFromPlan(newPlan)
        const next = findNextIndex(currentIndex, newPlan)
        if (next >= 0) {
            setCurrentIndex(next)
        } else {
            // nothing else to do, refresh
            await fetchWeek()
        }
    }

    // ------------- Progress display -------------
    const totalPercent = useMemo(() => {
        const totalDone = Object.values(progressMaps.done).reduce((a, b) => a + Number(b || 0), 0)
        const totalTarget = Object.values(progressMaps.target).reduce((a, b) => a + Number(b || 0), 0)
        return totalTarget > 0 ? Math.round((totalDone / totalTarget) * 100) : 0
    }, [progressMaps])

    if (authLoading) return <div className="p-8">Checking access…</div>
    if (!isAllowed) return null

    const renderAnswerReview = () => {
        const q = questions[currentIndex]
        if (!q) return null

        if (q.type === "multiple-choice") {
            const isCorrect = autoScore === "green"
            return (
                <div className="space-y-4">
                    <div className="p-3 bg-muted rounded">
                        <h3 className="font-medium mb-2">Your Answer</h3>
                        <div className="flex items-center gap-2">
                            {q.options?.[Number(answerPayload ?? 0)] ?? "—"}
                            {isCorrect ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                        </div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded border border-emerald-100">
                        <h3 className="font-medium mb-2 text-emerald-700">Correct Answer</h3>
                        <p>{q.options?.[q.correctAnswerIndex || 0]}</p>
                    </div>
                </div>
            )
        }

        if (q.type === "fill-in-the-blank") {
            let selected: number[] = []
            try { selected = JSON.parse(answerPayload || "[]") } catch { }
            const selectedOptions = selected.map((i) => q.options?.[i])
            const model = Array.isArray(q.model_answer) ? q.model_answer : []
            const orderImportant = q.order_important
            return (
                <div className="space-y-4">
                    <div className="p-3 bg-muted rounded">
                        <h3 className="font-medium mb-2">Your Answer</h3>
                        <ul className="list-disc pl-5">
                            {selectedOptions.map((opt, i) => {
                                const ok = orderImportant ? opt === model[i] : opt ? model.includes(opt) : false
                                return (
                                    <li key={i} className={ok ? "text-green-700" : "text-red-700"}>
                                        {opt ?? "—"} {ok ? "✓" : "✗"}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded border border-emerald-100">
                        <h3 className="font-medium mb-2 text-emerald-700">Mark Scheme</h3>
                        {orderImportant ? (
                            <ol className="list-decimal pl-5">{model.map((m: string, i: number) => <li key={i}>{m}</li>)}</ol>
                        ) : (
                            <ul className="list-disc pl-5">{model.map((m: string, i: number) => <li key={i}>{m}</li>)}</ul>
                        )}
                    </div>
                </div>
            )
        }

        if (q.type === "matching") {
            let sel: Record<string, string[]> = {}
            try { sel = JSON.parse(answerPayload || "{}") } catch { }
            return (
                <div className="space-y-4">
                    <div className="p-3 bg-muted rounded">
                        <h3 className="font-medium mb-2">Your Matches</h3>
                        <ul className="list-disc pl-5">
                            {q.pairs?.map((p, i) => {
                                const user = sel[p.statement] || []
                                const ok = user.includes(p.match)
                                return (
                                    <li key={i} className={ok ? "text-green-700" : "text-red-700"}>
                                        <strong>{p.statement}:</strong> {user.join(", ") || "—"} {ok ? "✓" : "✗"}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded border border-emerald-100">
                        <h3 className="font-medium mb-2 text-emerald-700">Mark Scheme</h3>
                        <ul className="list-disc pl-5">
                            {q.pairs?.map((p, i) => (
                                <li key={i}><strong>{p.statement}:</strong> {p.match}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )
        }

        if (q.type === "true-false") {
            const correct = String(answerPayload) === String(q.model_answer)
            return (
                <div className="space-y-4">
                    <div className="p-3 bg-muted rounded">
                        <h3 className="font-medium mb-2">Your Answer</h3>
                        <div className="flex items-center gap-2">
                            {String(answerPayload) === "true" ? "True" : "False"}
                            {correct ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                        </div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded border border-emerald-100">
                        <h3 className="font-medium mb-2 text-emerald-700">Correct Answer</h3>
                        <p>{String(q.model_answer) === "true" ? "True" : "False"}</p>
                    </div>
                </div>
            )
        }

        // text/code/essay
        return (
            <div className="space-y-4">
                <div className="p-3 bg-muted rounded">
                    <h3 className="font-medium mb-2">Your Answer</h3>
                    <pre className="whitespace-pre-wrap font-sans text-sm">{answerPayload}</pre>
                </div>
                <div className="p-3 bg-emerald-50 rounded border border-emerald-100">
                    <h3 className="font-medium mb-2 text-emerald-700">Model Answer</h3>
                    <div className="space-y-4">
                        <div>
                            {(q.type === "code" || q.type === "algorithm" || q.type === "sql") && (
                                <h4 className="text-sm font-medium mb-1">Pseudocode:</h4>
                            )}
                            <pre className="whitespace-pre-wrap font-sans text-sm">{q.model_answer}</pre>
                        </div>
                        {q.model_answer_code && (
                            <div>
                                <h4 className="text-sm font-medium mb-1">{q.language || "Python"}:</h4>
                                <pre className="whitespace-pre-wrap font-sans text-sm">{q.model_answer_code}</pre>
                            </div>
                        )}
                    </div>
                </div>
                {q.explanation && (
                    <div className="p-3 bg-emerald-50 rounded border border-emerald-100">
                        <h3 className="font-medium mb-2 text-emerald-700">Explanation</h3>
                        <pre className="whitespace-pre-wrap font-sans text-sm">{q.explanation}</pre>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Zap className="h-7 w-7 text-orange-500" />
                ProgressBoost
            </h1>
            <p className="text-muted-foreground mb-6">Weekly spaced repetition practice to reinforce your learning</p>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Weekly Progress
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-3">
                        <Progress value={totalPercent} className="flex-1" />
                        <span className="text-sm font-medium">{totalPercent}%</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="bg-green-50 p-2 rounded">
                            Easy: {getNum(progressMaps.done, "low:new") + getNum(progressMaps.done, "low:mid") + getNum(progressMaps.done, "low:old")} /
                            {getNum(progressMaps.target, "low:new") + getNum(progressMaps.target, "low:mid") + getNum(progressMaps.target, "low:old")}
                        </div>
                        <div className="bg-yellow-50 p-2 rounded">
                            Medium: {getNum(progressMaps.done, "medium:new") + getNum(progressMaps.done, "medium:mid") + getNum(progressMaps.done, "medium:old")} /
                            {getNum(progressMaps.target, "medium:new") + getNum(progressMaps.target, "medium:mid") + getNum(progressMaps.target, "medium:old")}
                        </div>
                        <div className="bg-red-50 p-2 rounded">
                            Hard: {getNum(progressMaps.done, "high:new") + getNum(progressMaps.done, "high:mid") + getNum(progressMaps.done, "high:old")} /
                            {getNum(progressMaps.target, "high:new") + getNum(progressMaps.target, "high:mid") + getNum(progressMaps.target, "high:old")}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {completed && (
                <Card className="border-green-300 bg-green-50 mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <Trophy className="h-5 w-5" /> ProgressBoost Complete!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-green-700">Awesome! You’ve hit all this week’s targets. Come back next week for a new Boost.</p>
                    </CardContent>
                </Card>
            )}

            {!completed && loading && (
                <Card>
                    <CardContent className="p-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                            <p>Loading your ProgressBoost questions…</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!completed && !loading && questions.length > 0 && currentIndex < questions.length && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Question {currentIndex + 1} of {questions.length}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge className="capitalize" variant="outline">{String(questions[currentIndex].difficulty)}</Badge>
                                {!answerId && (
                                    <Button variant="outline" size="sm" onClick={handleSkip} className="text-muted-foreground hover:text-foreground">
                                        <SkipForward className="mr-2 h-4 w-4" /> Skip
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">{questions[currentIndex].question_text}</p>

                        {/* TODO: Review against question page */}
                        {answerId ? (
                            <>
                                {renderAnswerReview()}

                                {/* For auto-marked types, show their score banner; for manual, ask for self‑assessment */}
                                {autoScore !== null ? (
                                    <div className="mt-4">
                                        <FeedbackDisplay answer={{ id: answerId as string, ai_feedback: null, score: autoScore } as Answer} />
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        {selfScore ? (
                                            <FeedbackDisplay answer={{ id: answerId as string, ai_feedback: null, score: selfScore } as Answer} />
                                        ) : (
                                            <SelfAssessment onSelectScore={handleSelfAssess} />
                                        )}
                                    </div>
                                )}

                                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                    <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
                                        <RefreshCw className="mr-2 h-4 w-4" /> Try Another Question
                                    </Button>
                                    <Link href="/progress">
                                        <Button variant="outline">View My Progress</Button>
                                    </Link>
                                </div>
                            </>
                        ) : questions[currentIndex].type === "multiple-choice" ? (
                            <MultipleChoiceQuestion
                                options={questions[currentIndex].options || []}
                                correctAnswerIndex={questions[currentIndex].correctAnswerIndex || 0}
                                onAnswerSelected={handleMultipleChoiceAnswer}
                            />
                        ) : questions[currentIndex].type === "fill-in-the-blank" ? (
                            <FillInTheBlankQuestion
                                question={questions[currentIndex]}
                                onAnswerSelected={handleFillInTheBlankAnswer}
                            />
                        ) : (questions[currentIndex].type === "code" || questions[currentIndex].type === "algorithm" || questions[currentIndex].type === "sql") ? (
                            <CodeQuestion onSubmit={handleSubmitAnswer} disabled={isSubmitting} />
                        ) : questions[currentIndex].type === "matching" ? (
                            <MatchingQuestion question={questions[currentIndex]} onSubmit={handleMatchingAnswer} disabled={isSubmitting} />
                        ) : questions[currentIndex].type === "true-false" ? (
                            <TrueFalseQuestion question={questions[currentIndex]} onSubmit={handleTrueFalseAnswer} disabled={isSubmitting} />
                        ) : questions[currentIndex].type === "text" || questions[currentIndex].type === "short-answer" ? (
                            <TextQuestion onSubmit={handleSubmitAnswer} disabled={isSubmitting} />
                        ) : questions[currentIndex].type === "essay" ? (
                            <EssayQuestion onSubmit={handleSubmitAnswer} disabled={isSubmitting} minWords={20} maxWords={500} />
                        ) : null}
                    </CardContent>
                </Card>
            )}

            {!completed && !loading && questions.length === 0 && (
                <p>No questions needed right now. ✅ You’re up to date!</p>
            )}
        </div>
    )
}
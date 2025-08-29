"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, Target, Trophy, RefreshCw, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

import type { Question } from "@/lib/types"
import { MultipleChoiceQuestion } from "@/components/question-components/question-type/multiple-choice-question"
import { FillInTheBlankQuestion } from "@/components/question-components/question-type/fill-in-the-blank-question"
import { TextQuestion } from "@/components/question-components/question-type/text-question"
import { CodeQuestion } from "@/components/question-components/question-type/code-question"
import { MatchingQuestion } from "@/components/question-components/question-type/matching-question"
import { TrueFalseQuestion } from "@/components/question-components/question-type/true-false-question"
import { EssayQuestion } from "@/components/question-components/question-type/essay-question"
import { SelfAssessment } from "@/components/question-components/self-assessment"
import { FeedbackDisplay } from "@/components/question-components/feedback-display"

// ---- Utils ----
import { PROGRESS_BOOST_RULES, NEW_DAYS, MID_DAYS, thisWeekBoundsLondon } from "@/lib/progressBoost"

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

const get = (m: Record<string, number> | undefined, k: string) => Number((m && (m as any)[k]) ?? 0)

type ScoreType = "green" | "amber" | "red"
type ProgressMaps = { done: Record<string, number>; target: Record<string, number> }

export default function ProgressBoostClient() {
  const supabase = createClient()
  const router = useRouter()

  // --- Auth ---
  const [authLoading, setAuthLoading] = useState(true)
  const [isAllowed, setIsAllowed] = useState(false)

  // --- Weekly plan state ---
  const [classId, setClassId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState<ProgressMaps>({ done: {}, target: {} })

  // --- Answer / marking flow state ---
  const [answerId, setAnswerId] = useState<string | null>(null)
  const [autoScore, setAutoScore] = useState<ScoreType | null>(null) // for auto-marked types
  const [selfScore, setSelfScore] = useState<ScoreType | null>(null) // for self-assessed types
  const [answerPayload, setAnswerPayload] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // -------- AUTH --------
  useEffect(() => {
    const run = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.replace("/login")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("userid", user.id)
        .single()

      if (profile?.user_type?.startsWith("teacher")) {
        router.replace("/")
        return
      }

      const { data: memberships } = await supabase
        .from("class_members")
        .select("class_id, classes(id,name)")
        .eq("student_id", user.id)

      if (!memberships || memberships.length === 0) {
        setAuthLoading(false)
        setIsAllowed(true)
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

  // -------- FETCH PLAN --------
  useEffect(() => {
    if (!isAllowed || !classId) return
    void fetchPlan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllowed, classId])

  // Fallback for done/target counts if RPC doesn’t return them
  const computeCountsFallback = async (
    studentId: string,
    clsId: string,
    weekStart: Date,
    weekEnd: Date
  ): Promise<ProgressMaps> => {
    const { data: coverageRows } = await supabase
      .from("class_subtopic_coverage")
      .select("subtopic_id, covered_on")
      .eq("class_id", clsId)

    const lastCovered = new Map<string, string>()
    for (const r of coverageRows || []) {
      const prev = lastCovered.get(r.subtopic_id)
      if (!prev || new Date(r.covered_on) > new Date(prev)) lastCovered.set(r.subtopic_id, r.covered_on)
    }

    const subtopicIds = Array.from(lastCovered.keys())
    if (subtopicIds.length === 0) {
      return {
        done: {},
        target: {
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
      }
    }

    const { data: links } = await supabase
      .from("subtopic_question_link")
      .select("subtopic_id, question_id, questions(id, difficulty)")
      .in("subtopic_id", subtopicIds)

    const now = new Date()
    const questionBucket = new Map<string, { difficulty: string; bucket: string }>()
    for (const row of links || []) {
      const q = Array.isArray((row as any).questions) ? (row as any).questions[0] : (row as any).questions
      if (!q) continue
      const coveredOn = lastCovered.get(row.subtopic_id)
      if (!coveredOn) continue
      const days = Math.floor((now.getTime() - new Date(coveredOn).getTime()) / (1000 * 60 * 60 * 24))
      const bucket = days <= NEW_DAYS ? "new" : days <= MID_DAYS ? "mid" : "old"
      questionBucket.set(q.id, { difficulty: String(q.difficulty), bucket })
    }

    const qIds = Array.from(questionBucket.keys())

    const { data: answers } = await supabase
      .from("student_answers")
      .select("question_id, submitted_at")
      .eq("student_id", studentId)
      .gte("submitted_at", weekStart.toISOString())
      .lt("submitted_at", weekEnd.toISOString())
      .in("question_id", qIds.length ? qIds : ["_none_"])

    const doneCounts: Record<string, number> = {}
    for (const a of answers || []) {
      const meta = questionBucket.get(a.question_id as string)
      if (!meta) continue
      const key = `${meta.difficulty}:${meta.bucket}`
      doneCounts[key] = (doneCounts[key] || 0) + 1
    }

    const targetCounts: Record<string, number> = {
      "low:new": PROGRESS_BOOST_RULES.low.new,
      "low:mid": PROGRESS_BOOST_RULES.low.mid,
      "low:old": PROGRESS_BOOST_RULES.low.old,
      "medium:new": PROGRESS_BOOST_RULES.medium.new,
      "medium:mid": PROGRESS_BOOST_RULES.medium.mid,
      "medium:old": PROGRESS_BOOST_RULES.medium.old,
      "high:new": PROGRESS_BOOST_RULES.high.new,
      "high:mid": PROGRESS_BOOST_RULES.high.mid,
      "high:old": PROGRESS_BOOST_RULES.high.old,
    }

    return { done: doneCounts, target: targetCounts }
  }

  const fetchPlan = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/login")
        return
      }

      const { start, end } = thisWeekBoundsLondon()

      // Your planner RPC: IDs + progress maps (no model answers here)
      const { data, error } = await supabase.rpc("get_progressboost_plan_v3", {
        p_student: user.id,
        p_class: classId,
        p_week_start: start.toISOString(),
        p_week_end: end.toISOString(),
        p_new_days: NEW_DAYS,
        p_mid_days: MID_DAYS,
        p_target_low_new: PROGRESS_BOOST_RULES.low.new,
        p_target_low_mid: PROGRESS_BOOST_RULES.low.mid,
        p_target_low_old: PROGRESS_BOOST_RULES.low.old,
        p_target_med_new: PROGRESS_BOOST_RULES.medium.new,
        p_target_med_mid: PROGRESS_BOOST_RULES.medium.mid,
        p_target_med_old: PROGRESS_BOOST_RULES.medium.old,
        p_target_high_new: PROGRESS_BOOST_RULES.high.new,
        p_target_high_mid: PROGRESS_BOOST_RULES.high.mid,
        p_target_high_old: PROGRESS_BOOST_RULES.high.old,
      })
      if (error) throw error

      const { done, target } =
        data && data.length > 0 && (data as any)[0]?.done_counts && (data as any)[0]?.target_counts
          ? { done: (data as any)[0].done_counts, target: (data as any)[0].target_counts }
          : await computeCountsFallback(user.id, classId, start, end)

      setProgress({ done, target })

      const totalDone = Object.values(done).reduce((a: number, b: any) => a + Number(b || 0), 0)
      const totalTarget = Object.values(target).reduce((a: number, b: any) => a + Number(b || 0), 0)

      if (totalTarget > 0 && totalDone >= totalTarget) {
        setCompleted(true)
        setQuestions([])
        toast.success("✅ You’ve completed this week’s ProgressBoost!")
        return
      }

      if (!data || data.length === 0) {
        setQuestions([])
        return
      }

      const qIds = (data as any[]).map((row) => row.question_id)

      // Pull *all* model-answer fields you display here (keeps the RPC lean)
      const { data: questionsData, error: qErr } = await supabase
        .from("questions")
        .select(`
          id, type, difficulty, question_text, explanation, created_at,
          multiple_choice_questions (options, correct_answer_index),
          fill_in_the_blank_questions (options, correct_answers, order_important),
          matching_questions (statement, match),
          true_false_questions (correct_answer),
          short_answer_questions (model_answer),
          essay_questions (model_answer, rubric),
          code_questions (language, model_answer_code)
        `)
        .in("id", qIds)
      if (qErr) throw qErr

      // Map to your UI Question shape
      const mapped = (questionsData || []).map((q: any) => {
        const norm = normalizeQuestionType(q.type)
        const base: any = {
          id: q.id,
          type: norm,
          difficulty: q.difficulty,
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
          base.pairs = (q.matching_questions || []).map((m: any) => ({
            statement: m.statement,
            match: m.match,
          }))
        } else if (norm === "true-false") {
          base.model_answer = q.true_false_questions?.correct_answer ?? null
        } else if (norm === "text" || norm === "short-answer") {
          base.model_answer = q.short_answer_questions?.model_answer ?? ""
        } else if (norm === "essay") {
          base.model_answer = q.essay_questions?.model_answer ?? ""
          base.rubric = q.essay_questions?.rubric ?? ""
        } else if (norm === "code" || norm === "algorithm" || norm === "sql") {
          base.language = q.code_questions?.language
          base.model_answer_code = q.code_questions?.model_answer_code
        }

        return base as Question
      }) as Question[]

      setQuestions(mapped)
      setCurrentIndex(0)
      setCompleted(false)
      // reset answer state when a new batch arrives
      setAnswerId(null)
      setAutoScore(null)
      setSelfScore(null)
      setAnswerPayload(null)
    } catch (e) {
      console.error(e)
      toast.error("Failed to load ProgressBoost")
    } finally {
      setLoading(false)
    }
  }

  // ---------- SAVE ANSWER HELPERS ----------
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
      toast.error("Failed to save answer")
      return null
    }

    setAnswerId(row.id)
    setAnswerPayload(payload.response_text)
    if (payload.autoScore) setAutoScore(payload.autoScore)
    return row.id as string
  }

  // ---------- HANDLERS (auto-mark where possible) ----------
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
    // amber by default (can be auto-marked with exact match if you want)
    await saveAnswer({ response_text: JSON.stringify(selections), autoScore: null })
    setIsSubmitting(false)
    await afterAnswered()
  }

  const handleTrueFalseAnswer = async (answerValue: boolean) => {
    if (currentIndex >= questions.length) return
    const q = questions[currentIndex]
    const isCorrect = String(answerValue) === String((q as any).model_answer)
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

  // Self-assessment for manual-marked types
  const handleSelfAssess = async (score: ScoreType) => {
    if (!answerId) return
    const { error } = await supabase
      .from("student_answers")
      .update({ student_score: score, self_assessed: true })
      .eq("id", answerId)
    if (error) {
      console.error(error)
      toast.error("Failed to save self-assessment")
      return
    }
    setSelfScore(score)
  }

  // Move on after seeing feedback / self assessment
  const handleNext = async () => {
    // reset local answer state
    setAnswerId(null)
    setAnswerPayload(null)
    setAutoScore(null)
    setSelfScore(null)

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1)
      return
    }
    // reached end of batch -> recompute plan
    await fetchPlan()
  }

  // ---------------- PROGRESS DISPLAY ----------------
  const totalPercent = useMemo(() => {
    const totalDone = Object.values(progress.done).reduce((a, b) => a + Number(b || 0), 0)
    const totalTarget = Object.values(progress.target).reduce((a, b) => a + Number(b || 0), 0)
    return totalTarget > 0 ? Math.round((totalDone / totalTarget) * 100) : 0
  }, [progress])

  if (authLoading) return <div className="p-8">Checking access…</div>
  if (!isAllowed) return null

  const renderAnswerReview = () => {
    const q = questions[currentIndex]
    if (!q) return null

    // Compact review per type
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
      try { selected = JSON.parse(answerPayload || "[]") } catch {}
      const selectedOptions = selected.map((i) => q.options?.[i])
      const model = Array.isArray((q as any).model_answer) ? (q as any).model_answer : []
      const orderImportant = (q as any).order_important
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
      try { sel = JSON.parse(answerPayload || "{}") } catch {}
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
      const correct = String(answerPayload) === String((q as any).model_answer)
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
            <p>{String((q as any).model_answer) === "true" ? "True" : "False"}</p>
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
            {(q as any).model_answer_code && (
              <div>
                <h4 className="text-sm font-medium mb-1">{(q as any).language || "Python"}:</h4>
                <pre className="whitespace-pre-wrap font-sans text-sm">{(q as any).model_answer_code}</pre>
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
              Easy: {get(progress.done, "low:new") + get(progress.done, "low:mid") + get(progress.done, "low:old")} /
              {get(progress.target, "low:new") + get(progress.target, "low:mid") + get(progress.target, "low:old")}
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              Medium: {get(progress.done, "medium:new") + get(progress.done, "medium:mid") + get(progress.done, "medium:old")} /
              {get(progress.target, "medium:new") + get(progress.target, "medium:mid") + get(progress.target, "medium:old")}
            </div>
            <div className="bg-red-50 p-2 rounded">
              Hard: {get(progress.done, "high:new") + get(progress.done, "high:mid") + get(progress.done, "high:old")} /
              {get(progress.target, "high:new") + get(progress.target, "high:mid") + get(progress.target, "high:old")}
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
              <Badge className="capitalize" variant="outline">{String(questions[currentIndex].difficulty)}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{questions[currentIndex].question_text}</p>

            {/* If already answered, show review & next. Otherwise show the interactive component */}
            {answerId ? (
              <>
                {renderAnswerReview()}

                {/* Self-assessment only for manual-marked types */}
                {autoScore === null && (
                  <div className="mt-4">
                    {selfScore ? (
                      <FeedbackDisplay answer={{ id: answerId, ai_feedback: null, score: selfScore } as any} />
                    ) : (
                      <SelfAssessment onSelectScore={handleSelfAssess} />
                    )}
                  </div>
                )}

                <div className="mt-6">
                  <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
                    <RefreshCw className="mr-2 h-4 w-4" /> Next question
                  </Button>
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
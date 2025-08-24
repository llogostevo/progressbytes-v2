// TODO: restrict user access to filters
"use client"

// access control
// import { useUser } from "@/hooks/useUser"
import { useAccess } from "@/hooks/useAccess"
// import { canViewAnswers, canAccessFilters } from "@/lib/access"

// react
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { Answer, Question, ScoreType } from "@/lib/types"
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  BookOpen,
  HelpCircle,
  User,
  GraduationCap,
  FileText,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"
import { UserLogin } from "@/components/user-login"
import { TopicFilter } from "@/components/topic-filter"
import { QuestionTypeFilter } from "@/components/question-type-filter"
import { DynamicIcon } from "@/components/ui/dynamicicon"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { QuestionDifficultyFilter } from "@/components/question-difficulty-filter"

interface DBTopic {
  id: string
  name: string
  description: string
  icon?: string
  slug: string
  unit: number
  disabled?: boolean
}

interface TypeSpecificData {
  model_answer?: string | boolean | string[]
  model_answer_code?: string
  order_important?: boolean
  correct_answers?: string[]
  correct_answer?: boolean
  options?: string[]
  correct_answer_index?: number
}

interface MatchingPair {
  statement: string
  match: string
}

function RevisitSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-24" />
              ))}
            </div>
            <div className="bg-muted/50 rounded-lg p-3 border border-muted">
              <div className="flex flex-wrap gap-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-9 w-32" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4 mt-2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </div>
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <div className="bg-emerald-50 p-4 rounded-md border border-emerald-200">
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <div className="flex flex-col md:flex-row gap-3">
                      <Skeleton className="h-10 w-32" />
                      <Skeleton className="h-10 w-40" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function RevisitPage() {

  // access control
  // const { user: accessUser, userType } = useUser()
  const { canViewAnswers: userCanViewAnswers, canAccessFilters: userCanAccessFilters } = useAccess()


  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as ScoreType | null
  const typeParam = searchParams.get("type")
  const difficultyParam = searchParams.get("difficulty") as string | null
  const selectedTopics = useMemo(() => searchParams.get("topics")?.split(",") || [], [searchParams])
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [allAnswers, setAllAnswers] = useState<Answer[]>([])
  const [questions, setQuestions] = useState<Record<string, Question>>({})
  const [activeTab, setActiveTab] = useState<ScoreType | "all">(tabParam || "all")
  const [topics, setTopics] = useState<DBTopic[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [answerToDelete, setAnswerToDelete] = useState<Answer | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // Memoize filtered answers
  const filteredAnswers = useMemo(() => {
    if (allAnswers.length === 0 || topics.length === 0) return allAnswers

    return selectedTopics.length > 0
      ? allAnswers.filter((answer) => {
        const question = questions[answer.question_id]
        return (
          question &&
          selectedTopics.some((topicSlug) => topics.some((t) => t.slug === topicSlug && t.id === question.topic))
        )
      })
      : allAnswers
  }, [allAnswers, selectedTopics, topics, questions])

  // Memoize filtered difficulty

  const availableDifficulty = useMemo(() => {
    const set = new Set<string>()
    filteredAnswers.forEach((answer) => {
      const q = questions[answer.question_id]
      if (q?.difficulty) set.add(String(q.difficulty).toLowerCase())
    })
    return Array.from(set)
  }, [filteredAnswers, questions])

  // First useEffect for initial data loading
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        // Fetch topics from the database
        const { data: topicsData, error: topicsError } = await supabase.from("topics").select("*")

        if (topicsError) {
          console.error("Error fetching topics:", topicsError)
          return
        }

        setTopics(topicsData || [])

        // Fetch answers for the user
        const { data: answersData, error: answersError } = await supabase
          .from("student_answers")
          .select("*")
          .eq("student_id", user.id)
          .order("submitted_at", { ascending: false })

        if (answersError) {
          console.error("Error fetching answers:", answersError)
          return
        }

        // Map database fields to Answer type
        const mappedAnswers: Answer[] = answersData.map((answer) => ({
          id: answer.id,
          question_id: answer.question_id,
          student_id: answer.student_id,
          response_text: answer.response_text,
          ai_feedback: answer.ai_feedback,
          score: answer.student_score as ScoreType,
          submitted_at: answer.submitted_at,
          self_assessed: answer.self_assessed,
        }))

        // Get all question IDs from answers
        const questionIds = mappedAnswers.map((answer) => answer.question_id)

        // Fetch questions with their type-specific data
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select(`
            *,
            short_answer_questions(*),
            true_false_questions(*),
            matching_questions(*),
            fill_in_the_blank_questions(
              options,
              correct_answers,
              order_important
            ),
            code_questions(*),
            multiple_choice_questions(*),
            essay_questions(*),
            subtopic_question_link(
              subtopic:subtopics(
                topic:topics(*)
              )
            )
          `)
          .in("id", questionIds)

        if (questionsError) {
          console.error("Error fetching questions:", questionsError)
          return
        }

        // Create a map of questions with their type-specific data
        const questionMap: Record<string, Question> = {}
        questionsData?.forEach((q) => {
          let typeSpecificData: TypeSpecificData | null = null
          let pairs: MatchingPair[] = []
          let options: string[] = []
          let correctAnswerIndex = 0
          let correctAnswers: string[] = []
          let fibq = undefined

          switch (q.type) {
            case "short-answer":
              typeSpecificData = {
                model_answer: q.short_answer_questions?.model_answer || "",
                model_answer_code: q.short_answer_questions?.model_answer_code,
              }
              break
            case "text":
              typeSpecificData = {
                model_answer: q.short_answer_questions?.model_answer || "",
                model_answer_code: q.short_answer_questions?.model_answer_code,
              }
              break
            case "true-false":
              typeSpecificData = Array.isArray(q.true_false_questions)
                ? q.true_false_questions[0]
                : q.true_false_questions;
              break
            case "matching":
              typeSpecificData = q.matching_questions?.[0] as TypeSpecificData
              pairs = q.matching_questions || []
              break
            case "fill-in-the-blank":
              fibq = q.fill_in_the_blank_questions
              if (Array.isArray(fibq)) {
                fibq = fibq[0]
              }
              typeSpecificData = fibq as TypeSpecificData
              options = fibq?.options || []
              correctAnswers = fibq?.correct_answers || []
              break
            case "code":
              console.log("CODE QUESTION:", q.code_questions)
              typeSpecificData = {
                model_answer: q.code_questions?.model_answer || "",
                model_answer_code: q.code_questions?.model_answer_code,
              }
              break
            case "multiple-choice":
              // Handle both array and object cases
              const mcq = Array.isArray(q.multiple_choice_questions)
                ? q.multiple_choice_questions[0]
                : q.multiple_choice_questions
              typeSpecificData = mcq as TypeSpecificData
              options = typeSpecificData?.options || []
              correctAnswerIndex = typeSpecificData?.correct_answer_index || 0
              break
            case "essay":
              typeSpecificData = {
                model_answer: q.essay_questions?.model_answer || "",
              }
              break
          }

          const topic = q.subtopic_question_link?.[0]?.subtopic?.topic

          const mappedQuestion = {
            id: q.id,
            type: q.type,
            difficulty: q.difficulty,
            question_text: q.question_text,
            explanation: q.explanation,
            topic: topic?.id,
            model_answer: (() => {
              switch (q.type) {
                case "multiple-choice":
                  return options[correctAnswerIndex] || ""
                case "fill-in-the-blank":
                  return correctAnswers
                case "true-false":
                  return typeSpecificData?.model_answer ?? ""
                case "matching":
                  return typeSpecificData?.model_answer || ""
                case "code":
                  return typeSpecificData?.model_answer || ""
                case "short-answer":
                  return typeSpecificData?.model_answer || ""
                case "text":
                  return typeSpecificData?.model_answer || ""
                case "essay":
                  return typeSpecificData?.model_answer || ""
                default:
                  return ""
              }
            })(),
            model_answer_code: typeSpecificData?.model_answer_code,
            pairs: pairs,
            order_important: fibq?.order_important,
            options: options,
            correctAnswerIndex: correctAnswerIndex,
            created_at: q.created_at,
            correct_answer: typeSpecificData?.correct_answer,
          }

          if (q.type === "text") {
            console.log("TEXT QUESTION:", q.id, "typeSpecificData:", typeSpecificData);
          }

          questionMap[q.id] = mappedQuestion
        })

        setQuestions(questionMap)
        setAllAnswers(mappedAnswers)

        await supabase.from("user_activity").insert({
          user_id: user.id,
          event: "visited_revisit",
          path: "/revisit",
          user_email: user.email,
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }
    getUser()
  }, [])

  // Filter answers by score and type and difficulty
  // const filteredAnswersByScoreAndType = useMemo(() => {
  //   return filteredAnswers
  //     .filter((answer) => activeTab === "all" || answer.score === activeTab)
  //     .filter((answer) => {
  //       if (typeParam === "all" || !typeParam) return true
  //       const question = questions[answer.question_id]
  //       return question?.type === typeParam
  //     })
  // }, [filteredAnswers, activeTab, typeParam, questions])

  const filteredAnswersByScoreAndType = useMemo(() => {
    return filteredAnswers
      .filter((answer) => activeTab === "all" || answer.score === activeTab)
      .filter((answer) => {
        if (typeParam === "all" || !typeParam) return true
        const q = questions[answer.question_id]
        return q?.type === typeParam
      })
      .filter((answer) => {
        if (!difficultyParam || difficultyParam === "all") return true
        const q = questions[answer.question_id]
        return String(q?.difficulty).toLowerCase() === difficultyParam.toLowerCase()
      })
  }, [filteredAnswers, activeTab, typeParam, difficultyParam, questions])


  // Group answers by topic
  const answersByTopic = useMemo(() => {
    return filteredAnswersByScoreAndType.reduce(
      (acc, answer) => {
        const question = questions[answer.question_id]
        if (!question) return acc

        const topicSlug = topics.find((t) => t.id === question.topic)?.slug || "unknown"

        if (!acc[topicSlug]) {
          acc[topicSlug] = []
        }

        // Only add if not already in the array (avoid duplicates)
        // if (!acc[topicSlug].some((a) => a.question_id === answer.question_id)) {
        //   acc[topicSlug].push(answer)
        // }

        (acc[topicSlug] ||= []).push(answer)


        return acc
      },
      {} as Record<string, Answer[]>,
    )
  }, [filteredAnswersByScoreAndType, questions, topics])

  Object.values(answersByTopic).forEach(list => {
    list.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
  })

  const getScoreLabel = (score: ScoreType) => {
    switch (score) {
      case "green":
        return "Fully Understood"
      case "amber":
        return "Partially Understood"
      case "red":
        return "Need More Practice"
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "short-answer":
        return "Short Answer"
      case "text":
        return "Short Answer"
      case "essay":
        return "Essay"
      case "true-false":
        return "True/False"
      case "matching":
        return "Matching"
      case "fill-in-the-blank":
        return "Fill in the Blank"
      case "code":
        return "Code Question"
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as ScoreType | "all")

    // Update URL using Next.js router
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("tab")
    } else {
      params.set("tab", value)
    }

    router.push(`?${params.toString()}`)
  }

  const handleTopicChange = (topics: string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    if (topics.length === 0) {
      params.delete("topics")
    } else {
      params.set("topics", topics.join(","))
    }
    router.push(`?${params.toString()}`)
  }

  // Calculate counts for each filter
  // const totalAnswers = filteredAnswers.filter((a) => {
  //   const question = questions[a.question_id]
  //   return !typeParam || typeParam === "all" || question?.type === typeParam
  // }).length
  // const scoreCount = {
  //   green: filteredAnswers.filter((a) => {
  //     const question = questions[a.question_id]
  //     return a.score === "green" && (!typeParam || typeParam === "all" || question?.type === typeParam)
  //   }).length,
  //   amber: filteredAnswers.filter((a) => {
  //     const question = questions[a.question_id]
  //     return a.score === "amber" && (!typeParam || typeParam === "all" || question?.type === typeParam)
  //   }).length,
  //   red: filteredAnswers.filter((a) => {
  //     const question = questions[a.question_id]
  //     return a.score === "red" && (!typeParam || typeParam === "all" || question?.type === typeParam)
  //   }).length,

  // }
  const matchesType = (q?: Question) =>
    !typeParam || typeParam === "all" || q?.type === typeParam

  const matchesDifficulty = (q?: Question) =>
    !difficultyParam || difficultyParam === "all" ||
    String(q?.difficulty).toLowerCase() === difficultyParam.toLowerCase()

  const totalAnswers = filteredAnswers.filter((a) => {
    const q = questions[a.question_id]
    return matchesType(q) && matchesDifficulty(q)
  }).length

  const scoreCount = {
    green: filteredAnswers.filter((a) => {
      const q = questions[a.question_id]
      return a.score === "green" && matchesType(q) && matchesDifficulty(q)
    }).length,
    amber: filteredAnswers.filter((a) => {
      const q = questions[a.question_id]
      return a.score === "amber" && matchesType(q) && matchesDifficulty(q)
    }).length,
    red: filteredAnswers.filter((a) => {
      const q = questions[a.question_id]
      return a.score === "red" && matchesType(q) && matchesDifficulty(q)
    }).length,
  }


  const handleDeleteClick = (answer: Answer) => {
    setAnswerToDelete(answer)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!answerToDelete || !user || deleteConfirmation !== "delete") return

    setIsDeleting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("student_answers")
        .delete()
        .eq("id", answerToDelete.id)
        .eq("student_id", user.id)

      if (error) throw error

      // Update local state
      setAllAnswers((prev) => prev.filter((a) => a.id !== answerToDelete.id))
      setDeleteDialogOpen(false)
      setAnswerToDelete(null)
      setDeleteConfirmation("")
      toast.success("Answer deleted successfully")
    } catch (error) {
      console.error("Error deleting answer:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <RevisitSkeleton />
  }

  // access control
  if (!userCanViewAnswers) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Access Restricted</CardTitle>
              <CardDescription>
                You need a paid plan to view your previous answers and revisit questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Upgrade Plan
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Revisit Questions</h1>
              <p className="text-muted-foreground">
                {selectedTopics.length > 0
                  ? `Review ${activeTab !== "all" ? activeTab + " " : ""}questions from selected topics`
                  : `Review ${activeTab !== "all" ? activeTab + " " : ""}questions you've previously answered`}
              </p>
            </div>
            <UserLogin email={user?.email} />
          </div>

          {userCanAccessFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Filter by Topic</CardTitle>
                  <CardDescription>Select specific topics to review</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopicFilter selectedTopics={selectedTopics} onTopicChange={handleTopicChange} topics={topics} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Filter by Type</CardTitle>
                  <CardDescription>Choose question types to review</CardDescription>
                </CardHeader>
                <CardContent>
                  <QuestionTypeFilter
                    selectedType={typeParam}
                    onTypeChange={(type: string | null) => {
                      const params = new URLSearchParams(searchParams.toString())
                      if (type === null) {
                        params.delete("type")
                      } else {
                        params.set("type", type)
                      }
                      router.push(`?${params.toString()}`)
                    }}
                  />
                </CardContent>
              </Card>

              {/* Difficulty */}
              <Card>
                <CardHeader>
                  <CardTitle>Filter by Difficulty</CardTitle>
                  <CardDescription>Choose question difficulty to review</CardDescription>
                </CardHeader>
                <CardContent>
                  <QuestionDifficultyFilter
                    selectedDifficulty={difficultyParam}
                    availableDifficulty={availableDifficulty}
                    onDifficultyChange={(difficulty: string | null) => {
                      const params = new URLSearchParams(searchParams.toString())
                      if (difficulty === null) {
                        params.delete("difficulty")
                      } else {
                        params.set("difficulty", difficulty)
                      }
                      router.push(`?${params.toString()}`)
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Button
            variant="outline"
            className={`w-full h-12 ${activeTab === "all" ? "bg-slate-50 border-slate-500 text-slate-800" : "border-slate-200 text-slate-800"}`}
            onClick={() => handleTabChange("all")}
          >
            <div className="text-center w-full">
              <div className="font-medium flex items-center justify-center gap-1">
                <FileText className="h-4 w-4" /> All Questions
              </div>
              <div className="text-xs text-muted-foreground">{totalAnswers} total</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className={`w-full h-12 ${activeTab === "green" ? "bg-emerald-50 border-emerald-600 text-emerald-700" : "border-emerald-200 text-emerald-700"} hover:bg-emerald-50`}
            onClick={() => handleTabChange("green")}
          >
            <div className="text-center w-full">
              <div className="font-medium flex items-center justify-center gap-1">
                <CheckCircle className="h-4 w-4" /> Strong
              </div>
              <div className="text-xs">{scoreCount.green} questions</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className={`w-full h-12 ${activeTab === "amber" ? "bg-amber-50 border-amber-600 text-amber-700" : "border-amber-200 text-amber-700"} hover:bg-amber-50`}
            onClick={() => handleTabChange("amber")}
          >
            <div className="text-center w-full">
              <div className="font-medium flex items-center justify-center gap-1">
                <AlertTriangle className="h-4 w-4" /> Developing
              </div>
              <div className="text-xs">{scoreCount.amber} questions</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className={`w-full h-12 ${activeTab === "red" ? "bg-red-50 border-red-600 text-red-700" : "border-red-200 text-red-700"} hover:bg-red-50`}
            onClick={() => handleTabChange("red")}
          >
            <div className="text-center w-full">
              <div className="font-medium flex items-center justify-center gap-1">
                <AlertCircle className="h-4 w-4" /> Needs Work
              </div>
              <div className="text-xs">{scoreCount.red} questions</div>
            </div>
          </Button>
        </div>

        {/* Questions List - keep only the content of the selected filter */}
        {["all", "green", "amber", "red"].map((tab) => (
          activeTab === tab && (
            <div key={tab} className="space-y-6">
              {Object.keys(answersByTopic).length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Questions Found</CardTitle>
                    <CardDescription>
                      {tab === "all"
                        ? `You haven't answered any questions yet.`
                        : `You don't have any ${tab} rated questions.`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/">
                      <Button className="bg-emerald-600 hover:bg-emerald-700">Start Practicing</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                Object.entries(answersByTopic).map(([topicSlug, topicAnswers]) => {
                  const topic = topics.find((t) => t.slug === topicSlug)
                  if (!topic) return null

                  return (
                    <div key={topicSlug} className="space-y-4">
                      <div className="flex items-center gap-3">
                        {topic.icon && (
                          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                            <span className="text-emerald-600">
                              <DynamicIcon name={topic.icon} size={24} />
                            </span>
                          </div>
                        )}
                        <h2 className="text-xl font-bold text-gray-900">{topic.name}</h2>
                      </div>

                      {topicAnswers.map((answer) => {
                        const question = questions[answer.question_id]
                        if (!question) return null

                        return (
                          <Card
                            key={answer.id}

                            className="hover:shadow-md transition-shadow"
                          >
                            <CardHeader className="pb-4">
                              <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap items-center gap-2 justify-between">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                                      {getQuestionTypeLabel(question.type)}
                                    </Badge>
                                    <Badge
                                      className={`flex items-center gap-1 whitespace-nowrap ${!answer.score
                                        ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                                        : answer.score === "green"
                                          ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                          : answer.score === "amber"
                                            ? "bg-amber-50 hover:bg-amber-100 text-amber-700"
                                            : "bg-red-50 hover:bg-red-100 text-red-700"
                                        }`}
                                    >
                                      {!answer.score ? (
                                        <HelpCircle className="h-4 w-4" />
                                      ) : answer.score === "green" ? (
                                        <CheckCircle className="h-4 w-4" />
                                      ) : answer.score === "amber" ? (
                                        <AlertTriangle className="h-4 w-4" />
                                      ) : (
                                        <AlertCircle className="h-4 w-4" />
                                      )}
                                      <span>{!answer.score ? "Not assessed" : getScoreLabel(answer.score)}</span>
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-medium">
                                      {topic.name}
                                    </Badge>
                                    <Button
                                      onClick={() => handleDeleteClick(answer)}
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Question Section - Blue Theme */}
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <FileText className="h-4 w-4 text-slate-600" />
                                    <h3 className="font-semibold text-slate-700">Question</h3>
                                  </div>
                                  <div className="bg-white border border-slate-100 rounded-md p-3">
                                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
                                      {question.question_text}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                              {/* Answer Comparison Section */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Your Answer Section */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <User className="h-4 w-4 text-gray-600" />
                                    <h3 className="font-semibold text-gray-700">Your Answer</h3>
                                  </div>
                                  <div className="bg-white border border-gray-100 rounded-md p-3 min-h-[80px]">
                                    {question.type === "fill-in-the-blank" ? (
                                      <div className="space-y-2">
                                        {(() => {
                                          try {
                                            const selectedIndexes = JSON.parse(answer?.response_text || "[]") as number[];
                                            const selectedOptions = selectedIndexes.map(index => question.options?.[index]);
                                            const modelAnswer = Array.isArray(question.model_answer) ? question.model_answer : [question.model_answer];

                                            return (
                                              <div className="space-y-2">
                                                {selectedOptions.map((option, i) => {
                                                  const isOptionCorrect = question.order_important
                                                    ? option === modelAnswer[i]
                                                    : option ? modelAnswer.includes(option) : false;
                                                  return (
                                                    <div key={i} className={`flex items-center gap-2 ${isOptionCorrect ? "text-emerald-600" : "text-red-600"}`}>
                                                      {option || "No answer selected"}
                                                      {isOptionCorrect ? (
                                                        <CheckCircle className="h-4 w-4" />
                                                      ) : (
                                                        <AlertCircle className="h-4 w-4" />
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            );
                                          } catch {
                                            return "Invalid answer format";
                                          }
                                        })()}
                                      </div>
                                    ) : question.type === "matching" ? (
                                      <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                          <thead>
                                            <tr>
                                              <th className="border border-gray-200 p-2 text-left bg-gray-50 text-gray-700">
                                                Statement
                                              </th>
                                              <th className="border border-gray-200 p-2 text-left bg-gray-50 text-gray-700">
                                                Your Match
                                              </th>
                                              <th className="border border-gray-200 p-2 text-center bg-gray-50 text-gray-700 w-12">
                                                ✓
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {question.pairs?.map((pair, index) => {
                                              const userMatches = (() => {
                                                try {
                                                  const parsed = JSON.parse(answer.response_text) as Record<string, string[]>;
                                                  return parsed[pair.statement] || [];
                                                } catch {
                                                  return [];
                                                }
                                              })();
                                              const isCorrect = userMatches.includes(pair.match);
                                              return (
                                                <tr key={index} className={isCorrect ? "bg-emerald-50" : "bg-red-50"}>
                                                  <td className="border border-gray-200 p-2 text-gray-700">{pair.statement}</td>
                                                  <td className="border border-gray-200 p-2 text-gray-700">
                                                    {userMatches.join(", ") || "No match selected"}
                                                  </td>
                                                  <td className="border border-gray-200 p-2 text-center">
                                                    <div className="flex justify-center">
                                                      {isCorrect ? (
                                                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                                                      ) : (
                                                        <AlertCircle className="h-3 w-3 text-red-600" />
                                                      )}
                                                    </div>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : question.type === "true-false" ? (
                                      (() => {
                                        const userAnswer = (answer.response_text ?? "").trim().toLowerCase();
                                        const correctAnswer = String(question.correct_answer).trim().toLowerCase();
                                        const isCorrect = userAnswer === correctAnswer;
                                        console.log({
                                          userAnswer,
                                          correctAnswer,
                                          isCorrect,
                                          typeofCorrectAnswer: typeof question.correct_answer,
                                          typeofUserAnswer: typeof answer.response_text
                                        });
                                        return (
                                          <div className="text-center">
                                            <span
                                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isCorrect
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                              {userAnswer === "true" ? "True" : "False"}
                                              {isCorrect ? (
                                                <CheckCircle className="h-4 w-4 ml-2" />
                                              ) : (
                                                <AlertCircle className="h-4 w-4 ml-2" />
                                              )}
                                            </span>
                                          </div>
                                        );
                                      })()
                                    ) : question.type === "multiple-choice" ? (
                                      <div className="space-y-2">
                                        {question.options?.map((option, index) => {
                                          const isCorrect = index === question.correctAnswerIndex

                                          if (!isCorrect) return null

                                          return (
                                            <div
                                              key={index}
                                              className="p-2 rounded border bg-emerald-100 border-emerald-300 text-emerald-800"
                                            >
                                              <div className="flex items-center justify-between">
                                                <span>{option}</span>
                                                <CheckCircle className="h-4 w-4" />
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    ) : (
                                      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                                        {answer.response_text}
                                      </pre>
                                    )}
                                  </div>
                                </div>

                                {/* Model Answer Section */}
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <GraduationCap className="h-4 w-4 text-emerald-600" />
                                    <h3 className="font-semibold text-emerald-700">Model Answer</h3>
                                  </div>
                                  <div className="bg-white border border-emerald-100 rounded-md p-3 min-h-[80px]">
                                    {question.type === "fill-in-the-blank" ? (
                                      <div className="space-y-2">
                                        {Array.isArray(question.model_answer) ? (
                                          question.order_important ? (
                                            <ol className="list-decimal pl-4 space-y-1">
                                              {question.model_answer.map((ans, idx) => (
                                                <li key={idx} className="text-emerald-700">
                                                  {ans}
                                                </li>
                                              ))}
                                            </ol>
                                          ) : (
                                            <ul className="list-disc pl-4 space-y-1">
                                              {question.model_answer.map((ans, idx) => (
                                                <li key={idx} className="text-emerald-700">
                                                  {ans}
                                                </li>
                                              ))}
                                            </ul>
                                          )
                                        ) : (
                                          <span className="text-emerald-700">{question.model_answer}</span>
                                        )}
                                      </div>
                                    ) : question.type === "matching" ? (
                                      <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-sm">
                                          <thead>
                                            <tr>
                                              <th className="border border-emerald-200 p-2 text-left bg-emerald-50 text-emerald-700">
                                                Statement
                                              </th>
                                              <th className="border border-emerald-200 p-2 text-left bg-emerald-50 text-emerald-700">
                                                Correct Match
                                              </th>
                                              <th className="border border-emerald-200 p-2 text-center bg-emerald-50 text-emerald-700 w-12">
                                                ✓
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {question.pairs?.map((pair, index) => (
                                              <tr key={index} className="bg-emerald-25">
                                                <td className="border border-emerald-200 p-2 text-emerald-700">
                                                  {pair.statement}
                                                </td>
                                                <td className="border border-emerald-200 p-2 text-emerald-700">
                                                  {pair.match}
                                                </td>
                                                <td className="border border-emerald-200 p-2 text-center">
                                                  <CheckCircle className="h-3 w-3 text-emerald-600 mx-auto" />
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : question.type === "true-false" ? (
                                      (() => {
                                        const modelAnswerDisplay = String(question.model_answer).trim().toLowerCase();
                                        return (
                                          <div className="text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                                              {modelAnswerDisplay === "true" ? "True" : "False"}
                                              <CheckCircle className="h-4 w-4 ml-2" />
                                            </span>
                                          </div>
                                        );
                                      })()
                                    ) : question.type === "multiple-choice" ? (
                                      <div className="space-y-2">
                                        {question.options?.map((option, index) => {
                                          const isCorrect = index === question.correctAnswerIndex

                                          if (!isCorrect) return null

                                          return (
                                            <div
                                              key={index}
                                              className="p-2 rounded border bg-emerald-100 border-emerald-300 text-emerald-800"
                                            >
                                              <div className="flex items-center justify-between">
                                                <span>{option}</span>
                                                <CheckCircle className="h-4 w-4" />
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        {question.type === "code" && (
                                          <div>
                                            <h4 className="text-sm font-medium mb-2 text-emerald-800">Pseudocode:</h4>
                                            <pre className="whitespace-pre-wrap font-sans text-sm text-emerald-700">
                                              {question.model_answer}
                                            </pre>
                                          </div>
                                        )}
                                        {question.type !== "code" && (
                                          <pre className="whitespace-pre-wrap font-sans text-sm text-emerald-700">
                                            {question.model_answer}
                                          </pre>
                                        )}
                                        {question.model_answer_code && (
                                          <div className="border-t border-emerald-200 pt-3">
                                            <h4 className="text-sm font-medium mb-2 text-emerald-800">{question.language}:</h4>
                                            <pre className="whitespace-pre-wrap font-mono text-sm text-emerald-700 bg-emerald-25 p-2 rounded">
                                              {question.model_answer_code}
                                            </pre>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Explanation Section - Purple Theme */}
                              {question.explanation && (
                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <HelpCircle className="h-4 w-4 text-indigo-600" />
                                    <h3 className="font-semibold text-indigo-700">Explanation</h3>
                                  </div>
                                  <div className="bg-white border border-indigo-100 rounded-md p-3">
                                    <p className="whitespace-pre-wrap text-sm text-indigo-700">
                                      {question.explanation}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Continue Learning Section */}
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Continue Learning</h4>
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <Button
                                    onClick={() =>
                                      router.push(`/questions/${topicSlug}?questionId=${answer.question_id}`)
                                    }
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                    size="default"
                                  >
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Try Again
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => router.push(`/questions/${topicSlug}`)}
                                    variant="outline"
                                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 shadow-sm"
                                    size="default"
                                  >
                                    {topic.icon && <DynamicIcon name={topic.icon} size={16} className="mr-2" />}
                                    <span className="hidden sm:inline">Practice More</span>
                                    <span className="truncate max-w-[120px]">{topic.name}</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>
          )
        ))}

        {/* Add Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">Delete Attempt</DialogTitle>
              <DialogDescription className="text-gray-500 mt-2">
                This action cannot be undone. This will permanently delete your attempt for this question.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 px-1">
              <div className="space-y-3">
                <label htmlFor="delete-confirmation" className="text-sm font-medium text-gray-700 block">
                  Type &quot;delete&quot; to confirm
                </label>
                <Input
                  id="delete-confirmation"
                  placeholder="Type &quot;delete&quot; to confirm"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className={`w-full ${deleteConfirmation && deleteConfirmation !== "delete"
                    ? "border-red-300 focus-visible:ring-red-500"
                    : ""
                    }`}
                />
                {deleteConfirmation && deleteConfirmation !== "delete" && (
                  <p className="text-sm text-red-500 mt-1">Please type &quot;delete&quot; exactly to confirm</p>
                )}
              </div>
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setAnswerToDelete(null)
                  setDeleteConfirmation("")
                }}
                className="mt-2 sm:mt-0"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmation !== "delete" || isDeleting}
                className={`flex items-center gap-2 ${deleteConfirmation === "delete"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-100 text-red-400 cursor-not-allowed"
                  }`}
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Attempt
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

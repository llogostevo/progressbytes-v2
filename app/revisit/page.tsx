"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Answer, Question, ScoreType } from "@/lib/types"
import { CheckCircle, AlertTriangle, AlertCircle, ArrowRight, BookOpen, HelpCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"
import { UserLogin } from "@/components/user-login"
import { TopicFilter } from "@/components/topic-filter"
import { QuestionTypeFilter } from "@/components/question-type-filter"
import { DynamicIcon } from "@/components/ui/dynamicicon"

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

export default function RevisitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as ScoreType | null
  const typeParam = searchParams.get("type")
  const selectedTopics = searchParams.get("topics")?.split(",") || []

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [allAnswers, setAllAnswers] = useState<Answer[]>([])
  const [questions, setQuestions] = useState<Record<string, Question>>({})
  const [activeTab, setActiveTab] = useState<ScoreType | "all">(tabParam || "all")
  const [topics, setTopics] = useState<DBTopic[]>([])

  // Memoize filtered answers
  const filteredAnswers = useMemo(() => {
    if (allAnswers.length === 0 || topics.length === 0) return allAnswers

    return selectedTopics.length > 0
      ? allAnswers.filter((answer) => {
          const question = questions[answer.question_id]
          return question && selectedTopics.some(topicSlug => 
            topics.some(t => t.slug === topicSlug && t.id === question.topic)
          )
        })
      : allAnswers
  }, [allAnswers, selectedTopics, topics, questions])

  // First useEffect for initial data loading
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        // Fetch topics from the database
        const { data: topicsData, error: topicsError } = await supabase
          .from('topics')
          .select('*')

        if (topicsError) {
          console.error('Error fetching topics:', topicsError)
          return
        }

        setTopics(topicsData || [])

        // Fetch answers for the user
        const { data: answersData, error: answersError } = await supabase
          .from('student_answers')
          .select('*')
          .eq('student_id', user.id)
          .order('submitted_at', { ascending: false })

        if (answersError) {
          console.error('Error fetching answers:', answersError)
          return
        }

        // Map database fields to Answer type
        const mappedAnswers: Answer[] = answersData.map(answer => ({
          id: answer.id,
          question_id: answer.question_id,
          student_id: answer.student_id,
          response_text: answer.response_text,
          ai_feedback: answer.ai_feedback,
          score: answer.student_score as ScoreType,
          submitted_at: answer.submitted_at,
          self_assessed: answer.self_assessed
        }))

        // Get all question IDs from answers
        const questionIds = mappedAnswers.map(answer => answer.question_id)

        // Fetch questions with their type-specific data
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
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
          .in('id', questionIds)

        if (questionsError) {
          console.error('Error fetching questions:', questionsError)
          return
        }

        // Create a map of questions with their type-specific data
        const questionMap: Record<string, Question> = {}
        questionsData?.forEach(q => {
          let typeSpecificData: TypeSpecificData | null = null
          let pairs: MatchingPair[] = []
          let options: string[] = []
          let correctAnswerIndex: number = 0
          let correctAnswers: string[] = []
          let fibq = undefined;

          switch (q.type) {
            case 'short-answer':
              typeSpecificData = {
                model_answer: q.short_answer_questions?.model_answer || '',
                model_answer_code: q.short_answer_questions?.model_answer_code,
                order_important: q.short_answer_questions?.order_important
              }

              break
            case 'true-false':
              typeSpecificData = q.true_false_questions?.[0] as TypeSpecificData
              break
            case 'matching':
              typeSpecificData = q.matching_questions?.[0] as TypeSpecificData
              pairs = q.matching_questions || []
              break
            case 'fill-in-the-blank':
              fibq = q.fill_in_the_blank_questions;
              if (Array.isArray(fibq)) {
                fibq = fibq[0];
              }
              typeSpecificData = fibq as TypeSpecificData;
              options = fibq?.options || [];
              correctAnswers = fibq?.correct_answers || [];
              break
            case 'code':
              console.log('CODE QUESTION:', q.code_questions)
              typeSpecificData = {
                model_answer: q.code_questions?.model_answer || '',
                model_answer_code: q.code_questions?.model_answer_code
              }
              break
            case 'multiple-choice':
              // Handle both array and object cases
              const mcq = Array.isArray(q.multiple_choice_questions)
                ? q.multiple_choice_questions[0]
                : q.multiple_choice_questions;
              typeSpecificData = mcq as TypeSpecificData;
              options = typeSpecificData?.options || [];
              correctAnswerIndex = typeSpecificData?.correct_answer_index || 0;
              break
            case 'essay':
              typeSpecificData = q.essay_questions?.[0] as TypeSpecificData
              break
          }

          const topic = q.subtopic_question_link?.[0]?.subtopic?.topic

          const mappedQuestion = {
            id: q.id,
            type: q.type,
            question_text: q.question_text,
            explanation: q.explanation,
            topic: topic?.id,
            model_answer: (() => {
              switch (q.type) {
                case 'multiple-choice':
                  return options[correctAnswerIndex] || ''
                case 'fill-in-the-blank':
                  return correctAnswers
                case 'true-false':
                  return typeSpecificData?.correct_answer ?? false
                case 'matching':
                  return typeSpecificData?.model_answer || ''
                case 'code':
                case 'short-answer':
                case 'essay':
                  return typeSpecificData?.model_answer || ''
                default:
                  return ''
              }
            })(),
            model_answer_python: typeSpecificData?.model_answer_code,
            pairs: pairs,
            order_important: fibq?.order_important,
            options: options,
            correctAnswerIndex: correctAnswerIndex,
            created_at: q.created_at,
            correct_answer: q.true_false_questions?.[0]?.correct_answer
          }

          questionMap[q.id] = mappedQuestion
        })

        setQuestions(questionMap)
        setAllAnswers(mappedAnswers)

        await supabase.from('user_activity').insert({
          user_id: user.id,
          event: 'visited_revisit',
          path: '/revisit',
          user_email: user.email
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }
    getUser()
  }, [])

  // Filter answers by score and type
  const filteredAnswersByScoreAndType = useMemo(() => {
    return filteredAnswers
      .filter((answer) => activeTab === "all" || answer.score === activeTab)
      .filter((answer) => {
        if (typeParam === "all" || !typeParam) return true
        const question = questions[answer.question_id]
        return question?.type === typeParam
      })
  }, [filteredAnswers, activeTab, typeParam, questions])

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
        if (!acc[topicSlug].some((a) => a.question_id === answer.question_id)) {
          acc[topicSlug].push(answer)
        }

        return acc
      },
      {} as Record<string, Answer[]>,
    )
  }, [filteredAnswersByScoreAndType, questions, topics])

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading your answers...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-3xl font-bold mb-2">Revisit Questions</h1>
            <UserLogin email={user?.email} />
          </div>

          <p className="text-muted-foreground mb-4">
            {selectedTopics.length > 0
              ? `Review ${activeTab !== "all" ? activeTab + " " : ""}questions from selected topics`
              : `Review ${activeTab !== "all" ? activeTab + " " : ""}questions you've previously answered`}
          </p>

          <div className="space-y-4 mb-8">
            <TopicFilter selectedTopics={selectedTopics} onTopicChange={handleTopicChange} topics={topics} />
            <div className="bg-muted/50 rounded-lg p-3 border border-muted">
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
            </div>
          </div>
        </div>

        <Tabs value={activeTab} className="mb-8" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All Questions</TabsTrigger>
            <TabsTrigger value="green" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Green
            </TabsTrigger>
            <TabsTrigger value="amber" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Amber
            </TabsTrigger>
            <TabsTrigger value="red" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Red
            </TabsTrigger>
          </TabsList>

          {["all", "green", "amber", "red"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-6">
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
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        {topic.icon && <DynamicIcon name={topic.icon} size={20} className="text-emerald-500" />}
                        {topic.name}
                      </h2>

                      {topicAnswers.map((answer) => {
                        const question = questions[answer.question_id]
                        if (!question) return null

                        return (
                          <Card key={`${answer.question_id}-${answer.score}`}>
                            <CardHeader className="pb-2">
                              <div className="flex flex-col gap-3">
                                <div className="flex justify-end gap-2 shrink-0">
                                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                                    {getQuestionTypeLabel(question.type)}
                                  </Badge>
                                  <Badge className={`flex items-center gap-1 whitespace-nowrap ${!answer.score
                                    ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                                    : answer.score === "green"
                                      ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                      : answer.score === "amber"
                                        ? "bg-amber-50 hover:bg-amber-100 text-amber-700"
                                        : "bg-red-50 hover:bg-red-100 text-red-700"
                                    }`}>
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
                                <CardTitle className="text-lg font-semibold leading-relaxed">
                                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <pre className="whitespace-pre-wrap font-sans text-gray-800">{question.question_text}</pre>
                                  </div>
                                </CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  {/* MATCHING QUESTION */}
                                  {question.type === "matching" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="overflow-x-auto">
                                        <h3 className="font-medium mb-2 text-sm">Your Answer:</h3>
                                        <table className="w-full border-collapse text-sm">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left bg-gray-50">Statement</th>
                                              <th className="border p-2 text-left bg-gray-50">Your Match</th>
                                              <th className="border p-2 text-center bg-gray-50 w-12">Status</th>
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
                                                <tr key={index} className={isCorrect ? "bg-green-50" : "bg-red-50"}>
                                                  <td className="border p-2">{pair.statement}</td>
                                                  <td className="border p-2">
                                                    {userMatches.join(", ") || "No match selected"}
                                                  </td>
                                                  <td className="border p-2 text-center">
                                                    <div className="flex justify-center">
                                                      {isCorrect ? (
                                                        <CheckCircle className="h-3 w-3 text-green-600" />
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
                                      <div className="overflow-x-auto">
                                        <h3 className="font-medium mb-2 text-sm text-emerald-700">Correct Answer:</h3>
                                        <table className="w-full border-collapse text-sm">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left bg-gray-50">Statement</th>
                                              <th className="border p-2 text-left bg-gray-50">Correct Match</th>
                                              <th className="border p-2 text-center bg-gray-50 w-12">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {question.pairs?.map((pair, index) => (
                                              <tr key={index} className="bg-emerald-50">
                                                <td className="border p-2">{pair.statement}</td>
                                                <td className="border p-2">{pair.match}</td>
                                                <td className="border p-2 text-center">
                                                  <div className="flex justify-center">
                                                    <CheckCircle className="h-3 w-3 text-emerald-600" />
                                                  </div>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                    // TRUE/FALSE QUESTION
                                  ) : question.type === "true-false" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="overflow-x-auto">
                                        <h3 className="font-medium mb-2 text-sm">Your Answer:</h3>
                                        <table className="w-full border-collapse text-sm">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left bg-gray-50">Question</th>
                                              <th className="border p-2 text-center bg-gray-50">Your Answer</th>
                                              <th className="border p-2 text-center bg-gray-50 w-12">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr className={(answer.response_text === "true" === Boolean(question.model_answer)) ? "bg-green-50" : "bg-red-50"}>
                                              <td className="border p-2">{question.question_text}</td>
                                              <td className="border p-2 text-center">{answer.response_text === "true" ? "True" : "False"}</td>
                                              <td className="border p-2 text-center">
                                                <div className="flex justify-center">
                                                  {(answer.response_text === "true" === Boolean(question.model_answer)) ? (
                                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                                  ) : (
                                                    <AlertCircle className="h-3 w-3 text-red-600" />
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                      <div className="overflow-x-auto">
                                        <h3 className="font-medium mb-2 text-sm text-emerald-700">Correct Answer:</h3>
                                        <table className="w-full border-collapse text-sm">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left bg-gray-50">Question</th>
                                              <th className="border p-2 text-center bg-gray-50">Correct Answer</th>
                                              <th className="border p-2 text-center bg-gray-50 w-12">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr className="bg-emerald-50">
                                              <td className="border p-2">{question.question_text}</td>
                                              <td className="border p-2 text-center">
                                                {question.correct_answer ? "True" : "False"}
                                              </td>
                                              <td className="border p-2 text-center">
                                                <div className="flex justify-center">
                                                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                                                </div>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                    // FILL IN THE BLANK QUESTION
                                  ) : question.type === "fill-in-the-blank" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="overflow-x-auto">
                                        <h3 className="font-medium mb-2 text-sm">Your Answer:</h3>
                                        <table className="w-full border-collapse text-sm">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left bg-gray-50">Question</th>
                                              <th className="border p-2 text-left bg-gray-50">Your Answer</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr>
                                              <td className="border p-2">{question.question_text}</td>
                                              <td className="border p-2">
                                                {(() => {
                                                  let selectedIndexes: number[] = [];
                                                  let oldFormat = false;
                                                  try {
                                                    const parsed = JSON.parse(answer.response_text || "[]");
                                                    if (Array.isArray(parsed)) {
                                                      selectedIndexes = parsed;
                                                    } else {
                                                      oldFormat = true;
                                                    }
                                                  } catch {
                                                    oldFormat = true;
                                                  }
                                                  const options = Array.isArray(question.options) ? question.options : [];
                                                  const blanksCount = Array.isArray(question.model_answer) ? question.model_answer.length : selectedIndexes.length;
                                                  const modelAnswer = Array.isArray(question.model_answer) ? question.model_answer : [question.model_answer];
                                                  if (oldFormat) {
                                                    return <div className="text-red-600">This answer was submitted using an old format and cannot be displayed.</div>;
                                                  }
                                                  return (
                                                    <div className="space-y-1">
                                                      {Array.from({ length: blanksCount }).map((_, i) => {
                                                        const selectedIndex = selectedIndexes[i];
                                                        const option = typeof selectedIndex === 'number' && options[selectedIndex] !== undefined ? options[selectedIndex] : undefined;
                                                        const isOptionCorrect = option !== undefined && (question.order_important
                                                          ? option === modelAnswer[i]
                                                          : modelAnswer.includes(option));
                                                        return (
                                                          <div key={i} className={`${isOptionCorrect ? "text-green-600" : "text-red-600"}`}>
                                                            {option || "No answer selected"}
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  );
                                                })()}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                      <div className="overflow-x-auto">
                                        <h3 className="font-medium mb-2 text-sm text-emerald-700">Correct Answer:</h3>
                                        <table className="w-full border-collapse text-sm">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left bg-gray-50">Question</th>
                                              <th className="border p-2 text-left bg-gray-50">Correct Answer</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr>
                                              <td className="border p-2">{question.question_text}</td>
                                              <td className="border p-2">
                                                {Array.isArray(question.model_answer) ? (
                                                  question.order_important ? (
                                                    <ol className="list-decimal pl-4 mb-0">
                                                      {question.model_answer.map((ans, idx) => (
                                                        <li key={idx} className="text-emerald-600">{ans}</li>
                                                      ))}
                                                    </ol>
                                                  ) : (
                                                    <ul className="list-disc pl-4 mb-0">
                                                      {question.model_answer.map((ans, idx) => (
                                                        <li key={idx} className="text-emerald-600">{ans}</li>
                                                      ))}
                                                    </ul>
                                                  )
                                                ) : (
                                                  <span className="text-emerald-600">{question.model_answer}</span>
                                                )}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                    // MULTIPLE CHOICE QUESTION
                                  ) : question.type === "multiple-choice" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="overflow-x-auto">
                                        <h3 className="font-medium mb-2 text-sm">Your Answer:</h3>
                                        <table className="w-full border-collapse text-sm table-fixed">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left bg-gray-50 w-1/2">Question</th>
                                              <th className="border p-2 text-left bg-gray-50 w-1/3">Your Selection</th>
                                              <th className="border p-2 text-center bg-gray-50 w-12">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {question.options && question.options.map((option, index) => {
                                              const userSelectedIndex = parseInt(answer?.response_text ?? "-1");
                                              const isSelected = userSelectedIndex === index;
                                              const isCorrect = index === question.correctAnswerIndex;
                                              return (
                                                <tr
                                                  key={index}
                                                  className={`h-12 ${isSelected
                                                    ? isCorrect
                                                      ? "bg-green-50"
                                                      : "bg-red-50"
                                                    : ""
                                                  }`}
                                                >
                                                  <td className="border p-2 align-middle">
                                                    {isSelected ? question.question_text : ""}
                                                  </td>
                                                  <td className="border p-2 align-middle">
                                                    <div className="flex items-center gap-2">
                                                      {option}
                                                    </div>
                                                  </td>
                                                  <td className="border p-2 text-center align-middle">
                                                    <div className="flex justify-center">
                                                      {isSelected && (
                                                        isCorrect
                                                          ? <CheckCircle className="h-3 w-3 text-green-600" />
                                                          : <AlertCircle className="h-3 w-3 text-red-600" />
                                                      )}
                                                    </div>
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                      <div className="overflow-x-auto">
                                        <h3 className="font-medium mb-2 text-sm text-emerald-700">Correct Answer:</h3>
                                        <table className="w-full border-collapse text-sm table-fixed">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left bg-gray-50 w-1/2">Question</th>
                                              <th className="border p-2 text-left bg-gray-50 w-1/3">Correct Option</th>
                                              <th className="border p-2 text-center bg-gray-50 w-12">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {question.options && question.options.map((option, index) => (
                                              <tr
                                                key={index}
                                                className={`h-12 ${index === question.correctAnswerIndex
                                                  ? "bg-emerald-50"
                                                  : ""
                                                }`}
                                              >
                                                <td className="border p-2 align-middle">
                                                  {index === question.correctAnswerIndex ? question.question_text : ""}
                                                </td>
                                                <td className="border p-2 align-middle">
                                                  <div className="flex items-center gap-2">
                                                    {option}
                                                  </div>
                                                </td>
                                                <td className="border p-2 text-center align-middle">
                                                  <div className="flex justify-center">
                                                    {index === question.correctAnswerIndex && (
                                                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                                                    )}
                                                  </div>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <h3 className="text-sm font-medium mb-2 text-gray-700">Your Answer:</h3>
                                      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">{answer.response_text}</pre>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Model Answers */}
                                {question.type !== "matching" && question.type !== "true-false" && question.type !== "fill-in-the-blank" && question.type !== "multiple-choice" && (
                                  <div>
                                    <h3 className="text-sm font-medium mb-2 text-emerald-700">Model Answer:</h3>
                                    <div className="space-y-4">
                                      <div>
                                        {question.type === "code" && (
                                          <>
                                            <h4 className="text-sm font-medium mb-2 text-gray-700">Pseudocode:</h4>
                                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">{question.model_answer}</pre>
                                            </div>
                                          </>
                                        )}
                                        {question.type === "short-answer" ? (
                                          <div className="bg-emerald-50 p-4 rounded-md border border-emerald-100">
                                            <pre className="whitespace-pre-wrap font-sans text-sm text-emerald-700">{question.model_answer}</pre>
                                          </div>
                                        ) : question.type !== "code" && (
                                          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">{question.model_answer}</pre>
                                          </div>
                                        )}
                                      </div>
                                      {question.model_answer_python && (
                                          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                          <h4 className="text-sm font-medium mb-1">Python:</h4>
                                          <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">{question.model_answer_python}</pre>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {/* Explanation */}
                                {question.explanation && (
                                  <div>
                                    <h3 className="text-sm font-medium mb-2 text-gray-700">Explanation:</h3>
                                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                      <p className="whitespace-pre-wrap text-sm text-gray-700">{question.explanation}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Continue Learning */}
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                  <div className="flex flex-col gap-3">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Continue Learning:</h4>
                                    <div className="flex flex-col md:flex-row gap-3 items-start">
                                      <Button
                                        onClick={() =>
                                          router.push(`/questions/${topicSlug}?questionId=${answer.question_id}`)
                                        }
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm py-2"
                                        size="default"
                                      >
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        Try Again
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                      </Button>
                                      <Button
                                        onClick={() => router.push(`/questions/${topicSlug}`)}
                                        variant="outline"
                                        className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 shadow-sm py-2"
                                        size="default"
                                      >
                                        {topic.icon && <DynamicIcon name={topic.icon} size={16} className="mr-2" />}
                                        Practice More {topic.name}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
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
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}


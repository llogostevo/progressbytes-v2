"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Answer, Question, ScoreType } from "@/lib/types"
import { CheckCircle, AlertTriangle, AlertCircle, ArrowRight, BookOpen } from "lucide-react"
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
  const topicParam = searchParams.get("topic")
  const typeParam = searchParams.get("type")

  const [answers, setAnswers] = useState<Answer[]>([])
  const [questions, setQuestions] = useState<Record<string, Question>>({})
  const [activeTab, setActiveTab] = useState<ScoreType | "all">(tabParam || "all")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [topics, setTopics] = useState<DBTopic[]>([])

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
              typeSpecificData = q.code_questions?.[0] as TypeSpecificData
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
            created_at: q.created_at
          }


          questionMap[q.id] = mappedQuestion
        })

        setQuestions(questionMap)

        // Filter by topic if specified
        const filteredByTopic = topicParam
          ? mappedAnswers.filter((answer) => {
            const question = questionMap[answer.question_id]
            return question && topicsData?.some(t => t.slug === topicParam && t.id === question.topic)
          })
          : mappedAnswers

        setAnswers(filteredByTopic)

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
  }, [topicParam])

  // Filter answers by score and type
  const filteredAnswers = answers
    .filter((answer) => activeTab === "all" || answer.score === activeTab)
    .filter((answer) => {
      if (typeParam === "all" || !typeParam) return true
      const question = questions[answer.question_id]
      return question?.type === typeParam
    })

  // Group answers by topic
  const answersByTopic = filteredAnswers.reduce(
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

  const handleTopicChange = (topic: string | null) => {
    // Update URL using Next.js router
    const params = new URLSearchParams(searchParams.toString())
    if (topic === null) {
      params.delete("topic")
    } else {
      params.set("topic", topic)
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
            {topicParam
              ? `Review ${activeTab !== "all" ? activeTab + " " : ""}questions from ${topics.find((t) => t.slug === topicParam)?.name || "this topic"}`
              : `Review ${activeTab !== "all" ? activeTab + " " : ""}questions you've previously answered`}
          </p>

          <div className="space-y-4 mb-8">
            <TopicFilter selectedTopic={topicParam} onTopicChange={handleTopicChange} topics={topics} />
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
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                  <pre className="whitespace-pre-wrap font-sans">{question.question_text}</pre>
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {getQuestionTypeLabel(question.type)}
                                  </Badge>
                                  <Badge className={`flex items-center gap-1 ${answer.score === "green"
                                    ? "bg-emerald-500 hover:bg-emerald-500 text-white"
                                    : answer.score === "amber"
                                      ? "bg-amber-500 hover:bg-amber-500 text-white"
                                      : "bg-red-500 hover:bg-red-500 text-white"
                                    }`}>
                                    {answer.score === "green" ? (
                                      <CheckCircle className="h-4 w-4" />
                                    ) : answer.score === "amber" ? (
                                      <AlertTriangle className="h-4 w-4" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4" />
                                    )}
                                    <span>{getScoreLabel(answer.score)}</span>
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  <h3 className="text-sm font-medium mb-1">Your Answer:</h3>
                                  {question.type === "matching" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="overflow-x-auto">
                                        <h3 className="font-medium mb-2">Your Answer:</h3>
                                        <table className="w-full border-collapse">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left">Statement</th>
                                              <th className="border p-2 text-left">Your Match</th>
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
                                                    <div className="flex items-center gap-2">
                                                      {userMatches.join(", ") || "No match selected"}
                                                      {isCorrect ? (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                      ) : (
                                                        <AlertCircle className="h-4 w-4 text-red-600" />
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
                                        <h3 className="font-medium mb-2 text-emerald-700">Correct Answer:</h3>
                                        <table className="w-full border-collapse">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left">Statement</th>
                                              <th className="border p-2 text-left">Correct Match</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {question.pairs?.map((pair, index) => (
                                              <tr key={index} className="bg-emerald-50">
                                                <td className="border p-2">{pair.statement}</td>
                                                <td className="border p-2">{pair.match}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  ) : question.type === "true-false" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="overflow-x-auto">
                                        <h3 className="font-medium mb-2">Your Answer:</h3>
                                        <table className="w-full border-collapse">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left">Question</th>
                                              <th className="border p-2 text-center">Your Answer</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr className={answer.response_text === question.model_answer ? "bg-green-50" : "bg-red-50"}>
                                              <td className="border p-2">{question.question_text}</td>
                                              <td className="border p-2 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                  {answer.response_text === "true" ? "True" : "False"}
                                                  {answer.response_text === question.model_answer ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                  ) : (
                                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                      <div className="overflow-x-auto">
                                        <h3 className="font-medium mb-2 text-emerald-700">Correct Answer:</h3>
                                        <table className="w-full border-collapse">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left">Question</th>
                                              <th className="border p-2 text-center">Correct Answer</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr className="bg-emerald-50">
                                              <td className="border p-2">{question.question_text}</td>
                                              <td className="border p-2 text-center">
                                                {question.model_answer === "true" ? "True" : "False"}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  ) : question.type === "fill-in-the-blank" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="overflow-x-auto">
                                        <h3 className="font-medium mb-2">Your Answer:</h3>
                                        <table className="w-full border-collapse">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left">Question</th>
                                              <th className="border p-2 text-center">Your Answer</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr>
                                              <td className="border p-2">{question.question_text}</td>
                                              <td className="border p-2">
                                                {(() => {
                                                  // DEBUG: Print selectedIndexes, options, modelAnswer, and order_important for troubleshooting
                                                  let selectedIndexes: number[] = [];
                                                  let oldFormat = false;
                                                  try {
                                                    const parsed = JSON.parse(answer.response_text || "[]");
                                                    if (Array.isArray(parsed)) {
                                                      selectedIndexes = parsed;
                                                    } else {
                                                      oldFormat = true;
                                                    }
                                                  } catch  {
                                                    oldFormat = true;
                                                  }
                                                  const options = Array.isArray(question.options) ? question.options : [];
                                                  const blanksCount = Array.isArray(question.model_answer) ? question.model_answer.length : selectedIndexes.length;
                                                  const modelAnswer = Array.isArray(question.model_answer) ? question.model_answer : [question.model_answer];
                                                  if (oldFormat) {
                                                    return <div className="text-red-600">This answer was submitted using an old format and cannot be displayed.</div>;
                                                  }
                                                  return (
                                                    <div className="space-y-2">
                                                      {Array.from({ length: blanksCount }).map((_, i) => {
                                                        const selectedIndex = selectedIndexes[i];
                                                        const option = typeof selectedIndex === 'number' && options[selectedIndex] !== undefined ? options[selectedIndex] : undefined;
                                                        const isOptionCorrect = option !== undefined && (question.order_important
                                                          ? option === modelAnswer[i]
                                                          : modelAnswer.includes(option));
                                                        return (
                                                          <div key={i} className={`flex items-center gap-2 ${isOptionCorrect ? "text-green-600" : "text-red-600"}`}>
                                                            {option || "No answer selected"}
                                                            {option
                                                              ? (isOptionCorrect
                                                                ? <CheckCircle className="h-4 w-4" />
                                                                : <AlertCircle className="h-4 w-4" />)
                                                              : <AlertCircle className="h-4 w-4" />}
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
                                        <h3 className="font-medium mb-2 text-emerald-700">Correct Answer:</h3>
                                        <table className="w-full border-collapse">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left">Question</th>
                                              <th className="border p-2 text-center">Correct Answer</th>
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
                                  ) : question.type === "multiple-choice" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="overflow-x-auto">
                                        <h3 className="font-medium mb-2">Your Answer:</h3>
                                        <table className="w-full border-collapse">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left">Question</th>
                                              <th className="border p-2 text-left">Your Selection</th>
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
                                                  className={isSelected
                                                    ? isCorrect
                                                      ? "bg-green-50"
                                                      : "bg-red-50"
                                                    : ""
                                                  }
                                                >
                                                  <td className="border p-2">
                                                    {index === 0 ? question.question_text : ""}
                                                  </td>
                                                  <td className="border p-2">
                                                    <div className="flex items-center gap-2">
                                                      {option}
                                                      {isSelected && (
                                                        isCorrect
                                                          ? <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                                                          : <AlertCircle className="h-4 w-4 text-red-600 ml-2" />
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
                                        <h3 className="font-medium mb-2 text-emerald-700">Correct Answer:</h3>
                                        <table className="w-full border-collapse">
                                          <thead>
                                            <tr>
                                              <th className="border p-2 text-left">Question</th>
                                              <th className="border p-2 text-left">Correct Option</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {question.options && question.options.map((option, index) => (
                                              <tr
                                                key={index}
                                                className={index === question.correctAnswerIndex
                                                  ? "bg-emerald-50"
                                                  : ""
                                                }
                                              >
                                                <td className="border p-2">
                                                  {index === 0 ? question.question_text : ""}
                                                </td>
                                                <td className="border p-2">
                                                  <div className="flex items-center gap-2">
                                                    {option}
                                                    {index === question.correctAnswerIndex && (
                                                      <CheckCircle className="h-4 w-4 text-emerald-600 ml-2" />
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
                                    <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">{answer.response_text}</pre>
                                  )}
                                </div>

                                {question.type !== "matching" && question.type !== "true-false" && question.type !== "fill-in-the-blank" && (
                                  <div>
                                    <h3 className="text-sm font-medium mb-1 text-emerald-700">Model Answer:</h3>
                                    <div className="space-y-4">
                                      <div>
                                        {question.type === "code" && (
                                          <h4 className="text-sm font-medium mb-1">Pseudocode:</h4>
                                        )}
                                        {question.type === "short-answer" ? (
                                          <div className="bg-emerald-50 p-4 rounded-md">
                                            <pre className="whitespace-pre-wrap font-sans text-sm text-emerald-700">{question.model_answer}</pre>
                                          </div>
                                        ) : (
                                          <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">{question.model_answer}</pre>
                                        )}
                                      </div>
                                      {question.model_answer_python && (
                                        <div>
                                          <h4 className="text-sm font-medium mb-1">Python:</h4>
                                          <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">{question.model_answer_python}</pre>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {question.explanation && (
                                  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-md">
                                    <h3 className="text-sm font-medium mb-2 text-emerald-700">Explanation:</h3>
                                    <p className="whitespace-pre-wrap text-sm text-emerald-700">{question.explanation}</p>
                                  </div>
                                )}

                                <div className="mt-6 pt-4 border-t border-gray-200">
                                  <div className="flex flex-col gap-3">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Continue Learning:</h4>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                      <Button
                                        onClick={() =>
                                          router.push(`/questions/${topicSlug}?questionId=${answer.question_id}`)
                                        }
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                        size="lg"
                                      >
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        Practice This Question Again
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                      </Button>
                                      <Button
                                        onClick={() => router.push(`/questions/${topicSlug}`)}
                                        variant="outline"
                                        className="flex-1 border-emerald-600 text-emerald-600 hover:bg-emerald-50 shadow-sm"
                                        size="lg"
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


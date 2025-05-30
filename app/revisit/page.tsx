"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { topics } from "@/lib/data"
import type { Answer, Question, ScoreType } from "@/lib/types"
import { CheckCircle, AlertTriangle, AlertCircle, ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"
import { UserLogin } from "@/components/user-login"
import { TopicFilter } from "@/components/topic-filter"
import { QuestionTypeFilter } from "@/components/question-type-filter"

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

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        // Fetch answers for the user
        const { data: answersData, error } = await supabase
          .from('student_answers')
          .select('*')
          .eq('student_id', user.id)
          .order('submitted_at', { ascending: false })

        if (error) {
          console.error('Error fetching answers:', error)
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

        // Filter by topic if specified
        const filteredByTopic = topicParam
          ? mappedAnswers.filter((answer) => {
            const question = topics.flatMap((t) => t.questions).find((q) => q.id === answer.question_id)
            return (
              question && topics.find((t) => t.slug === topicParam)?.questions.some((q) => q.id === answer.question_id)
            )
          })
          : mappedAnswers

        setAnswers(filteredByTopic)

        // Get all questions referenced in answers
        const questionMap: Record<string, Question> = {}
        filteredByTopic.forEach((answer) => {
          const question = topics.flatMap((t) => t.questions).find((q) => q.id === answer.question_id)
          if (question) {
            questionMap[question.id] = question
          }
        })
        setQuestions(questionMap)

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

      const topicSlug = topics.find((t) => t.questions.some((q) => q.id === answer.question_id))?.slug || "unknown"

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

    // Update URL without refreshing the page
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("tab")
    } else {
      params.set("tab", value)
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.pushState({}, "", newUrl)
  }

  const handleTopicChange = (topic: string | null) => {
    // Update URL without refreshing the page
    const params = new URLSearchParams(searchParams.toString())
    if (topic === null) {
      params.delete("topic")
    } else {
      params.set("topic", topic)
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.pushState({}, "", newUrl)
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
            <TopicFilter selectedTopic={topicParam} onTopicChange={handleTopicChange} />
            <div className="bg-muted/50 rounded-xl p-6 border border-muted">
              <QuestionTypeFilter 
                selectedType={typeParam} 
                onTypeChange={(type: string | null) => {
                  const params = new URLSearchParams(searchParams.toString())
                  if (type === null) {
                    params.delete("type")
                  } else {
                    params.set("type", type)
                  }
                  const newUrl = `${window.location.pathname}?${params.toString()}`
                  window.history.pushState({}, "", newUrl)
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
                        {topic.icon && React.createElement(topic.icon, { size: 20, className: "text-emerald-500" })}
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
                                              <th className="border p-2 text-left">Your Answer</th>
                                              <th className="border p-2 text-center">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr className={answer.response_text === "Correct" ? "bg-green-50" : "bg-red-50"}>
                                              <td className="border p-2">{answer.response_text}</td>
                                              <td className="border p-2 text-center">
                                                {answer.response_text === "Correct" ? (
                                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                                )}
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
                                              <th className="border p-2 text-left">Correct Answer</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr className="bg-emerald-50">
                                              <td className="border p-2">
                                                {Array.isArray(question.model_answer) ? (
                                                  question.order_important ? (
                                                    <ol className="list-decimal pl-4 mb-0">
                                                      {question.model_answer.map((ans, idx) => (
                                                        <li key={idx}>{ans}</li>
                                                      ))}
                                                    </ol>
                                                  ) : (
                                                    <ul className="list-disc pl-4 mb-0">
                                                      {question.model_answer.map((ans, idx) => (
                                                        <li key={idx}>{ans}</li>
                                                      ))}
                                                    </ul>
                                                  )
                                                ) : (
                                                  question.model_answer
                                                )}
                                              </td>
                                            </tr>
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
                                        <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">{question.model_answer}</pre>
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
                                        {topic.icon && React.createElement(topic.icon, { size: 16, className: "mr-2" })}
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

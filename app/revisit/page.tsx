"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllAnswers, topics, getQuestionById } from "@/lib/data"
import type { Answer, Question, ScoreType } from "@/lib/types"
import { CheckCircle, AlertTriangle, AlertCircle, ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"
import { UserLogin } from "@/components/user-login"

export default function RevisitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as ScoreType | null
  const topicParam = searchParams.get("topic")

  const [answers, setAnswers] = useState<Answer[]>([])
  const [questions, setQuestions] = useState<Record<string, Question>>({})
  const [activeTab, setActiveTab] = useState<ScoreType | "all">(tabParam || "all")
  const [user, setUser] = useState<User | null>(null)


  useEffect(() => {

    // TODO: move this to a hook
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await supabase.from('user_activity').insert({
          user_id: user.id,
          event: 'visited_revisit',
          path: '/revisit'
        })
      } else {
        setUser(null)
      }
    }
    getUser()
  }, [])


  useEffect(() => {
    // Get all saved answers
    const savedAnswers = getAllAnswers()

    // Filter by topic if specified
    const filteredByTopic = topicParam
      ? savedAnswers.filter((answer) => {
        const question = topics.flatMap((t) => t.questions).find((q) => q.id === answer.question_id)
        return (
          question && topics.find((t) => t.slug === topicParam)?.questions.some((q) => q.id === answer.question_id)
        )
      })
      : savedAnswers

    setAnswers(filteredByTopic)

    // Get all questions referenced in answers
    const questionMap: Record<string, Question> = {}
    filteredByTopic.forEach((answer) => {
      const question = getQuestionById(answer.question_id)
      if (question) {
        questionMap[question.id] = question
      }
    })
    setQuestions(questionMap)

    // Set active tab from URL parameter if present
    if (tabParam && ["green", "amber", "red"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam, topicParam])

  // Filter answers by score
  const filteredAnswers = activeTab === "all" ? answers : answers.filter((answer) => answer.score === activeTab)

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-3xl font-bold mb-2">Revisit Questions</h1>
            <UserLogin email={user?.email} />
          </div>


          <p className="text-muted-foreground">
            {topicParam
              ? `Review ${activeTab !== "all" ? activeTab + " " : ""}questions from ${topics.find((t) => t.slug === topicParam)?.name || "this topic"}`
              : `Review ${activeTab !== "all" ? activeTab + " " : ""}questions you've previously answered`}
          </p>
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

                                {/* Remove the separate model answer section since it's now integrated into the tables */}
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

                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button
                                    onClick={() => router.push(`/questions/${topicSlug}?questionId=${answer.question_id}`)}
                                    variant="outline"
                                    className="flex-1 hover:bg-emerald-600 hover:text-white"
                                  >
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Practice This Question Again <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => router.push(`/questions/${topicSlug}`)}
                                    variant="outline"
                                    className="flex-1 hover:bg-emerald-600 hover:text-white"
                                  >
                                    {topic.icon && React.createElement(topic.icon, { size: 16, className: "mr-2" })}
                                    Practice {topic.name} Again <ArrowRight className="ml-2 h-4 w-4" />
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
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

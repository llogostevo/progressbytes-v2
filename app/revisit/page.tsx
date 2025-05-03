"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllAnswers, topics, getQuestionById } from "@/lib/data"
import type { Answer, Question, ScoreType } from "@/lib/types"
import { CheckCircle, AlertTriangle, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function RevisitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as ScoreType | null
  const topicParam = searchParams.get("topic")

  const [answers, setAnswers] = useState<Answer[]>([])
  const [questions, setQuestions] = useState<Record<string, Question>>({})
  const [activeTab, setActiveTab] = useState<ScoreType | "all">(tabParam || "all")

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
          <h1 className="text-3xl font-bold mb-2">Revisit Questions</h1>
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
                                <Badge className={`flex items-center gap-1 ${
                                  answer.score === "green" 
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
                                  <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">{answer.response_text}</pre>
                                </div>

                                <div>
                                  <h3 className="text-sm font-medium mb-1 text-emerald-700">Model Answer:</h3>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-sm font-medium mb-1">Pseudocode:</h4>
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

                                <Button
                                  onClick={() => router.push(`/questions/${topicSlug}`)}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                                >
                                  Practice This Topic Again <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
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

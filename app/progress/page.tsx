"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAllAnswers, topics } from "@/lib/data"
import type { Answer, ScoreType } from "@/lib/types"
import { CheckCircle, AlertTriangle, AlertCircle, ArrowRight } from "lucide-react"
// import { CheckCircle, AlertTriangle, AlertCircle, Sparkles, ArrowRight } from "lucide-react"

import Link from "next/link"
import { UserLogin } from "@/components/user-login"
import { createClient } from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"

export default function ProgressPage() {
  const [answers, setAnswers] = useState<Answer[]>([])
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Get all saved answers
    const savedAnswers = getAllAnswers()
    setAnswers(savedAnswers)
  }, [])

  useEffect(() => {

    // TODO: move this to a hook
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        await supabase.from('user_activity').insert({
          user_id: user.id,
          event: 'visited_progress',
          path: '/progress'
        })

      } else {
        setUser(null)
      }
    }
    getUser()
  }, [])

  // Calculate statistics
  const totalAnswers = answers.length
  const scoreCount = {
    green: answers.filter((a) => a.score === "green").length,
    amber: answers.filter((a) => a.score === "amber").length,
    red: answers.filter((a) => a.score === "red").length,
  }

  const scorePercentages = {
    green: totalAnswers ? Math.round((scoreCount.green / totalAnswers) * 100) : 0,
    amber: totalAnswers ? Math.round((scoreCount.amber / totalAnswers) * 100) : 0,
    red: totalAnswers ? Math.round((scoreCount.red / totalAnswers) * 100) : 0,
  }

  // Group answers by topic
  const answersByTopic = answers.reduce(
    (acc, answer) => {
      const topicSlug = topics.find((t) => t.questions.some((q) => q.id === answer.question_id))?.slug || "unknown"

      if (!acc[topicSlug]) {
        acc[topicSlug] = []
      }

      acc[topicSlug].push(answer)
      return acc
    },
    {} as Record<string, Answer[]>,
  )

  const getScoreIcon = (score: ScoreType) => {
    switch (score) {
      case "green":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "amber":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "red":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
            <UserLogin email={user?.email} />
          </div>

          <p className="text-muted-foreground">Track your performance across all topics</p>
        </div>

        {/* TODO: need to create a component to display upgrade cards */}

        {/* {!hasPaid && (
          <Card className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="shrink-0 bg-emerald-100 p-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-medium text-emerald-800">Free Version</h3>
                  <p className="text-sm text-emerald-700">
                    You&apos;re using the free version with self-assessment. Upgrade to get AI-powered feedback and detailed
                    analytics.
                  </p>
                </div>
                <div className="ml-auto">
                  <Link href="/coming-soon">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      Upgrade
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}

        {totalAnswers === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Progress Yet</CardTitle>
              <CardDescription>
                You haven&apos;t answered any questions yet. Start a quiz to see your progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Start a Quiz</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Overall Performance</CardTitle>
                <CardDescription>
                  You&apos;ve answered {totalAnswers} question{totalAnswers !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div className="flex h-full">
                        <div className="bg-emerald-500 h-full" style={{ width: `${scorePercentages.green}%` }}></div>
                        <div className="bg-amber-500 h-full" style={{ width: `${scorePercentages.amber}%` }}></div>
                        <div className="bg-red-500 h-full" style={{ width: `${scorePercentages.red}%` }}></div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-2">
                      <div className="flex items-center gap-1 text-sm">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <span>Green: {scorePercentages.green}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span>Amber: {scorePercentages.amber}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Red: {scorePercentages.red}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 md:w-1/3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-500">{scoreCount.green}</div>
                      <div className="text-xs text-muted-foreground">Green</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-500">{scoreCount.amber}</div>
                      <div className="text-xs text-muted-foreground">Amber</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">{scoreCount.red}</div>
                      <div className="text-xs text-muted-foreground">Red</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="w-full">
                  <p className="text-sm font-medium mb-3">Revisit questions by assessment:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <Link href="/revisit" className="w-full">
                      <Button variant="outline" className="w-full">
                        All Questions
                      </Button>
                    </Link>
                    <Link href="/revisit?tab=green" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        <CheckCircle className="h-4 w-4" /> Green ({scoreCount.green})
                      </Button>
                    </Link>
                    <Link href="/revisit?tab=amber" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                      >
                        <AlertTriangle className="h-4 w-4" /> Amber ({scoreCount.amber})
                      </Button>
                    </Link>
                    <Link href="/revisit?tab=red" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <AlertCircle className="h-4 w-4" /> Red ({scoreCount.red})
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <h2 className="text-xl font-bold mb-4">Performance by Topic</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(answersByTopic).map(([topicSlug, topicAnswers]) => {
                const topic = topics.find((t) => t.slug === topicSlug)
                if (!topic) return null

                const topicScores = {
                  green: topicAnswers.filter((a) => a.score === "green").length,
                  amber: topicAnswers.filter((a) => a.score === "amber").length,
                  red: topicAnswers.filter((a) => a.score === "red").length,
                }

                return (
                  <Card key={topicSlug}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {topic.icon && (
                          <span className="text-emerald-500">{React.createElement(topic.icon, { size: 20 })}</span>
                        )}
                        {topic.name}
                      </CardTitle>
                      <CardDescription>
                        {topicAnswers.length} question{topicAnswers.length !== 1 ? "s" : ""} answered
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 mb-4">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                          {topicScores.green}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          {topicScores.amber}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 text-red-500" />
                          {topicScores.red}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/questions/${topicSlug}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            Continue Practice
                          </Button>
                        </Link>
                        <Link href={`/revisit?topic=${topicSlug}`} className="flex-1">
                          <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                            Revisit Questions <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Recent Answers</h2>

              <div className="space-y-4">
                {answers.slice(0, 5).map((answer) => {
                  const question = topics.flatMap((t) => t.questions).find((q) => q.id === answer.question_id)

                  return (
                    <Card key={answer.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          <pre className="whitespace-pre-wrap font-sans">{question?.question_text || "Unknown question"}</pre>
                        </CardTitle>
                        <CardDescription>
                          {new Date(answer.submitted_at).toLocaleString()}
                          <span className="ml-2 inline-flex items-center">{getScoreIcon(answer.score)}</span>
                          {answer.self_assessed && <span className="ml-2 text-xs">(Self-assessed)</span>}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium mb-2">Your Answer:</h3>
                            <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">{answer.response_text}</pre>
                          </div>

                          <div>
                            {answer.ai_feedback ? (
                              <>
                                <h3 className="text-sm font-medium mb-2">AI Feedback:</h3>
                                <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground mb-3">{answer.ai_feedback}</pre>
                              </>
                            ) : (
                              <>
                                <h3 className="text-sm font-medium mb-2">Self-Assessment:</h3>
                                <div className="text-sm text-muted-foreground mb-3">
                                  You marked this as{" "}
                                  <Badge className={`inline-flex items-center gap-1 px-2 py-0.5 ${answer.score === "green"
                                    ? "bg-emerald-500 hover:bg-emerald-500 text-white"
                                    : answer.score === "amber"
                                      ? "bg-amber-500 hover:bg-amber-500 text-white"
                                      : "bg-red-500 hover:bg-red-500 text-white"
                                    }`}>
                                    {answer.score === "green" ? (
                                      <CheckCircle className="h-3 w-3" />
                                    ) : answer.score === "amber" ? (
                                      <AlertTriangle className="h-3 w-3" />
                                    ) : (
                                      <AlertCircle className="h-3 w-3" />
                                    )}
                                    <span className="text-xs">
                                      {answer.score === "green"
                                        ? "Fully Understood"
                                        : answer.score === "amber"
                                          ? "Partially Understood"
                                          : "Need More Practice"}
                                    </span>
                                  </Badge>
                                </div>
                              </>
                            )}

                            <div className="space-y-4">
                              <div>
                                {question?.type === "code" && (
                                  <h4 className="text-sm font-medium mb-1">Pseudocode:</h4>
                                )}
                                <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                                  {question?.model_answer || "Model answer not available"}
                                </pre>
                              </div>
                              {question?.model_answer_python && (
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Python:</h4>
                                  <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                                    {question.model_answer_python}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

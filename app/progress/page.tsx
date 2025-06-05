"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Answer, ScoreType, Topic, Question } from "@/lib/types"
import { CheckCircle, AlertTriangle, AlertCircle, ArrowRight, Calendar } from "lucide-react"
import Link from "next/link"
import { UserLogin } from "@/components/user-login"
import { createClient } from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DynamicIcon } from "@/components/ui/dynamicicon"
import { Skeleton } from "@/components/ui/skeleton"

// Define types for the database responses
interface DBQuestion {
  id: string;
  type: string;
  question_text: string;
  explanation?: string;
  created_at: string;
  model_answer?: string;
  multiple_choice_questions?: {
    options: string[];
    correct_answer_index: number;
    model_answer?: string;
  };
  fill_in_the_blank_questions?: {
    correct_answers: string[];
    model_answer?: string;
    order_important?: boolean;
    options?: string[];
  };
  matching_questions?: Array<{
    statement: string;
    match: string;
    model_answer?: string;
  }>;
  code_questions?: {
    starter_code?: string;
    model_answer?: string;
    language?: string;
    model_answer_code?: string;
  };
}

interface DBSubtopicQuestionLink {
  questions: DBQuestion;
}

interface DBSubtopic {
  subtopic_question_link: DBSubtopicQuestionLink[];
}

interface DBUnit {
  id: string;
  name: string;
  unit_number: number;
}

interface DBTopic {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  topicnumber: number;
  summary: string | null;
  unit_id: string;
  units: DBUnit;
  subtopics: DBSubtopic[];
}

function ProgressSkeleton() {
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
          <div className="flex items-center justify-end mt-4">
            <Skeleton className="h-10 w-64" />
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex-1">
                <Skeleton className="h-4 w-full rounded-full" />
                <div className="flex justify-between mt-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 md:w-1/3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-8 w-8 mx-auto mb-1" />
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="w-full">
              <Skeleton className="h-4 w-48 mb-3" />
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-48" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <Skeleton className="h-4 w-40 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="h-6 w-16" />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProgressPage() {
  const [answers, setAnswers] = useState<Answer[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'all'>('today')
  const [topics, setTopics] = useState<Topic[]>([])

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        // Fetch topics with their associated questions
        const { data: topicsWithQuestions, error: topicsError } = await supabase
          .from('topics')
          .select(`
            id,
            name,
            description,
            slug,
            icon,
            topicnumber,
            summary,
            unit_id,
            units!inner (
              id,
              name,
              unit_number
            ),
            subtopics!inner (
              id,
              subtopic_question_link!inner (
                questions!inner (
                  id,
                  type,
                  question_text,
                  explanation,
                  created_at,
                  multiple_choice_questions (
                    options,
                    correct_answer_index,
                    model_answer
                  ),
                  short_answer_questions (
                    model_answer
                  ),
                  fill_in_the_blank_questions (
                    correct_answers,
                    model_answer,
                    order_important,
                    options
                  ),
                  matching_questions (
                    statement,
                    match,
                    model_answer
                  ),
                  essay_questions (
                    model_answer,
                    rubric
                  ),
                  code_questions (
                    starter_code,
                    model_answer,
                    language,
                    model_answer_code
                  )
                )
              )
            )
          `)
          .order('name')

        if (topicsError) {
          console.error('Error fetching topics:', topicsError)
          return
        }

        // Transform the topics data
        const transformedTopics = topicsWithQuestions?.map(topic => {
          const dbTopic = topic as unknown as DBTopic;
          const dbUnit = dbTopic.units as unknown as DBUnit;
          
          // Get all questions from all subtopics in a single flat array
          const allQuestions = dbTopic.subtopics.flatMap(subtopic => 
            subtopic.subtopic_question_link.flatMap(link => {
              const question = link.questions as unknown as DBQuestion;
              return {
                id: question.id,
                type: question.type as Question['type'],
                topic: dbTopic.slug,
                question_text: question.question_text,
                explanation: question.explanation,
                created_at: question.created_at,
                model_answer: question.model_answer || '',
                ...(question.type === 'multiple-choice' && {
                  options: question.multiple_choice_questions?.options || [],
                  correctAnswerIndex: question.multiple_choice_questions?.correct_answer_index
                }),
                ...(question.type === 'fill-in-the-blank' && {
                  options: question.fill_in_the_blank_questions?.options || [],
                  order_important: question.fill_in_the_blank_questions?.order_important,
                  model_answer: question.fill_in_the_blank_questions?.correct_answers || []
                }),
                ...(question.type === 'matching' && {
                  pairs: question.matching_questions?.map(mq => ({
                    statement: mq.statement,
                    match: mq.match
                  })) || []
                }),
                ...(question.type === 'code' && {
                  model_answer_python: question.code_questions?.model_answer_code,
                  language: question.code_questions?.language
                })
              }
            })
          )

          const transformedTopic: Topic = {
            id: dbTopic.id,
            name: dbTopic.name,
            description: dbTopic.description,
            summary: dbTopic.summary || undefined,
            icon: dbTopic.icon,
            disabled: false,
            slug: dbTopic.slug,
            unit: dbUnit.unit_number,
            unitName: dbUnit.name,
            questionCount: allQuestions.length,
            questions: allQuestions,
            topicnumber: dbTopic.topicnumber
          }

          return transformedTopic;
        }) || []

        setTopics(transformedTopics)

        // Build query based on timeFilter
        let query = supabase
          .from('student_answers')
          .select('*')
          .eq('student_id', user.id)

        if (timeFilter === 'today') {
          const startDate = new Date()
          startDate.setHours(0, 0, 0, 0)
          const endDate = new Date()
          query = query
            .gte('submitted_at', startDate.toISOString())
            .lte('submitted_at', endDate.toISOString())
        } else if (timeFilter === 'week') {
          const startDate = new Date()
          startDate.setDate(startDate.getDate() - 7)
          const endDate = new Date()
          query = query
            .gte('submitted_at', startDate.toISOString())
            .lte('submitted_at', endDate.toISOString())
        }
        // If 'all', do not add date filters

        query = query.order('submitted_at', { ascending: false })

        const { data: answersData, error } = await query

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

        setAnswers(mappedAnswers)

        await supabase.from('user_activity').insert({
          user_id: user.id,
          event: 'visited_progress',
          path: '/progress',
          user_email: user.email
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }
    getUser()
  }, [timeFilter])

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

  if (isLoading) {
    return <ProgressSkeleton />
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
          {/* Time Filter Tabs - always visible */}
          <div className="flex items-center justify-end mt-4">
            <Tabs value={timeFilter} onValueChange={(value) => setTimeFilter(value as 'today' | 'week' | 'all')}>
              <TabsList>
                <TabsTrigger value="today" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Today
                </TabsTrigger>
                <TabsTrigger value="week" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  7 Days
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  All Time
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
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

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Performance by Topic</h2>
              </div>

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
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {topic.icon && (
                              <div className="p-2 rounded-lg bg-emerald-50">
                                <span className="text-emerald-600">
                                  <DynamicIcon iconName={topic.icon} size={20} />
                                </span>
                              </div>
                            )}
                            {topic.name}
                          </CardTitle>
                          {topic.topicnumber && (
                            <Badge variant="outline" className="text-xs font-medium shrink-0 text-muted-foreground">
                              {topic.topicnumber}
                            </Badge>
                          )}
                        </div>
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
                          <Link href={`/revisit?topics=${topicSlug}`} className="flex-1">
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}

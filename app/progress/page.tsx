"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Answer, ScoreType, Topic, Question } from "@/lib/types"
import { CheckCircle, AlertTriangle, AlertCircle, ArrowRight, Calendar, Flame, Star } from "lucide-react"
import Link from "next/link"
import { UserLogin } from "@/components/user-login"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DynamicIcon } from "@/components/ui/dynamicicon"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import React from "react"

// Define types for the database responses
interface DBQuestion {
  id: string
  type: string
  question_text: string
  explanation?: string
  created_at: string
  model_answer?: string
  multiple_choice_questions?: {
    options: string[]
    correct_answer_index: number
    model_answer?: string
  }
  fill_in_the_blank_questions?: {
    correct_answers: string[]
    model_answer?: string
    order_important?: boolean
    options?: string[]
  }
  matching_questions?: Array<{
    statement: string
    match: string
    model_answer?: string
  }>
  code_questions?: {
    starter_code?: string
    model_answer?: string
    language?: string
    model_answer_code?: string
  }
}

interface DBSubtopicQuestionLink {
  questions: DBQuestion
}

interface DBSubtopic {
  subtopic_question_link: DBSubtopicQuestionLink[]
}

interface DBUnit {
  id: string
  name: string
  unit_number: number
}

interface DBTopic {
  id: string
  name: string
  description: string
  slug: string
  icon: string
  topicnumber: number
  summary: string | null
  unit_id: string
  units: DBUnit
  subtopics: DBSubtopic[]
}

// Add new interfaces for streak tracking
interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string;
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

// Helper to compare topicnumber strings like 1.1.1, 1.1.2, etc.
function compareTopicNumbers(a?: string, b?: string) {
  if (!a && !b) return 0
  if (!a) return -1
  if (!b) return 1
  const aParts = a.split(".").map(Number)
  const bParts = b.split(".").map(Number)
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] ?? 0
    const bVal = bParts[i] ?? 0
    if (aVal !== bVal) return aVal - bVal
  }
  return 0
}

function ProgressCharts({ answers, topics }: { answers: Answer[]; topics: Topic[] }) {
  // Prepare data for the stacked bar chart
  const barChartData = topics.map((topic) => {
    const topicAnswers = answers.filter((answer) =>
      topic.questions.some((q) => q.id === answer.question_id)
    )
    return {
      name: topic.name,
      topicNumber: topic.topicnumber?.toString() || "",
      Strong: topicAnswers.filter((a) => a.score === "green").length,
      Developing: topicAnswers.filter((a) => a.score === "amber").length,
      "Needs Work": topicAnswers.filter((a) => a.score === "red").length,
      total: topicAnswers.length,
    }
  }).sort((a, b) => compareTopicNumbers(a.topicNumber, b.topicNumber))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Topic</CardTitle>
        <CardDescription>Distribution of scores across different topics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] min-w-0 min-h-0">
          {/* Mobile: vertical, small font */}
          <div className="block md:invisible md:absolute min-w-0 min-h-0 h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="topicNumber"
                  tick={({ x, y, payload }) => {
                    const topic = topics.find(t => t.topicnumber?.toString() === payload.value);
                    return (
                      <Link
                        href={`/revisit?topics=${topic?.slug}`}
                        className="cursor-pointer hover:text-emerald-600 transition-colors"
                      >
                        <text
                          x={x}
                          y={y}
                          dy={8}
                          fontSize={9}
                          transform={`rotate(90, ${x}, ${y})`}
                          textAnchor="start"
                          fill="currentColor"
                        >
                          {payload.value}
                        </text>
                      </Link>
                    );
                  }}
                  interval={0}
                  height={80}
                />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-muted-foreground">Topic {data.topicNumber}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-emerald-600">Strong: {data.Strong}</p>
                            <p className="text-amber-600">Developing: {data.Developing}</p>
                            <p className="text-red-600">Needs Work: {data["Needs Work"]}</p>
                            <p className="font-medium mt-1">Total: {data.total}</p>
                          </div>
                          <Link 
                            href={`/revisit?topics=${topics.find(t => t.name === data.name)?.slug}`}
                            className="mt-2 block text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            Review Questions <ArrowRight className="inline-block ml-1 h-3 w-3" />
                          </Link>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="Strong" stackId="a" fill="#10b981" />
                <Bar dataKey="Developing" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Needs Work" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* md: diagonal, medium font */}
          <div className="invisible md:visible md:static lg:invisible lg:absolute min-w-0 min-h-0 h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="topicNumber"
                  tick={({ x, y, payload }) => {
                    const topic = topics.find(t => t.topicnumber?.toString() === payload.value);
                    return (
                      <Link
                        href={`/revisit?topics=${topic?.slug}`}
                        className="cursor-pointer hover:text-emerald-600 transition-colors"
                      >
                        <text
                          x={x}
                          y={y}
                          dy={16}
                          fontSize={12}
                          transform={`rotate(40, ${x}, ${y})`}
                          textAnchor="start"
                          fill="currentColor"
                        >
                          {payload.value}
                        </text>
                      </Link>
                    );
                  }}
                  interval={0}
                  height={60}
                />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-muted-foreground">Topic {data.topicNumber}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-emerald-600">Strong: {data.Strong}</p>
                            <p className="text-amber-600">Developing: {data.Developing}</p>
                            <p className="text-red-600">Needs Work: {data["Needs Work"]}</p>
                            <p className="font-medium mt-1">Total: {data.total}</p>
                          </div>
                          <Link 
                            href={`/revisit?topics=${topics.find(t => t.name === data.name)?.slug}`}
                            className="mt-2 block text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            Review Questions <ArrowRight className="inline-block ml-1 h-3 w-3" />
                          </Link>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="Strong" stackId="a" fill="#10b981" />
                <Bar dataKey="Developing" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Needs Work" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* lg+: diagonal, larger font */}
          <div className="invisible lg:visible lg:static min-w-0 min-h-0 h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="topicNumber"
                  tick={({ x, y, payload }) => {
                    const topic = topics.find(t => t.topicnumber?.toString() === payload.value);
                    return (
                      <Link
                        href={`/revisit?topics=${topic?.slug}`}
                        className="cursor-pointer hover:text-emerald-600 transition-colors"
                      >
                        <text
                          x={x}
                          y={y}
                          dy={16}
                          fontSize={14}
                          transform={`rotate(40, ${x}, ${y})`}
                          textAnchor="start"
                          fill="currentColor"
                        >
                          {payload.value}
                        </text>
                      </Link>
                    );
                  }}
                  interval={0}
                  height={60}
                />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-muted-foreground">Topic {data.topicNumber}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-emerald-600">Strong: {data.Strong}</p>
                            <p className="text-amber-600">Developing: {data.Developing}</p>
                            <p className="text-red-600">Needs Work: {data["Needs Work"]}</p>
                            <p className="font-medium mt-1">Total: {data.total}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="Strong" stackId="a" fill="#10b981" />
                <Bar dataKey="Developing" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Needs Work" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Add new component for streak display
function StreakDisplay({ streakData, scorePercentages }: { streakData: StreakData; scorePercentages: { green: number; amber: number; red: number } }) {
  const getStreakFeedback = () => {
    if (streakData.currentStreak >= 7) {
      return {
        icon: <Star className="h-5 w-5 text-yellow-500" />,
        message: "Amazing! You've maintained a week-long streak! 🔥🔥🔥🔥🔥",
        color: "text-yellow-600"
      }
    } else if (streakData.currentStreak >= 3) {
      return {
        icon: <Flame className="h-5 w-5 text-orange-500" />,
        message: `You're on a ${streakData.currentStreak}-day streak! Keep it going! 🔥🔥🔥`,
        color: "text-orange-600"
      }
    } else if (streakData.currentStreak > 0) {
      return {
        icon: <Flame className="h-5 w-5 text-orange-500" />,
        message: `You've started your streak! Come back tomorrow to keep it going! 🔥`,
        color: "text-orange-600"
      }
    } else {
      return {
        icon: <Flame className="h-5 w-5 text-gray-400" />,
        message: "Start your streak today by answering some questions!",
        color: "text-gray-600"
      }
    }
  }

  const getPerformanceFeedback = () => {
    if (scorePercentages.green >= 80) {
      return "🌟 Outstanding performance! You're mastering the material!"
    } else if (scorePercentages.green >= 60) {
      return "💪 Strong understanding! Keep up the great work!"
    } else if (scorePercentages.green >= 40) {
      return "📈 Making good progress! Keep practicing!"
    } else {
      return "🌱 Keep practicing! Every question helps you improve!"
    }
  }

  const streakFeedback = getStreakFeedback()
  const performanceFeedback = getPerformanceFeedback()

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {/* <Flame className="h-5 w-5 text-orange-500" /> */}
          Your Streak
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          {streakFeedback.icon}
          <span className={streakFeedback.color}>{streakFeedback.message}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm text-orange-700 font-medium">Current Streak</div>
            <div className="text-3xl font-bold text-orange-600">{streakData.currentStreak}</div>
            <div className="text-xs text-orange-600">days</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-700 font-medium">Best Streak</div>
            <div className="text-3xl font-bold text-purple-600">{streakData.bestStreak}</div>
            <div className="text-xs text-purple-600">days</div>
          </div>
        </div>
        <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-sm text-emerald-700">{performanceFeedback}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProgressPage() {
  const [answers, setAnswers] = useState<Answer[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "all">("today")
  const [topics, setTopics] = useState<Topic[]>([])
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    bestStreak: 0,
    lastActiveDate: new Date().toISOString()
  })

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        // Calculate streak data
        const { data: activityData } = await supabase
          .from("user_activity")
          .select("created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (activityData) {
          // Calculate current streak
          let currentStreak = 0
          let bestStreak = 0
          let tempStreak = 0
          // let lastDate = new Date()

          // Group activities by date
          const activitiesByDate = activityData.reduce((acc, activity) => {
            const date = new Date(activity.created_at).toDateString()
            if (!acc[date]) {
              acc[date] = true
            }
            return acc
          }, {} as Record<string, boolean>)

          // Calculate streaks
          const dates = Object.keys(activitiesByDate).sort().reverse()
          for (let i = 0; i < dates.length; i++) {
            const currentDate = new Date(dates[i])
            const prevDate = i > 0 ? new Date(dates[i - 1]) : null

            if (i === 0) {
              tempStreak = 1
            } else if (prevDate && isConsecutiveDay(currentDate, prevDate)) {
              tempStreak++
            } else {
              tempStreak = 1
            }

            if (tempStreak > bestStreak) {
              bestStreak = tempStreak
            }

            if (i === 0) {
              currentStreak = tempStreak
            }
          }

          setStreakData({
            currentStreak,
            bestStreak,
            lastActiveDate: dates[0] || new Date().toISOString()
          })
        }

        // Fetch topics with their associated questions
        const { data: topicsWithQuestions, error: topicsError } = await supabase
          .from("topics")
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
          .order("name")

        if (topicsError) {
          console.error("Error fetching topics:", topicsError)
          return
        }

        // Transform the topics data
        const transformedTopics =
          topicsWithQuestions?.map((topic) => {
            const dbTopic = topic as unknown as DBTopic
            const dbUnit = dbTopic.units as unknown as DBUnit

            // Get all questions from all subtopics in a single flat array
            const allQuestions = dbTopic.subtopics.flatMap((subtopic) =>
              subtopic.subtopic_question_link.flatMap((link) => {
                const question = link.questions as unknown as DBQuestion
                return {
                  id: question.id,
                  type: question.type as Question["type"],
                  topic: dbTopic.slug,
                  question_text: question.question_text,
                  explanation: question.explanation,
                  created_at: question.created_at,
                  model_answer: question.model_answer || "",
                  ...(question.type === "multiple-choice" && {
                    options: question.multiple_choice_questions?.options || [],
                    correctAnswerIndex: question.multiple_choice_questions?.correct_answer_index,
                  }),
                  ...(question.type === "fill-in-the-blank" && {
                    options: question.fill_in_the_blank_questions?.options || [],
                    order_important: question.fill_in_the_blank_questions?.order_important,
                    model_answer: question.fill_in_the_blank_questions?.correct_answers || [],
                  }),
                  ...(question.type === "matching" && {
                    pairs:
                      question.matching_questions?.map((mq) => ({
                        statement: mq.statement,
                        match: mq.match,
                      })) || [],
                  }),
                  ...(question.type === "code" && {
                    model_answer_python: question.code_questions?.model_answer_code,
                    language: question.code_questions?.language,
                  }),
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
              topicnumber: dbTopic.topicnumber,
            }

            return transformedTopic
          }) || []

        setTopics(transformedTopics)

        // Build query based on timeFilter
        let query = supabase.from("student_answers").select("*").eq("student_id", user.id)

        if (timeFilter === "today") {
          const startDate = new Date()
          startDate.setHours(0, 0, 0, 0)
          const endDate = new Date()
          query = query.gte("submitted_at", startDate.toISOString()).lte("submitted_at", endDate.toISOString())
        } else if (timeFilter === "week") {
          const startDate = new Date()
          startDate.setDate(startDate.getDate() - 7)
          const endDate = new Date()
          query = query.gte("submitted_at", startDate.toISOString()).lte("submitted_at", endDate.toISOString())
        }
        // If 'all', do not add date filters

        query = query.order("submitted_at", { ascending: false })

        const { data: answersData, error } = await query

        if (error) {
          console.error("Error fetching answers:", error)
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

        setAnswers(mappedAnswers)

        await supabase.from("user_activity").insert({
          user_id: user.id,
          event: "visited_progress",
          path: "/progress",
          user_email: user.email,
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
            <Tabs value={timeFilter} onValueChange={(value) => setTimeFilter(value as "today" | "week" | "all")}>
              <TabsList>
                <TabsTrigger value="today" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Today
                </TabsTrigger>
                <TabsTrigger value="week" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />7 Days
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
            <StreakDisplay streakData={streakData} scorePercentages={scorePercentages} />
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Overall Performance</CardTitle>
                <CardDescription>
                  You&apos;ve answered {totalAnswers} question{totalAnswers !== 1 ? "s" : ""}{" "}
                  {timeFilter === "today" ? "today" : timeFilter === "week" ? "this week" : "in total"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900">{totalAnswers}</div>
                      <div className="text-sm text-muted-foreground">Total Attempts</div>
                    </div>
                  </div>

                  <div className="md:col-span-3 grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="text-2xl font-bold text-emerald-600">{scoreCount.green}</div>
                      <div className="text-sm text-emerald-700 font-medium">Strong</div>
                      <div className="text-xs text-emerald-600">{scorePercentages.green}% of attempts</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="text-2xl font-bold text-amber-600">{scoreCount.amber}</div>
                      <div className="text-sm text-amber-700 font-medium">Developing</div>
                      <div className="text-xs text-amber-600">{scorePercentages.amber}% of attempts</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-2xl font-bold text-red-600">{scoreCount.red}</div>
                      <div className="text-sm text-red-700 font-medium">Needs Work</div>
                      <div className="text-xs text-red-600">{scorePercentages.red}% of attempts</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <div className="w-full">
                  <p className="text-sm font-medium mb-4">Review your answers by performance level:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link href="/revisit" className="w-full">
                      <Button variant="outline" className="w-full h-12">
                        <div className="text-center">
                          <div className="font-medium">All Questions</div>
                          <div className="text-xs text-muted-foreground">{totalAnswers} total</div>
                        </div>
                      </Button>
                    </Link>
                    <Link href="/revisit?tab=green" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full h-12 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 font-medium">
                            <CheckCircle className="h-4 w-4" /> Strong
                          </div>
                          <div className="text-xs">{scoreCount.green} questions</div>
                        </div>
                      </Button>
                    </Link>
                    <Link href="/revisit?tab=amber" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full h-12 border-amber-200 text-amber-700 hover:bg-amber-50"
                      >
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 font-medium">
                            <AlertTriangle className="h-4 w-4" /> Developing
                          </div>
                          <div className="text-xs">{scoreCount.amber} questions</div>
                        </div>
                      </Button>
                    </Link>
                    <Link href="/revisit?tab=red" className="w-full">
                      <Button variant="outline" className="w-full h-12 border-red-200 text-red-700 hover:bg-red-50">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 font-medium">
                            <AlertCircle className="h-4 w-4" /> Needs Work
                          </div>
                          <div className="text-xs">{scoreCount.red} questions</div>
                        </div>
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <ProgressCharts answers={answers} topics={topics} />

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Performance by Topic</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(answersByTopic)
                  .sort(([topicSlugA], [topicSlugB]) => {
                    const topicA = topics.find((t) => t.slug === topicSlugA)
                    const topicB = topics.find((t) => t.slug === topicSlugB)
                    return compareTopicNumbers(topicA?.topicnumber?.toString(), topicB?.topicnumber?.toString())
                  })
                  .map(([topicSlug, topicAnswers]) => {
                    const topic = topics.find((t) => t.slug === topicSlug)
                    if (!topic) return null

                    const topicScores = {
                      green: topicAnswers.filter((a) => a.score === "green").length,
                      amber: topicAnswers.filter((a) => a.score === "amber").length,
                      red: topicAnswers.filter((a) => a.score === "red").length,
                    }

                    const mostRecentAnswer = topicAnswers.sort(
                      (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
                    )[0]

                    return (
                      <Card key={topicSlug} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {topic.icon && (
                                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                                  <span className="text-emerald-600">
                                    <DynamicIcon iconName={topic.icon} size={24} />
                                  </span>
                                </div>
                              )}
                              <div>
                                <CardTitle className="text-lg leading-tight">{topic.name}</CardTitle>
                              </div>
                            </div>
                            {topic.topicnumber && (
                              <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
                                {topic.topicnumber}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="mt-2">
                            {topicAnswers.length} attempt{topicAnswers.length !== 1 ? "s" : ""} • Last answered{" "}
                            {new Date(mostRecentAnswer.submitted_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex gap-2">
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

                          <div className="flex gap-3">
                            <Link href={`/questions/${topicSlug}`} className="flex-1">
                              <Button size="sm" variant="outline" className="w-full h-8">
                                Continue Practice
                              </Button>
                            </Link>
                            <Link href={`/revisit?topics=${topicSlug}`} className="flex-1">
                              <Button size="sm" className="w-full h-8 bg-emerald-600 hover:bg-emerald-700">
                                Review Answers <ArrowRight className="ml-1 h-3 w-3" />
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

// Helper function to check if two dates are consecutive days
function isConsecutiveDay(date1: Date, date2: Date): boolean {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays === 1
}

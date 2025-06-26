"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Eye, Navigation, Home, FileText, BarChart, RefreshCw, CheckCircle, Calendar } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserSessions } from "@/components/user-sessions"
import { UserActivityFilter } from "@/components/user-activity-filter"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { PostgrestError } from '@supabase/supabase-js'
import React from "react"

interface Class {
  id: string
  name: string
  teacher_id: string
  created_at: string
  teacher?: {
    email: string
    full_name: string
  }
}

interface UserActivity {
  id: string
  user_id: string
  event: string
  path: string
  created_at: string
  user_email?: string
  student_score?: 'red' | 'amber' | 'green'
  question_type?: string
  question_text?: string
  topic?: string
  class_id?: string
}

interface StudentAnswerData {
  id: string;
  student_id: string;
  question_id: string;
  student_score: 'red' | 'amber' | 'green';
  submitted_at: string;
  questions: {
    id: string;
    question_text: string;
    subtopic_question_link: Array<{
      subtopics: {
        id: string;
        topic_id: string;
        topics: {
          id: string;
          name: string;
          slug: string;
          topicnumber: string;
        };
      };
    }>;
  } | null;
}

interface ProcessedStudentAnswer {
  id: string;
  student_id: string;
  question_id: string;
  student_score: 'red' | 'amber' | 'green';
  submitted_at: string;
  question: {
    topic_id: string;
    topic: {
      id: string;
      slug: string;
      topicnumber: string;
      name: string;
    };
  };
}

interface UserSession {
  id: string
  user_id: string
  user_email: string
  login_time: string
  last_activity: string
  duration_minutes: number
  questions_submitted: number
  pages_visited: string[]
  events: UserActivity[]
}

interface StudentClassMember {
  class: {
    id: string
    name: string
    teacher_id: string
    created_at: string
    teacher: {
      email: string
      full_name: string
    }
  }
}

type UserRole = 'admin' | 'student' | 'teacher'

type DbMember = {
  student_id: string;
  student: {
    email: string;
    forename?: string;
    lastname?: string;
  };
}

// Define a type for student list items
type StudentListItem = { id: string; email: string; forename?: string; lastname?: string };

function ActivitySkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Graph */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Skeleton className="w-full h-full" />
          </div>
        </CardContent>
      </Card>

      {/* Activity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
              <div>Event</div>
              <div>User</div>
              <div>Path</div>
              <div>Time</div>
            </div>
            {/* Activity Items */}
            {[...Array(10)].map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 text-sm py-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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

function PerformanceGraph({ studentAnswers, selectedStudent, topics }: {
  studentAnswers: ProcessedStudentAnswer[],
  selectedStudent: string | null,
  topics: Array<{ id: string; name: string; slug: string; topicnumber: string }>
}) {
  // Prepare data for the stacked bar chart
  const barChartData = topics.map((topic) => {
    const topicAnswers = studentAnswers.filter(
      a => a.student_id === selectedStudent &&
        a.question?.topic_id === topic.id
    );

    return {
      name: topic.name,
      topicNumber: topic.topicnumber,
      Strong: topicAnswers.filter(a => a.student_score === 'green').length,
      Developing: topicAnswers.filter(a => a.student_score === 'amber').length,
      "Needs Work": topicAnswers.filter(a => a.student_score === 'red').length,
      total: topicAnswers.length,
    }
  }).sort((a, b) => compareTopicNumbers(a.topicNumber, b.topicNumber))


  console.log('Bar Chart Data:', barChartData); // Debug log

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
              <RechartsBarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="topicNumber"
                  tick={({ x, y, payload }) => (
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
                  )}
                  interval={0}
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
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
          {/* md: diagonal, medium font */}
          <div className="invisible md:visible md:static lg:invisible lg:absolute min-w-0 min-h-0 h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="topicNumber"
                  tick={({ x, y, payload }) => (
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
                  )}
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
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
          {/* lg+: diagonal, larger font */}
          <div className="invisible lg:visible lg:static min-w-0 min-h-0 h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="topicNumber"
                  tick={({ x, y, payload }) => (
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
                  )}
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
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PerformanceGraphSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="h-[500px] min-w-0 min-h-0">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StudentSelectorSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 flex-1" />
    </div>
  )
}

// Add new skeleton components
function SessionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function HomeworkSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-36" />
          </div>
          {/* Content */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PerformanceTabSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart className="h-5 w-5 mr-2" />
          Student Performance
        </CardTitle>
        <CardDescription>Track student progress across topics and question types</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Time Filter Tabs */}
        <div className="flex items-center justify-end mb-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        {/* Student Selector */}
        <div className="mb-6">
          <StudentSelectorSkeleton />
          <div className="mt-4 max-h-72 overflow-y-auto border rounded-md divide-y divide-gray-100 bg-white">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2">
                <Skeleton className="w-7 h-7 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Performance Graph */}
        <PerformanceGraphSkeleton />
      </CardContent>
    </Card>
  )
}

// MAIN PAGE
export default function AnalyticsPage() {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [isLoadingHomework, setIsLoadingHomework] = useState(true)
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false)
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [allUserSessions, setAllUserSessions] = useState<UserSession[]>([])
  const [topics, setTopics] = useState<Array<{ id: string; name: string; slug: string; topicnumber: string }>>([])
  const [students, setStudents] = useState<Array<{ userid: string; email: string; forename: string; lastname: string }>>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [studentAnswers, setStudentAnswers] = useState<ProcessedStudentAnswer[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [classMembers, setClassMembers] = useState<Array<{ student_id: string; email: string; forename: string; lastname: string }>>([])
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "all">("all")
  const [studentSearch, setStudentSearch] = useState("");

  const supabase = createClient()

  const handleUserClick = (userid: string) => {
    setSelectedStudent(userid)
  }

  const fetchStudentAnswers = useCallback(async () => {
    if (!selectedStudent) {
      console.log('No student selected, skipping fetch')
      return
    }

    setIsLoadingPerformance(true)
    try {
      // Fetch student answers with topic information
      const { data: studentAnswers, error: studentAnswersError } = await supabase
        .from('student_answers')
        .select(`
    id,
    student_id,
    question_id,
    student_score,
    submitted_at,
    questions (
      id,
      question_text,
      subtopic_question_link (
        subtopics (
          id,
          topic_id,
          topics (
            id,
            name,
            slug,
            topicnumber
          )
        )
      )
    )
  `)
        .order('submitted_at', { ascending: false })
        .eq('student_id', selectedStudent)

      console.log('Student answers:', studentAnswers)
      if (studentAnswersError) {
        console.error('Error fetching student answers:', studentAnswersError.message)
        return
      }

      if (!studentAnswers) {
        console.log('No student answers found for student:', selectedStudent)
        return
      }

      // Set the state with the fetched answers, mapping to match ProcessedStudentAnswer type
      setStudentAnswers(
        studentAnswers.map((answer) => {
          const question = (answer.questions as unknown) as StudentAnswerData['questions'];
          const subtopicLink = question?.subtopic_question_link?.[0];
          const subtopic = subtopicLink?.subtopics;
          const topic = subtopic?.topics;
          return {
            ...answer,
            question: {
              topic_id: subtopic?.topic_id || '',
              topic: topic
                ? { id: topic.id, slug: topic.slug, topicnumber: topic.topicnumber, name: topic.name }
                : { id: '', slug: '', topicnumber: '', name: '' },
            },
          };
        })
      );
      console.log('Fetched student answers:', studentAnswers)
    } catch (error) {
      console.error('Unexpected error fetching student answers:', error)
    } finally {
      setIsLoadingPerformance(false)
    }
  }, [selectedStudent, supabase]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentAnswers()
    }
  }, [selectedStudent, fetchStudentAnswers])

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        redirect('/')
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("userid", user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
      } else {
        setCurrentUserRole(profile?.role || 'student')
      }

      // Fetch classes based on user role
      if (profile?.role === 'teacher') {
        // Fetch classes where user is the teacher
        const { data: teacherClasses, error: teacherClassesError } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id)

        if (teacherClassesError) {
          console.error('Error fetching teaching classes:', teacherClassesError)
        } else {
          setClasses(teacherClasses || [])
        }
        setIsLoadingClasses(false)
      } else if (profile?.role === 'student') {
        // Fetch classes where user is a student
        const { data: studentClasses, error: studentClassesError } = await supabase
          .from('class_members')
          .select(`
            class:classes (
              id,
              name,
              teacher_id,
              created_at,
              teacher:profiles!classes_teacher_id_fkey (
                email,
                full_name
              )
            )
          `)
          .eq('student_id', user.id)
          .returns<StudentClassMember[]>()

        if (studentClassesError) {
          console.error('Error fetching student classes:', studentClassesError)
        } else {
          const mappedClasses = (studentClasses || []).map((m: StudentClassMember) => ({
            id: m.class.id,
            name: m.class.name,
            teacher_id: m.class.teacher_id,
            created_at: m.class.created_at,
            teacher: m.class.teacher
          }))
          setClasses(mappedClasses)
        }
        setIsLoadingClasses(false)
      } else {
        setIsLoadingClasses(false)
      }

      // Fetch students if user is admin or teacher
      if (profile?.role === 'admin' || profile?.role === 'teacher') {
        // Fetch all users
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("userid, email, forename, lastname")
          .order('email')

        if (usersError) {
          console.error('Error fetching users:', usersError)
        } else {
          setStudents(usersData || [])
          if (usersData && usersData.length > 0) {
            setSelectedStudent(usersData[0].userid)
          }
        }
      }

      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("id, name, slug, topicnumber")
        .order('topicnumber')

      if (topicsError) {
        console.error('Error fetching topics:', topicsError)
      } else {
        setTopics(topicsData || [])
      }

      // Fetch all user activity
      const { data: activity } = await supabase
        .from("user_activity")
        .select("*")
        .order('created_at', { ascending: false })

      if (activity) {
        setUserActivity(activity)
      } else {
        setUserActivity([])
      }

      setIsLoading(false)
      setIsLoadingSessions(false)
      setIsLoadingHomework(false)
    }

    fetchUser()
  }, [supabase])

  useEffect(() => {
    // Group activities by session for all users
    const sessions = new Map<string, UserSession>()

    userActivity.forEach(activity => {
      const date = new Date(activity.created_at).toDateString()
      const sessionKey = `${activity.user_id}_${date}`
      
      if (!sessions.has(sessionKey)) {
        sessions.set(sessionKey, {
          id: sessionKey,
          user_id: activity.user_id,
          user_email: activity.user_email || 'Unknown',
          login_time: activity.created_at,
          last_activity: activity.created_at,
          duration_minutes: 0,
          questions_submitted: 0,
          pages_visited: [],
          events: []
        })
      }

      const session = sessions.get(sessionKey)!
      session.events.push(activity)

      // Update last activity time
      if (new Date(activity.created_at) > new Date(session.last_activity)) {
        session.last_activity = activity.created_at
      }

      // Update login time if this is earlier
      if (new Date(activity.created_at) < new Date(session.login_time)) {
        session.login_time = activity.created_at
      }

      // Count questions submitted
      if (activity.event === 'submitted_question') {
        session.questions_submitted++
      }

      // Track unique pages visited
      if (!session.pages_visited.includes(activity.path)) {
        session.pages_visited.push(activity.path)
      }
    })

    // Calculate duration for each session
    const sessionsArray = Array.from(sessions.values()).map(session => ({
      ...session,
      duration_minutes: Math.round(
        (new Date(session.last_activity).getTime() - new Date(session.login_time).getTime()) / (1000 * 60)
      )
    }))

    // Sort by most recent
    sessionsArray.sort((a, b) =>
      new Date(b.login_time).getTime() - new Date(a.login_time).getTime()
    )

    setAllUserSessions(sessionsArray)
  }, [userActivity])

  useEffect(() => {
    const fetchClassMembers = async () => {
      if (selectedClass === "all") {
        setClassMembers([])
        return
      }

      const { data: members, error: membersError } = await supabase
        .from('class_members')
        .select(`
          student_id,
          student:profiles!class_members_student_id_fkey (
            email,
            forename,
            lastname
          )
        `)
        .eq('class_id', selectedClass) as { data: DbMember[] | null, error: PostgrestError | null }

      if (membersError) {
        console.error('Error fetching class members:', membersError)
        return
      }

      const mappedMembers = (members || []).map(member => {
        const { forename = '', lastname = '', email = '' } = member.student || {};
        return {
          student_id: member.student_id,
          email,
          forename,
          lastname
        };
      })

      setClassMembers(mappedMembers)
    }

    fetchClassMembers()
  }, [selectedClass, supabase])

  // Filter activity based on selected class
  const filteredActivity = selectedClass === "all" 
    ? userActivity 
    : userActivity.filter(activity => {
        // For students, only show their own activity
        if (currentUserRole === 'student') {
          return activity.user_id === selectedStudent
        }
        // For teachers, show activity of students in their class
        const studentInClass = students.find(s => s.userid === activity.user_id)
        return studentInClass && activity.class_id === selectedClass
      })

  // Update unique users count based on filtered activity
  const filteredUniqueUsers = new Set(filteredActivity.map(a => a.user_id)).size

  // Update page views based on filtered activity
  const filteredPageViews = filteredActivity.reduce((acc, curr) => {
    acc[curr.path] = (acc[curr.path] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Get top 5 most visited pages from filtered data
  const topPages = Object.entries(filteredPageViews)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Filter studentAnswers by timeFilter for Performance tab
  const filteredStudentAnswers = studentAnswers.filter((answer) => {
    if (timeFilter === "all") return true;
    const submitted = new Date(answer.submitted_at);
    const now = new Date();
    if (timeFilter === "today") {
      return (
        submitted.getFullYear() === now.getFullYear() &&
        submitted.getMonth() === now.getMonth() &&
        submitted.getDate() === now.getDate()
      );
    }
    if (timeFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return submitted >= weekAgo && submitted <= now;
    }
    return true;
  });

  // Filter students for selected class
  const studentsInClass: StudentListItem[] = selectedClass === "all"
    ? students.map(s => ({ id: s.userid, email: s.email, forename: s.forename, lastname: s.lastname }))
    : classMembers.length > 0
      ? classMembers.map(s => ({ id: s.student_id, email: s.email, forename: s.forename, lastname: s.lastname }))
      : [];

  const filteredStudents: StudentListItem[] = studentsInClass.filter(student =>
    student.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  if (!currentUserRole || (currentUserRole !== 'admin' && currentUserRole !== 'teacher')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mt-4 mb-2">Analytics</h1>
            <p className="text-muted-foreground">Access denied. This page is only available to administrators and teachers.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mt-4 mb-2">Analytics</h1>
          <p className="text-muted-foreground">Track student progress and site usage</p>
        </div>

        {/* Class Selector */}
        <div className="mb-6">
          {isLoadingClasses ? (
            <Skeleton className="h-10 w-[200px]" />
          ) : classes.length > 0 ? (
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-muted-foreground">
              No classes assigned to you yet.
            </div>
          )}
        </div>

        <Tabs defaultValue="activity" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="w-full md:w-auto justify-start md:justify-center">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="homework">Homework</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Site Analytics
                </CardTitle>
                <CardDescription>Overview of site usage and user activity</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <ActivitySkeleton />
                ) : (
                  <div className="space-y-8">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold">{filteredUniqueUsers}</div>
                              <p className="text-sm text-muted-foreground">Unique Users</p>
                            </div>
                            <Users className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold">{filteredActivity.filter(a => a.event === 'visited_question').length}</div>
                              <p className="text-sm text-muted-foreground">Questions Viewed</p>
                            </div>
                            <Eye className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold">{filteredActivity.length}</div>
                              <p className="text-sm text-muted-foreground">Total Page Views</p>
                            </div>
                            <Navigation className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Top Pages */}
                    <div className="border-t pt-6">
                      <h3 className="font-medium mb-4">Most Visited Pages</h3>
                      <div className="space-y-2">
                        {topPages.map(([path, count], index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <span className="font-medium">{index + 1}.</span>
                              <span className="ml-2">{path}</span>
                            </div>
                            <span className="text-muted-foreground">{count} views</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Activity Breakdown */}
                    <div className="border-t pt-6">
                      <h3 className="font-medium mb-4">Activity Breakdown</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{filteredActivity.filter(a => a.event === 'visited_revisit').length}</div>
                            <p className="text-sm text-muted-foreground">Revisit Sessions</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{filteredActivity.filter(a => a.event === 'visited_progress').length}</div>
                            <p className="text-sm text-muted-foreground">Progress Checks</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="border-t pt-6">
                      <h3 className="font-medium mb-4">Recent Activity</h3>
                      <div className="space-y-2">
                        {/* Header */}
                        <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                          <div>Event</div>
                          <div>User</div>
                          <div>Path</div>
                          <div>Time</div>
                        </div>
                        {/* Activity Items */}
                        {filteredActivity
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((activity) => (
                            <div key={activity.id} className="grid grid-cols-4 gap-4 text-sm py-2">
                              <div className="flex items-center gap-2">
                                {activity.event === 'visited_home' && <Home className="h-4 w-4 text-muted-foreground" />}
                                {activity.event === 'visited_question' && <FileText className="h-4 w-4 text-muted-foreground" />}
                                {activity.event === 'visited_progress' && <BarChart className="h-4 w-4 text-muted-foreground" />}
                                {activity.event === 'visited_revisit' && <RefreshCw className="h-4 w-4 text-muted-foreground" />}
                                {activity.event === 'submitted_question' && <CheckCircle className="h-4 w-4 text-muted-foreground" />}
                                <span className="capitalize">{activity.event.replace(/_/g, ' ')}</span>
                              </div>
                              <div
                                className="truncate cursor-pointer hover:text-primary"
                                onClick={() => handleUserClick(activity.user_id)}
                              >
                                {activity.user_email}
                              </div>
                              <div className="truncate">{activity.path}</div>
                              <div>{new Date(activity.created_at).toLocaleString()}</div>
                            </div>
                          ))}
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredActivity.length)} of {filteredActivity.length} activities
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                          <button
                            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredActivity.length / itemsPerPage), prev + 1))}
                            disabled={currentPage >= Math.ceil(filteredActivity.length / itemsPerPage)}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            {isLoadingSessions ? (
              <SessionsSkeleton />
            ) : (
              <UserSessions onUserClick={handleUserClick} sessions={allUserSessions} />
            )}
          </TabsContent>

          <TabsContent value="homework">
            {isLoadingHomework ? (
              <HomeworkSkeleton />
            ) : (
              <UserActivityFilter selectedClass={selectedClass} classMembers={classMembers} />
            )}
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2" />
                  Student Performance
                </CardTitle>
                <CardDescription>Track student progress across topics and question types</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Time Filter Tabs - always visible */}
                <div className="flex items-center justify-end mb-4">
                  <Tabs value={timeFilter} onValueChange={(value) => setTimeFilter(value as "today" | "week" | "all")}> 
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
                {/* Class-based student selection UI */}
                {selectedClass === "all" ? (
                  <div className="text-center text-muted-foreground my-8">
                    <p>Please select a class to view and select students.</p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <label htmlFor="student-search" className="text-sm font-medium">Search Student</label>
                      <input
                        id="student-search"
                        type="text"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Type name or email..."
                        value={studentSearch}
                        onChange={e => setStudentSearch(e.target.value)}
                      />
                    </div>
                    <div className="max-h-72 overflow-y-auto border rounded-md divide-y divide-gray-100 bg-white">
                      {filteredStudents.length === 0 ? (
                        <div className="py-4 text-center text-muted-foreground">No students found.</div>
                      ) : (
                        filteredStudents.map(student => {
                          const initials = student?.forename?.[0] && student?.lastname?.[0]
                            ? `${student.forename[0]}${student.lastname[0]}`.toUpperCase()
                            : (student.email?.[0]?.toUpperCase() || '?');
                          return (
                            <button
                              key={student.id}
                              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors focus:outline-none ${selectedStudent === student.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'hover:bg-gray-50'}`}
                              onClick={() => setSelectedStudent(student.id)}
                            >
                              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-base">
                                {initials}
                              </span>
                              <span className="truncate font-medium">{student.email}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
                {/* Performance Graph */}
                {selectedStudent && (
                  isLoadingPerformance ? (
                    <PerformanceGraphSkeleton />
                  ) : (
                    <PerformanceGraph
                      studentAnswers={filteredStudentAnswers || []}
                      selectedStudent={selectedStudent}
                      topics={topics}
                    />
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Activity, Users, Eye, Navigation, Home, FileText, BarChart, RefreshCw, CheckCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserSessions } from "@/components/user-sessions"
import { UserActivityFilter } from "@/components/user-activity-filter"
import { Skeleton } from "@/components/ui/skeleton"
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

interface UserActivity {
  id: string
  user_id: string
  event: string
  path: string
  created_at: string
  user_email?: string
  score?: 'correct' | 'incorrect'
  question_type?: string
  question_text?: string
  topic?: string
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

type UserRole = 'admin' | 'student' | 'teacher'

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

function PerformanceGraph({ userActivity, selectedStudent, topics }: { userActivity: UserActivity[], selectedStudent: string | null, topics: Array<{ id: string; name: string; slug: string }> }) {
  // Prepare data for the stacked bar chart
  const barChartData = topics.map((topic) => {
    const topicAnswers = userActivity.filter(
      a => a.user_id === selectedStudent &&
        a.event === 'submitted_question' &&
        a.path.includes(topic.slug)
    );
    return {
      name: topic.name,
      topicNumber: topic.slug,
      Strong: topicAnswers.filter(a => a.score === 'correct').length,
      Developing: topicAnswers.filter(a => a.score === 'incorrect').length,
      "Needs Work": 0, // Adding this to match progress page structure
      total: topicAnswers.length,
    }
  }).filter(data => data.total > 0) // Only show topics with activity

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

export default function AnalyticsPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uniqueUsers, setUniqueUsers] = useState<number>(0)
  const [pageViews, setPageViews] = useState<Record<string, number>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [userSessions, setUserSessions] = useState<UserSession[]>([])
  const [topics, setTopics] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [students, setStudents] = useState<Array<{ userid: string; email: string }>>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)

  const supabase = createClient()

  const handleUserClick = (email: string) => {
    setSelectedStudent(email)

    // Group activities by session for the selected user
    const userActivities = userActivity.filter(a => a.user_email === email)
    const sessions = new Map<string, UserSession>()

    userActivities.forEach(activity => {
      const date = new Date(activity.created_at).toDateString()
      if (!sessions.has(date)) {
        sessions.set(date, {
          id: `${activity.user_id}_${date}`,
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

      const session = sessions.get(date)!
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

    setUserSessions(sessionsArray)
  }

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
        setUserRole(profile?.role || 'student')
      }

      // Fetch students if user is admin or teacher
      if (profile?.role === 'admin' || profile?.role === 'teacher') {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from("profiles")
          .select("userid, email")
          .neq("role", "admin")  // Exclude admins
          .neq("role", "teacher")  // Exclude teachers
          .order('email')

        if (studentsError) {
          console.error('Error fetching students:', studentsError)
        } else {
          setStudents(studentsData || [])
          if (studentsData && studentsData.length > 0) {
            setSelectedStudent(studentsData[0].userid)
          }
        }
      }

      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("id, name, slug")
        .order('name')

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

      // Calculate unique users
      const uniqueUserIds = new Set(activity?.map(a => a.user_id) || [])
      setUniqueUsers(uniqueUserIds.size)

      // Calculate page views
      const views = activity?.reduce((acc, curr) => {
        acc[curr.path] = (acc[curr.path] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
      setPageViews(views)

      setIsLoading(false)
    }

    fetchUser()
  }, [supabase])

  // Group activity by event type
  const activityStats = userActivity.reduce((acc, activity) => {
    acc[activity.event] = (acc[activity.event] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Get top 5 most visited pages
  const topPages = Object.entries(pageViews)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  if (!userRole || (userRole !== 'admin' && userRole !== 'teacher')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
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
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Analytics</h1>
          <p className="text-muted-foreground">Track student progress and site usage</p>
        </div>

        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="homework">Homework</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

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
                              <div className="text-2xl font-bold">{uniqueUsers}</div>
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
                              <div className="text-2xl font-bold">{activityStats['visited_question'] || 0}</div>
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
                              <div className="text-2xl font-bold">{userActivity.length}</div>
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
                            <div className="text-2xl font-bold">{activityStats['visited_revisit'] || 0}</div>
                            <p className="text-sm text-muted-foreground">Revisit Sessions</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{activityStats['visited_progress'] || 0}</div>
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
                        {userActivity
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
                                onClick={() => handleUserClick(activity.user_email || '')}
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
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, userActivity.length)} of {userActivity.length} activities
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                          <button
                            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(userActivity.length / itemsPerPage), prev + 1))}
                            disabled={currentPage >= Math.ceil(userActivity.length / itemsPerPage)}
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
            <UserSessions onUserClick={handleUserClick} sessions={userSessions} />
          </TabsContent>

          <TabsContent value="homework">
            <UserActivityFilter />
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
                {isLoading ? (
                  <div className="space-y-8">
                    <StudentSelectorSkeleton />
                    <PerformanceGraphSkeleton />
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Student Selector */}
                    <div className="flex items-center gap-4">
                      <label htmlFor="student" className="text-sm font-medium">Select Student</label>
                      <select
                        id="student"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={selectedStudent || ''}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                      >
                        {students.length === 0 ? (
                          <option value="">No students available</option>
                        ) : (
                          students.map((student) => (
                            <option key={student.userid} value={student.userid}>
                              {student.email}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Performance Graph */}
                    <PerformanceGraph 
                      userActivity={userActivity}
                      selectedStudent={selectedStudent}
                      topics={topics}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
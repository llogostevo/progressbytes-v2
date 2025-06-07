"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { ArrowLeft, Activity, Users, Eye, Navigation, CheckCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { redirect } from "next/navigation"

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
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserSessions } from "@/components/user-sessions"

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

interface Student {
  userid: string
  email: string
}

interface UserSession {
  login_time: string
  last_activity: string
  duration_minutes: number
  questions_submitted: number
  pages_visited: string[]
  events: UserActivity[]
}

interface Course {
  name: string
  slug: string
  description: string
  icon: string
}

type UserRole = 'admin' | 'student' | 'teacher'

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

function ActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-4">
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

          {/* Top Pages */}
          <div className="border-t pt-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Activity Breakdown */}
          <div className="border-t pt-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="border-t pt-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-2">
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const [userType, setUserType] = useState<"basic" | "revision" | "revisionAI" | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userCourses, setUserCourses] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false)
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [filteredActivity, setFilteredActivity] = useState<UserActivity[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>("all")

  const supabase = createClient()

  const handleDeleteCourse = async () => {
    if (!courseToDelete || !userEmail || deleteConfirmation !== "delete") return

    setIsDeleting(true)
    const supabase = createClient()

    try {
      // Get current courses
      const { data: profile } = await supabase
        .from("profiles")
        .select("courses")
        .eq("email", userEmail)
        .single()

      if (!profile) throw new Error("Profile not found")

      // Remove the course from the array
      const updatedCourses = profile.courses.filter((course: string) => course !== courseToDelete)

      // Update the profile
      const { error } = await supabase
        .from("profiles")
        .update({ courses: updatedCourses })
        .eq("email", userEmail)

      if (error) throw error

      // Update local state
      setUserCourses(updatedCourses)
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
      setDeleteConfirmation("")
    } catch (error) {
      console.error("Error deleting course:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddCourse = async (courseSlug: string) => {
    if (!userEmail) return

    setIsAddingCourse(true)
    const supabase = createClient()

    try {
      // Get current courses
      const { data: profile } = await supabase
        .from("profiles")
        .select("courses")
        .eq("email", userEmail)
        .single()

      if (!profile) throw new Error("Profile not found")

      // Add the course if it's not already in the array
      if (!profile.courses.includes(courseSlug)) {
        const updatedCourses = [...profile.courses, courseSlug]

        // Update the profile
        const { error } = await supabase
          .from("profiles")
          .update({ courses: updatedCourses })
          .eq("email", userEmail)

        if (error) throw error

        // Update local state
        setUserCourses(updatedCourses)
      }

      setAddCourseDialogOpen(false)
    } catch (error) {
      console.error("Error adding course:", error)
    } finally {
      setIsAddingCourse(false)
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        redirect('/')
      }
      setUserEmail(user.email || null)

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("userid", user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
      } else {
        console.log('Profile data:', profile) // Debug log
        setUserType(profile?.user_type)
        setUserRole(profile?.role || 'student')
        setUserCourses(profile?.courses || [])
      }
    }

    const fetchCourses = async () => {
      const { data: courses, error } = await supabase
        .from("courses")
        .select("*")
        .order('name')

      if (error) {
        console.error("Error fetching courses:", error)
      } else {
        setAvailableCourses(courses || [])
      }
    }

    fetchUser()
    fetchCourses()
  }, [userEmail, supabase])

  useEffect(() => {
    const supabase = createClient()
    const fetchCourses = async () => {
      const { data: courses, error } = await supabase
        .from("courses")
        .select("*")
        .order('name')

      if (error) {
        console.error("Error fetching courses:", error)
      } else {
        setAvailableCourses(courses || [])
      }
    }

    if (addCourseDialogOpen) {
      fetchCourses()
    }
  }, [addCourseDialogOpen, supabase])

  useEffect(() => {
    const fetchUserActivity = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data: activityData } = await supabase
        .from("user_activity")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (activityData) {
        setUserActivity(activityData)
        setFilteredActivity(activityData)
      }
    }

    fetchUserActivity()
  }, [])

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    if (filter === "all") {
      setFilteredActivity(userActivity)
    } else {
      const filtered = userActivity.filter(activity => activity.event === filter)
      setFilteredActivity(filtered)
    }
  }

  const handleUserClick = (email: string) => {
    // Handle user click in settings page
    console.log("User clicked:", email)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  if (userRole !== "admin" && userRole !== "teacher") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Premium Features</CardTitle>
            <CardDescription>
              Upgrade to access advanced analytics and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <h3 className="font-medium">Self-Assessment</h3>
                  <p className="text-sm text-muted-foreground">
                    You&apos;re using the premium version with self-assessment. Coming soon get AI-powered feedback.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link href="/" className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>
                View detailed analytics and user insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      +0% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Sessions
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      +0% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Page Views
                    </CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      +0% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Navigation Events
                    </CardTitle>
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      +0% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Sessions</CardTitle>
              <CardDescription>
                View detailed user session data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserSessions onUserClick={handleUserClick} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>
                Track and analyze user interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-4">
                {filteredActivity.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {activity.event}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.path}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

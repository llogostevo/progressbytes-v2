"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Sparkles, Activity, Users, Eye, Navigation, Home, FileText, BarChart, RefreshCw, CheckCircle, Clock, Calendar, Trash2, Plus, BookOpen, Book, GraduationCap, School, BookMarked, BookText, Library, BookOpenCheck, BookOpenText, Bookmark, BookmarkCheck, BookmarkPlus, BookmarkX } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserSessions } from "@/components/user-sessions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { UserActivityFilter } from "@/components/user-activity-filter"
import { Input } from "@/components/ui/input"

// TODO: the homework dialgo is the best and should be replciated for hte other dialogs. 
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
  id: string
  email: string
  name?: string
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

export default function SettingsPage() {
  const [userType, setUserType] = useState<"revision" | "revisionAI" | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uniqueUsers, setUniqueUsers] = useState<number>(0)
  const [pageViews, setPageViews] = useState<Record<string, number>>({})
  // const [navigationPaths, setNavigationPaths] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userSessions, setUserSessions] = useState<UserSession[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0)
  const [topics, setTopics] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userCourses, setUserCourses] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false)
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  
  const supabase = createClient()

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const handleUserClick = (email: string) => {
    setSelectedUser(email)
    setCurrentSessionIndex(0) // Reset to first session
    
    // Group activities by session for the selected user
    const userActivities = userActivity.filter(a => a.user_email === email)
    const sessions = new Map<string, UserSession>()
    
    userActivities.forEach(activity => {
      const date = new Date(activity.created_at).toDateString()
      if (!sessions.has(date)) {
        sessions.set(date, {
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
    setIsDialogOpen(true)
  }

  const handlePreviousSession = () => {
    setCurrentSessionIndex(prev => Math.max(0, prev - 1))
  }

  const handleNextSession = () => {
    setCurrentSessionIndex(prev => Math.min(userSessions.length - 1, prev + 1))
  }

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
      const { data: {user}, error } = await supabase.auth.getUser()
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
        setUserType(profile?.user_type)
        setUserCourses(profile?.courses || [])
      }

      // Only fetch students if user is admin
      if (userEmail === "stevensl@centralfoundationboys.co.uk") {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from("profiles")
          .select("id, email, name")
          .order('email')

        if (studentsError) {
          console.error('Error fetching students:', studentsError)
        } else {
          setStudents(studentsData || [])
          if (studentsData && studentsData.length > 0) {
            setSelectedStudent(studentsData[0].id)
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

      // Calculate navigation paths
      // const paths = activity?.map(a => a.path) || []
      // setNavigationPaths(paths)

      setIsLoading(false)
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

  // Group activity by event type
  const activityStats = userActivity.reduce((acc, activity) => {
    acc[activity.event] = (acc[activity.event] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Get top 5 most visited pages
  const topPages = Object.entries(pageViews)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            {userEmail === "stevensl@centralfoundationboys.co.uk" && (
              <>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="homework">Homework</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="account">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account details and subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="text-sm text-muted-foreground">{userEmail}</div>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="courses">Courses</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddCourseDialogOpen(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Course
                    </Button>
                  </div>
                  {userCourses && userCourses.length > 0 ? (
                    <div className="space-y-2">
                      {userCourses.map((course, index) => (
                        <div key={index} className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{course}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${
                              userCourses.length === 1 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => {
                              if (userCourses.length > 1) {
                                setCourseToDelete(course)
                                setDeleteDialogOpen(true)
                              }
                            }}
                            disabled={userCourses.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No courses enrolled</div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                        AI Feedback Mode
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {userType === "revisionAI" ? "You have access to AI-powered feedback" : "Upgrade to get AI-powered feedback"}
                      </p>
                    </div>
                    <Switch checked={userType === "revisionAI"} id="paid-mode" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Manage your subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{userType === "revisionAI" ? "Premium Plan" : "Free Plan"}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {userType === "revisionAI"
                          ? "Full access to all features including AI feedback"
                          : "Limited access with self-assessment only"}
                      </p>
                    </div>
                    <Link href="/coming-soon">
                      <Button
                        variant={userType === "revisionAI" ? "outline" : "default"}
                        className={userType === "revisionAI" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                      >
                        {userType === "revisionAI" ? "Downgrade" : "Upgrade"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {userEmail === "stevensl@centralfoundationboys.co.uk" && (
            <>
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
                      <div className="text-center py-4">Loading analytics data...</div>
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(userActivity.length / itemsPerPage), prev + 1))}
                                disabled={currentPage >= Math.ceil(userActivity.length / itemsPerPage)}
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions">
                <UserSessions onUserClick={handleUserClick} />
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
                      <div className="text-center py-4">Loading performance data...</div>
                    ) : (
                      <div className="space-y-8">
                        {/* Student Selector */}
                        <div className="flex items-center gap-4">
                          <Label htmlFor="student">Select Student</Label>
                          <select
                            id="student"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedStudent || ''}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                          >
                            {students.map((student) => (
                              <option key={student.id} value={student.id}>
                                {student.name || student.email}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Overall Performance */}
                        <div className="border-t pt-6">
                          <h3 className="font-medium mb-4">Overall Performance</h3>
                          <div className="grid grid-cols-3 gap-4">
                            {(() => {
                              const studentActivity = userActivity.filter(
                                a => a.user_id === selectedStudent && a.event === 'submitted_question'
                              );
                              const totalQuestions = studentActivity.length;
                              const correctAnswers = studentActivity.filter(
                                a => a.score === 'correct'
                              ).length;
                              const successRate = totalQuestions > 0 
                                ? Math.round((correctAnswers / totalQuestions) * 100) 
                                : 0;

                              return (
                                <>
                                  <Card>
                                    <CardContent className="pt-6">
                                      <div className="text-2xl font-bold">{totalQuestions}</div>
                                      <p className="text-sm text-muted-foreground">Total Questions</p>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardContent className="pt-6">
                                      <div className="text-2xl font-bold">{correctAnswers}</div>
                                      <p className="text-sm text-muted-foreground">Correct Answers</p>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardContent className="pt-6">
                                      <div className="text-2xl font-bold">{successRate}%</div>
                                      <p className="text-sm text-muted-foreground">Success Rate</p>
                                    </CardContent>
                                  </Card>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Topic Performance */}
                        <div className="border-t pt-6">
                          <h3 className="font-medium mb-4">Topic Performance</h3>
                          <div className="space-y-4">
                            {topics.map((topic) => {
                              const topicAnswers = userActivity.filter(
                                a => a.user_id === selectedStudent && 
                                     a.event === 'submitted_question' && 
                                     a.path.includes(topic.slug)
                              );
                              const correctAnswers = topicAnswers.filter(
                                a => a.score === 'correct'
                              ).length;
                              const totalAnswers = topicAnswers.length;
                              const successRate = totalAnswers > 0 
                                ? Math.round((correctAnswers / totalAnswers) * 100) 
                                : 0;

                              return (
                                <Card key={topic.id}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h4 className="font-medium">{topic.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {correctAnswers} correct out of {totalAnswers} attempts
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-2xl font-bold">{successRate}%</div>
                                        <p className="text-sm text-muted-foreground">Success Rate</p>
                                      </div>
                                    </div>
                                    <div className="mt-4 w-full bg-secondary h-2 rounded-full">
                                      <div 
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${successRate}%` }}
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>

                        {/* Question Type Performance */}
                        <div className="border-t pt-6">
                          <h3 className="font-medium mb-4">Question Type Performance</h3>
                          <div className="grid grid-cols-2 gap-4">
                            {['multiple-choice', 'short-answer', 'true-false', 'matching'].map((type) => {
                              const typeAnswers = userActivity.filter(
                                a => a.user_id === selectedStudent && 
                                     a.event === 'submitted_question' && 
                                     a.question_type === type
                              );
                              const correctAnswers = typeAnswers.filter(
                                a => a.score === 'correct'
                              ).length;
                              const totalAnswers = typeAnswers.length;
                              const successRate = totalAnswers > 0 
                                ? Math.round((correctAnswers / totalAnswers) * 100) 
                                : 0;

                              return (
                                <Card key={type}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h4 className="font-medium capitalize">{type.replace(/-/g, ' ')}</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {correctAnswers} correct out of {totalAnswers} attempts
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-2xl font-bold">{successRate}%</div>
                                        <p className="text-sm text-muted-foreground">Success Rate</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>

                        {/* Recent Performance */}
                        <div className="border-t pt-6">
                          <h3 className="font-medium mb-4">Recent Performance</h3>
                          <div className="space-y-2">
                            {userActivity
                              .filter(a => a.user_id === selectedStudent && a.event === 'submitted_question')
                              .slice(0, 5)
                              .map((activity) => (
                                <Card key={activity.id}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h4 className="font-medium">{activity.question_text}</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {activity.topic} • {activity.question_type}
                                        </p>
                                      </div>
                                      <div className={`text-right ${
                                        activity.score === 'correct' ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        <div className="text-2xl font-bold capitalize">
                                          {activity.score}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          {new Date(activity.created_at).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* User Session Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Activity: {selectedUser}</DialogTitle>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>
          
          {userSessions.length > 0 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {new Date(userSessions[currentSessionIndex].login_time).toLocaleDateString()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Duration: {formatDuration(userSessions[currentSessionIndex].duration_minutes)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Questions: {userSessions[currentSessionIndex].questions_submitted}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Pages visited: {userSessions[currentSessionIndex].pages_visited.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Total events: {userSessions[currentSessionIndex].events.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Pages Visited:</h4>
                    <div className="space-y-1">
                      {userSessions[currentSessionIndex].pages_visited.map((path, i) => (
                        <div key={i} className="text-sm text-muted-foreground">
                          {path}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousSession}
                  disabled={currentSessionIndex === 0}
                >
                  Previous Session
                </Button>
                <span className="text-sm text-muted-foreground">
                  Session {currentSessionIndex + 1} of {userSessions.length}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextSession}
                  disabled={currentSessionIndex === userSessions.length - 1}
                >
                  Next Session
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Delete Course</DialogTitle>
            <DialogDescription className="text-gray-500 mt-2">
              This action cannot be undone. This will permanently remove this course from your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 px-1">
            <div className="space-y-3">
              <label htmlFor="delete-confirmation" className="text-sm font-medium text-gray-700 block">
                Type &quot;delete&quot; to confirm
              </label>
              <Input
                id="delete-confirmation"
                placeholder="Type &quot;delete&quot; to confirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className={`w-full ${
                  deleteConfirmation && deleteConfirmation !== "delete"
                    ? "border-red-300 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              {deleteConfirmation && deleteConfirmation !== "delete" && (
                <p className="text-sm text-red-500 mt-1">Please type &quot;delete&quot; exactly to confirm</p>
              )}
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setCourseToDelete(null)
                setDeleteConfirmation("")
              }}
              className="mt-2 sm:mt-0"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCourse}
              disabled={deleteConfirmation !== "delete" || isDeleting}
              className={`flex items-center gap-2 ${
                deleteConfirmation === "delete"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-100 text-red-400 cursor-not-allowed"
              }`}
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Course
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Course Dialog */}
      <Dialog open={addCourseDialogOpen} onOpenChange={setAddCourseDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Add Course</DialogTitle>
            <DialogDescription className="text-gray-500 mt-2">
              Select a course to add to your profile
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
              {availableCourses
                .filter(course => !userCourses.includes(course.slug))
                .map((course) => {
                  // Map icon string to Lucide component
                  const IconComponent = (() => {
                    switch (course.icon) {
                      case 'book': return Book
                      case 'book-open': return BookOpen
                      case 'graduation-cap': return GraduationCap
                      case 'school': return School
                      case 'book-marked': return BookMarked
                      case 'book-text': return BookText
                      case 'library': return Library
                      case 'book-open-check': return BookOpenCheck
                      case 'book-open-text': return BookOpenText
                      case 'bookmark': return Bookmark
                      case 'bookmark-check': return BookmarkCheck
                      case 'bookmark-plus': return BookmarkPlus
                      case 'bookmark-x': return BookmarkX
                      default: return BookOpen
                    }
                  })()

                  return (
                    <div
                      key={course.slug}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => handleAddCourse(course.slug)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-gray-100 group-hover:bg-gray-200 transition-colors">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{course.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">{course.description}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isAddingCourse}
                      >
                        {isAddingCourse ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )
                })}
              {availableCourses.filter(course => !userCourses.includes(course.slug)).length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No more courses available to add
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddCourseDialogOpen(false)}
              className="mt-2 sm:mt-0"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { currentUser } from "@/lib/data"
import { ArrowLeft, Sparkles, Activity, Users, Eye, Navigation, Home, FileText, BarChart, RefreshCw, CheckCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserSessions } from "@/components/user-sessions"

interface UserActivity {
  id: string
  user_id: string
  event: string
  path: string
  created_at: string
  user_email?: string
}

export default function SettingsPage() {
  const [userType, setUserType] = useState<"revision" | "revisionAI" | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uniqueUsers, setUniqueUsers] = useState<number>(0)
  const [pageViews, setPageViews] = useState<Record<string, number>>({})
  const [navigationPaths, setNavigationPaths] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: {user}, error } = await supabase.auth.getUser()
      if (error) {
        redirect('/')
      } else if (user && user.email != "stevensl@centralfoundationboys.co.uk") {
        redirect('/')
      }

      const { data: { profiles } } = await supabase
        .from("profiles")
        .select("*")
        .eq("userid", user?.id)
        .single()

      setUserType(profiles?.user_type)

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
      const paths = activity?.map(a => a.path) || []
      setNavigationPaths(paths)

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
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
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
                  <div className="text-sm text-muted-foreground">{currentUser.email}</div>
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
                              <div className="truncate">{activity.user_email}</div>
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
            <UserSessions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

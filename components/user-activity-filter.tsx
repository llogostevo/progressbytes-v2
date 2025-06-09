import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Clock, FileText, Calendar, Navigation, Activity, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

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
  user_id: string
  user_email: string
  total_duration: number
  questions_submitted: number
  last_activity: string
  class_id?: string
}

interface UserEvent {
  created_at: string
  event: string
  path: string
  user_id: string
  user_email: string
}

interface UserSession {
  login_time: string
  last_activity: string
  duration_minutes: number
  questions_submitted: number
  pages_visited: string[]
  events: UserEvent[]
  submitted_questions: { path: string; count: number }[]
}

interface UserActivityFilterProps {
  selectedClass: string;
  classMembers: Array<{ student_id: string; email: string }>;
}

function FilterSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-32 mt-4" />
      </CardContent>
    </Card>
  )
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <Skeleton className="h-4 w-48" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function UserActivityFilter({ selectedClass, classMembers }: UserActivityFilterProps) {
  const [users, setUsers] = useState<UserActivity[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserActivity[]>([])
  const [nonFilteredUsers, setNonFilteredUsers] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userSessions, setUserSessions] = useState<UserSession[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0)
  
  // Filter states
  const [timeRange, setTimeRange] = useState("7") // days
  const [minDuration, setMinDuration] = useState("30") // minutes
  const [minQuestions, setMinQuestions] = useState("5") // questions

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const formatPath = (path: string) => {
    // Extract the last part of the path (after the last slash)
    const slug = path.split('/').pop() || path
    // Remove hyphens and capitalize first letter
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const handleUserClick = async (email: string) => {
    setSelectedUser(email)
    setCurrentSessionIndex(0)
    
    const supabase = createClient()
    
    // Calculate the date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(timeRange))

    // Fetch user activity
    const { data: activity } = await supabase
      .from("user_activity")
      .select("*")
      .eq('user_email', email)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (activity) {
      // Group activities by session
      const sessions = new Map<string, UserSession>()
      
      activity.forEach(record => {
        const date = new Date(record.created_at).toDateString()
        if (!sessions.has(date)) {
          sessions.set(date, {
            login_time: record.created_at,
            last_activity: record.created_at,
            duration_minutes: 0,
            questions_submitted: 0,
            pages_visited: [],
            events: [],
            submitted_questions: []
          })
        }
        
        const session = sessions.get(date)!
        session.events.push(record)
        
        // Update last activity time
        if (new Date(record.created_at) > new Date(session.last_activity)) {
          session.last_activity = record.created_at
        }
        
        // Update login time if this is earlier
        if (new Date(record.created_at) < new Date(session.login_time)) {
          session.login_time = record.created_at
        }
        
        // Count questions submitted and track paths
        if (record.event === 'submitted_question') {
          session.questions_submitted++
          const existingQuestion = session.submitted_questions.find(q => q.path === record.path)
          if (existingQuestion) {
            existingQuestion.count++
          } else {
            session.submitted_questions.push({ path: record.path, count: 1 })
          }
        }
        
        // Track unique pages visited
        if (!session.pages_visited.includes(record.path)) {
          session.pages_visited.push(record.path)
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
  }

  const handlePreviousSession = () => {
    setCurrentSessionIndex(prev => Math.max(0, prev - 1))
  }

  const handleNextSession = () => {
    setCurrentSessionIndex(prev => Math.min(userSessions.length - 1, prev + 1))
  }

  const applyFilters = useCallback((usersToFilter: UserActivity[]) => {
    return usersToFilter.filter(user => {
      const durationMatch = user.total_duration >= parseInt(minDuration)
      const questionsMatch = user.questions_submitted >= parseInt(minQuestions)
      const classMatch = selectedClass === "all" || classMembers.some(member => member.email === user.user_email)
      return durationMatch && questionsMatch && classMatch
    })
  }, [minDuration, minQuestions, selectedClass, classMembers])

  useEffect(() => {
    const fetchUserActivity = async () => {
      const supabase = createClient()
      
      // Calculate the date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(timeRange))

      // Fetch all user activity within the date range
      const { data: activity } = await supabase
        .from("user_activity")
        .select("*")
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (activity) {
        // Group and process user activity
        const userMap = new Map<string, UserActivity>()
        
        // First pass: Initialize user records
        activity.forEach(record => {
          if (!userMap.has(record.user_id)) {
            userMap.set(record.user_id, {
              user_id: record.user_id,
              user_email: record.user_email || 'Unknown',
              total_duration: 0,
              questions_submitted: 0,
              last_activity: record.created_at,
              class_id: record.class_id
            })
          }
        })

        // Second pass: Calculate durations and count questions
        activity.forEach(record => {
          const user = userMap.get(record.user_id)!
          
          // Update last activity if this is more recent
          if (new Date(record.created_at) > new Date(user.last_activity)) {
            user.last_activity = record.created_at
          }
          
          // Count questions submitted
          if (record.event === 'submitted_question') {
            user.questions_submitted++
          }
        })

        const usersArray = Array.from(userMap.values())
        setNonFilteredUsers(usersArray)
        setFilteredUsers(applyFilters(usersArray))
        setUsers(usersArray)
      }
      
      setIsLoading(false)
    }

    fetchUserActivity()
  }, [timeRange, applyFilters])

  const handleFilterChange = () => {
    applyFilters(users)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFilterChange()
    }
  }

  const exportToCSV = (users: UserActivity[], filename: string) => {
    // Create CSV content
    const headers = ['Email', 'Total Duration (minutes)', 'Questions Submitted', 'Last Activity']
    const rows = users.map(user => [
      user.user_email,
      user.total_duration,
      user.questions_submitted,
      new Date(user.last_activity).toLocaleString()
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <FilterSkeleton />
        <ResultsSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Time Range (days)</Label>
              <Select value={timeRange} onValueChange={(value) => {
                setTimeRange(value)
                handleFilterChange()
              }}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Minimum Duration (minutes)</Label>
              <Input
                type="number"
                value={minDuration}
                onChange={(e) => setMinDuration(e.target.value)}
                onKeyDown={handleKeyDown}
                min="0"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Minimum Questions</Label>
              <Input
                type="number"
                value={minQuestions}
                onChange={(e) => setMinQuestions(e.target.value)}
                onKeyDown={handleKeyDown}
                min="0"
                className="h-10"
              />
            </div>
          </div>
          
          <Button 
            className="mt-4"
            onClick={handleFilterChange}
          >
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users who meet criteria */}
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="hidden md:inline">Met Criteria</span>
                <span className="md:hidden">Met</span>
                ({filteredUsers.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(filteredUsers, 'met-criteria.csv')}
                className="flex items-center gap-2 shrink-0"
              >
                <Download className="h-4 w-4" />
                <span className="hidden md:inline">Export CSV</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <div key={user.user_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div 
                    className="truncate cursor-pointer hover:text-primary"
                    onClick={() => handleUserClick(user.user_email)}
                  >
                    {user.user_email}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {user.total_duration}m
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {user.questions_submitted}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Users who don't meet criteria */}
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="hidden md:inline">Did Not Meet Criteria</span>
                <span className="md:hidden">Not Met</span>
                ({nonFilteredUsers.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(nonFilteredUsers, 'not-met-criteria.csv')}
                className="flex items-center gap-2 shrink-0"
              >
                <Download className="h-4 w-4" />
                <span className="hidden md:inline">Export CSV</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nonFilteredUsers.map(user => (
                <div key={user.user_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div 
                    className="truncate cursor-pointer hover:text-primary"
                    onClick={() => handleUserClick(user.user_email)}
                  >
                    {user.user_email}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {user.total_duration}m
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {user.questions_submitted}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Session Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
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
          
          {userSessions.length > 0 && userSessions[currentSessionIndex] && (
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
                  
                  <div className="grid grid-cols-2 gap-6 border-t pt-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Pages Visited:</h4>
                      <div className="space-y-1">
                        {userSessions[currentSessionIndex].pages_visited?.map((path, i) => (
                          <div key={i} className="text-sm text-muted-foreground">
                            {formatPath(path)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Submitted Questions:</h4>
                      <div className="space-y-1">
                        {userSessions[currentSessionIndex].submitted_questions?.map((question, i) => (
                          <div key={i} className="text-sm text-muted-foreground flex justify-between">
                            <span className="truncate">{formatPath(question.path)}</span>
                            <span className="ml-2 font-medium">{question.count}</span>
                          </div>
                        ))}
                      </div>
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
    </div>
  )
} 
"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Users, Clock, FileText, CalendarIcon, Navigation, Activity, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface UserActivity {
  user_id: string
  user_email: string
  total_duration: number
  questions_submitted: number
  last_activity: string
  class_id?: string
  low_questions: number
  medium_questions: number
  high_questions: number
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
  selectedClass: string
  classMembers: Array<{ student_id: string; email: string }>
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
  console.log("UserActivityFilter received:", { selectedClass, classMembersLength: classMembers.length, classMembers })
  const [users, setUsers] = useState<UserActivity[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userSessions, setUserSessions] = useState<UserSession[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0)

  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7) // Default to 7 days ago
    return date
  })
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [minLowQuestions, setMinLowQuestions] = useState("2") // low difficulty questions
  const [minMediumQuestions, setMinMediumQuestions] = useState("2") // medium difficulty questions
  const [minHighQuestions, setMinHighQuestions] = useState("1") // high difficulty questions

  const setQuickDateRange = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    setStartDate(start)
    setEndDate(end)
  }

  const setWeekRange = (weekType: 'this' | 'last') => {
    const today = new Date()
    const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate days to subtract to get to Monday of current week
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1 // If Sunday, go back 6 days; otherwise go back to Monday
    
    const mondayOfCurrentWeek = new Date(today)
    mondayOfCurrentWeek.setDate(today.getDate() - daysToMonday)
    
    const sundayOfCurrentWeek = new Date(mondayOfCurrentWeek)
    sundayOfCurrentWeek.setDate(mondayOfCurrentWeek.getDate() + 6) // Sunday is 6 days after Monday
    
    if (weekType === 'this') {
      setStartDate(mondayOfCurrentWeek)
      setEndDate(sundayOfCurrentWeek)
    } else {
      // For last week, subtract 7 days from both dates
      const mondayOfLastWeek = new Date(mondayOfCurrentWeek)
      mondayOfLastWeek.setDate(mondayOfCurrentWeek.getDate() - 7)
      
      const sundayOfLastWeek = new Date(sundayOfCurrentWeek)
      sundayOfLastWeek.setDate(sundayOfCurrentWeek.getDate() - 7)
      
      setStartDate(mondayOfLastWeek)
      setEndDate(sundayOfLastWeek)
    }
  }

  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }

  // Helper function to get the date range for a specific number of days
  const getDateRangeForDays = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    return { start, end }
  }

  // Helper function to get the week range
  const getWeekRange = (weekType: 'this' | 'last') => {
    const today = new Date()
    const currentDay = today.getDay()
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1
    
    const mondayOfCurrentWeek = new Date(today)
    mondayOfCurrentWeek.setDate(today.getDate() - daysToMonday)
    
    const sundayOfCurrentWeek = new Date(mondayOfCurrentWeek)
    sundayOfCurrentWeek.setDate(mondayOfCurrentWeek.getDate() + 6)
    
    if (weekType === 'this') {
      return { start: mondayOfCurrentWeek, end: sundayOfCurrentWeek }
    } else {
      const mondayOfLastWeek = new Date(mondayOfCurrentWeek)
      mondayOfLastWeek.setDate(mondayOfCurrentWeek.getDate() - 7)
      
      const sundayOfLastWeek = new Date(sundayOfCurrentWeek)
      sundayOfLastWeek.setDate(sundayOfCurrentWeek.getDate() - 7)
      
      return { start: mondayOfLastWeek, end: sundayOfLastWeek }
    }
  }

  // Check if current date range matches a specific range
  const isDateRangeActive = (rangeType: 'days' | 'week', value: number | 'this' | 'last') => {
    if (rangeType === 'days') {
      const { start, end } = getDateRangeForDays(value as number)
      return isSameDay(startDate, start) && isSameDay(endDate, end)
    } else {
      const { start, end } = getWeekRange(value as 'this' | 'last')
      return isSameDay(startDate, start) && isSameDay(endDate, end)
    }
  }

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
    const slug = path.split("/").pop() || path
    // Remove hyphens and capitalize first letter
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const handleUserClick = async (email: string) => {
    setSelectedUser(email)
    setCurrentSessionIndex(0)

    const supabase = createClient()

    const { data: activity } = await supabase
      .from("user_activity")
      .select("*")
      .eq("user_email", email)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true })

    if (activity) {
      const sessions = new Map<string, UserSession>()

      activity.forEach((record) => {
        const date = new Date(record.created_at).toDateString()
        if (!sessions.has(date)) {
          sessions.set(date, {
            login_time: record.created_at,
            last_activity: record.created_at,
            duration_minutes: 0,
            questions_submitted: 0,
            pages_visited: [],
            events: [],
            submitted_questions: [],
          })
        }

        const session = sessions.get(date)!
        session.events.push(record)

        if (new Date(record.created_at) > new Date(session.last_activity)) {
          session.last_activity = record.created_at
        }

        if (new Date(record.created_at) < new Date(session.login_time)) {
          session.login_time = record.created_at
        }

        if (record.event === "submitted_question") {
          session.questions_submitted++
          const existingQuestion = session.submitted_questions.find((q) => q.path === record.path)
          if (existingQuestion) {
            existingQuestion.count++
          } else {
            session.submitted_questions.push({ path: record.path, count: 1 })
          }
        }

        if (!session.pages_visited.includes(record.path)) {
          session.pages_visited.push(record.path)
        }
      })

      const sessionsArray = Array.from(sessions.values()).map((session) => ({
        ...session,
        duration_minutes: Math.round(
          (new Date(session.last_activity).getTime() - new Date(session.login_time).getTime()) / (1000 * 60),
        ),
      }))

      sessionsArray.sort((a, b) => new Date(b.login_time).getTime() - new Date(a.login_time).getTime())

      setUserSessions(sessionsArray)
      setIsDialogOpen(true)
    }
  }

  const handlePreviousSession = () => {
    setCurrentSessionIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextSession = () => {
    setCurrentSessionIndex((prev) => Math.min(userSessions.length - 1, prev + 1))
  }

  const applyFilters = useCallback(
    (usersToFilter: UserActivity[]) => {
      return usersToFilter.filter((user) => {
        const lowQuestionsMatch = user.low_questions >= Number.parseInt(minLowQuestions)
        const mediumQuestionsMatch = user.medium_questions >= Number.parseInt(minMediumQuestions)
        const highQuestionsMatch = user.high_questions >= Number.parseInt(minHighQuestions)
        return lowQuestionsMatch && mediumQuestionsMatch && highQuestionsMatch
      })
    },
    [minLowQuestions, minMediumQuestions, minHighQuestions],
  )

  useEffect(() => {
    const fetchUserActivity = async () => {
      const supabase = createClient()

      const uniqueClassMembers = classMembers.filter(
        (member, index, self) => index === self.findIndex((m) => m.student_id === member.student_id),
      )

      const allStudents = uniqueClassMembers.map((member) => ({
        user_id: member.student_id,
        user_email: member.email,
        total_duration: 0,
        questions_submitted: 0,
        last_activity: "",
        class_id: selectedClass,
        low_questions: 0,
        medium_questions: 0,
        high_questions: 0,
      }))

      const userMap = new Map<string, UserActivity>()
      allStudents.forEach((student) => {
        userMap.set(student.user_id, student)
      })

      if (classMembers.length === 0) {
        setUsers([])
        setFilteredUsers([])
        setIsLoading(false)
        return
      }

      let activityQuery = supabase
        .from("user_activity")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())

      if (classMembers.length > 0) {
        const classMemberEmails = classMembers.map((member) => member.email)
        activityQuery = activityQuery.in("user_email", classMemberEmails)
      }

      const { data: activity } = await activityQuery

      if (activity) {
        const userIds = [...new Set(activity.map((record) => record.user_id))]

        const { data: studentAnswers } = await supabase
          .from("student_answers")
          .select(`
            student_id,
            questions (
              difficulty
            )
          `)
          .in("student_id", userIds)
          .gte("submitted_at", startDate.toISOString())
          .lte("submitted_at", endDate.toISOString())

        activity.forEach((record) => {
          const user = userMap.get(record.user_id)
          if (user) {
            if (!user.last_activity || new Date(record.created_at) > new Date(user.last_activity)) {
              user.last_activity = record.created_at
            }

            if (record.event === "submitted_question") {
              user.questions_submitted++
            }
          }
        })

        activity.forEach((record) => {
          const user = userMap.get(record.user_id)!

          if (new Date(record.created_at) > new Date(user.last_activity)) {
            user.last_activity = record.created_at
          }

          if (record.event === "submitted_question") {
            user.questions_submitted++
          }
        })

        const userActivityMap = new Map<string, typeof activity>()
        activity.forEach((record) => {
          if (!userActivityMap.has(record.user_id)) {
            userActivityMap.set(record.user_id, [])
          }
          userActivityMap.get(record.user_id)!.push(record)
        })

        userActivityMap.forEach((userActivity, userId) => {
          const user = userMap.get(userId)
          if (user) {
            const dailyActivities = new Map<string, typeof userActivity>()
            userActivity.forEach((record) => {
              const date = new Date(record.created_at).toDateString()
              if (!dailyActivities.has(date)) {
                dailyActivities.set(date, [])
              }
              dailyActivities.get(date)!.push(record)
            })

            let totalDuration = 0
            dailyActivities.forEach((dayActivity) => {
              if (dayActivity.length > 1) {
                dayActivity.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

                const firstActivity = dayActivity[0]
                const lastActivity = dayActivity[dayActivity.length - 1]
                const durationMinutes = Math.round(
                  (new Date(lastActivity.created_at).getTime() - new Date(firstActivity.created_at).getTime()) /
                  (1000 * 60),
                )
                totalDuration += durationMinutes
              }
            })

            user.total_duration = totalDuration
          }
        })

        if (studentAnswers) {
          const toArray = <T,>(x: T | T[] | null | undefined): T[] => (Array.isArray(x) ? x : x ? [x] : [])

          type Difficulty = "low" | "medium" | "high"
          const isDifficulty = (x: unknown): x is Difficulty => x === "low" || x === "medium" || x === "high"

          const perUserTotals = new Map<string, { low: number; medium: number; high: number }>()

          for (const ans of studentAnswers) {
            if (!perUserTotals.has(ans.student_id)) {
              perUserTotals.set(ans.student_id, { low: 0, medium: 0, high: 0 })
            }
            const totals = perUserTotals.get(ans.student_id)!

            const qs = toArray(ans.questions)

            for (const q of qs) {
              const d = typeof q?.difficulty === "string" ? q.difficulty.toLowerCase() : null
              if (isDifficulty(d)) totals[d] += 1
            }
          }

          for (const [userId, totals] of perUserTotals.entries()) {
            const user = userMap.get(userId)
            if (user) {
              user.low_questions = totals.low
              user.medium_questions = totals.medium
              user.high_questions = totals.high
            }
          }
        }

        const usersArray = Array.from(userMap.values())
        setUsers(usersArray)
        setFilteredUsers(applyFilters(usersArray))
      }

      setIsLoading(false)
    }

    fetchUserActivity()
  }, [startDate, endDate, applyFilters, selectedClass, classMembers])

  const handleFilterChange = () => {
    setFilteredUsers(applyFilters(users))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFilterChange()
    }
  }

  const exportToCSV = (users: UserActivity[], filename: string) => {
    const headers = [
      "Email",
      "Total Duration (minutes)",
      "Low Questions",
      "Medium Questions",
      "High Questions",
      "Questions Submitted",
      "Last Activity",
    ]
    const rows = users.map((user) => [
      user.user_email,
      user.total_duration,
      user.low_questions,
      user.medium_questions,
      user.high_questions,
      user.questions_submitted,
      new Date(user.last_activity).toLocaleString(),
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
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
          <div className="mt-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="space-y-2 flex-1">
                <Label>Weekly Ranges</Label>
                <div className="flex gap-2">
                  <Button 
                    variant={isDateRangeActive('week', 'last') ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setWeekRange('last')}
                  >
                    Last Week (Mon-Sun)
                  </Button>
                  <Button 
                    variant={isDateRangeActive('week', 'this') ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setWeekRange('this')}
                  >
                    This Week (Mon-Sun)
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 flex-1">
                <Label>Quick Date Ranges</Label>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={isDateRangeActive('days', 7) ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setQuickDateRange(7)}
                  >
                    Last 7 days
                  </Button>
                  <Button 
                    variant={isDateRangeActive('days', 14) ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setQuickDateRange(14)}
                  >
                    Last 14 days
                  </Button>
                  <Button 
                    variant={isDateRangeActive('days', 30) ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setQuickDateRange(30)}
                  >
                    Last 30 days
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">


              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Minimum Low Questions</Label>
              <Input
                type="number"
                value={minLowQuestions}
                onChange={(e) => setMinLowQuestions(e.target.value)}
                onKeyDown={handleKeyDown}
                min="0"
                className="h-10"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Minimum Medium Questions</Label>
              <Input
                type="number"
                value={minMediumQuestions}
                onChange={(e) => setMinMediumQuestions(e.target.value)}
                onKeyDown={handleKeyDown}
                min="0"
                className="h-10"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Minimum High Questions</Label>
              <Input
                type="number"
                value={minHighQuestions}
                onChange={(e) => setMinHighQuestions(e.target.value)}
                onKeyDown={handleKeyDown}
                min="0"
                className="h-10"
                placeholder="0"
              />
            </div>
          </div>



          <Button className="mt-4" onClick={handleFilterChange}>
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
                <span className="md:hidden">Met</span>({filteredUsers.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(filteredUsers, "met-criteria.csv")}
                className="flex items-center gap-2 shrink-0"
              >
                <Download className="h-4 w-4" />
                <span className="hidden md:inline">Export CSV</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredUsers.map((user) => (
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
                      <span className="text-green-600">{user.low_questions}L</span>
                      <span className="text-amber-600">{user.medium_questions}M</span>
                      <span className="text-red-600">{user.high_questions}H</span>
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
                <span className="md:hidden">Not Met</span>(
                {users.filter((user) => !filteredUsers.some((filtered) => filtered.user_id === user.user_id)).length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportToCSV(
                    users.filter((user) => !filteredUsers.some((filtered) => filtered.user_id === user.user_id)),
                    "not-met-criteria.csv",
                  )
                }
                className="flex items-center gap-2 shrink-0"
              >
                <Download className="h-4 w-4" />
                <span className="hidden md:inline">Export CSV</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users
                .filter((user) => !filteredUsers.some((filtered) => filtered.user_id === user.user_id))
                .map((user) => (
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
                        <span className="text-green-600">{user.low_questions}L</span>
                        <span className="text-amber-600">{user.medium_questions}M</span>
                        <span className="text-red-600">{user.high_questions}H</span>
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
                        <span className="text-sm">
                          Duration: {formatDuration(userSessions[currentSessionIndex].duration_minutes)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Questions: {userSessions[currentSessionIndex].questions_submitted}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Pages visited: {userSessions[currentSessionIndex].pages_visited.length}
                        </span>
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
                <Button variant="outline" onClick={handlePreviousSession} disabled={currentSessionIndex === 0}>
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

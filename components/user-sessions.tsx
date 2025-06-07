import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { Clock, Users, FileText } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface UserSession {
  id: string
  user_id: string
  user_email: string
  login_time: string
  last_activity: string
  duration_minutes: number
  questions_submitted: number
}

interface UserSessionsProps {
  onUserClick: (email: string) => void
  sessions: UserSession[]
}

function SessionsSkeleton() {
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

          {/* Sessions List */}
          <div className="border-t pt-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                <div>User</div>
                <div>Login Time</div>
                <div>Duration</div>
                <div>Questions</div>
              </div>
              {/* Sessions */}
              {[...Array(10)].map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 text-sm py-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function UserSessions({ onUserClick, sessions }: UserSessionsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [totalActiveTime, setTotalActiveTime] = useState(0)
  const [uniqueUsers, setUniqueUsers] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)

  useEffect(() => {
    // Calculate total active time
    const totalTime = sessions.reduce((sum, session) => sum + session.duration_minutes, 0)
    setTotalActiveTime(totalTime)
    
    // Calculate total questions submitted
    const totalQuestionsSubmitted = sessions.reduce((sum, session) => sum + session.questions_submitted, 0)
    setTotalQuestions(totalQuestionsSubmitted)
    
    // Calculate unique users
    const uniqueUserIds = new Set(sessions.map(s => s.user_id))
    setUniqueUsers(uniqueUserIds.size)

    setIsLoading(false)
  }, [sessions])

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  if (isLoading) {
    return <SessionsSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          User Sessions
        </CardTitle>
        <CardDescription>Overview of user login sessions and activity</CardDescription>
      </CardHeader>
      <CardContent>
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
                    <div className="text-2xl font-bold">{formatDuration(totalActiveTime)}</div>
                    <p className="text-sm text-muted-foreground">Total Active Time</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{totalQuestions}</div>
                    <p className="text-sm text-muted-foreground">Questions Submitted</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sessions List */}
          <div className="border-t pt-6">
            <h3 className="font-medium mb-4">Recent Sessions</h3>
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                <div>User</div>
                <div>Login Time</div>
                <div>Duration</div>
                <div>Questions</div>
              </div>
              {/* Sessions */}
              {sessions.slice(0, 10).map((session) => (
                <div key={session.id} className="grid grid-cols-4 gap-4 text-sm py-2">
                  <div 
                    className="truncate cursor-pointer hover:text-primary"
                    onClick={() => onUserClick(session.user_email)}
                  >
                    {session.user_email}
                  </div>
                  <div>{new Date(session.login_time).toLocaleString()}</div>
                  <div>{formatDuration(session.duration_minutes)}</div>
                  <div>{session.questions_submitted}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
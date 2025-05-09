import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { Clock, Users, FileText } from "lucide-react"

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
}

export function UserSessions({ onUserClick }: UserSessionsProps) {
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalActiveTime, setTotalActiveTime] = useState(0)
  const [uniqueUsers, setUniqueUsers] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)

  useEffect(() => {
    const fetchSessions = async () => {
      const supabase = createClient()
      
      // Fetch all user activity
      const { data: activity } = await supabase
        .from("user_activity")
        .select("*")
        .order('created_at', { ascending: false })

      if (activity) {
        // Group activities by user and session
        const userSessions = new Map<string, UserSession>()
        
        activity.forEach(record => {
          const key = `${record.user_id}_${new Date(record.created_at).toDateString()}`
          
          if (!userSessions.has(key)) {
            userSessions.set(key, {
              id: key,
              user_id: record.user_id,
              user_email: record.user_email || 'Unknown',
              login_time: record.created_at,
              last_activity: record.created_at,
              duration_minutes: 0,
              questions_submitted: record.event === 'submitted_question' ? 1 : 0
            })
          } else {
            const session = userSessions.get(key)!
            // Update last activity time
            if (new Date(record.created_at) > new Date(session.last_activity)) {
              session.last_activity = record.created_at
            }
            // Update login time if this is earlier
            if (new Date(record.created_at) < new Date(session.login_time)) {
              session.login_time = record.created_at
            }
            // Increment questions submitted if this is a question submission
            if (record.event === 'submitted_question') {
              session.questions_submitted++
            }
          }
        })

        // Calculate duration for each session
        const sessionsArray = Array.from(userSessions.values()).map(session => {
          const duration = Math.round(
            (new Date(session.last_activity).getTime() - new Date(session.login_time).getTime()) / (1000 * 60)
          )
          return {
            ...session,
            duration_minutes: duration
          }
        })

        // Sort by most recent
        sessionsArray.sort((a, b) => 
          new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
        )

        setSessions(sessionsArray)
        
        // Calculate total active time
        const totalTime = sessionsArray.reduce((sum, session) => sum + session.duration_minutes, 0)
        setTotalActiveTime(totalTime)
        
        // Calculate total questions submitted
        const totalQuestionsSubmitted = sessionsArray.reduce((sum, session) => sum + session.questions_submitted, 0)
        setTotalQuestions(totalQuestionsSubmitted)
        
        // Calculate unique users
        const uniqueUserIds = new Set(sessionsArray.map(s => s.user_id))
        setUniqueUsers(uniqueUserIds.size)
      }

      setIsLoading(false)
    }

    fetchSessions()
  }, [])

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading session data...</div>
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
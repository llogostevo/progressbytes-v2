import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Clock, FileText } from "lucide-react"

interface UserActivity {
  user_id: string
  user_email: string
  total_duration: number
  questions_submitted: number
  last_activity: string
}

export function UserActivityFilter() {
  const [users, setUsers] = useState<UserActivity[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserActivity[]>([])
  const [nonFilteredUsers, setNonFilteredUsers] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filter states
  const [timeRange, setTimeRange] = useState("7") // days
  const [minDuration, setMinDuration] = useState("30") // minutes
  const [minQuestions, setMinQuestions] = useState("5") // questions
  const [emailFilter, setEmailFilter] = useState("@centralfoundationboys.co.uk")

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
              last_activity: record.created_at
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

        // Calculate session durations
        const usersArray = Array.from(userMap.values()).map(user => {
          // Get all activities for this user
          const userActivities = activity.filter(a => a.user_id === user.user_id)
          
          // Sort activities by time
          userActivities.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
          
          // Calculate total duration
          let totalDuration = 0
          for (let i = 0; i < userActivities.length - 1; i++) {
            const currentTime = new Date(userActivities[i].created_at).getTime()
            const nextTime = new Date(userActivities[i + 1].created_at).getTime()
            const timeDiff = nextTime - currentTime
            
            // Only count if activities are within 30 minutes of each other
            if (timeDiff <= 30 * 60 * 1000) {
              totalDuration += timeDiff
            }
          }
          
          return {
            ...user,
            total_duration: Math.round(totalDuration / (1000 * 60)) // Convert to minutes
          }
        })

        setUsers(usersArray)
        applyFilters(usersArray)
      }

      setIsLoading(false)
    }

    fetchUserActivity()
  }, [timeRange])

  const applyFilters = (usersToFilter: UserActivity[]) => {
    const minDurationNum = parseInt(minDuration)
    const minQuestionsNum = parseInt(minQuestions)

    // First filter by email domain
    const emailFiltered = usersToFilter.filter(user => 
      user.user_email.toLowerCase().includes(emailFilter.toLowerCase())
    )

    // Then apply other filters
    const filtered = emailFiltered.filter(user => 
      user.total_duration >= minDurationNum && 
      user.questions_submitted >= minQuestionsNum
    )

    const nonFiltered = emailFiltered.filter(user => 
      user.total_duration < minDurationNum || 
      user.questions_submitted < minQuestionsNum
    )

    setFilteredUsers(filtered)
    setNonFilteredUsers(nonFiltered)
  }

  const handleFilterChange = () => {
    applyFilters(users)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFilterChange()
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading user activity data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Email Domain</Label>
              <Input
                type="text"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="@centralfoundationboys.co.uk"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Time Range (days)</Label>
              <Select value={timeRange} onValueChange={(value) => {
                setTimeRange(value)
                handleFilterChange()
              }}>
                <SelectTrigger>
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
      <div className="grid grid-cols-2 gap-6">
        {/* Users who meet criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Met Criteria ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <div key={user.user_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="truncate">{user.user_email}</div>
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
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Did Not Meet Criteria ({nonFilteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nonFilteredUsers.map(user => (
                <div key={user.user_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="truncate">{user.user_email}</div>
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
    </div>
  )
} 
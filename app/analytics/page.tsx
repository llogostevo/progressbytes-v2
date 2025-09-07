"use client"

// access control
// import { useUser } from "@/hooks/useUser"
import { useAccess } from "@/hooks/useAccess"
import { isAdmin, isTeacher } from '@/lib/access';
// import { canAccessAnalytics } from "@/lib/access"

// react
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Calendar, Filter } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserActivityFilter } from "@/components/user-activity-filter"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
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
import Link from "next/link"
import { Class } from "@/lib/types"


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


interface StudentClassMember {
  class: {
    id: string
    name: string
    teacher_id: string
    created_at: string
    teacher: {
      email: string
      full_name: string
    }[] | null
  }[]
}

type UserRole = 'regular' | 'admin'

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
    <div className="mb-6">
      {/* Search input skeleton */}
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 flex-1" />
      </div>

      {/* Student list skeleton */}
      <div className="max-h-72 overflow-y-auto border rounded-md divide-y divide-gray-100 bg-white">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2">
            <Skeleton className="w-7 h-7 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
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

// MAIN PAGE
export default function AnalyticsPage() {
  // access control
  // const { user: accessUser, userType } = useUser()
  const { canAccessAnalytics: userCanAccessAnalytics } = useAccess()


  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null)
  const [currentUserType, setCurrentUserType] = useState<string | null>(null)
  const [isLoadingHomework, setIsLoadingHomework] = useState(true)
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false)
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)
  const [topics, setTopics] = useState<Array<{ id: string; name: string; slug: string; topicnumber: string }>>([])
  const [students, setStudents] = useState<Array<{ userid: string; email: string; forename: string; lastname: string }>>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [studentAnswers, setStudentAnswers] = useState<ProcessedStudentAnswer[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [classMembers, setClassMembers] = useState<Array<{ student_id: string; email: string; forename: string; lastname: string }>>([])
  const [allClassMembers, setAllClassMembers] = useState<Array<{ student_id: string; email: string; forename: string; lastname: string }>>([])
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "all">("all")
  const [studentSearch, setStudentSearch] = useState("");
  const [sortBy, setSortBy] = useState<"forename" | "lastname" | "email">("forename");

  const supabase = createClient()

  const fetchStudentAnswers = useCallback(async () => {
    if (!selectedStudent) {
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

      if (studentAnswersError) {
        return
      }

      if (!studentAnswers) {
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
    } catch (error) {
      console.error('Error fetching student answers:', error)
    } finally {
      setIsLoadingPerformance(false)
    }
  }, [selectedStudent, supabase]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentAnswers()
    }
  }, [selectedStudent, fetchStudentAnswers])

  // Fetch students for teachers after classes are loaded
  useEffect(() => {
    const fetchTeacherStudents = async () => {
      if (!isTeacher(currentUserType) || classes.length === 0) {
        return
      }

      setIsLoadingStudents(true)
      try {

        const { data: classMembersData, error: classMembersError } = await supabase
          .from("class_members")
          .select(`
            student_id,
            student:profiles!class_members_student_id_fkey (
              userid,
              email,
              forename,
              lastname
            )
          `)
          .in('class_id', classes.map(c => c.id))

        if (classMembersError) {
          console.error('Error fetching class members:', classMembersError)
        } else {

          // Remove duplicates and map to students array
          const uniqueStudents = (classMembersData || []).reduce((acc: Array<{ userid: string; email: string; forename: string; lastname: string }>, member) => {
            // Handle the case where student might be an array or object
            const studentData = Array.isArray(member.student) ? member.student[0] : member.student;
            if (studentData && !acc.find(s => s.userid === studentData.userid)) {
              acc.push(studentData)
            }
            return acc
          }, [] as Array<{ userid: string; email: string; forename: string; lastname: string }>)
          
          setStudents(uniqueStudents)
          
          // Also populate allClassMembers for the homework tab
          const allMembers = (classMembersData || []).map(member => {
            // Handle the case where student might be an array or object
            const studentData = Array.isArray(member.student) ? member.student[0] : member.student;
            const { forename = '', lastname = '', email = '' } = studentData || {};
            return {
              student_id: member.student_id,
              email,
              forename,
              lastname
            }
          })
          setAllClassMembers(allMembers)
          console.log('allClassMembers set:', allMembers.length, 'members')
          
          if (uniqueStudents.length > 0 && !selectedStudent) {
            setSelectedStudent(uniqueStudents[0].userid)
          }
        }
      } catch (error) {
        console.error('Error fetching teacher students:', error)
      } finally {
        setIsLoadingStudents(false)
        setIsLoadingHomework(false)
      }
    }

    fetchTeacherStudents()
  }, [classes, currentUserType, selectedStudent, supabase])

  // Debug useEffect for homework tab
  useEffect(() => {
    console.log('Debug - selectedClass:', selectedClass)
    console.log('Debug - allClassMembers:', allClassMembers.length, allClassMembers)
    console.log('Debug - classMembers:', classMembers.length, classMembers)
  }, [selectedClass, allClassMembers, classMembers])

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
        setCurrentUserRole(profile?.role || 'regular')
        setCurrentUserType(profile?.user_type || null)
      }

      // Fetch classes based on user role
      if (isTeacher(profile?.user_type)) {
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
      } else if (profile?.user_type === 'basic' || profile?.user_type === 'revision' || profile?.user_type === 'revisionAI') {
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

        if (studentClassesError) {
          console.error('Error fetching student classes:', studentClassesError)
        } else {
          const mappedClasses = (studentClasses || []).map((m: StudentClassMember) => ({
            id: m.class[0].id,
            name: m.class[0].name,
            teacher_id: m.class[0].teacher_id,
            created_at: m.class[0].created_at,
            teacher: m.class[0].teacher?.[0] || undefined
          }))
          setClasses(mappedClasses)
        }
        setIsLoadingClasses(false)
      } else {
        setIsLoadingClasses(false)
      }

      // Fetch students if user is admin or teacher
      if (isAdmin( profile?.role) || isTeacher(profile?.user_type)) {
        if (isTeacher(profile?.user_type)) {
          // For teachers, we'll fetch students after classes are loaded
          // This will be handled in a separate useEffect
        } else {
          // For admins, fetch all users
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
        setIsLoadingStudents(false)
      } else {
        setIsLoadingStudents(false)
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

      // Only set homework loading to false if user is not a teacher
      // For teachers, we'll set it to false after students are loaded
      if (!isTeacher(profile?.user_type)) {
        setIsLoadingHomework(false)
      }
    }

    fetchUser()
  }, [supabase])

  useEffect(() => {
    const fetchClassMembers = async () => {
      if (selectedClass === "all") {
        // For "All Classes", we don't need to fetch class members separately
        // since we already have all students from the teacher's classes in the students array
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

  const filteredStudents: StudentListItem[] = studentsInClass
    .filter(student =>
      student.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (student.forename && student.forename.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (student.lastname && student.lastname.toLowerCase().includes(studentSearch.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      return aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
    });

  if (!currentUserRole || (!isAdmin(currentUserRole) && !isTeacher(currentUserType))) {
        
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

  if (!userCanAccessAnalytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Access Restricted</CardTitle>
              <CardDescription>
                You need a paid plan to access analytics and student progress tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/settings">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Upgrade Plan
                </Button>
              </Link>
            </CardContent>
          </Card>
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

        <Tabs defaultValue="homework" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="w-full md:w-auto justify-start md:justify-center">
              <TabsTrigger value="homework">Homework</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="homework">
            {isLoadingHomework ? (
              <HomeworkSkeleton />
            ) : (
              <UserActivityFilter 
                selectedClass={selectedClass} 
                classMembers={selectedClass === "all" ? allClassMembers : classMembers} 
              />
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
                {isLoadingStudents ? (
                  <StudentSelectorSkeleton />
                ) : studentsInClass.length === 0 ? (
                  <div className="text-center text-muted-foreground my-8">
                    <p>No students available to select.</p>
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon" className="h-10 w-10">
                            <Filter className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48" align="end">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">Sort by</h4>
                            <div className="space-y-1">
                              <button
                                className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${sortBy === 'forename' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                                  }`}
                                onClick={() => setSortBy('forename')}
                              >
                                Forename
                              </button>
                              <button
                                className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${sortBy === 'lastname' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                                  }`}
                                onClick={() => setSortBy('lastname')}
                              >
                                Surname
                              </button>
                              <button
                                className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${sortBy === 'email' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                                  }`}
                                onClick={() => setSortBy('email')}
                              >
                                Email
                              </button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="max-h-72 overflow-y-auto border rounded-md divide-y divide-gray-100 bg-white">
                      {filteredStudents.length === 0 ? (
                        <div className="py-4 text-center text-muted-foreground">No students found.</div>
                      ) : (
                        filteredStudents.map(student => {
                          const initials = student?.forename?.[0] && student?.lastname?.[0]
                            ? `${student.forename[0]}${student.lastname[0]}`.toUpperCase()
                            : (student.email?.[0]?.toUpperCase() || '?');
                          const fullName = student?.forename && student?.lastname
                            ? `${student.forename} ${student.lastname}`
                            : student?.forename || student?.lastname || '';
                          return (
                            <button
                              key={student.id}
                              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors focus:outline-none cursor-pointer ${selectedStudent === student.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'hover:bg-gray-50'}`}
                              onClick={() => setSelectedStudent(student.id)}
                            >
                              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-base">
                                {initials}
                              </span>
                              <div className="flex-1 min-w-0">
                                {fullName && (
                                  <div className="font-medium text-sm truncate">{fullName}</div>
                                )}
                                <div className="text-xs text-muted-foreground truncate">{student.email}</div>
                              </div>
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
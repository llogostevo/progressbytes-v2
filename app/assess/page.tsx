"use client"

import type React from "react"

import { useEffect, useState, useCallback, useRef, useMemo, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/app/providers/AuthProvider"
import { isTeacherPlan, UserType, User } from "@/lib/access"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User as UserIcon, AlertCircle, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { GreenButton } from "@/components/question-components/self-assessment/green-button"
import { AmberButton } from "@/components/question-components/self-assessment/amber-button"
import { RedButton } from "@/components/question-components/self-assessment/red-button"
import { TopicFilter } from "@/components/topic-filter"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Filter } from "lucide-react"
import type { ScoreType, Class } from "@/lib/types"
import { toast } from "sonner"

// Types for the grading interface
interface DBTopic {
  id: string
  name: string
  description: string
  icon?: string
  slug: string
  unit: number
  disabled?: boolean
  topicnumber?: string
}

interface StudentAnswerForGrading {
  id: string
  student_id: string
  question_id: string
  response_text: string
  student_score: string | null
  ai_score: string | null
  teacher_score: string | null
  ai_feedback: string | null
  teacher_feedback: string | null
  submitted_at: string
  teacher_id: string | null
  questions: {
    id: string
    type: string
    difficulty: string
    question_text: string
    explanation: string | null
    created_at: string
    topic_id?: string
    topic?: {
      id: string
      name: string
      slug: string
      topicnumber?: string
    }
    multiple_choice_questions?: {
      options: string[]
      correct_answer_index: number
      model_answer: string | null
    } | null
    fill_in_the_blank_questions?: {
      options: string[]
      correct_answers: string[]
      order_important: boolean
      model_answer: string | null
    } | null
    matching_questions?:
      | {
          statement: string
          match: string
          model_answer: string | null
        }[]
      | null
    true_false_questions?: {
      correct_answer: boolean
      model_answer: string | null
    } | null
    short_answer_questions?: {
      model_answer: string
    } | null
    essay_questions?: {
      model_answer: string
      rubric: string | null
    } | null
    code_questions?: {
      language: string
      model_answer: string
      model_answer_code: string
    } | null
  }
  students:
    | {
        email: string
        forename: string
        lastname: string
      }
    | {
        email: string
        forename: string
        lastname: string
      }[]
}

function AssessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userType, isLoggedIn } = useAuth()
  const supabase = createClient()

  const [answersToGrade, setAnswersToGrade] = useState<StudentAnswerForGrading[]>([])
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isGrading, setIsGrading] = useState(false)
  const [selectedScore, setSelectedScore] = useState<ScoreType | null>(null)
  const [teacherFeedback, setTeacherFeedback] = useState("")
  const [topics, setTopics] = useState<DBTopic[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const [students, setStudents] = useState<Array<{ userid: string; email: string; forename: string; lastname: string }>>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [studentSearch, setStudentSearch] = useState("")
  const [sortBy, setSortBy] = useState<"forename" | "lastname" | "email">("forename")
  const [isLoadingStudents, setIsLoadingStudents] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [answerToDelete, setAnswerToDelete] = useState<StudentAnswerForGrading | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const selectedTopics = useMemo(() => searchParams.get("topics")?.split(",") || [], [searchParams])

  // Memoize filtered students
  const filteredStudents = useMemo(() => {
    return students
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
  }, [students, studentSearch, sortBy])

  // Memoize filtered answers by topic, class, and student
  const filteredAnswersToGrade = useMemo(() => {
    let filtered = answersToGrade

    // Filter by topic if topics are selected
    if (selectedTopics.length > 0) {
      filtered = filtered.filter((answer) => {
        const question = answer.questions
        return question.topic && selectedTopics.includes(question.topic.slug)
      })
    }

    // Filter by class if a specific class is selected
    if (selectedClass !== "all") {
      filtered = filtered.filter(() => {
        // Check if the student belongs to the selected class
        // This will be handled in the fetchAnswersToGrade function
        return true // For now, we'll filter in the fetch function
      })
    }

    // Filter by selected student if one is selected
    if (selectedStudent) {
      filtered = filtered.filter((answer) => {
        return answer.student_id === selectedStudent
      })
    }

    return filtered
  }, [answersToGrade, selectedTopics, selectedClass, selectedStudent])

  const [isMobile, setIsMobile] = useState(false)
  const [showMobileGrading, setShowMobileGrading] = useState(false)
  const [swipeColor, setSwipeColor] = useState<string | null>(null)
  const [cardTransform, setCardTransform] = useState({ x: 0, y: 0, rotation: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const studentAnswerCardRef = useRef<HTMLDivElement>(null)
  const gradingSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    setIsDragging(true)
    setSwipeColor(null)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !touchStartRef.current || !isDragging) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    // Update card transform for visual feedback
    const rotation = deltaX * 0.1 // Slight rotation based on horizontal movement
    setCardTransform({ x: deltaX, y: deltaY, rotation })

    // Determine swipe direction and color
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > 30) {
        const direction = deltaX > 0 ? "right" : "left"
        setSwipeColor(direction === "right" ? "amber" : "red")
      }
    } else {
      if (Math.abs(deltaY) > 30) {
        const direction = deltaY > 0 ? "down" : "up"
        setSwipeColor(direction === "up" ? "green" : "blue")
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || !touchStartRef.current || !isDragging) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    const minSwipeDistance = 120

    // Check if swipe is significant enough
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        // Animate card off screen
        const exitDirection = deltaX > 0 ? 1 : -1
        setCardTransform({ 
          x: exitDirection * window.innerWidth, 
          y: deltaY, 
          rotation: exitDirection * 30 
        })
        
        if (deltaX > 0) {
          // Swipe right - amber
          setSelectedScore("amber")
          setSwipeColor("amber")
          setTimeout(() => {
            handleGradeAnswer("amber")
            resetCard()
          }, 300)
        } else {
          // Swipe left - red
          setSelectedScore("red")
          setSwipeColor("red")
          setTimeout(() => {
            handleGradeAnswer("red")
            resetCard()
          }, 300)
        }
      } else {
        // Reset card position
        resetCard()
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY < 0) {
          // Swipe up - green
          setSelectedScore("green")
          setSwipeColor("green")
          setCardTransform({ x: 0, y: -window.innerHeight, rotation: 0 })
          setTimeout(() => {
            handleGradeAnswer("green")
            resetCard()
          }, 300)
        } else {
          // Swipe down - show manual grading interface
          setSwipeColor("blue")
          setShowMobileGrading(true)
          resetCard()
          setTimeout(() => {
            if (gradingSectionRef.current) {
              gradingSectionRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              })
            }
            setSwipeColor(null)
          }, 200)
        }
      } else {
        // Reset card position
        resetCard()
      }
    }

    touchStartRef.current = null
    setIsDragging(false)
  }

  const resetCard = () => {
    setCardTransform({ x: 0, y: 0, rotation: 0 })
    setSwipeColor(null)
  }

  const handleDeleteClick = (answer: StudentAnswerForGrading) => {
    setAnswerToDelete(answer)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!answerToDelete || deleteConfirmation !== "delete") return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from("student_answers")
        .delete()
        .eq("id", answerToDelete.id)

      if (error) throw error

      // Update local state
      setAnswersToGrade((prev) => prev.filter((a) => a.id !== answerToDelete.id))
      
      // Adjust current index if needed
      const newFilteredAnswers = answersToGrade.filter((answer) => {
        const question = answer.questions
        return selectedTopics.length === 0 || (question.topic && selectedTopics.includes(question.topic.slug))
      }).filter((answer) => answer.id !== answerToDelete.id)
      
      if (currentAnswerIndex >= newFilteredAnswers.length && newFilteredAnswers.length > 0) {
        setCurrentAnswerIndex(newFilteredAnswers.length - 1)
      } else if (newFilteredAnswers.length === 0) {
        setCurrentAnswerIndex(0)
      }

      setDeleteDialogOpen(false)
      setAnswerToDelete(null)
      setDeleteConfirmation("")
      toast.success("Student attempt deleted successfully")
    } catch (error) {
      console.error("Error deleting answer:", error)
      toast.error("Failed to delete student attempt")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTopicChange = (topics: string[]) => {
    const params = new URLSearchParams(searchParams.toString())
    if (topics.length === 0) {
      params.delete("topics")
    } else {
      params.set("topics", topics.join(","))
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const clearAllFilters = () => {
    setSelectedClass("all")
    setSelectedStudent(null)
    setStudentSearch("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("topics")
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Fetch classes for the teacher
  const fetchClasses = useCallback(async () => {
    if (!userType || !isTeacherPlan({ user_type: userType as UserType } as User)) return

    setIsLoadingClasses(true)
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

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
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setIsLoadingClasses(false)
    }
  }, [userType, supabase])

  // Fetch answers that need grading
  const fetchAnswersToGrade = useCallback(async () => {
    if (!userType || !isTeacherPlan({ user_type: userType as UserType } as User)) return

    setIsLoading(true)
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Determine which classes to fetch from
      let classIds: string[]
      if (selectedClass === "all") {
        // Get all teacher's classes
        const { data: classes } = await supabase.from("classes").select("id").eq("teacher_id", user.id)
        if (!classes || classes.length === 0) {
          setAnswersToGrade([])
          return
        }
        classIds = classes.map((c) => c.id)
      } else {
        // Use the selected class
        classIds = [selectedClass]
      }

      // Get students in these classes
      const { data: classMembers } = await supabase
        .from("class_members")
        .select(`
          student_id,
          profiles!inner (
            email,
            forename,
            lastname
          )
        `)
        .in("class_id", classIds)

      if (!classMembers || classMembers.length === 0) {
        setAnswersToGrade([])
        setStudents([])
        setIsLoadingStudents(false)
        return
      }

      const studentIds = classMembers.map((m) => m.student_id)

      // Set students for the student selector
      const uniqueStudents = (classMembers || []).reduce((acc: Array<{ userid: string; email: string; forename: string; lastname: string }>, member) => {
        const studentData = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
        if (studentData && !acc.find(s => s.userid === member.student_id)) {
          acc.push({
            userid: member.student_id,
            email: studentData.email,
            forename: studentData.forename,
            lastname: studentData.lastname
          })
        }
        return acc
      }, [])
      setStudents(uniqueStudents)
      setIsLoadingStudents(false)

      const { data: answers, error } = await supabase
        .from("student_answers")
        .select(`
    id,
    student_id,
    question_id,
    response_text,
    student_score,
    ai_score,
    teacher_score,
    ai_feedback,
    teacher_feedback,
    submitted_at,
    teacher_id,
    questions!inner (
      id,
      type,
      difficulty,
      question_text,
      explanation,
      created_at,
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
      ),
      multiple_choice_questions (
        options,
        correct_answer_index,
        model_answer
      ),
      fill_in_the_blank_questions (
        options,
        correct_answers,
        order_important,
        model_answer
      ),
      matching_questions (
        statement,
        match,
        model_answer
      ),
      true_false_questions (
        correct_answer,
        model_answer
      ),
      short_answer_questions (
        model_answer
      ),
      essay_questions (
        model_answer,
        rubric
      ),
      code_questions (
        language,
        model_answer,
        model_answer_code
      )
    )
  `)
        .in("student_id", studentIds)
        .is("teacher_id", null)
        .is("teacher_feedback", null)
        .in("questions.type", ["short-answer", "essay", "code", "text"])
        .order("submitted_at", { ascending: false })

      if (error) {
        console.error("Error fetching answers:", error)
        toast.error("Failed to load answers for grading")
        return
      }

      // Map the data to include student information
      console.log("Raw answers:", answers)
      console.log("Class members:", classMembers)
      console.log(
        "Student IDs from answers:",
        answers?.map((a) => a.student_id),
      )
      console.log(
        "Student IDs from class members:",
        classMembers?.map((m) => m.student_id),
      )

      const answersWithStudents: StudentAnswerForGrading[] = (answers || [])
        .map((answer) => {
          console.log(`Processing answer for student_id: ${answer.student_id}`)
          const classMember = classMembers.find((m) => m.student_id === answer.student_id)
          console.log("Found class member:", classMember)

          if (!classMember) {
            console.log(`No class member found for student_id: ${answer.student_id}`)
            return null
          }

          const studentData = classMember.profiles
          console.log("Student data from profiles:", studentData)

          if (!studentData) {
            console.log(`No profile data found for student_id: ${answer.student_id}`)
            return null
          }

          // Extract topic information from the question
          const question = answer.questions as any // eslint-disable-line @typescript-eslint/no-explicit-any
          const subtopicLink = question?.subtopic_question_link?.[0]
          const subtopic = subtopicLink?.subtopics
          const topic = subtopic?.topics

          return {
            ...answer,
            questions: {
              ...question,
              topic_id: subtopic?.topic_id || '',
              topic: topic
                ? { id: topic.id, name: topic.name, slug: topic.slug, topicnumber: topic.topicnumber }
                : undefined,
            } as StudentAnswerForGrading["questions"],
            students: studentData,
          }
        })
        .filter((answer): answer is NonNullable<typeof answer> => answer !== null)

      console.log("Final mapped answers:", answersWithStudents)

      // Fetch topics for the filter
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("*")
        .order("topicnumber")

      if (topicsError) {
        console.error("Error fetching topics:", topicsError)
      } else {
        setTopics(topicsData || [])
      }

      setAnswersToGrade(answersWithStudents)
    } catch (error) {
      console.error("Error fetching answers:", error)
      toast.error("Failed to load answers for grading")
    } finally {
      setIsLoading(false)
    }
  }, [userType, supabase, selectedClass, selectedStudent])

  useEffect(() => {
    // Redirect students to home page
    if (isLoggedIn && userType !== null && !isTeacherPlan({ user_type: userType as UserType } as User)) {
      router.push("/")
    } else if (isLoggedIn && isTeacherPlan({ user_type: userType as UserType } as User)) {
      fetchClasses()
    }
  }, [isLoggedIn, userType, router, fetchClasses])

  useEffect(() => {
    // Fetch answers when classes are loaded and class selection changes
    if (isLoggedIn && isTeacherPlan({ user_type: userType as UserType } as User) && !isLoadingClasses) {
      fetchAnswersToGrade()
    }
  }, [isLoggedIn, userType, fetchAnswersToGrade, isLoadingClasses])

  // Handle grading submission
  const handleGradeAnswer = async (score: ScoreType) => {
    if (!filteredAnswersToGrade[currentAnswerIndex]) return

    setIsGrading(true)
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("User not found")
        return
      }

      const currentAnswer = filteredAnswersToGrade[currentAnswerIndex]

      const { error } = await supabase
        .from("student_answers")
        .update({
          teacher_score: score,
          student_score: score, // Update student_score to match teacher's assessment
          teacher_id: user.id,
          teacher_feedback: teacherFeedback.trim() || null,
        })
        .eq("id", currentAnswer.id)

      if (error) {
        console.error("Error updating grade:", error)
        toast.error("Failed to save grade")
        return
      }

      toast.success("Grade saved successfully!")

      // Remove the graded answer from the list
      const updatedAnswers = answersToGrade.filter((answer) => answer.id !== currentAnswer.id)
      setAnswersToGrade(updatedAnswers)

      // Adjust current index if needed
      const newFilteredAnswers = updatedAnswers.filter((answer) => {
        const question = answer.questions
        return selectedTopics.length === 0 || (question.topic && selectedTopics.includes(question.topic.slug))
      })
      
      if (currentAnswerIndex >= newFilteredAnswers.length && newFilteredAnswers.length > 0) {
        setCurrentAnswerIndex(newFilteredAnswers.length - 1)
      } else if (newFilteredAnswers.length === 0) {
        setCurrentAnswerIndex(0)
      }

      setSelectedScore(null)
      setTeacherFeedback("")
      setShowMobileGrading(false)
      
      // Scroll back up to the next student answer
      setTimeout(() => {
        if (studentAnswerCardRef.current) {
          studentAnswerCardRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }
      }, 100)
    } catch (error) {
      console.error("Error grading answer:", error)
      toast.error("Failed to save grade")
    } finally {
      setIsGrading(false)
    }
  }

  // Get model answer based on question type
  const getModelAnswer = (question: StudentAnswerForGrading["questions"]) => {
    switch (question.type) {
      case "multiple-choice":
        return (
          question.multiple_choice_questions?.model_answer ||
          question.multiple_choice_questions?.options?.[question.multiple_choice_questions.correct_answer_index] ||
          "No model answer available"
        )
      case "fill-in-the-blank":
        return (
          question.fill_in_the_blank_questions?.model_answer ||
          question.fill_in_the_blank_questions?.correct_answers?.join(", ") ||
          "No model answer available"
        )
      case "matching":
        return (
          question.matching_questions?.map((m) => `${m.statement} → ${m.match}`).join("\n") ||
          "No model answer available"
        )
      case "true-false":
        return (
          question.true_false_questions?.model_answer ||
          (question.true_false_questions?.correct_answer ? "True" : "False")
        )
      case "short-answer":
        return question.short_answer_questions?.model_answer || "No model answer available"
      case "essay":
        return question.essay_questions?.model_answer || "No model answer available"
      case "code":
        return question.code_questions?.model_answer || "No model answer available"
      default:
        return "No model answer available"
    }
  }

  // Don't render anything if user is not a teacher
  if (!userType || !isTeacherPlan({ user_type: userType as UserType } as User)) {
    return null
  }



  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading answers for grading...</p>
        </div>
      </div>
    )
  }

  // Check if any filters are applied
  const hasActiveFilters = selectedTopics.length > 0 || selectedClass !== "all" || selectedStudent !== null

  if (filteredAnswersToGrade.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              {hasActiveFilters ? (
                <>
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-3">
                    Completed Filtered Questions!
                  </h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    You&apos;ve completed all the questions in your current filter. Remove filters to see all available questions.
                  </p>
                  <Button 
                    onClick={clearAllFilters}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    Remove Filters & Show All Questions
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-3">
                    All Caught Up!
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    There are currently no student answers waiting for your review.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentAnswer = filteredAnswersToGrade[currentAnswerIndex]
  const question = currentAnswer.questions
  const student = Array.isArray(currentAnswer.students) ? currentAnswer.students[0] : currentAnswer.students

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-1">Grade Student Answers</h1>
              <p className="text-slate-600">Review and assess student responses</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                {currentAnswerIndex + 1} of {filteredAnswersToGrade.length}
              </Badge>
              {!isMobile && filteredAnswersToGrade.length > 1 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentAnswerIndex(Math.max(0, currentAnswerIndex - 1))
                      setSelectedScore(null)
                      setTeacherFeedback("")
                      setShowMobileGrading(false)
                    }}
                    disabled={currentAnswerIndex === 0}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentAnswerIndex(Math.min(filteredAnswersToGrade.length - 1, currentAnswerIndex + 1))
                      setSelectedScore(null)
                      setTeacherFeedback("")
                      setShowMobileGrading(false)
                    }}
                    disabled={currentAnswerIndex === filteredAnswersToGrade.length - 1}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Class Filter */}
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
              <div className="text-sm text-slate-600">
                No classes assigned to you yet.
              </div>
            )}
          </div>

          {/* Student Search */}
          {students.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filter by Student</CardTitle>
                <CardDescription>Search and select a specific student to review their answers</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStudents ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
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
                              key={student.userid}
                              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors focus:outline-none cursor-pointer ${selectedStudent === student.userid ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'hover:bg-gray-50'}`}
                              onClick={() => setSelectedStudent(selectedStudent === student.userid ? null : student.userid)}
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
                    {selectedStudent && (
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                        <span className="text-sm text-emerald-700">
                          Showing answers for: <strong>{filteredStudents.find(s => s.userid === selectedStudent)?.forename} {filteredStudents.find(s => s.userid === selectedStudent)?.lastname}</strong>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedStudent(null)}
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Topic Filter */}
          {topics.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filter by Topic</CardTitle>
                <CardDescription>Select specific topics to review student answers</CardDescription>
              </CardHeader>
              <CardContent>
                <TopicFilter 
                  selectedTopics={selectedTopics} 
                  onTopicChange={handleTopicChange} 
                  topics={topics} 
                />
              </CardContent>
            </Card>
          )}

          <div ref={cardRef} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Assessment Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Student Information */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Student Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-500">Student:</span>
                      <span className="font-semibold text-slate-800">
                        {student.forename} {student.lastname}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-500">Email:</span>
                      <span className="text-slate-700 text-sm truncate max-w-[200px] sm:max-w-none">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-500">Submitted:</span>
                      <span className="text-slate-700 text-sm">{new Date(currentAnswer.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700">Question</h3>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-white text-slate-700 text-xs">
                        {question.type}
                      </Badge>
                      <Badge variant="outline" className="border-green-200 text-green-700 text-xs">
                        {question.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-slate-700 leading-relaxed text-sm">{question.question_text}</p>
                  </div>
                </div>

                {/* Model Answer */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Model Answer</h3>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <p className="whitespace-pre-wrap text-slate-800 leading-relaxed text-sm">{getModelAnswer(question)}</p>
                  </div>
                  {question.explanation && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs font-semibold text-amber-800 mb-1">Explanation</p>
                      <p className="text-xs text-amber-700 leading-relaxed">{question.explanation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card 
              ref={studentAnswerCardRef}
              className={`transition-transform duration-200 ease-out ${
                isDragging ? "cursor-grabbing shadow-2xl" : "cursor-grab"
              } ${
                swipeColor === "green" 
                  ? "bg-green-50 border-green-200 shadow-green-200" 
                  : swipeColor === "amber" 
                    ? "bg-amber-50 border-amber-200 shadow-amber-200"
                    : swipeColor === "red"
                      ? "bg-red-50 border-red-200 shadow-red-200"
                      : swipeColor === "blue"
                        ? "bg-blue-50 border-blue-200 shadow-blue-200"
                        : ""
              }`}
              style={{
                transform: `translate(${cardTransform.x}px, ${cardTransform.y}px) rotate(${cardTransform.rotation}deg)`,
                zIndex: isDragging ? 10 : 1,
                touchAction: 'none',
                opacity: isDragging && Math.abs(cardTransform.x) > 50 ? 0.8 : 1
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-800 text-base">Student Answer</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-500 hidden sm:block">Self-Assessment:</p>
                    {currentAnswer.student_score ? (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          currentAnswer.student_score === "green" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : currentAnswer.student_score === "amber"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {currentAnswer.student_score === "green" && "✓ Confident"}
                        {currentAnswer.student_score === "amber" && "⚠ Somewhat"}
                        {currentAnswer.student_score === "red" && "✗ Struggling"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-xs">
                        Not assessed
                      </Badge>
                    )}
                    <Button
                      onClick={() => handleDeleteClick(currentAnswer)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {isMobile && isDragging && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-6xl font-bold opacity-20">
                      {swipeColor === "green" && "✓"}
                      {swipeColor === "amber" && "⚠"}
                      {swipeColor === "red" && "✗"}
                      {swipeColor === "blue" && "📝"}
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="relative">
                {/* Swipe Indicators - Mobile Only */}
                {isMobile && (
                  <>
                    {/* Top - Strong Answer (Green) */}
                    <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="text-green-500 text-xs opacity-60">↑</div>
                    </div>
                    
                    {/* Right - Some Understanding (Amber) */}
                    <div className="absolute top-1/2 right-0.5 transform -translate-y-1/2 z-10">
                      <div className="text-amber-500 text-xs opacity-60">→</div>
                    </div>
                    
                    {/* Bottom - Provide Feedback (Blue) */}
                    <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="text-blue-500 text-xs opacity-60">↓</div>
                    </div>
                    
                    {/* Left - Needs Work (Red) */}
                    <div className="absolute top-1/2 left-0.5 transform -translate-y-1/2 z-10">
                      <div className="text-red-500 text-xs opacity-60">←</div>
                    </div>
                  </>
                )}
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="whitespace-pre-wrap text-slate-800 leading-relaxed text-sm">{currentAnswer.response_text}</p>
                </div>
                {currentAnswer.ai_feedback && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs font-semibold text-blue-800 mb-1">AI Feedback</p>
                    <p className="text-xs text-blue-700 leading-relaxed">{currentAnswer.ai_feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>


            {(!isMobile || showMobileGrading) && (
              <Card ref={gradingSectionRef}>
                <CardHeader>
                  <CardTitle>Teacher Assessment</CardTitle>
                  <CardDescription>
                    Compare the student&apos;s answer with the model answer and assign a grade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <GreenButton isSelected={selectedScore === "green"} onClick={() => setSelectedScore("green")} />
                      <AmberButton isSelected={selectedScore === "amber"} onClick={() => setSelectedScore("amber")} />
                      <RedButton isSelected={selectedScore === "red"} onClick={() => setSelectedScore("red")} />
                    </div>

                    {selectedScore && (
                      <div className="space-y-2">
                        <label htmlFor="teacher-feedback" className="text-sm font-semibold text-slate-700">
                          Teacher Feedback (Optional)
                        </label>
                        <Textarea
                          id="teacher-feedback"
                          placeholder="Add any additional feedback for the student..."
                          value={teacherFeedback}
                          onChange={(e) => setTeacherFeedback(e.target.value)}
                          className="min-h-[80px] border-slate-200 focus:border-blue-400 focus:ring-blue-400 text-sm"
                        />
                      </div>
                    )}

                    {selectedScore && (
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => handleGradeAnswer(selectedScore)}
                          disabled={isGrading}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        >
                          {isGrading ? "Saving..." : "Save Grade"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedScore(null)
                            setTeacherFeedback("")
                            if (isMobile) setShowMobileGrading(false)
                          }}
                          disabled={isGrading}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {isMobile && filteredAnswersToGrade.length > 1 && (
              <div className="flex justify-between gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentAnswerIndex(Math.max(0, currentAnswerIndex - 1))
                    setSelectedScore(null)
                    setTeacherFeedback("")
                    setShowMobileGrading(false)
                  }}
                  disabled={currentAnswerIndex === 0}
                  className="flex-1 py-3"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentAnswerIndex(Math.min(filteredAnswersToGrade.length - 1, currentAnswerIndex + 1))
                    setSelectedScore(null)
                    setTeacherFeedback("")
                    setShowMobileGrading(false)
                  }}
                  disabled={currentAnswerIndex === filteredAnswersToGrade.length - 1}
                  className="flex-1 py-3"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Delete Student Attempt</DialogTitle>
            <DialogDescription className="text-gray-500 mt-2">
              This action cannot be undone. This will permanently delete the student&apos;s attempt for this question.
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
                className={`w-full ${deleteConfirmation && deleteConfirmation !== "delete"
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
                setAnswerToDelete(null)
                setDeleteConfirmation("")
              }}
              className="mt-2 sm:mt-0"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteConfirmation !== "delete" || isDeleting}
              className={`flex items-center gap-2 ${deleteConfirmation === "delete"
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
                  Delete Attempt
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AssessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <AssessPageContent />
    </Suspense>
  )
}

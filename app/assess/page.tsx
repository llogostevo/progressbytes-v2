"use client"

import type React from "react"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers/AuthProvider"
import { isTeacher } from "@/lib/access"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, BookOpen, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { GreenButton } from "@/components/question-components/self-assessment/green-button"
import { AmberButton } from "@/components/question-components/self-assessment/amber-button"
import { RedButton } from "@/components/question-components/self-assessment/red-button"
import type { ScoreType } from "@/lib/types"
import { toast } from "sonner"

// Types for the grading interface
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

export default function AssessPage() {
  const router = useRouter()
  const { userType, isLoggedIn } = useAuth()
  const supabase = createClient()

  const [answersToGrade, setAnswersToGrade] = useState<StudentAnswerForGrading[]>([])
  const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isGrading, setIsGrading] = useState(false)
  const [selectedScore, setSelectedScore] = useState<ScoreType | null>(null)
  const [teacherFeedback, setTeacherFeedback] = useState("")

  const [isMobile, setIsMobile] = useState(false)
  const [showMobileGrading, setShowMobileGrading] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null)
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
    setSwipeDirection(null)
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
        setSwipeDirection(direction)
        setSwipeColor(direction === "right" ? "amber" : "red")
      }
    } else {
      if (Math.abs(deltaY) > 30) {
        const direction = deltaY > 0 ? "down" : "up"
        setSwipeDirection(direction)
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
    const maxSwipeDistance = 200

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
          // Swipe down - scroll to grading section
          setSwipeColor("blue")
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
    setSwipeDirection(null)
  }

  const resetCard = () => {
    setCardTransform({ x: 0, y: 0, rotation: 0 })
    setSwipeColor(null)
    setSwipeDirection(null)
  }

  // Fetch answers that need grading
  const fetchAnswersToGrade = useCallback(async () => {
    if (!isTeacher(userType)) return

    setIsLoading(true)
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // First, get the teacher's classes
      const { data: classes } = await supabase.from("classes").select("id").eq("teacher_id", user.id)

      if (!classes || classes.length === 0) {
        setAnswersToGrade([])
        return
      }

      const classIds = classes.map((c) => c.id)

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
        return
      }

      const studentIds = classMembers.map((m) => m.student_id)

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

          return {
            ...answer,
            questions: answer.questions as unknown as StudentAnswerForGrading["questions"],
            students: studentData,
          }
        })
        .filter((answer): answer is NonNullable<typeof answer> => answer !== null)

      console.log("Final mapped answers:", answersWithStudents)

      setAnswersToGrade(answersWithStudents)
    } catch (error) {
      console.error("Error fetching answers:", error)
      toast.error("Failed to load answers for grading")
    } finally {
      setIsLoading(false)
    }
  }, [userType, supabase])

  useEffect(() => {
    // Redirect students to home page
    if (isLoggedIn && userType !== null && !isTeacher(userType)) {
      router.push("/")
    } else if (isLoggedIn && isTeacher(userType)) {
      fetchAnswersToGrade()
    }
  }, [isLoggedIn, userType, router, fetchAnswersToGrade])

  // Handle grading submission
  const handleGradeAnswer = async (score: ScoreType) => {
    if (!answersToGrade[currentAnswerIndex]) return

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

      const currentAnswer = answersToGrade[currentAnswerIndex]

      const { error } = await supabase
        .from("student_answers")
        .update({
          teacher_score: score,
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
      const updatedAnswers = answersToGrade.filter((_, index) => index !== currentAnswerIndex)
      setAnswersToGrade(updatedAnswers)

      // Adjust current index if needed
      if (currentAnswerIndex >= updatedAnswers.length && updatedAnswers.length > 0) {
        setCurrentAnswerIndex(updatedAnswers.length - 1)
      } else if (updatedAnswers.length === 0) {
        setCurrentAnswerIndex(0)
      }

      setSelectedScore(null)
      setTeacherFeedback("")
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
  if (!isLoggedIn || !isTeacher(userType)) {
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

  if (answersToGrade.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">All Caught Up!</h2>
            <p className="text-slate-600">There are currently no student answers waiting for your review.</p>
          </div>
        </div>
      </div>
    )
  }

  const currentAnswer = answersToGrade[currentAnswerIndex]
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
                {currentAnswerIndex + 1} of {answersToGrade.length}
              </Badge>
              {!isMobile && answersToGrade.length > 1 && (
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
                      setCurrentAnswerIndex(Math.min(answersToGrade.length - 1, currentAnswerIndex + 1))
                      setSelectedScore(null)
                      setTeacherFeedback("")
                      setShowMobileGrading(false)
                    }}
                    disabled={currentAnswerIndex === answersToGrade.length - 1}
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

          <div ref={cardRef} className="space-y-6">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg py-3">
                <CardTitle className="flex items-center gap-2 text-slate-800 text-lg">
                  <User className="h-4 w-4 text-blue-600" />
                  Assessment Review
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-6">
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
                      <span className="text-slate-700 text-sm">{student.email}</span>
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
              className={`border-0 bg-white transition-transform duration-200 ease-out ${
                isDragging ? "cursor-grabbing shadow-2xl" : "cursor-grab shadow-lg"
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
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg relative py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-800 text-lg">Student Answer</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-500">Self-Assessment:</p>
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
              <CardContent className="p-4 relative">
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
              <Card ref={gradingSectionRef} className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg py-3">
                  <CardTitle className="text-slate-800 text-lg">Teacher Assessment</CardTitle>
                  <CardDescription className="text-slate-600 text-sm">
                    Compare the student&apos;s answer with the model answer and assign a grade
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
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
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
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
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {isMobile && answersToGrade.length > 1 && (
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
                    setCurrentAnswerIndex(Math.min(answersToGrade.length - 1, currentAnswerIndex + 1))
                    setSelectedScore(null)
                    setTeacherFeedback("")
                    setShowMobileGrading(false)
                  }}
                  disabled={currentAnswerIndex === answersToGrade.length - 1}
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
    </div>
  )
}

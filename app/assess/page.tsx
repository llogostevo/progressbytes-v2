// "use client"

// import { useEffect, useState, useCallback } from "react"
// import { useRouter } from "next/navigation"
// import { useAuth } from "@/app/providers/AuthProvider"
// import { isTeacher } from "@/lib/access"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { ClipboardList, User, Calendar, BookOpen, AlertCircle } from "lucide-react"
// import { createClient } from "@/utils/supabase/client"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { Textarea } from "@/components/ui/textarea"
// import { GreenButton } from "@/components/question-components/self-assessment/green-button"
// import { AmberButton } from "@/components/question-components/self-assessment/amber-button"
// import { RedButton } from "@/components/question-components/self-assessment/red-button"
// import type { ScoreType } from "@/lib/types"
// import { toast } from "sonner"

// // Types for the grading interface
// interface StudentAnswerForGrading {
//   id: string
//   student_id: string
//   question_id: string
//   response_text: string
//   student_score: string | null
//   ai_score: string | null
//   teacher_score: string | null
//   ai_feedback: string | null
//   teacher_feedback: string | null
//   submitted_at: string
//   teacher_id: string | null
//   questions: {
//     id: string
//     type: string
//     difficulty: string
//     question_text: string
//     explanation: string | null
//     created_at: string
//     multiple_choice_questions?: {
//       options: string[]
//       correct_answer_index: number
//       model_answer: string | null
//     } | null
//     fill_in_the_blank_questions?: {
//       options: string[]
//       correct_answers: string[]
//       order_important: boolean
//       model_answer: string | null
//     } | null
//     matching_questions?: {
//       statement: string
//       match: string
//       model_answer: string | null
//     }[] | null
//     true_false_questions?: {
//       correct_answer: boolean
//       model_answer: string | null
//     } | null
//     short_answer_questions?: {
//       model_answer: string
//     } | null
//     essay_questions?: {
//       model_answer: string
//       rubric: string | null
//     } | null
//     code_questions?: {
//       language: string
//       model_answer: string
//       model_answer_code: string
//     } | null
//   }
//   students: {
//     email: string
//     forename: string
//     lastname: string
//   } | {
//     email: string
//     forename: string
//     lastname: string
//   }[]
// }

// export default function AssessPage() {
//   const router = useRouter()
//   const { userType, isLoggedIn } = useAuth()
//   const supabase = createClient()

//   const [answersToGrade, setAnswersToGrade] = useState<StudentAnswerForGrading[]>([])
//   const [currentAnswerIndex, setCurrentAnswerIndex] = useState(0)
//   const [isLoading, setIsLoading] = useState(true)
//   const [isGrading, setIsGrading] = useState(false)
//   const [selectedScore, setSelectedScore] = useState<ScoreType | null>(null)
//   const [teacherFeedback, setTeacherFeedback] = useState("")

//   // Fetch answers that need grading
//   const fetchAnswersToGrade = useCallback(async () => {
//     if (!isTeacher(userType)) return

//     setIsLoading(true)
//     try {
//       // Get current user
//       const { data: { user } } = await supabase.auth.getUser()
//       if (!user) return

//       // First, get the teacher's classes
//       const { data: classes } = await supabase
//         .from('classes')
//         .select('id')
//         .eq('teacher_id', user.id)

//       if (!classes || classes.length === 0) {
//         setAnswersToGrade([])
//         return
//       }

//       const classIds = classes.map(c => c.id)

//       // Get students in these classes
//       const { data: classMembers } = await supabase
//         .from('class_members')
//         .select(`
//           student_id,
//           profiles!inner (
//             email,
//             forename,
//             lastname
//           )
//         `)
//         .in('class_id', classIds)

//       if (!classMembers || classMembers.length === 0) {
//         setAnswersToGrade([])
//         return
//       }

//       const studentIds = classMembers.map(m => m.student_id)

//       const { data: answers, error } = await supabase
//         .from('student_answers')
//         .select(`
//     id,
//     student_id,
//     question_id,
//     response_text,
//     student_score,
//     ai_score,
//     teacher_score,
//     ai_feedback,
//     teacher_feedback,
//     submitted_at,
//     teacher_id,
//     questions!inner (
//       id,
//       type,
//       difficulty,
//       question_text,
//       explanation,
//       created_at,
//       multiple_choice_questions (
//         options,
//         correct_answer_index,
//         model_answer
//       ),
//       fill_in_the_blank_questions (
//         options,
//         correct_answers,
//         order_important,
//         model_answer
//       ),
//       matching_questions (
//         statement,
//         match,
//         model_answer
//       ),
//       true_false_questions (
//         correct_answer,
//         model_answer
//       ),
//       short_answer_questions (
//         model_answer
//       ),
//       essay_questions (
//         model_answer,
//         rubric
//       ),
//       code_questions (
//         language,
//         model_answer,
//         model_answer_code
//       )
//     )
//   `)
//         .in('student_id', studentIds)
//         .is('teacher_id', null)
//         .is('teacher_feedback', null)
//         .in('questions.type', ['short-answer','essay','code', 'text'])
//         .order('submitted_at', { ascending: false });


//       if (error) {
//         console.error('Error fetching answers:', error)
//         toast.error('Failed to load answers for grading')
//         return
//       }

//       // Map the data to include student information
//       console.log('Raw answers:', answers)
//       console.log('Class members:', classMembers)
//       console.log('Student IDs from answers:', answers?.map(a => a.student_id))
//       console.log('Student IDs from class members:', classMembers?.map(m => m.student_id))

//       const answersWithStudents: StudentAnswerForGrading[] = (answers || []).map(answer => {
//         console.log(`Processing answer for student_id: ${answer.student_id}`)
//         const classMember = classMembers.find(m => m.student_id === answer.student_id)
//         console.log('Found class member:', classMember)

//         if (!classMember) {
//           console.log(`No class member found for student_id: ${answer.student_id}`)
//           return null
//         }

//         const studentData = classMember.profiles
//         console.log('Student data from profiles:', studentData)

//         if (!studentData) {
//           console.log(`No profile data found for student_id: ${answer.student_id}`)
//           return null
//         }

//         return {
//           ...answer,
//           questions: answer.questions as unknown as StudentAnswerForGrading['questions'],
//           students: studentData
//         }
//       }).filter((answer): answer is NonNullable<typeof answer> => answer !== null)

//       console.log('Final mapped answers:', answersWithStudents)

//       setAnswersToGrade(answersWithStudents)
//     } catch (error) {
//       console.error('Error fetching answers:', error)
//       toast.error('Failed to load answers for grading')
//     } finally {
//       setIsLoading(false)
//     }
//   }, [userType, supabase])

//   useEffect(() => {
//     // Redirect students to home page
//     if (isLoggedIn && !isTeacher(userType)) {
//       router.push('/')
//     } else if (isLoggedIn && isTeacher(userType)) {
//       fetchAnswersToGrade()
//     }
//   }, [isLoggedIn, userType, router, fetchAnswersToGrade])

//   // Handle grading submission
//   const handleGradeAnswer = async (score: ScoreType) => {
//     if (!answersToGrade[currentAnswerIndex]) return

//     setIsGrading(true)
//     try {
//       // Get current user
//       const { data: { user } } = await supabase.auth.getUser()
//       if (!user) {
//         toast.error('User not found')
//         return
//       }

//       const currentAnswer = answersToGrade[currentAnswerIndex]

//       const { error } = await supabase
//         .from('student_answers')
//         .update({
//           teacher_score: score,
//           teacher_id: user.id,
//           teacher_feedback: teacherFeedback.trim() || null
//         })
//         .eq('id', currentAnswer.id)

//       if (error) {
//         console.error('Error updating grade:', error)
//         toast.error('Failed to save grade')
//         return
//       }

//       toast.success('Grade saved successfully!')

//       // Remove the graded answer from the list
//       const updatedAnswers = answersToGrade.filter((_, index) => index !== currentAnswerIndex)
//       setAnswersToGrade(updatedAnswers)

//       // Adjust current index if needed
//       if (currentAnswerIndex >= updatedAnswers.length && updatedAnswers.length > 0) {
//         setCurrentAnswerIndex(updatedAnswers.length - 1)
//       } else if (updatedAnswers.length === 0) {
//         setCurrentAnswerIndex(0)
//       }

//       setSelectedScore(null)
//       setTeacherFeedback("")
//     } catch (error) {
//       console.error('Error grading answer:', error)
//       toast.error('Failed to save grade')
//     } finally {
//       setIsGrading(false)
//     }
//   }

//   // Get model answer based on question type
//   const getModelAnswer = (question: StudentAnswerForGrading['questions']) => {
//     switch (question.type) {
//       case 'multiple-choice':
//         return question.multiple_choice_questions?.model_answer ||
//           (question.multiple_choice_questions?.options?.[question.multiple_choice_questions.correct_answer_index] || 'No model answer available')
//       case 'fill-in-the-blank':
//         return question.fill_in_the_blank_questions?.model_answer ||
//           (question.fill_in_the_blank_questions?.correct_answers?.join(', ') || 'No model answer available')
//       case 'matching':
//         return question.matching_questions?.map(m => `${m.statement} → ${m.match}`).join('\n') || 'No model answer available'
//       case 'true-false':
//         return question.true_false_questions?.model_answer ||
//           (question.true_false_questions?.correct_answer ? 'True' : 'False')
//       case 'short-answer':
//         return question.short_answer_questions?.model_answer || 'No model answer available'
//       case 'essay':
//         return question.essay_questions?.model_answer || 'No model answer available'
//       case 'code':
//         return question.code_questions?.model_answer || 'No model answer available'
//       default:
//         return 'No model answer available'
//     }
//   }

//   // Don't render anything if user is not a teacher
//   if (!isLoggedIn || !isTeacher(userType)) {
//     return null
//   }

//   if (isLoading) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           <div className="flex items-center justify-center h-64">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
//               <p className="text-muted-foreground">Loading answers for grading...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (answersToGrade.length === 0) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           <div className="text-center py-12">
//             <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//             <h2 className="text-2xl font-semibold mb-2">No Answers to Grade</h2>
//             <p className="text-muted-foreground">
//               There are currently no student answers waiting for your review.
//             </p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   const currentAnswer = answersToGrade[currentAnswerIndex]
//   const question = currentAnswer.questions
//   const student = Array.isArray(currentAnswer.students) ? currentAnswer.students[0] : currentAnswer.students

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h1 className="text-3xl font-bold mb-2">Grade Student Answers</h1>
//               <p className="text-muted-foreground">
//                 Review and grade student responses
//               </p>
//             </div>
//             <div className="text-right">
//               <Badge variant="outline" className="text-sm">
//                 {currentAnswerIndex + 1} of {answersToGrade.length}
//               </Badge>
//             </div>
//           </div>
//         </div>

//         <div className="space-y-6">
//           {/* Student Information */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <User className="h-5 w-5" />
//                 Student Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Student</p>
//                   <p className="font-medium">{student.forename} {student.lastname}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Email</p>
//                   <p className="font-medium">{student.email}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">Submitted</p>
//                   <p className="font-medium">
//                     {new Date(currentAnswer.submitted_at).toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Question */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <BookOpen className="h-5 w-5" />
//                 Question
//               </CardTitle>
//               <div className="flex gap-2">
//                 <Badge variant="secondary">{question.type}</Badge>
//                 <Badge variant="outline">{question.difficulty}</Badge>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="prose max-w-none">
//                 <p className="text-base leading-relaxed">{question.question_text}</p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Student Answer */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Student Answer</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="bg-slate-50 p-4 rounded-md">
//                 <p className="whitespace-pre-wrap">{currentAnswer.response_text}</p>
//               </div>
//               {currentAnswer.ai_feedback && (
//                 <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
//                   <p className="text-sm font-medium text-blue-800 mb-1">AI Feedback</p>
//                   <p className="text-sm text-blue-700">{currentAnswer.ai_feedback}</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Model Answer */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Model Answer</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="bg-green-50 p-4 rounded-md">
//                 <p className="whitespace-pre-wrap">{getModelAnswer(question)}</p>
//               </div>
//               {question.explanation && (
//                 <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
//                   <p className="text-sm font-medium text-amber-800 mb-1">Explanation</p>
//                   <p className="text-sm text-amber-700">{question.explanation}</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Grading Interface */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Teacher Assessment</CardTitle>
//               <CardDescription>
//                 Compare the student's answer with the model answer and assign a grade
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                   <GreenButton
//                     isSelected={selectedScore === "green"}
//                     onClick={() => setSelectedScore("green")}
//                   />
//                   <AmberButton
//                     isSelected={selectedScore === "amber"}
//                     onClick={() => setSelectedScore("amber")}
//                   />
//                   <RedButton
//                     isSelected={selectedScore === "red"}
//                     onClick={() => setSelectedScore("red")}
//                   />
//                 </div>

//                 {selectedScore && (
//                   <div className="space-y-2">
//                     <label htmlFor="teacher-feedback" className="text-sm font-medium">
//                       Teacher Feedback (Optional)
//                     </label>
//                     <Textarea
//                       id="teacher-feedback"
//                       placeholder="Add any additional feedback for the student..."
//                       value={teacherFeedback}
//                       onChange={(e) => setTeacherFeedback(e.target.value)}
//                       className="min-h-[100px]"
//                     />
//                   </div>
//                 )}

//                 {selectedScore && (
//                   <div className="flex gap-2 pt-4">
//                     <Button
//                       onClick={() => handleGradeAnswer(selectedScore)}
//                       disabled={isGrading}
//                       className="flex-1"
//                     >
//                       {isGrading ? "Saving..." : "Save Grade"}
//                     </Button>
//                     <Button
//                       variant="outline"
//                       onClick={() => {
//                         setSelectedScore(null)
//                         setTeacherFeedback("")
//                       }}
//                       disabled={isGrading}
//                     >
//                       Cancel
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Navigation */}
//           {answersToGrade.length > 1 && (
//             <div className="flex justify-between">
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setCurrentAnswerIndex(Math.max(0, currentAnswerIndex - 1))
//                   setSelectedScore(null)
//                   setTeacherFeedback("")
//                 }}
//                 disabled={currentAnswerIndex === 0}
//               >
//                 Previous
//               </Button>
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setCurrentAnswerIndex(Math.min(answersToGrade.length - 1, currentAnswerIndex + 1))
//                   setSelectedScore(null)
//                   setTeacherFeedback("")
//                 }}
//                 disabled={currentAnswerIndex === answersToGrade.length - 1}
//               >
//                 Next
//               </Button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

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
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

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
    setSwipeDirection(null)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !touchStartRef.current) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    // Determine swipe direction based on larger delta
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > 50) {
        setSwipeDirection(deltaX > 0 ? "right" : "left")
      }
    } else {
      if (Math.abs(deltaY) > 50) {
        setSwipeDirection(deltaY > 0 ? "down" : "up")
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || !touchStartRef.current) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    const minSwipeDistance = 100

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          // Swipe right - amber
          setSelectedScore("amber")
          handleGradeAnswer("amber")
        } else {
          // Swipe left - red
          setSelectedScore("red")
          handleGradeAnswer("red")
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY < 0) {
          // Swipe up - green
          setSelectedScore("green")
          handleGradeAnswer("green")
        } else {
          // Swipe down - show grading interface
          setShowMobileGrading(true)
        }
      }
    }

    touchStartRef.current = null
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
    if (isLoggedIn && !isTeacher(userType)) {
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
          {isMobile && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-semibold text-blue-800 mb-2">Swipe to Grade</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                <div>↑ Swipe Up: Green</div>
                <div>→ Swipe Right: Amber</div>
                <div>← Swipe Left: Red</div>
                <div>↓ Swipe Down: Manual</div>
              </div>
            </div>
          )}

          <div
            ref={cardRef}
            className={`space-y-6 transition-transform duration-200 ${
              swipeDirection === "left"
                ? "-translate-x-2 bg-red-50"
                : swipeDirection === "right"
                  ? "translate-x-2 bg-amber-50"
                  : swipeDirection === "up"
                    ? "-translate-y-2 bg-green-50"
                    : swipeDirection === "down"
                      ? "translate-y-2 bg-blue-50"
                      : ""
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <User className="h-5 w-5 text-blue-600" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Student</p>
                    <p className="font-semibold text-slate-800 text-lg">
                      {student.forename} {student.lastname}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Email</p>
                    <p className="text-slate-700">{student.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Submitted</p>
                    <p className="text-slate-700">{new Date(currentAnswer.submitted_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Question
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-white text-slate-700">
                      {question.type}
                    </Badge>
                    <Badge variant="outline" className="border-green-200 text-green-700">
                      {question.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <p className="text-slate-700 leading-relaxed text-lg">{question.question_text}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <CardTitle className="text-slate-800">Student Answer</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">{currentAnswer.response_text}</p>
                </div>
                {currentAnswer.ai_feedback && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm font-semibold text-blue-800 mb-2">AI Feedback</p>
                    <p className="text-sm text-blue-700 leading-relaxed">{currentAnswer.ai_feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg">
                <CardTitle className="text-slate-800">Model Answer</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">{getModelAnswer(question)}</p>
                </div>
                {question.explanation && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm font-semibold text-amber-800 mb-2">Explanation</p>
                    <p className="text-sm text-amber-700 leading-relaxed">{question.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {(!isMobile || showMobileGrading) && (
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                  <CardTitle className="text-slate-800">Teacher Assessment</CardTitle>
                  <CardDescription className="text-slate-600">
                    Compare the student's answer with the model answer and assign a grade
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <GreenButton isSelected={selectedScore === "green"} onClick={() => setSelectedScore("green")} />
                      <AmberButton isSelected={selectedScore === "amber"} onClick={() => setSelectedScore("amber")} />
                      <RedButton isSelected={selectedScore === "red"} onClick={() => setSelectedScore("red")} />
                    </div>

                    {selectedScore && (
                      <div className="space-y-3">
                        <label htmlFor="teacher-feedback" className="text-sm font-semibold text-slate-700">
                          Teacher Feedback (Optional)
                        </label>
                        <Textarea
                          id="teacher-feedback"
                          placeholder="Add any additional feedback for the student..."
                          value={teacherFeedback}
                          onChange={(e) => setTeacherFeedback(e.target.value)}
                          className="min-h-[120px] border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                        />
                      </div>
                    )}

                    {selectedScore && (
                      <div className="flex gap-3 pt-4">
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

"use client"

import { useMemo, useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { FeedbackDisplay } from "@/components/question-components/feedback-display"
import { SelfAssessment } from "@/components/question-components/self-assessment"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Question, Answer, ScoreType, Topic } from "@/lib/types"
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle, SkipForward } from "lucide-react"
import Link from "next/link"
import { MultipleChoiceQuestion } from "@/components/question-components/question-type/multiple-choice-question"
import { FillInTheBlankQuestion } from "@/components/question-components/question-type/fill-in-the-blank-question"
import { TextQuestion } from "@/components/question-components/question-type/text-question"
import { CodeQuestion } from "@/components/question-components/question-type/code-question"
import { MatchingQuestion } from "@/components/question-components/question-type/matching-question"
import { TrueFalseQuestion } from "@/components/question-components/question-type/true-false-question"
import { EssayQuestion } from "@/components/question-components/question-type/essay-question"
import { createClient } from "@/utils/supabase/client"
import { CTABanner } from "@/components/cta-banner"
import { UserLogin } from "@/components/user-login"
import { User } from "@supabase/supabase-js"
import { QuestionTypeFilter } from "@/components/question-type-filter"
import { SubtopicFilter } from "@/components/ui/subtopic-filter"
import { Skeleton } from "@/components/ui/skeleton"
import { canAccessFilters, getMaxQuestionsPerTopic, UserType, canSkipQuestions } from "@/lib/access"
import { QuestionDifficultyFilter } from "@/components/question-difficulty-filter"

// Define types for the database responses
interface DBQuestion {
  id: string;
  type: string;
  question_text: string;
  explanation?: string;
  created_at: string;
  model_answer?: string;
  difficulty?: string;
  multiple_choice_questions?: {
    options: string[];
    correct_answer_index: number;
    model_answer?: string;
  };
  fill_in_the_blank_questions?: {
    correct_answers: string[];
    model_answer?: string;
    order_important?: boolean;
    options?: string[];
  };
  matching_questions?: Array<{
    statement: string;
    match: string;
    model_answer?: string;
  }>;
  true_false_questions?: {
    model_answer?: boolean;
    correct_answer?: boolean;
  };
  code_questions?: {
    starter_code?: string;
    model_answer?: string;
    language?: string;
    model_answer_code?: string;
  };
  short_answer_questions?: {
    model_answer: string;
    keywords?: string[];
  };
  essay_questions?: {
    model_answer?: string;
    rubric?: string;
    keywords?: string[];
  };
}

interface DBSubtopicQuestionLink {
  questions: DBQuestion;
}

interface DBSubtopic {
  subtopic_question_link: DBSubtopicQuestionLink[];
}

// Helper functions to interact with the database
async function getTopicBySlug(slug: string): Promise<Topic | undefined> {
  const supabase = createClient()

  const { data: topic, error } = await supabase
    .from('topics')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (error || !topic) {
    console.error('Error fetching topic:', error)
    return undefined
  }

  return topic as Topic
}

function transformQuestion(dbQuestion: DBQuestion, topicName: string): Question {

  return {
    id: dbQuestion.id,
    type: dbQuestion.type as Question['type'],
    topic: topicName,
    question_text: dbQuestion.question_text,
    explanation: dbQuestion.explanation,
    created_at: dbQuestion.created_at,
    difficulty: dbQuestion.difficulty as Question['difficulty'],
    // Map model_answer based on question type
    model_answer: (() => {
      switch (dbQuestion.type) {
        case 'multiple-choice':
          return dbQuestion.multiple_choice_questions?.model_answer || '';
        case 'fill-in-the-blank':
          return dbQuestion.fill_in_the_blank_questions?.model_answer || '';
        case 'matching':
          return dbQuestion.matching_questions?.[0]?.model_answer || '';
        case 'true-false':
          return dbQuestion.true_false_questions?.correct_answer ?? false;
        case 'code':
          return dbQuestion.code_questions?.model_answer || '';
        case 'algorithm':
          return dbQuestion.code_questions?.model_answer || '';
        case 'sql':
          return dbQuestion.code_questions?.model_answer || '';
        case 'short-answer':
          return dbQuestion.short_answer_questions?.model_answer || '';
        case 'text':
          return dbQuestion.short_answer_questions?.model_answer || '';
        case 'essay':
          return dbQuestion.essay_questions?.model_answer || '';
        default:
          return '';
      }
    })(),
    // Add type-specific data
    ...(dbQuestion.type === 'multiple-choice' && dbQuestion.multiple_choice_questions && {
      options: dbQuestion.multiple_choice_questions.options,
      correctAnswerIndex: dbQuestion.multiple_choice_questions.correct_answer_index
    }),
    ...(dbQuestion.type === 'fill-in-the-blank' && dbQuestion.fill_in_the_blank_questions && {
      options: dbQuestion.fill_in_the_blank_questions.options,
      order_important: dbQuestion.fill_in_the_blank_questions.order_important,
      model_answer: dbQuestion.fill_in_the_blank_questions.correct_answers
    }),
    ...(dbQuestion.type === 'matching' && {
      pairs: dbQuestion.matching_questions?.map((mq) => ({
        statement: mq.statement,
        match: mq.match
      }))
    }),
    ...((dbQuestion.type === 'code' || dbQuestion.type === 'algorithm' || dbQuestion.type === 'sql') && dbQuestion.code_questions && {
      model_answer_code: dbQuestion.code_questions.model_answer_code,
      language: dbQuestion.code_questions.language
    }),
    ...(dbQuestion.type === 'text' && {
      model_answer: dbQuestion.short_answer_questions?.model_answer || '',
      keywords: dbQuestion.short_answer_questions?.keywords
    }),
    ...(dbQuestion.type === 'essay' && {
      model_answer: dbQuestion.essay_questions?.model_answer || '',
      keywords: dbQuestion.essay_questions?.keywords
    }),
    ...(dbQuestion.type === 'true-false' && {
      model_answer: dbQuestion.true_false_questions?.correct_answer || false
    }),
    ...(dbQuestion.type === 'short-answer' && {
      model_answer: dbQuestion.short_answer_questions?.model_answer || '',
      keywords: dbQuestion.short_answer_questions?.keywords
    })
  };
}

async function getSubtopicsForTopic(topicId: string): Promise<Array<{ id: string; subtopictitle: string }>> {
  const supabase = createClient()

  const { data: subtopicsData, error: subtopicsError } = await supabase
    .from('subtopics')
    .select('id, subtopictitle')
    .eq('topic_id', topicId)

  if (subtopicsError || !subtopicsData) {
    console.error('Error fetching subtopics:', subtopicsError)
    return []
  }

  return subtopicsData
}

async function getRandomQuestionForTopic(
  topicId: string,
  userType: UserType,
  selectedSubtopics: string[],
  selectedQuestionType?: string | null,
  selectedQuestionDifficulty?: string | null
): Promise<Question | null> {
  const supabase = createClient()

  // First check if the topic exists
  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .select('id, name')
    .eq('id', topicId)
    .single()

  if (topicError || !topic) {
    throw new Error(`Topic not found with ID: ${topicId}`)
  }

  // Get all questions for this topic through the subtopics
  let query = supabase
    .from('subtopics')
    .select(`
      id,
      subtopictitle,
      subtopic_question_link (
        questions (
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
            correct_answers,
            model_answer,
            order_important,
            options
          ),
          matching_questions (
            statement,
            match,
            model_answer
          ),
          true_false_questions (
            model_answer,
            correct_answer
          ),
          code_questions (
            starter_code,
            model_answer,
            language,
            model_answer_code
          ),
          short_answer_questions (
            model_answer,
            keywords
          ),
          essay_questions (
            model_answer,
            rubric,
            keywords
          )
        )
      )
    `)
    .eq('topic_id', topicId)

  // Add subtopic filter if subtopics are selected
  if (selectedSubtopics.length > 0) {
    query = query.in('id', selectedSubtopics)
  }

  const { data: questions, error: questionsError } = await query

  if (questionsError) {
    throw new Error(`Error fetching questions for topic ID: ${topicId}. Error: ${questionsError.message}`)
  }

  if (!questions || questions.length === 0) {
    throw new Error(`No subtopics found for topic ID: ${topicId}`)
  }

  // Flatten the questions array and transform the data
  const allQuestions = (questions as unknown as DBSubtopic[]).flatMap(subtopic =>
    subtopic.subtopic_question_link.flatMap(link => {
      const question = link.questions
      if (!question) return []
      return transformQuestion(question, topic.name)
    })
  )

  // Filter questions by type if a type is selected
  const filteredQuestions = selectedQuestionType
    ? allQuestions.filter(q => q.type === selectedQuestionType)
    : allQuestions

  // Filter questions by difficulty if a difficulty is selected
  const filteredQuestionsByDifficulty = selectedQuestionDifficulty
    ? filteredQuestions.filter(q => q.difficulty === selectedQuestionDifficulty)
    : filteredQuestions

  if (filteredQuestionsByDifficulty.length === 0) {
    return null
  }

  // Determine the number of questions based on access level
  const accessUser: { user_type: UserType } = userType ? { user_type: userType as UserType } : { user_type: 'anonymous' }
  const maxQuestions = getMaxQuestionsPerTopic(accessUser)
  const length = Math.min(maxQuestions, filteredQuestionsByDifficulty.length)

  const randomIndex = Math.floor(Math.random() * length)
  return filteredQuestionsByDifficulty[randomIndex]


}

// Add this new function to get available question types
async function getAvailableQuestionTypes(topicId: string): Promise<
  {
    types: string[],
    difficulties: string[]
  }
> {
  const supabase = createClient()

  const { data: questions, error: questionsError } = await supabase
    .from('subtopics')
    .select(`
      subtopic_question_link (
        questions (
          type,
          difficulty
        )
      )
    `)
    .eq('topic_id', topicId)

  if (questionsError || !questions) {
    console.error('Error fetching question types:', questionsError)
    return { types: [], difficulties: [] }
  }

  // Get unique question types
  const types = new Set<string>()
  const difficulties = new Set<string>()
  // TODO: fix the type error
  // @ts-expect-error - this is a workaround to fix the type error
  questions.forEach((subtopic: DBSubtopic) => {
    subtopic.subtopic_question_link?.forEach((link: DBSubtopicQuestionLink) => {
      if (link.questions?.type) {
        types.add(link.questions.type)
      }
      if (link.questions?.difficulty) {
        difficulties.add(link.questions.difficulty)
      }
    })
  })

  return {
    types: Array.from(types),
    difficulties: Array.from(difficulties),
  }
}

async function getQuestionById(questionId: string): Promise<Question | undefined> {
  const supabase = createClient()

  const { data: question, error } = await supabase
    .from('questions')
    .select(`
      id,
      type,
      difficulty,
      question_text,
      explanation,
      created_at,
      subtopic_question_link!inner (
        subtopics!inner (
          topics!inner (
            name
          )
        )
      ),
      multiple_choice_questions (
        options,
        correct_answer_index,
        model_answer
      ),
      fill_in_the_blank_questions (
        correct_answers,
        model_answer,
        order_important,
        options
      ),
      matching_questions (
        statement,
        match,
        model_answer
      ),
      true_false_questions (
        model_answer,
        correct_answer
      ),
      code_questions (
        starter_code,
        model_answer,
        language,
        model_answer_code
      ),
      short_answer_questions (
        model_answer,
        keywords
      ),
      essay_questions (
        model_answer,
        rubric,
        keywords
      )
    `)
    .eq('id', questionId)
    .single()

  if (error || !question) {
    return undefined
  }

  // Get the first topic name from the many-to-many relationship
  // TODO: need to capture the full hierarchy
  /*
      If a question is linked to multiple subtopics, and those subtopics belong to different topics, you'll only get the first one.
      consider capturing the full hierarchy
      const topicNames = question.subtopic_question_link
        ?.flatMap(link => link.subtopics?.flatMap(sub => sub.topics?.map(t => t.name)) ?? [])
        ?? []
  */
  const topicName = question.subtopic_question_link?.[0]?.subtopics?.[0]?.topics?.[0]?.name || ''

  // Transform the question using the shared function
  return transformQuestion(question as unknown as DBQuestion, topicName)
}

function QuestionSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Subtopic Filter Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-4 w-32 mb-2" />
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-24" />
            ))}
          </div>
        </div>

        {/* Question Type Filter Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-4 w-32 mb-2" />
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-32" />
            ))}
          </div>
        </div>

        {/* Question Card Skeleton */}
        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />

              {/* Answer Input Skeleton */}
              <div className="mt-6">
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Model Answer Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function QuestionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const topicSlug = params.topic as string
  const questionId = searchParams.get("questionId")

  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [selfAssessmentScore, setSelfAssessmentScore] = useState<ScoreType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userType, setUserType] = useState<UserType | "anonymous">("anonymous")
  const [isLoadingUserType, setIsLoadingUserType] = useState(true)
  const [freeUser, setFreeUser] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  const [selectedQuestionType, setSelectedQuestionType] = useState<string | null>(null)
  const [availableQuestionTypes, setAvailableQuestionTypes] = useState<string[]>([])

  const [subtopics, setSubtopics] = useState<Array<{ id: string; subtopictitle: string }>>([])
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([])

  const [selectedQuestionDifficulty, setSelectedQuestionDifficulty] = useState<string | null>(null)
  const [availableQuestionDifficulty, setAvailableQuestionDifficulty] = useState<string[]>([])

  const [hasStartedAnswering, setHasStartedAnswering] = useState(false)

  // const freeUser = currentUser.email === "student@example.com"

  // const supabase = createClient()

  // //TODO: put this into a hook?? or into data.ts??
  // useEffect(() => {
  //   const checkHasPaid = async () => {
  //     const { data: { user } } = await supabase.auth.getUser()
  //     if (!user) {
  //       setFreeUser(true)
  //       setIsLoadingUserType(false)
  //       return
  //     }

  //     const { data } = await supabase
  //       .from('profiles')
  //       .select('user_type')
  //       .eq('userid', user.id)
  //       .single()

  //     if (!data) {
  //       setUserType("anonymous")
  //       setUser(user)
  //       setFreeUser(true)
  //       setIsLoadingUserType(false)
  //       return
  //     }

  //     setUserType(data.user_type)
  //     setUser(user)
  //     setFreeUser(false)
  //     setIsLoadingUserType(false)
  //   }
  //   checkHasPaid()
  // }, [supabase, topicSlug])

  // Create a stable supabase client instance
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const checkHasPaid = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setFreeUser(true)
        setIsLoadingUserType(false)
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("userid", user.id)
        .single()

      if (!data) {
        setUserType("anonymous")
        setUser(user)
        setFreeUser(true)
        setIsLoadingUserType(false)
        return
      }

      setUserType(data.user_type)
      setUser(user)
      setFreeUser(false)
      setIsLoadingUserType(false)
    }

    checkHasPaid()
  }, [supabase])



  useEffect(() => {
    if (isLoadingUserType) return

    const loadQuestion = async () => {
      try {
        const currentTopic = await getTopicBySlug(topicSlug)
        setTopic(currentTopic || null)

        if (currentTopic) {
          // Get available question types and difficulties
          const { types, difficulties } = await getAvailableQuestionTypes(currentTopic.id)

          setAvailableQuestionTypes(types)
          setAvailableQuestionDifficulty(difficulties)

          // Get subtopics for the current topic
          const subtopicsData = await getSubtopicsForTopic(currentTopic.id)
          setSubtopics(subtopicsData)

          let newQuestion: Question | null
          if (questionId) {
            const question = await getQuestionById(questionId)
            if (question) {
              newQuestion = question
            } else {
              newQuestion = await getRandomQuestionForTopic(currentTopic.id, userType, selectedSubtopics, selectedQuestionType, selectedQuestionDifficulty)
            }
          } else {
            newQuestion = await getRandomQuestionForTopic(currentTopic.id, userType, selectedSubtopics, selectedQuestionType, selectedQuestionDifficulty)
          }

          if (!newQuestion) {
            setQuestion(null)
            setAnswer(null)
            setSelfAssessmentScore(null)
            return
          }

          // console.log("=== QUESTION DEBUG INFO ===")
          // console.log("User Type:", userType)
          // console.log("User ID:", user?.id)
          // console.log("Topic ID:", currentTopic?.id)
          // console.log("Raw question data:", newQuestion)
          // console.log("Question ID:", newQuestion.id)
          // console.log("Question type:", newQuestion.type)
          // console.log("Model answer:", newQuestion.model_answer)
          // console.log("Model answer type:", typeof newQuestion.model_answer)
          // console.log("Options:", newQuestion.options)
          // console.log("Order important:", newQuestion.order_important)
          // console.log("=== END DEBUG INFO ===")

          // if (newQuestion.type === 'true-false') {
          //   console.log("True/False specific data:", {
          //     modelAnswer: newQuestion.model_answer,
          //     modelAnswerType: typeof newQuestion.model_answer,
          //     rawModelAnswer: newQuestion.model_answer
          //   })
          // }

          setQuestion(newQuestion)
          setAnswer(null)
          setSelfAssessmentScore(null)
          setHasStartedAnswering(false)
        }
      } catch (error) {
        console.error("Error loading question:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestion()
  }, [topicSlug, isLoadingUserType, userType, freeUser, questionId, selectedQuestionType, selectedSubtopics, selectedQuestionDifficulty])



  const handleSubmitAnswer = async (responseText: string) => {
    if (!question) return

    setIsSubmitting(true)

    // Mock answer object for anonymous users
    const baseAnswer = {
      id: "anon",
      question_id: question.id,
      student_id: "anon",
      response_text: responseText,
      ai_feedback: null,
      score: "amber" as ScoreType,
      submitted_at: new Date().toISOString(),
      self_assessed: false,
      teacher_score: null,
      teacher_feedback: null,
    }

    try {
      // If not logged in, simulate and return
      if (!user) {
        setAnswer(baseAnswer)
        return
      }

      // Logged-in user: save to Supabase
      const { data: answerData, error: insertError } = await supabase
        .from('student_answers')
        .insert({
          student_id: user.id,
          question_id: question.id,
          response_text: responseText,
          self_assessed: false,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw insertError

      if (userType === "revisionAI") {
        // Simulate delay + generate feedback
        await new Promise((resolve) => setTimeout(resolve, 1500))
        const mockFeedback = generateMockFeedback(responseText, question)

        // Save feedback
        await supabase
          .from('student_answers')
          .update({
            ai_feedback: mockFeedback.feedback,
            ai_score: mockFeedback.score
          })
          .eq('id', answerData.id)

        setAnswer({
          ...baseAnswer,
          id: answerData.id,
          student_id: user.id,
          ai_feedback: mockFeedback.feedback,
          score: mockFeedback.score,
          submitted_at: answerData.submitted_at,
          teacher_score: null,
          teacher_feedback: null,
        })
      } else {
        // Free logged-in user
        setAnswer({
          ...baseAnswer,
          id: answerData.id,
          student_id: user.id,
          submitted_at: answerData.submitted_at,
          teacher_score: null,
          teacher_feedback: null,
        })
      }

      // Log activity
      await supabase.from('user_activity').insert({
        user_id: user.id,
        event: 'submitted_question',
        path: `/questions/${topicSlug}`,
        user_email: user.email
      })

    } catch (error) {
      console.error("Error saving answer:", error)
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleSelfAssessment = async (score: ScoreType) => {
    if (!answer || !user) return

    try {
      // Update the answer with self-assessment score
      const { error: updateError } = await supabase
        .from('student_answers')
        .update({
          student_score: score,
          self_assessed: true
        })
        .eq('id', answer.id)

      if (updateError) throw updateError

      const updatedAnswer: Answer = {
        ...answer,
        score: score,
        self_assessed: true,
      }

      setAnswer(updatedAnswer)
      setSelfAssessmentScore(score)
    } catch (error) {
      console.error("Error updating self-assessment:", error)
    }
  }

  const handleTryAnother = async () => {
    try {
      if (!topic) {
        throw new Error("No topic found")
      }
      // const newQuestion = await getRandomQuestionForTopic(topic.id, freeUser, userType, selectedSubtopics, selectedQuestionType)
      const newQuestion = await getRandomQuestionForTopic(
        topic.id, userType, selectedSubtopics,
        selectedQuestionType, selectedQuestionDifficulty
      )

      if (!newQuestion) {
        setQuestion(null)
        setAnswer(null)
        setSelfAssessmentScore(null)
        setHasStartedAnswering(false)
        return
      }

      setQuestion(newQuestion)
      setAnswer(null)
      setSelfAssessmentScore(null)
      setHasStartedAnswering(false)
    } catch (error) {
      console.error("Error loading new question:", error)
    }
  }

  const handleSkipQuestion = async () => {
    try {
      if (!topic) {
        throw new Error("No topic found")
      }
      // const newQuestion = await getRandomQuestionForTopic(topic.id, freeUser, userType, selectedSubtopics, selectedQuestionType)
      const newQuestion = await getRandomQuestionForTopic(
        topic.id, userType, selectedSubtopics,
        selectedQuestionType, selectedQuestionDifficulty
      )
      if (!newQuestion) {
        setQuestion(null)
        setAnswer(null)
        setSelfAssessmentScore(null)
        setHasStartedAnswering(false)
        return
      }

      setQuestion(newQuestion)
      setAnswer(null)
      setSelfAssessmentScore(null)
      setHasStartedAnswering(false)
    } catch (error) {
      console.error("Error skipping question:", error)
    }
  }

  const handleMultipleChoiceAnswer = async (selectedIndex: number, isCorrect: boolean) => {
    if (!question) return

    if (!user) {
      // For anonymous users, just set a mock answer
      setAnswer({
        id: "anon",
        question_id: question.id,
        student_id: "anon",
        response_text: selectedIndex.toString(),
        ai_feedback: isCorrect ? "Well done! You selected the correct answer." : "Try to understand why this answer is incorrect.",
        score: isCorrect ? "green" : "red",
        submitted_at: new Date().toISOString(),
        self_assessed: true,
        teacher_score: null,
        teacher_feedback: null,
      })
      setSelfAssessmentScore(isCorrect ? "green" : "red")
      return
    }

    try {
      const { data: answerData, error: insertError } = await supabase
        .from('student_answers')
        .insert({
          student_id: user.id,
          question_id: question.id,
          response_text: selectedIndex.toString(),
          ai_feedback: isCorrect ? "Well done! You selected the correct answer." : "Try to understand why this answer is incorrect.",
          student_score: isCorrect ? "green" : "red",
          self_assessed: true,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw insertError

      const newAnswer: Answer = {
        id: answerData.id,
        question_id: question.id,
        student_id: user.id,
        response_text: selectedIndex.toString(),
        ai_feedback: isCorrect ? "Well done! You selected the correct answer." : "Try to understand why this answer is incorrect.",
        score: isCorrect ? "green" : "red",
        submitted_at: answerData.submitted_at,
        self_assessed: true,
        teacher_score: null,
        teacher_feedback: null,
      }

      setAnswer(newAnswer)
      setSelfAssessmentScore(isCorrect ? "green" : "red")
    } catch (error) {
      console.error("Error saving multiple choice answer:", error)
    }
  }

  const handleFillInTheBlankAnswer = async (isCorrect: boolean, selectedIndexes: number[]) => {
    if (!question) return

    if (!user) {
      setAnswer({
        id: "anon",
        question_id: question.id,
        student_id: "anon",
        response_text: JSON.stringify(selectedIndexes),
        ai_feedback: isCorrect ? "Well done! You selected the correct answers." : "Try to understand why these answers are incorrect.",
        score: isCorrect ? "green" : "red",
        submitted_at: new Date().toISOString(),
        self_assessed: true,
        teacher_score: null,
        teacher_feedback: null,
      })
      setSelfAssessmentScore(isCorrect ? "green" : "red")
      return
    }

    try {
      const { data: answerData, error: insertError } = await supabase
        .from('student_answers')
        .insert({
          student_id: user.id,
          question_id: question.id,
          response_text: JSON.stringify(selectedIndexes),
          ai_feedback: isCorrect ? "Well done! You selected the correct answers." : "Try to understand why these answers are incorrect.",
          student_score: isCorrect ? "green" : "red",
          self_assessed: true,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw insertError

      const newAnswer: Answer = {
        id: answerData.id,
        question_id: question.id,
        student_id: user.id,
        response_text: JSON.stringify(selectedIndexes),
        ai_feedback: isCorrect ? "Well done! You selected the correct answers." : "Try to understand why these answers are incorrect.",
        score: isCorrect ? "green" : "red",
        submitted_at: answerData.submitted_at,
        self_assessed: true,
        teacher_score: null,
        teacher_feedback: null,
      }

      setAnswer(newAnswer)
      setSelfAssessmentScore(isCorrect ? "green" : "red")
    } catch (error) {
      console.error("Error saving fill in the blank answer:", error)
    }
  }

  const handleMatchingAnswer = async (selections: Record<string, string[]>) => {
    if (!question) return

    const isCorrect = question.pairs?.every(pair =>
      selections[pair.statement]?.includes(pair.match)
    ) || false

    if (!user) {
      setAnswer({
        id: "anon",
        question_id: question.id,
        student_id: "anon",
        response_text: JSON.stringify(selections),
        ai_feedback: isCorrect ? "Well done! You matched all items correctly." : "Some matches are incorrect. Try again!",
        score: isCorrect ? "green" : "red",
        submitted_at: new Date().toISOString(),
        self_assessed: true,
        teacher_score: null,
        teacher_feedback: null,
      })
      setSelfAssessmentScore(isCorrect ? "green" : "red")
      return
    }

    try {
      const { data: answerData, error: insertError } = await supabase
        .from('student_answers')
        .insert({
          student_id: user.id,
          question_id: question.id,
          response_text: JSON.stringify(selections),
          ai_feedback: isCorrect ? "Well done! You matched all items correctly." : "Some matches are incorrect. Try again!",
          student_score: isCorrect ? "green" : "red",
          self_assessed: true,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw insertError

      const newAnswer: Answer = {
        id: answerData.id,
        question_id: question.id,
        student_id: user.id,
        response_text: JSON.stringify(selections),
        ai_feedback: isCorrect ? "Well done! You matched all items correctly." : "Some matches are incorrect. Try again!",
        score: isCorrect ? "green" : "red",
        submitted_at: answerData.submitted_at,
        self_assessed: true,
        teacher_score: null,
        teacher_feedback: null,
      }

      setAnswer(newAnswer)
      setSelfAssessmentScore(isCorrect ? "green" : "red")
    } catch (error) {
      console.error("Error saving matching answer:", error)
    }
  }

  const handleTrueFalseAnswer = async (answerValue: boolean) => {
    if (!question) return

    const isCorrect = answerValue === question.model_answer

    if (!user) {
      setAnswer({
        id: "anon",
        question_id: question.id,
        student_id: "anon",
        response_text: answerValue ? "true" : "false",
        ai_feedback: isCorrect ? "Correct! Well done!" : "Incorrect. Try to understand why this is wrong.",
        score: isCorrect ? "green" : "red",
        submitted_at: new Date().toISOString(),
        self_assessed: true,
        teacher_score: null,
        teacher_feedback: null,
      })
      setSelfAssessmentScore(isCorrect ? "green" : "red")
      return
    }

    try {
      const { data: answerData, error: insertError } = await supabase
        .from('student_answers')
        .insert({
          student_id: user.id,
          question_id: question.id,
          response_text: answerValue ? "true" : "false",
          ai_feedback: isCorrect ? "Correct! Well done!" : "Incorrect. Try to understand why this is wrong.",
          student_score: isCorrect ? "green" : "red",
          self_assessed: true,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw insertError

      const newAnswer: Answer = {
        id: answerData.id,
        question_id: question.id,
        student_id: user.id,
        response_text: answerValue ? "true" : "false",
        ai_feedback: isCorrect ? "Correct! Well done!" : "Incorrect. Try to understand why this is wrong.",
        score: isCorrect ? "green" : "red",
        submitted_at: answerData.submitted_at,
        self_assessed: true,
        teacher_score: null,
        teacher_feedback: null,
      }

      setAnswer(newAnswer)
      setSelfAssessmentScore(isCorrect ? "green" : "red")
    } catch (error) {
      console.error("Error saving true/false answer:", error)
    }
  }

  // Mock feedback generator - this would be replaced by actual AI API call
  const generateMockFeedback = (response: string, question: Question) => {
    /* TODO: create AI feedback connnection */
    // Very basic mock logic - in reality this would be an AI model
    const responseLength = response.length

    // For true/false questions, we don't need keyword matching
    if (question.type === 'true-false') {
      return {
        feedback: "Your answer has been recorded.",
        score: "green" as ScoreType,
      }
    }

    // For other question types, use keyword matching
    const modelAnswer = typeof question.model_answer === 'string'
      ? question.model_answer
      : Array.isArray(question.model_answer)
        ? question.model_answer.join(" ")
        : String(question.model_answer)
    const hasKeywords = modelAnswer
      .split(" ")
      .some((word: string) => response.toLowerCase().includes(word))

    if (responseLength < 10) {
      return {
        feedback: "Your answer is too short. Please provide more detail.",
        score: "red" as ScoreType,
      }
    } else if (!hasKeywords) {
      return {
        feedback: "Your answer is missing key concepts. Try to include more specific terminology.",
        score: "amber" as ScoreType,
      }
    } else {
      return {
        feedback: "Great answer! You've covered the key points and demonstrated good understanding.",
        score: "green" as ScoreType,
      }
    }
  }

  const handleQuestionTypeChange = (type: string | null) => {
    setSelectedQuestionType(type)
    setAnswer(null)
    setSelfAssessmentScore(null)
    setHasStartedAnswering(false)
  }

  const handleQuestionDifficultyChange = (difficulty: string | null) => {
    setSelectedQuestionDifficulty(difficulty)
    setAnswer(null)
    setSelfAssessmentScore(null)
    setHasStartedAnswering(false)
  }

  const handleStartAnswering = () => {
    setHasStartedAnswering(true)
  }

  if (isLoading) {
    return <QuestionSkeleton />
  }

  if (!topic) {
    console.log("No topic found:", { topic })
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Topic not found</CardTitle>
            <CardDescription>The topic you&apos;re looking for doesn&apos;t exist or has no questions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Topics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent copy (Ctrl+C), paste (Ctrl+V), and cut (Ctrl+X) on the entire page
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
      e.preventDefault()
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <div
      className="container mx-auto px-4 py-8 question-page"
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Topics
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-3xl font-bold mt-4 mb-2">{topic.name}</h1>
            <UserLogin email={user?.email} />
          </div>
        </div>

        {/* Filters Container */}
        {canAccessFilters({ user_type: userType || 'anonymous' }) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Subtopic Filter Card */}
            <Card>
              <CardHeader className="hidden sm:block">
                <CardTitle>Filter by Subtopic</CardTitle>
                <CardDescription>Select one or more subtopics to focus your practice</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                    <SubtopicFilter
                      selectedSubtopics={selectedSubtopics}
                      onSubtopicChange={setSelectedSubtopics}
                      subtopics={subtopics}
                    />
              </CardContent>
            </Card>

            {/* Question Type Filter Card */}
            <Card>
              <CardHeader className="hidden sm:block">
                <CardTitle>Filter by Type</CardTitle>
                <CardDescription>Choose question types to practice</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <QuestionTypeFilter
                  selectedType={selectedQuestionType}
                  onTypeChange={handleQuestionTypeChange}
                  availableTypes={availableQuestionTypes}
                />
              </CardContent>
            </Card>

            {/* Question Difficulty Filter Card */}
            <Card>
              <CardHeader className="hidden sm:block">
                <CardTitle>Filter by Difficulty</CardTitle>
                <CardDescription>Choose question difficulty to practice</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <QuestionDifficultyFilter
                  selectedDifficulty={selectedQuestionDifficulty}
                  onDifficultyChange={handleQuestionDifficultyChange}
                  availableDifficulty={availableQuestionDifficulty}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* CTA Banner */}
        <div className="mb-6 md:mb-8">
          {freeUser && <CTABanner variant="free" userEmail={user?.email} />}
          {userType === 'basic' && <CTABanner variant="basic" userEmail={user?.email} />}
          {userType === 'revision' && <CTABanner variant="premium" userEmail={user?.email} />}
        </div>

        {!question ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>No Questions Available</CardTitle>
              <CardDescription>
                {selectedQuestionType
                  ? `There are no ${selectedQuestionType} questions available for the selected subtopics.`
                  : "There are no questions available for the selected subtopics."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Please try adjusting your filters by:
              </p>
              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                <li>Selecting different subtopics</li>
                <li>Choosing a different question type</li>
                <li>Clearing your filters to see all available questions</li>
              </ul>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Question</CardTitle>
                {canSkipQuestions({ user_type: userType || 'anonymous' }) && !hasStartedAnswering && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSkipQuestion}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <SkipForward className="mr-2 h-4 w-4" />
                    Skip Question
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-lg whitespace-pre-wrap">{question.question_text}</p>
              </div>
              {!answer ? (
                question.type === "multiple-choice" ? (
                  <MultipleChoiceQuestion
                    key={question.id}
                    options={question.options || []}
                    correctAnswerIndex={question.correctAnswerIndex || 0}
                    onAnswerSelected={(...args) => { handleStartAnswering(); handleMultipleChoiceAnswer(...args); }}
                  />
                ) : question.type === "fill-in-the-blank" ? (
                  <FillInTheBlankQuestion
                    key={question.id}
                    question={question}
                    onAnswerSelected={(...args) => { handleStartAnswering(); handleFillInTheBlankAnswer(...args); }}
                  />
                ) : (question.type === "code" || question.type === "algorithm" || question.type === "sql") ? (
                  <CodeQuestion
                    key={question.id}
                    onSubmit={(...args) => { handleStartAnswering(); handleSubmitAnswer(...args); }}
                    disabled={isSubmitting}
                  />
                ) : question.type === "matching" ? (
                  <MatchingQuestion
                    key={question.id}
                    question={question}
                    onSubmit={(...args) => { handleStartAnswering(); handleMatchingAnswer(...args); }}
                    disabled={isSubmitting}
                  />
                ) : question.type === "true-false" ? (
                  <TrueFalseQuestion
                    key={question.id}
                    question={question}
                    onSubmit={(...args) => { handleStartAnswering(); handleTrueFalseAnswer(...args); }}
                    disabled={isSubmitting}
                  />
                ) : question.type === "text" || question.type === "short-answer" ? (
                  <TextQuestion
                    key={question.id}
                    onSubmit={(...args) => { handleStartAnswering(); handleSubmitAnswer(...args); }}
                    disabled={isSubmitting}
                    keywords={question.keywords}
                  />
                ) : question.type === "essay" ? (
                  <EssayQuestion
                    key={question.id}
                    onSubmit={(...args) => { handleStartAnswering(); handleSubmitAnswer(...args); }}
                    disabled={isSubmitting}
                    minWords={20}
                    maxWords={500}
                    keywords={question.keywords}
                  />
                ) : null
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-muted rounded-md">
                    <h3 className="font-medium mb-2">Your Answer:</h3>
                    {question.type === "matching" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="overflow-x-auto">
                          <h3 className="font-medium mb-2">Your Answer:</h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border p-2 text-left">Statement</th>
                                <th className="border p-2 text-left">Your Match</th>
                              </tr>
                            </thead>
                            <tbody>
                              {question.pairs?.map((pair, index) => {
                                const userMatches = (() => {
                                  if (!answer?.response_text) return [];
                                  try {
                                    const parsed = JSON.parse(answer.response_text) as Record<string, string[]>;
                                    return parsed[pair.statement] || [];
                                  } catch {
                                    return [];
                                  }
                                })();
                                const isCorrect = userMatches.includes(pair.match);
                                return (
                                  <tr key={index} className={isCorrect ? "bg-green-50" : "bg-red-50"}>
                                    <td className="border p-2">{pair.statement}</td>
                                    <td className="border p-2">
                                      <div className="flex items-center gap-2">
                                        {userMatches.join(", ") || "No match selected"}
                                        {isCorrect ? (
                                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        ) : (
                                          <XCircle className="h-4 w-4 text-red-600" />
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="overflow-x-auto">
                          <h3 className="font-medium mb-2 text-emerald-700">Correct Answer:</h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border p-2 text-left">Statement</th>
                                <th className="border p-2 text-left">Correct Match</th>
                              </tr>
                            </thead>
                            <tbody>
                              {question.pairs?.map((pair, index) => (
                                <tr key={index} className="bg-emerald-50">
                                  <td className="border p-2">{pair.statement}</td>
                                  <td className="border p-2">{pair.match}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : question.type === "true-false" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="overflow-x-auto">
                          <h3 className="font-medium mb-2">Your Answer:</h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border p-2 text-left">Question</th>
                                <th className="border p-2 text-center">Your Answer</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className={answer?.response_text === String(question.model_answer) ? "bg-green-50" : "bg-red-50"}>
                                <td className="border p-2">{question.question_text}</td>
                                <td className="border p-2 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    {answer?.response_text === "true" ? "True" : "False"}
                                    {answer?.response_text === String(question.model_answer) ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="overflow-x-auto">
                          <h3 className="font-medium mb-2 text-emerald-700">Correct Answer:</h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border p-2 text-left">Question</th>
                                <th className="border p-2 text-center">Correct Answer</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="bg-emerald-50">
                                <td className="border p-2">{question.question_text}</td>
                                <td className="border p-2 text-center">
                                  {typeof question.model_answer === 'boolean' ? (question.model_answer ? "True" : "False") : (question.model_answer === "true" ? "True" : "False")}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : question.type === "multiple-choice" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="overflow-x-auto">
                          <h3 className="font-medium mb-2">Your Answer:</h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border p-2 text-left">Question</th>
                                <th className="border p-2 text-center">Your Answer</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className={answer?.response_text === String(question.correctAnswerIndex) ? "bg-green-50" : "bg-red-50"}>
                                <td className="border p-2">{question.question_text}</td>
                                <td className="border p-2 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    {question.options?.[parseInt(answer?.response_text || "0")] || "No answer selected"}
                                    {answer?.response_text === String(question.correctAnswerIndex) ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="overflow-x-auto">
                          <h3 className="font-medium mb-2 text-emerald-700">Correct Answer:</h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border p-2 text-left">Question</th>
                                <th className="border p-2 text-center">Correct Answer</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="bg-emerald-50">
                                <td className="border p-2">{question.question_text}</td>
                                <td className="border p-2 text-center">
                                  {question.options?.[question.correctAnswerIndex || 0]}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : question.type === "fill-in-the-blank" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="overflow-x-auto">
                          <h3 className="font-medium mb-2">Your Answer:</h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border p-2 text-left">Question</th>
                                <th className="border p-2 text-center">Your Answer</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border p-2">{question.question_text}</td>
                                <td className="border p-2">
                                  {(() => {
                                    try {
                                      const selectedIndexes = JSON.parse(answer?.response_text || "[]") as number[];
                                      const selectedOptions = selectedIndexes.map(index => question.options?.[index]);
                                      const modelAnswer = Array.isArray(question.model_answer) ? question.model_answer : [question.model_answer];

                                      return (
                                        <div className="space-y-2">
                                          {selectedOptions.map((option, i) => {
                                            const isOptionCorrect = question.order_important
                                              ? option === modelAnswer[i]
                                              : option ? modelAnswer.includes(option) : false;
                                            return (
                                              <div key={i} className={`flex items-center gap-2 ${isOptionCorrect ? "text-green-600" : "text-red-600"}`}>
                                                {option || "No answer selected"}
                                                {isOptionCorrect ? (
                                                  <CheckCircle2 className="h-4 w-4" />
                                                ) : (
                                                  <XCircle className="h-4 w-4" />
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      );
                                    } catch {
                                      return "Invalid answer format";
                                    }
                                  })()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="overflow-x-auto">
                          <h3 className="font-medium mb-2 text-emerald-700">Correct Answer:</h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="border p-2 text-left">Question</th>
                                <th className="border p-2 text-center">Correct Answer</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border p-2">{question.question_text}</td>
                                <td className="border p-2">
                                  {Array.isArray(question.model_answer) ? (
                                    <div className="space-y-2">
                                      {question.model_answer.map((answer, i) => (
                                        <div key={i} className="text-emerald-600">
                                          {answer}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    "No correct answer available"
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-sm">{answer?.response_text}</pre>
                    )}
                  </div>

                  {/* For free version, show model answer first, then self-assessment */}
                  {answer && (
                    <>
                      {/* Keywords display for short-answer and essay questions */}
                      {(question.type === "short-answer" || question.type === "text" || question.type === "essay") && question.keywords && question.keywords.length > 0 && (
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
                          <h3 className="font-medium mb-2 text-blue-800">Keywords to include:</h3>
                          <div className="flex flex-wrap gap-2">
                            {question.keywords.map((keyword, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-md">
                        <h3 className="font-medium mb-2 text-emerald-700">Model Answer:</h3>
                        <div className="space-y-4">
                          <div>
                            {(question.type === "code" || question.type === "algorithm" || question.type === "sql") && (
                              <h4 className="text-sm font-medium mb-1">Pseudocode:</h4>
                            )}
                            {question.type === "matching" ? (
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr>
                                      <th className="border p-2 text-left">Statement</th>
                                      <th className="border p-2 text-left">Correct Match</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {question.pairs?.map((pair, index) => (
                                      <tr key={index}>
                                        <td className="border p-2">{pair.statement}</td>
                                        <td className="border p-2">{pair.match}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : question.type === "true-false" ? (
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr>
                                      <th className="border p-2 text-left">Question</th>
                                      <th className="border p-2 text-center">Correct Answer</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td className="border p-2">{question.question_text}</td>
                                      <td className="border p-2 text-center">
                                        {typeof question.model_answer === 'boolean' ? (question.model_answer ? "True" : "False") : (question.model_answer === "true" ? "True" : "False")}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            ) : question.type === "fill-in-the-blank" && Array.isArray(question.model_answer) ? (
                              question.order_important ? (
                                <ol className="font-sans text-sm pl-4 list-decimal">
                                  {question.model_answer.map((ans, idx) => (
                                    <li key={idx}>{ans}</li>
                                  ))}
                                </ol>
                              ) : (
                                <ul className="font-sans text-sm pl-4 list-disc">
                                  {question.model_answer.map((ans, idx) => (
                                    <li key={idx}>{ans}</li>
                                  ))}
                                </ul>
                              )
                            ) : question.type === "multiple-choice" ? (
                              <div className="space-y-2">
                                <p className="font-medium">Correct Answer:</p>
                                <p>{question.options?.[question.correctAnswerIndex || 0]}</p>
                              </div>
                            ) : question.type === "short-answer" || question.type === "text" || question.type === "essay" ? (
                              <pre className="whitespace-pre-wrap font-sans text-sm">{question.model_answer}</pre>
                            ) : (
                              <pre className="whitespace-pre-wrap font-sans text-sm">{question.model_answer}</pre>
                            )}
                          </div>
                          {question.model_answer_code && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Python:</h4>
                              <pre className="whitespace-pre-wrap font-sans text-sm">{question.model_answer_code}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                      {question.explanation && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-md">
                          <p className="whitespace-pre-wrap text-sm text-emerald-700">{question.explanation}</p>
                        </div>
                      )}
                      {!selfAssessmentScore ? (
                        <SelfAssessment onSelectScore={handleSelfAssessment} />
                      ) : (
                        <FeedbackDisplay answer={answer} />
                      )}
                    </>
                  )}

                  {/* For paid version, show AI feedback, then model answer */}
                  {userType === "revisionAI" && (
                    <>
                      <FeedbackDisplay answer={answer} />

                      {/* Keywords display for short-answer and essay questions */}
                      {(question.type === "short-answer" || question.type === "text" || question.type === "essay") && question.keywords && question.keywords.length > 0 && (
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
                          <h3 className="font-medium mb-2 text-blue-800">Keywords to include:</h3>
                          <div className="flex flex-wrap gap-2">
                            {question.keywords.map((keyword, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-md">
                        <h3 className="font-medium mb-2 text-emerald-700">Model Answer:</h3>
                        <div className="space-y-4">
                          <div>
                            {(question.type === "code" || question.type === "algorithm" || question.type === "sql") && (
                              <h4 className="text-sm font-medium mb-1">Pseudocode:</h4>
                            )}
                            {question.type === "matching" ? (
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr>
                                      <th className="border p-2 text-left">Statement</th>
                                      <th className="border p-2 text-left">Correct Match</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {question.pairs?.map((pair, index) => (
                                      <tr key={index}>
                                        <td className="border p-2">{pair.statement}</td>
                                        <td className="border p-2">{pair.match}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : question.type === "true-false" ? (
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr>
                                      <th className="border p-2 text-left">Question</th>
                                      <th className="border p-2 text-center">Correct Answer</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td className="border p-2">{question.question_text}</td>
                                      <td className="border p-2 text-center">
                                        {typeof question.model_answer === 'boolean' ? (question.model_answer ? "True" : "False") : (question.model_answer === "true" ? "True" : "False")}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            ) : question.type === "fill-in-the-blank" && Array.isArray(question.model_answer) ? (
                              question.order_important ? (
                                <ol className="font-sans text-sm pl-4 list-decimal">
                                  {question.model_answer.map((ans, idx) => (
                                    <li key={idx}>{ans}</li>
                                  ))}
                                </ol>
                              ) : (
                                <ul className="font-sans text-sm pl-4 list-disc">
                                  {question.model_answer.map((ans, idx) => (
                                    <li key={idx}>{ans}</li>
                                  ))}
                                </ul>
                              )
                            ) : (
                              <pre className="whitespace-pre-wrap font-sans text-sm">{question.model_answer}</pre>
                            )}
                          </div>
                          {question.model_answer_code && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">{question.language}:</h4>
                              <pre className="whitespace-pre-wrap font-sans text-sm">{question.model_answer_code}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                      {question.explanation && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-md">
                          <p className="whitespace-pre-wrap text-sm text-emerald-700">{question.explanation}</p>
                        </div>
                      )}
                      {!selfAssessmentScore ? (
                        <SelfAssessment onSelectScore={handleSelfAssessment} />
                      ) : (
                        <FeedbackDisplay answer={answer} />
                      )}
                    </>
                  )}

                  {/* For unauthenticated users, show model answer first, then self-assessment but remove try again buttons and progress link */}

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      onClick={handleTryAnother}
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={!userType || !selfAssessmentScore}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Try Another Question
                    </Button>

                    {(userType && selfAssessmentScore) ? (
                      <Link href="/progress">
                        <Button variant="outline">View My Progress</Button>
                      </Link>
                    ) : (
                      <Button variant="outline" disabled>View My Progress</Button>
                    )}
                  </div>

                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

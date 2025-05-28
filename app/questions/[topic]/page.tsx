"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { FeedbackDisplay } from "@/components/feedback-display"
import { SelfAssessment } from "@/components/self-assessment"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { saveAnswer, currentUser } from "@/lib/data"
import type { Question, Answer, ScoreType, Topic } from "@/lib/types"
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { MultipleChoiceQuestion } from "@/components/multiple-choice-question"
import { FillInTheBlankQuestion } from "@/components/fill-in-the-blank-question"
import { TextQuestion } from "@/components/text-question"
import { CodeQuestion } from "@/components/code-question"
import { MatchingQuestion } from "@/components/matching-question"
import { TrueFalseQuestion } from "@/components/true-false-question"
import { EssayQuestion } from "@/components/essay-question"
import { createClient } from "@/utils/supabase/client"
import { CTABanner } from "@/components/cta-banner"
import { UserLogin } from "@/components/user-login"
import { User } from "@supabase/supabase-js"

// Define types for the database responses
interface DBQuestion {
  id: string;
  type: string;
  question_text: string;
  explanation?: string;
  created_at: string;
  model_answer?: string;
  multiple_choice_questions?: {
    options: string[];
    correct_answer_index: number;
    model_answer?: string;
  }[];
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
  }[];
  code_questions?: {
    starter_code?: string;
    model_answer?: string;
    language?: string;
    model_answer_code?: string;
  };
  short_answer_questions?: {
    model_answer: string;
  };
  essay_questions?: {
    model_answer?: string;
    rubric?: string;
  };
}

interface DBSubtopicQuestionLink {
  questions: DBQuestion;
}

interface DBSubtopic {
  subtopic_question_link: DBSubtopicQuestionLink[];
}

// Helper functions to interact with the database
export async function getTopicBySlug(slug: string): Promise<Topic | undefined> {
  const supabase = createClient()

  const { data: topic, error } = await supabase
    .from('topics')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !topic) {
    console.error('Error fetching topic:', error)
    return undefined
  }

  return topic as Topic
}

// Add this helper function before getRandomQuestionForTopic
function transformQuestion(dbQuestion: DBQuestion, topicName: string): Question {
  console.log('Fill in the blank data:', {
    type: dbQuestion.type,
    fillInTheBlankData: dbQuestion.fill_in_the_blank_questions,
    options: dbQuestion.fill_in_the_blank_questions?.options,
    orderImportant: dbQuestion.fill_in_the_blank_questions?.order_important
  });


  return {
    id: dbQuestion.id,
    type: dbQuestion.type as Question['type'],
    topic: topicName,
    question_text: dbQuestion.question_text,
    explanation: dbQuestion.explanation,
    created_at: dbQuestion.created_at,
    // Map model_answer based on question type
    model_answer: (() => {
      switch (dbQuestion.type) {
        case 'multiple-choice':
          return dbQuestion.multiple_choice_questions?.[0]?.model_answer || '';
        case 'fill-in-the-blank':
          return dbQuestion.fill_in_the_blank_questions?.model_answer || '';
        case 'matching':
          return dbQuestion.matching_questions?.[0]?.model_answer || '';
        case 'true-false':
          return dbQuestion.true_false_questions?.[0]?.model_answer?.toString() || '';
        case 'code':
          return dbQuestion.code_questions?.model_answer || '';
        case 'short-answer':
          return dbQuestion.short_answer_questions?.model_answer || '';
        case 'essay':
          return dbQuestion.essay_questions?.model_answer || '';
        default:
          return '';
      }
    })(),
    // Add type-specific data
    ...(dbQuestion.type === 'multiple-choice' && dbQuestion.multiple_choice_questions?.[0] && {
      options: dbQuestion.multiple_choice_questions[0].options,
      correctAnswerIndex: dbQuestion.multiple_choice_questions[0].correct_answer_index
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
    ...(dbQuestion.type === 'code' && dbQuestion.code_questions && {
      model_answer_python: dbQuestion.code_questions.model_answer_code,
      language: dbQuestion.code_questions.language
    })
  };
}

export async function getRandomQuestionForTopic(topicId: string, freeUser: boolean, userType: "revision" | "revisionAI" | "basic" | null): Promise<Question> {
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
  const { data: questions, error: questionsError } = await supabase
    .from('subtopics')
    .select(`
      id,
      subtopictitle,
      subtopic_question_link (
        questions (
          id,
          type,
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
            model_answer
          ),
          essay_questions (
            model_answer,
            rubric
          )
        )
      )
    `)
    .eq('topic_id', topicId)

  console.log('Raw questions data:', JSON.stringify(questions, null, 2));

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



  // Determine the number of questions based on access level
  let length: number
  if (userType === "revision" || userType === "revisionAI") {
    length = allQuestions.length
  } else if (userType === "basic") {
    length = allQuestions.length // full access
  } else {
    length = allQuestions.length // full access
  }

  const randomIndex = Math.floor(Math.random() * length)
  return allQuestions[randomIndex]



}

export async function getQuestionById(questionId: string): Promise<Question | undefined> {
  const supabase = createClient()

  const { data: question, error } = await supabase
    .from('questions')
    .select(`
      id,
      type,
      question_text,
      explanation,
      created_at,
      subtopic_id,
      subtopics!inner (
        topics (
          name
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
        model_answer
      ),
      essay_questions (
        model_answer,
        rubric
      )
    `)
    .eq('id', questionId)
    .single()

  if (error || !question) {
    return undefined
  }

  const topicName = question.subtopics?.[0]?.topics?.[0]?.name || ''

  // Transform the question using the shared function
  return transformQuestion(question as unknown as DBQuestion, topicName)
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
  const [userType, setUserType] = useState<"revision" | "revisionAI" | "basic" | null>(null)
  const [isLoadingUserType, setIsLoadingUserType] = useState(true)
  const [freeUser, setFreeUser] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  // const [hasPaid, setHasPaid] = useState(false)

  // const freeUser = currentUser.email === "student@example.com"

  const supabase = createClient()

  //TODO: put this into a hook?? or into data.ts??
  useEffect(() => {
    const checkHasPaid = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setFreeUser(true)
        setIsLoadingUserType(false)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('userid', user.id)
        .single()

      if (!data) {
        setUserType(null)
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
  }, [supabase, topicSlug])

  useEffect(() => {
    if (isLoadingUserType) return

    const loadQuestion = async () => {
      try {
        const currentTopic = await getTopicBySlug(topicSlug)
        console.log("Current topic:", currentTopic)
        setTopic(currentTopic || null)

        if (currentTopic) {
          let newQuestion: Question
          if (questionId) {
            const question = await getQuestionById(questionId)
            if (question) {
              newQuestion = question
            } else {
              newQuestion = await getRandomQuestionForTopic(currentTopic.id, freeUser, userType)
            }
          } else {
            newQuestion = await getRandomQuestionForTopic(currentTopic.id, freeUser, userType)
          }

          setQuestion(newQuestion)
          setAnswer(null)
          setSelfAssessmentScore(null)
        }
      } catch (error) {
        console.error("Error loading question:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestion()
  }, [topicSlug, isLoadingUserType, userType, freeUser, questionId])

  const handleSubmitAnswer = async (responseText: string) => {
    if (!question || !user) return

    setIsSubmitting(true)

    try {
      // Create initial answer record
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
        // Paid version - use AI feedback
        /* TODO: setup supabase AI connection */
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Mock AI feedback generation
        const mockFeedback = generateMockFeedback(responseText, question)

        // Update the answer with AI feedback
        const { error: updateError } = await supabase
          .from('student_answers')
          .update({
            ai_feedback: mockFeedback.feedback,
            ai_score: mockFeedback.score
          })
          .eq('id', answerData.id)

        if (updateError) throw updateError

        setAnswer({
          id: answerData.id,
          question_id: question.id,
          student_id: user.id,
          response_text: responseText,
          ai_feedback: mockFeedback.feedback,
          score: mockFeedback.score,
          submitted_at: answerData.submitted_at,
          self_assessed: false,
        })
      } else {
        // Free version - just set the basic answer
        setAnswer({
          id: answerData.id,
          question_id: question.id,
          student_id: user.id,
          response_text: responseText,
          ai_feedback: null,
          score: "amber", // Placeholder, will be updated after self-assessment
          submitted_at: answerData.submitted_at,
          self_assessed: false,
        })
      }

      // Track question submission
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
      const newQuestion = await getRandomQuestionForTopic(topic.id, freeUser, userType)
      setQuestion(newQuestion)
      setAnswer(null)
      setSelfAssessmentScore(null)
    } catch (error) {
      console.error("Error loading new question:", error)
    }
  }

  const handleMultipleChoiceAnswer = async (isCorrect: boolean) => {
    if (!question || !user) return

    try {
      const { data: answerData, error: insertError } = await supabase
        .from('student_answers')
        .insert({
          student_id: user.id,
          question_id: question.id,
          response_text: isCorrect ? "Correct" : "Incorrect",
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
        response_text: isCorrect ? "Correct" : "Incorrect",
        ai_feedback: isCorrect ? "Well done! You selected the correct answer." : "Try to understand why this answer is incorrect.",
        score: isCorrect ? "green" : "red",
        submitted_at: answerData.submitted_at,
        self_assessed: true,
      }

      setAnswer(newAnswer)
      setSelfAssessmentScore(isCorrect ? "green" : "red")
    } catch (error) {
      console.error("Error saving multiple choice answer:", error)
    }
  }

  const handleFillInTheBlankAnswer = async (isCorrect: boolean) => {
    if (!question || !user) return

    try {
      const { data: answerData, error: insertError } = await supabase
        .from('student_answers')
        .insert({
          student_id: user.id,
          question_id: question.id,
          response_text: isCorrect ? "Correct" : "Incorrect",
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
        response_text: isCorrect ? "Correct" : "Incorrect",
        ai_feedback: isCorrect ? "Well done! You selected the correct answers." : "Try to understand why these answers are incorrect.",
        score: isCorrect ? "green" : "red",
        submitted_at: answerData.submitted_at,
        self_assessed: true,
      }

      setAnswer(newAnswer)
      setSelfAssessmentScore(isCorrect ? "green" : "red")
    } catch (error) {
      console.error("Error saving fill in the blank answer:", error)
    }
  }

  const handleMatchingAnswer = async (selections: Record<string, string[]>) => {
    if (!question || !user) return

    const isCorrect = question.pairs?.every(pair =>
      selections[pair.statement]?.includes(pair.match)
    ) || false

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
      }

      setAnswer(newAnswer)
      setSelfAssessmentScore(isCorrect ? "green" : "red")
    } catch (error) {
      console.error("Error saving matching answer:", error)
    }
  }

  const handleTrueFalseAnswer = async (answer: boolean) => {
    if (!question || !user) return

    const isCorrect = answer === (question.model_answer === "true")

    try {
      const { data: answerData, error: insertError } = await supabase
        .from('student_answers')
        .insert({
          student_id: user.id,
          question_id: question.id,
          response_text: answer ? "true" : "false",
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
        response_text: answer ? "true" : "false",
        ai_feedback: isCorrect ? "Correct! Well done!" : "Incorrect. Try to understand why this is wrong.",
        score: isCorrect ? "green" : "red",
        submitted_at: answerData.submitted_at,
        self_assessed: true,
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
    const modelAnswer = Array.isArray(question.model_answer)
      ? question.model_answer.join(" ")
      : question.model_answer
    const hasKeywords = modelAnswer
      .toLowerCase()
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Loading question...</CardTitle>
            <CardDescription>Please wait while we prepare your question.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!topic || !question) {
    console.log("No topic or question found:", { topic, question })
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


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Topics
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-3xl font-bold mt-4 mb-2">{topic.name}</h1>
            <UserLogin email={user?.email} />
          </div>


          <p className="text-muted-foreground">{topic.description}</p>
        </div>

        {/* <div className="mb-6 md:mb-8">
          {freeUser && <CTABanner variant="free" />}
          {!freeUser && userType === "basic" && <CTABanner variant="basic" />}
          {!freeUser && userType === "revisionAI" && <CTABanner variant="premium" />}
        </div> */}
        {/* CTA Banner */}
        <div className="mb-6 md:mb-8">
          {freeUser && <CTABanner variant="free" />}
          {userType === 'basic' && <CTABanner variant="basic" />}
          {userType === 'revision' && <CTABanner variant="premium" />}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Question</CardTitle>

          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-lg whitespace-pre-wrap">{question.question_text}</p>
            </div>
            {!answer ? (
              question.type === "multiple-choice" ? (
                <MultipleChoiceQuestion
                  options={question.options || []}
                  correctAnswerIndex={question.correctAnswerIndex || 0}
                  onAnswerSelected={handleMultipleChoiceAnswer}
                />
              ) : question.type === "fill-in-the-blank" ? (
                <FillInTheBlankQuestion
                  question={question}
                  onAnswerSelected={handleFillInTheBlankAnswer}
                />
              ) : question.type === "code" ? (
                <CodeQuestion
                  onSubmit={handleSubmitAnswer}
                  disabled={isSubmitting}
                />
              ) : question.type === "matching" ? (
                <MatchingQuestion
                  question={question}
                  onSubmit={handleMatchingAnswer}
                  disabled={isSubmitting}
                />
              ) : question.type === "true-false" ? (
                <TrueFalseQuestion
                  question={question}
                  onSubmit={handleTrueFalseAnswer}
                  disabled={isSubmitting}
                />
              ) : question.type === "text" || question.type === "short-answer" ? (
                <TextQuestion
                  onSubmit={handleSubmitAnswer}
                  disabled={isSubmitting}
                />
              ) : question.type === "essay" ? (
                <EssayQuestion
                  onSubmit={handleSubmitAnswer}
                  disabled={isSubmitting}
                  minWords={20}
                  maxWords={500}
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
                            <tr className={answer?.response_text === question.model_answer ? "bg-green-50" : "bg-red-50"}>
                              <td className="border p-2">{question.question_text}</td>
                              <td className="border p-2 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {answer?.response_text ? (answer.response_text === "true" ? "True" : "False") : "No answer"}
                                  {answer?.response_text === question.model_answer ? (
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
                                {question.model_answer === "true" ? "True" : "False"}
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
                {userType && (
                  <>
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-md">
                      <h3 className="font-medium mb-2 text-emerald-700">Model Answer:</h3>
                      <div className="space-y-4">
                        <div>
                          {question.type === "code" && (
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
                                      {question.model_answer === "true" ? "True" : "False"}
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
                        {question.model_answer_python && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Python:</h4>
                            <pre className="whitespace-pre-wrap font-sans text-sm">{question.model_answer_python}</pre>
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

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-md">
                      <h3 className="font-medium mb-2 text-emerald-700">Model Answer:</h3>
                      <div className="space-y-4">
                        <div>
                          {question.type === "code" && (
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
                                      {question.model_answer === "true" ? "True" : "False"}
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
                        {question.model_answer_python && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Python:</h4>
                            <pre className="whitespace-pre-wrap font-sans text-sm">{question.model_answer_python}</pre>
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

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    onClick={handleTryAnother}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={!selfAssessmentScore}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Try Another Question
                  </Button>
                  <Link href="/progress">
                    <Button variant="outline">View My Progress</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

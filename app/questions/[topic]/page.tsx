"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { FeedbackDisplay } from "@/components/feedback-display"
import { SelfAssessment } from "@/components/self-assessment"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRandomQuestionForTopic, getTopicBySlug, saveAnswer, currentUser, getQuestionById } from "@/lib/data"
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

export default function QuestionPage() {
  const params = useParams()
  const topicSlug = params.topic as string

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
      setIsLoadingUserType(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setUserType(null)
        setIsLoadingUserType(false)
        return
      }

      if (user) {
        setUser(user)
        await supabase.from('user_activity').insert({
          user_id: user.id,
          event: 'visited_question',
          path: '/questions/' + topicSlug,
          user_email: user.email
        })
      } else {
        setUser(null)
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("userid", user.id)
        .single()

      if (error || !data) {
        setUserType(null)
        setIsLoadingUserType(false)
        return
      }

      setUserType(data.user_type)
      setUser(user)
      setFreeUser(false)
      setIsLoadingUserType(false)
    }
    checkHasPaid()
  }, [])

  useEffect(() => {
    if (isLoadingUserType) return

    try {
      const currentTopic = getTopicBySlug(topicSlug)
      console.log("Current topic:", currentTopic)
      setTopic(currentTopic || null)

      if (currentTopic) {
        const searchParams = new URLSearchParams(window.location.search)
        const questionId = searchParams.get("questionId")

        let newQuestion: Question
        if (questionId) {
          newQuestion = getQuestionById(questionId) || getRandomQuestionForTopic(topicSlug, freeUser, userType)
        } else {
          newQuestion = getRandomQuestionForTopic(topicSlug, freeUser, userType)
        }

        console.log("Loaded question:", {
          id: newQuestion.id,
          type: newQuestion.type,
          text: newQuestion.question_text,
          options: newQuestion.options,
          correctAnswerIndex: newQuestion.correctAnswerIndex
        })
        setQuestion(newQuestion)
        setAnswer(null)
        setSelfAssessmentScore(null)
      }
    } catch (error) {
      console.error("Error loading question:", error)
    } finally {
      setIsLoading(false)
    }
  }, [topicSlug, isLoadingUserType, userType, freeUser])

  const handleSubmitAnswer = async (responseText: string) => {
    if (!question) return

    setIsSubmitting(true)

    if (userType === "revisionAI") {
      // Paid version - use AI feedback
      /* TODO: setup supabase AI connection */
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock AI feedback generation
      const mockFeedback = generateMockFeedback(responseText, question)

      const newAnswer: Answer = {
        id: crypto.randomUUID(),
        question_id: question.id,
        student_id: currentUser.id,
        response_text: responseText,
        ai_feedback: mockFeedback.feedback,
        score: mockFeedback.score,
        submitted_at: new Date().toISOString(),
        self_assessed: false,
      }

      saveAnswer(newAnswer)
      setAnswer(newAnswer)

      // Track question submission
      if (user) {
        await supabase.from('user_activity').insert({
          user_id: user.id,
          event: 'submitted_question',
          path: `/questions/${topicSlug}`,
          user_email: user.email
        })
      }
    } else {
      // Free version - just save the response, self-assessment comes later
      setAnswer({
        /* TODO: add following data to supabase table structure */
        id: crypto.randomUUID(),
        question_id: question.id,
        student_id: currentUser.id,
        response_text: responseText,
        ai_feedback: null,
        score: "amber", // Placeholder, will be updated after self-assessment
        submitted_at: new Date().toISOString(),
        self_assessed: false,
      })

      // Track question submission
      if (user) {
        await supabase.from('user_activity').insert({
          user_id: user.id,
          event: 'submitted_question',
          path: `/questions/${topicSlug}`,
          user_email: user.email
        })
      }
    }

    setIsSubmitting(false)
  }

  const handleSelfAssessment = (score: ScoreType) => {
    if (!answer) return

    const updatedAnswer: Answer = {
      ...answer,
      score: score,
      self_assessed: true,
    }

    saveAnswer(updatedAnswer)
    setAnswer(updatedAnswer)
    setSelfAssessmentScore(score)
  }

  const handleTryAnother = () => {
    const newQuestion = getRandomQuestionForTopic(topicSlug, freeUser, userType)
    setQuestion(newQuestion)
    setAnswer(null)
    setSelfAssessmentScore(null)
  }

  const handleMultipleChoiceAnswer = (isCorrect: boolean) => {
    if (!question) return

    const newAnswer: Answer = {
      /* TODO: add following data to supabase table structure */
      id: crypto.randomUUID(),
      question_id: question.id,
      student_id: currentUser.id,
      response_text: isCorrect ? "Correct" : "Incorrect",
      ai_feedback: isCorrect ? "Well done! You selected the correct answer." : "Try to understand why this answer is incorrect.",
      score: isCorrect ? "green" : "red",
      submitted_at: new Date().toISOString(),
      self_assessed: false,
    }

    saveAnswer(newAnswer)
    setAnswer(newAnswer)
    setSelfAssessmentScore(isCorrect ? "green" : "red")
  }

  const handleFillInTheBlankAnswer = (isCorrect: boolean) => {
    if (!question) return

    const newAnswer: Answer = {
      id: crypto.randomUUID(),
      question_id: question.id,
      student_id: currentUser.id,
      response_text: isCorrect ? "Correct" : "Incorrect",
      ai_feedback: isCorrect ? "Well done! You selected the correct answers." : "Try to understand why these answers are incorrect.",
      score: isCorrect ? "green" : "red",
      submitted_at: new Date().toISOString(),
      self_assessed: false,
    }

    saveAnswer(newAnswer)
    setAnswer(newAnswer)
    setSelfAssessmentScore(isCorrect ? "green" : "red")
  }

  const handleMatchingAnswer = (selections: Record<string, string[]>) => {
    if (!question) return

    const isCorrect = question.pairs?.every(pair =>
      selections[pair.statement]?.includes(pair.match)
    ) || false

    const newAnswer: Answer = {
      id: crypto.randomUUID(),
      question_id: question.id,
      student_id: currentUser.id,
      response_text: JSON.stringify(selections),
      ai_feedback: isCorrect ? "Well done! You matched all items correctly." : "Some matches are incorrect. Try again!",
      score: isCorrect ? "green" : "red",
      submitted_at: new Date().toISOString(),
      self_assessed: false,
    }

    saveAnswer(newAnswer)
    setAnswer(newAnswer)
    setSelfAssessmentScore(isCorrect ? "green" : "red")
  }

  const handleTrueFalseAnswer = (answer: boolean) => {
    if (!question) return

    const isCorrect = answer === (question.model_answer === "true")

    const newAnswer: Answer = {
      id: crypto.randomUUID(),
      question_id: question.id,
      student_id: currentUser.id,
      response_text: answer ? "true" : "false",
      ai_feedback: isCorrect ? "Correct! Well done!" : "Incorrect. Try to understand why this is wrong.",
      score: isCorrect ? "green" : "red",
      submitted_at: new Date().toISOString(),
      self_assessed: false,
    }

    saveAnswer(newAnswer)
    setAnswer(newAnswer)
    setSelfAssessmentScore(isCorrect ? "green" : "red")
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

  console.log("Rendering question:", {
    type: question.type,
    text: question.question_text,
    options: question.options,
    correctAnswerIndex: question.correctAnswerIndex
  })

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

        <div className="mb-6 md:mb-8">
          {freeUser && <CTABanner variant="free" />}
          {!freeUser && userType === "basic" && <CTABanner variant="basic" />}
          {!freeUser && userType === "revisionAI" && <CTABanner variant="premium" />}
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
                {userType !== "revisionAI" && (
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

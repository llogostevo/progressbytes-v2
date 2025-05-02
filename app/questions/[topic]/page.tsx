"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { QuestionForm } from "@/components/question-form"
import { FeedbackDisplay } from "@/components/feedback-display"
import { SelfAssessment } from "@/components/self-assessment"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRandomQuestionForTopic, getTopicBySlug, saveAnswer, currentUser } from "@/lib/data"
import type { Question, Answer, ScoreType, Topic } from "@/lib/types"
import { ArrowLeft, RefreshCw, Lock } from "lucide-react"
import Link from "next/link"

export default function QuestionPage() {
  const params = useParams()
  const topicSlug = params.topic as string

  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [selfAssessmentScore, setSelfAssessmentScore] = useState<ScoreType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const hasPaid = currentUser.has_paid

  useEffect(() => {
    try {
      const currentTopic = getTopicBySlug(topicSlug)
      setTopic(currentTopic || null)

      if (currentTopic) {
        const newQuestion = getRandomQuestionForTopic(topicSlug)
        setQuestion(newQuestion)
        setAnswer(null)
        setSelfAssessmentScore(null)
      }
    } catch (error) {
      console.error("Error loading question:", error)
    } finally {
      setIsLoading(false)
    }
  }, [topicSlug])

  const handleSubmitAnswer = async (responseText: string) => {
    if (!question) return

    setIsSubmitting(true)

    if (hasPaid) {
      // Paid version - use AI feedback
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
    } else {
      // Free version - just save the response, self-assessment comes later
      setAnswer({
        id: crypto.randomUUID(),
        question_id: question.id,
        student_id: currentUser.id,
        response_text: responseText,
        ai_feedback: null,
        score: "amber", // Placeholder, will be updated after self-assessment
        submitted_at: new Date().toISOString(),
        self_assessed: true,
      })
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
    const newQuestion = getRandomQuestionForTopic(topicSlug)
    setQuestion(newQuestion)
    setAnswer(null)
    setSelfAssessmentScore(null)
  }

  // Mock feedback generator - this would be replaced by actual AI API call
  const generateMockFeedback = (response: string, question: Question) => {
    // Very basic mock logic - in reality this would be an AI model
    const responseLength = response.length
    const hasKeywords = question.model_answer
      .toLowerCase()
      .split(" ")
      .some((word) => response.toLowerCase().includes(word))

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
        feedback: "Great answer! You&apos;ve covered the key points and demonstrated good understanding.",
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
          <h1 className="text-3xl font-bold mt-4 mb-2">{topic.name}</h1>
          <p className="text-muted-foreground">{topic.description}</p>
        </div>

        {!hasPaid && (
          <Card className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="shrink-0 bg-emerald-100 p-2 rounded-full">
                  <Lock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-medium text-emerald-800">Free Version</h3>
                  <p className="text-sm text-emerald-700">
                    You&apos;re using the free version. Upgrade to get AI-powered feedback and personalized recommendations.
                  </p>
                </div>
                <div className="ml-auto">
                  <Link href="/coming-soon">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      Upgrade
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Question</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium mb-6">{question.question_text}</p>

            {!answer ? (
              <QuestionForm onSubmit={handleSubmitAnswer} isSubmitting={isSubmitting} />
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2">Your Answer:</h3>
                  <p>{answer.response_text}</p>
                </div>

                {/* For free version, show model answer first, then self-assessment */}
                {!hasPaid && (
                  <>
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-md">
                      <h3 className="font-medium mb-2 text-emerald-700">Model Answer:</h3>
                      <p>{question.model_answer}</p>
                    </div>

                    {!selfAssessmentScore ? (
                      <SelfAssessment onSelectScore={handleSelfAssessment} />
                    ) : (
                      <FeedbackDisplay answer={answer} />
                    )}
                  </>
                )}

                {/* For paid version, show AI feedback, then model answer */}
                {hasPaid && (
                  <>
                    <FeedbackDisplay answer={answer} />

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-md">
                      <h3 className="font-medium mb-2 text-emerald-700">Model Answer:</h3>
                      <p>{question.model_answer}</p>
                    </div>
                  </>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    onClick={handleTryAnother}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={!hasPaid && !selfAssessmentScore}
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

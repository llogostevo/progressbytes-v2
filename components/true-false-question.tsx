"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Check } from "lucide-react"
import type { Question } from "@/lib/types"

interface TrueFalseQuestionProps {
  question: Question
  onSubmit: (answer: boolean) => void
  disabled?: boolean
}

export function TrueFalseQuestion({ question, onSubmit, disabled = false }: TrueFalseQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  console.log("TrueFalseQuestion received:", {
    question,
    modelAnswer: question.model_answer,
    modelAnswerType: typeof question.model_answer,
    rawModelAnswer: question.model_answer
  })

  const handleSelectAnswer = (answer: boolean) => {
    setSelectedAnswer(answer)
  }

  const handleSubmit = () => {
    if (selectedAnswer === null) return
    setIsSubmitted(true)
    onSubmit(selectedAnswer)
  }

  const isCorrect = () => {
    if (!isSubmitted || selectedAnswer === null) return false;
    console.log("Checking correctness:", {
      selectedAnswer,
      modelAnswer: question.model_answer,
      modelAnswerType: typeof question.model_answer,
      comparison: selectedAnswer === question.model_answer
    });
    return selectedAnswer === question.model_answer;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left">Question</th>
              <th className="border p-2 text-center">True</th>
              <th className="border p-2 text-center">False</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">{question.question_text}</td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => handleSelectAnswer(true)}
                  disabled={disabled || isSubmitted}
                  className={`w-full h-full p-2 rounded ${
                    selectedAnswer === true
                      ? 'bg-emerald-100'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {selectedAnswer === true && !isSubmitted && (
                    <div className="flex justify-center">
                      <Check className="h-5 w-5 text-emerald-600" />
                    </div>
                  )}
                  {isSubmitted && (
                    <div className="flex justify-center">
                      {isCorrect() && selectedAnswer === true ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : !isCorrect() && selectedAnswer === true ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : null}
                    </div>
                  )}
                </button>
              </td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => handleSelectAnswer(false)}
                  disabled={disabled || isSubmitted}
                  className={`w-full h-full p-2 rounded ${
                    selectedAnswer === false
                      ? 'bg-emerald-100'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {selectedAnswer === false && !isSubmitted && (
                    <div className="flex justify-center">
                      <Check className="h-5 w-5 text-emerald-600" />
                    </div>
                  )}
                  {isSubmitted && (
                    <div className="flex justify-center">
                      {isCorrect() && selectedAnswer === false ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : !isCorrect() && selectedAnswer === false ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : null}
                    </div>
                  )}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {!isSubmitted && (
        <Button 
          onClick={handleSubmit} 
          disabled={disabled || selectedAnswer === null}
          className="mt-4"
        >
          Submit Answer
        </Button>
      )}
    </div>
  )
} 
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import type { Question } from "@/lib/types"

interface MatchingQuestionProps {
  question: Question
  onSubmit: (answer: Record<string, string[]>) => void
  disabled?: boolean
}

export function MatchingQuestion({ question, onSubmit, disabled = false }: MatchingQuestionProps) {
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!question.pairs) {
    return <div>Invalid matching question format</div>
  }

  // Get unique matches for the columns
  const uniqueMatches = Array.from(new Set(question.pairs.map(pair => pair.match)))
  
  // Initialize selections if not already done
  if (Object.keys(selections).length === 0) {
    const initialSelections: Record<string, string[]> = {}
    question.pairs.forEach(pair => {
      initialSelections[pair.statement] = []
    })
    setSelections(initialSelections)
  }

  const handleToggleMatch = (statement: string, match: string) => {
    const currentMatches = selections[statement] || []
    const newMatches = currentMatches.includes(match)
      ? currentMatches.filter(m => m !== match)
      : [...currentMatches, match]
    
    setSelections({
      ...selections,
      [statement]: newMatches
    })
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    onSubmit(selections)
  }

  const isCorrect = (statement: string, match: string) => {
    if (!isSubmitted) return false
    const correctMatch = question.pairs?.find(p => p.statement === statement)?.match
    return correctMatch === match
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left">Statement</th>
              {uniqueMatches.map((match, index) => (
                <th key={index} className="border p-2 text-center">
                  {match}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {question.pairs.map((pair, rowIndex) => (
              <tr key={rowIndex}>
                <td className="border p-2">{pair.statement}</td>
                {uniqueMatches.map((match, colIndex) => (
                  <td key={colIndex} className="border p-2 text-center">
                    <button
                      onClick={() => handleToggleMatch(pair.statement, match)}
                      disabled={disabled || isSubmitted}
                      className={`w-full h-full p-2 rounded ${
                        selections[pair.statement]?.includes(match)
                          ? 'bg-emerald-100'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {selections[pair.statement]?.includes(match) && !isSubmitted && (
                        <div className="flex justify-center">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                      )}
                      {isSubmitted && (
                        <div className="flex justify-center">
                          {isCorrect(pair.statement, match) ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : selections[pair.statement]?.includes(match) ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : null}
                        </div>
                      )}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isSubmitted && (
        <Button 
          onClick={handleSubmit} 
          disabled={disabled}
          className="mt-4"
        >
          Submit Answer
        </Button>
      )}
    </div>
  )
} 
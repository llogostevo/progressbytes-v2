"use client"

import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle } from "lucide-react"

interface MultipleChoiceQuestionProps {
  options: string[]
  correctAnswerIndex: number
  onAnswerSelected: (selectedIndex: number, isCorrect: boolean) => void
}

export function MultipleChoiceQuestion({
  options,
  correctAnswerIndex,
  onAnswerSelected,
}: MultipleChoiceQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)

  const handleOptionSelect = (value: string) => {
    const index = parseInt(value)
    setSelectedOption(index)
    setIsAnswered(true)
    onAnswerSelected(index, index === correctAnswerIndex)
  }

  return (
    <div className="space-y-4">
      
      
      <RadioGroup
        onValueChange={handleOptionSelect}
        disabled={isAnswered}
        className="space-y-2"
      >
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem value={index.toString()} id={`option-${index}`} className="cursor-pointer" />
            <Label
              htmlFor={`option-${index}`}
              className={`flex items-center gap-2 cursor-pointer ${
                isAnswered
                  ? index === correctAnswerIndex
                    ? "text-green-600"
                    : selectedOption === index
                    ? "text-red-600"
                    : ""
                  : ""
              }`}
            >
              {option}
              {isAnswered && index === correctAnswerIndex && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              {isAnswered && selectedOption === index && index !== correctAnswerIndex && (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
} 
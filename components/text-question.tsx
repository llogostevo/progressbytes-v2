"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface TextQuestionProps {
  onSubmit: (responseText: string) => void
  disabled?: boolean
}

export function TextQuestion({ onSubmit, disabled = false }: TextQuestionProps) {
  const [answer, setAnswer] = useState("")

  const handleSubmit = () => {
    onSubmit(answer)
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        disabled={disabled}
        className="min-h-[100px]"
      />
      <Button onClick={handleSubmit} disabled={disabled || !answer.trim()}>
        Submit Answer
      </Button>
    </div>
  )
} 
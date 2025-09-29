"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface TextQuestionProps {
  onSubmit: (responseText: string) => void
  disabled?: boolean
}

export function TextQuestion({ onSubmit, disabled = false }: TextQuestionProps) {
  const [answer, setAnswer] = useState("")

  const handleSubmit = () => {
    // Check if the answer is "idk" (case insensitive)
    if (answer.toLowerCase().trim() === "idk") {
      toast.error("Please try to answer the question! Look at the resources provided to help you understand the topic better.", {
        duration: 5000,
      })
      return
    }
    
    onSubmit(answer)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent copy (Ctrl+C), paste (Ctrl+V), and cut (Ctrl+X)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
      e.preventDefault()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
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
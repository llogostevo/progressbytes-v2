"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CodeEditor } from "@/components/code-editor"
import { Question } from "@/lib/types"

interface QuestionFormProps {
  question: Question
  onSubmit: (answer: string) => void
  disabled?: boolean
}

export function QuestionForm({ question, onSubmit, disabled }: QuestionFormProps) {
  const [answer, setAnswer] = useState("")
  const [autocomplete, setAutocomplete] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(answer)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {question.type === "text" ? (
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            disabled={disabled}
            className="min-h-[100px]"
          />
        ) : (
          <CodeEditor
            value={answer}
            onChange={setAnswer}
            disabled={disabled}
            autocomplete={autocomplete}
            onAutocompleteChange={setAutocomplete}
          />
        )}
      </div>
      <Button type="submit" disabled={disabled}>
        Submit Answer
      </Button>
    </form>
  )
}

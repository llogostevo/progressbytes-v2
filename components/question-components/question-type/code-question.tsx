"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CodeEditor } from "@/components/question-components/question-type/code-question-components/code-editor"

interface CodeQuestionProps {
  onSubmit: (responseText: string) => void
  disabled?: boolean
}

export function CodeQuestion({ onSubmit, disabled = false }: CodeQuestionProps) {
  const [answer, setAnswer] = useState("")
  const [autocomplete, setAutocomplete] = useState(false)

  const handleSubmit = () => {
    onSubmit(answer)
  }

  return (
    <div className="space-y-4">
      <CodeEditor
        value={answer}
        onChange={setAnswer}
        disabled={disabled}
        autocomplete={autocomplete}
        onAutocompleteChange={setAutocomplete}
      />
      <Button onClick={handleSubmit} disabled={disabled || !answer.trim()}>
        Submit Answer
      </Button>
    </div>
  )
} 
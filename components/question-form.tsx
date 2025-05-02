"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Loader2 } from "lucide-react"

interface QuestionFormProps {
  onSubmit: (answer: string) => void
  isSubmitting: boolean
}

export function QuestionForm({ onSubmit, isSubmitting }: QuestionFormProps) {
  const [answer, setAnswer] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (answer.trim().length < 5) {
      setError("Please provide a more detailed answer")
      return
    }

    setError("")
    onSubmit(answer)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Type your answer here..."
          className="min-h-[150px] resize-none"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isSubmitting}
        />

        {error && (
          <div className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Submit Answer"
          )}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground pt-2">
        <p>Tip: Provide a complete answer with key terminology to get the best feedback.</p>
      </div>
    </form>
  )
}

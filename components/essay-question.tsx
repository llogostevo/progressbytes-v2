"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"
import { HelpCircle } from "lucide-react"
import EssayGuide from "./EssayGuide"

interface EssayQuestionProps {
  onSubmit: (responseText: string) => void
  disabled?: boolean
  minWords?: number
  maxWords?: number
}


export function EssayQuestion({ 
  onSubmit, 
  disabled = false,
  minWords = 100,
  maxWords = 1000 
}: EssayQuestionProps) {
  const [answer, setAnswer] = useState("")
  const [wordCount, setWordCount] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setAnswer(text)
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length)
  }

  const handleSubmit = () => {
    onSubmit(answer)
  }

  const isWordCountValid = wordCount >= minWords && wordCount <= maxWords

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Essay Question</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Essay Guide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogTitle className="sr-only">Essay Writing Guide</DialogTitle>
            <EssayGuide />
          </DialogContent>
        </Dialog>
      </div>
      <Card className="p-4 bg-slate-50">
        {/* <div className="text-sm text-muted-foreground mb-2">
          Word count: {wordCount} / {maxWords} (minimum: {minWords})
        </div> */}
        <Textarea
          value={answer}
          onChange={handleChange}
          placeholder="Write your essay here..."
          disabled={disabled}
          className="min-h-[300px] font-sans text-base leading-relaxed"
        />
      </Card>
      <Button 
        onClick={handleSubmit} 
        disabled={disabled || !answer.trim() || !isWordCountValid}
        className="w-full sm:w-auto"
      >
        Submit Essay
      </Button>
      {!isWordCountValid && answer.trim() && (
        <p className="text-sm text-red-600">
          {wordCount < minWords 
            ? `Your essay is too short. Please write at least ${minWords} words.`
            : `Your essay is too long. Please keep it under ${maxWords} words.`}
        </p>
      )}
    </div>
  )
} 
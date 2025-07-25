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
import { HelpCircle, Monitor, Gavel } from "lucide-react"
import EssayGuide from "./essay-guides/EssayGuide"
import DigitalTechnologyGuide from "./essay-guides/DigitalTechnologyGuide"
import ComputerScienceLawsGuide from "./essay-guides/ComputerScienceLawsGuide"
import { ScrollArea } from "@/components/ui/scroll-area"

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
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="default" className="gap-2 h-11 px-6 bg-transparent">
                  <HelpCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Essay Guide</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[85vh] w-[95vw] sm:w-full">
                <DialogTitle className="sr-only">Essay Writing Guide</DialogTitle>
                <ScrollArea className="max-h-[75vh] pr-4">
                  <EssayGuide />
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="default" className="gap-2 h-11 px-6 bg-transparent">
                  <Monitor className="h-4 w-4" />
                  <span className="hidden sm:inline">Digital Impacts Guide</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[85vh] w-[95vw] sm:w-full">
                <DialogTitle className="sr-only">Digital Technology Impact Guide</DialogTitle>
                <ScrollArea className="max-h-[75vh] pr-4">
                  <DigitalTechnologyGuide />
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="default" className="gap-2 h-11 px-6 bg-transparent">
                  <Gavel className="h-4 w-4" />
                  <span className="hidden sm:inline">Legal Guide</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[85vh] w-[95vw] sm:w-full">
                <DialogTitle className="sr-only">Computer Science Laws Guide</DialogTitle>
                <ScrollArea className="max-h-[75vh] pr-4">
                  <ComputerScienceLawsGuide />
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
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
"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Lightbulb } from "lucide-react"

interface TextQuestionProps {
  onSubmit: (responseText: string) => void
  disabled?: boolean
  keywords?: string[]
}

export function TextQuestion({ onSubmit, disabled = false, keywords }: TextQuestionProps) {
  const [answer, setAnswer] = useState("")
  const [showKeywords, setShowKeywords] = useState(false)

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
      {/* Keywords hint section */}
      {keywords && keywords.length > 0 && (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowKeywords(!showKeywords)}
            className="flex items-center gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            {showKeywords ? "Hide Keywords" : "Reveal Keywords"}
          </Button>
          {showKeywords && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800 font-medium mb-2">Keywords to include:</p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
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
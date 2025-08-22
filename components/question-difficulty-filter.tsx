import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface QuestionDifficultyFilterProps {
  selectedDifficulty: string | null
  onDifficultyChange: (difficulty: string | null) => void
  availableDifficulty?: string[]
}

const questionDifficulty = [
  {
    label: "Low",
    value: "low",
    description: "Low difficulty questions"
  },
  {
    label: "Medium",
    value: "medium",
    description: "Medium difficulty questions"
  },
  {
    label: "High",
    value: "high",
    description: "High difficulty questions"
  },
]

export function QuestionDifficultyFilter({ selectedDifficulty, onDifficultyChange, availableDifficulty }: QuestionDifficultyFilterProps) {
  const [showDifficulty, setShowDifficulty] = useState(selectedDifficulty !== null)
  
  const filteredQuestionDifficulty = availableDifficulty 
    ? questionDifficulty.filter(difficulty => availableDifficulty.includes(difficulty.value))
    : questionDifficulty

  const handleAllDifficultyClick = () => {
    onDifficultyChange(null)
    setShowDifficulty(false)
  }

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-5">
        <Button
          variant={selectedDifficulty === null ? "default" : "outline"}
          onClick={handleAllDifficultyClick}
          size="sm"
          className="flex-shrink-0"
        >
          All Types
        </Button>
        {!showDifficulty && (
          <Button
            variant="outline"
            onClick={() => setShowDifficulty(true)}
            size="sm"
            className="flex-shrink-0"
          >
            Show Difficulty
          </Button>
        )}
      </div>
      {showDifficulty && (
        <div className="grid grid-cols-3 w-full gap-3">
          {filteredQuestionDifficulty.map((difficulty) => (
            <TooltipProvider key={difficulty.value}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedDifficulty === difficulty.value ? "default" : "outline"}
                    onClick={() => onDifficultyChange(difficulty.value)}
                    size="sm"
                    className="flex-shrink-0 justify-start text-left h-8 px-2"
                  >
                    <span className="truncate">{difficulty.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-black/80 text-white">
                  <p className="text-sm">{difficulty.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
    </div>
  )
} 
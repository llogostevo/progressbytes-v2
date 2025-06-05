import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface QuestionTypeFilterProps {
  selectedType: string | null
  onTypeChange: (type: string | null) => void
  availableTypes?: string[]
}

const questionTypes = [
  { 
    value: "multiple-choice", 
    label: "Multiple Choice",
    description: "Questions with predefined answer options"
  },
  { 
    value: "short-answer", 
    label: "Short Answer",
    description: "Brief written responses to questions"
  },
  { 
    value: "true-false", 
    label: "True/False",
    description: "Questions requiring true or false answers"
  },
  { 
    value: "matching", 
    label: "Matching",
    description: "Match items from one list to another"
  },
  { 
    value: "fill-in-the-blank", 
    label: "Fill in the Blank",
    description: "Complete sentences with missing words"
  },
  { 
    value: "code", 
    label: "Code Question",
    description: "Programming and coding related questions"
  },
]

export function QuestionTypeFilter({ selectedType, onTypeChange, availableTypes }: QuestionTypeFilterProps) {
  const [showTypes, setShowTypes] = useState(selectedType !== null)
  
  const filteredQuestionTypes = availableTypes 
    ? questionTypes.filter(type => availableTypes.includes(type.value))
    : questionTypes

  const handleAllTypesClick = () => {
    onTypeChange(null)
    setShowTypes(false)
  }

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-5">
        <Button
          variant={selectedType === null ? "default" : "outline"}
          onClick={handleAllTypesClick}
          size="sm"
          className="flex-shrink-0"
        >
          All Types
        </Button>
        {!showTypes && (
          <Button
            variant="outline"
            onClick={() => setShowTypes(true)}
            size="sm"
            className="flex-shrink-0"
          >
            Show Types
          </Button>
        )}
      </div>
      {showTypes && (
        <div className="grid grid-cols-3 w-full gap-3">
          {filteredQuestionTypes.map((type) => (
            <TooltipProvider key={type.value}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedType === type.value ? "default" : "outline"}
                    onClick={() => onTypeChange(type.value)}
                    size="sm"
                    className="flex-shrink-0 justify-start text-left h-8 px-2"
                  >
                    <span className="truncate">{type.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-black/80 text-white">
                  <p className="text-sm">{type.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
    </div>
  )
} 
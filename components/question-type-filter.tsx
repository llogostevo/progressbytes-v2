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
  const filteredQuestionTypes = availableTypes 
    ? questionTypes.filter(type => availableTypes.includes(type.value))
    : questionTypes

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedType === null ? "default" : "outline"}
          size="sm"
          onClick={() => onTypeChange(null)}
          className="text-xs"
        >
          All Types
        </Button>
        {filteredQuestionTypes.map((type) => (
          <TooltipProvider key={type.value}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTypeChange(type.value)}
                  className="text-xs"
                >
                  {type.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-black/80 text-white">
                <p className="text-sm">{type.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  )
} 
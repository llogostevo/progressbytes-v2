import { Button } from "@/components/ui/button"

interface QuestionTypeFilterProps {
  selectedType: string | null
  onTypeChange: (type: string | null) => void
  availableTypes?: string[]
}

const questionTypes = [
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "short-answer", label: "Short Answer" },
  { value: "true-false", label: "True/False" },
  { value: "matching", label: "Matching" },
  { value: "fill-in-the-blank", label: "Fill in the Blank" },
  { value: "code", label: "Code Question" },
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
          <Button
            key={type.value}
            variant={selectedType === type.value ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange(type.value)}
            className="text-xs"
          >
            {type.label}
          </Button>
        ))}
      </div>
    </div>
  )
} 
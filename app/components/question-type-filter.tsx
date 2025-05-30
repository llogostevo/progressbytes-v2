import { Button } from "@/components/ui/button"

interface QuestionTypeFilterProps {
  selectedType: string | null
  onTypeChange: (type: string | null) => void
}

const questionTypes = [
  { value: "short-answer", label: "Short Answer" },
  { value: "true-false", label: "True/False" },
  { value: "matching", label: "Matching" },
  { value: "fill-in-the-blank", label: "Fill in the Blank" },
  { value: "code", label: "Code Question" },
]

export function QuestionTypeFilter({ selectedType, onTypeChange }: QuestionTypeFilterProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Type</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={selectedType === null ? "default" : "outline"}
          size="sm"
          onClick={() => onTypeChange(null)}
          className="text-xs"
        >
          All Types
        </Button>
        {questionTypes.map((type) => (
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
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MessageSquare, CheckCircle } from "lucide-react"

interface TeacherAssessmentFilterProps {
  selectedAssessment: string | null
  onAssessmentChange: (assessment: string | null) => void
}

const assessmentOptions = [
  {
    label: "With Teacher Assessment",
    value: "assessed",
    description: "Questions that have been marked by a teacher",
    icon: CheckCircle
  },
  {
    label: "With Feedback",
    value: "feedback",
    description: "Questions that have teacher feedback",
    icon: MessageSquare
  },
  {
    label: "Not Assessed",
    value: "not-assessed",
    description: "Questions that haven't been marked by a teacher",
    icon: null
  }
]

export function TeacherAssessmentFilter({ selectedAssessment, onAssessmentChange }: TeacherAssessmentFilterProps) {
  const [showAssessment, setShowAssessment] = useState(selectedAssessment !== null)

  const handleAllAssessmentClick = () => {
    onAssessmentChange(null)
    setShowAssessment(false)
  }

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-5">
        <Button
          variant={selectedAssessment === null ? "default" : "outline"}
          onClick={handleAllAssessmentClick}
          size="sm"
          className="flex-shrink-0"
        >
          All Assessments
        </Button>
        {!showAssessment && (
          <Button
            variant="outline"
            onClick={() => setShowAssessment(true)}
            size="sm"
            className="flex-shrink-0"
          >
            Show Assessment Filter
          </Button>
        )}
      </div>
      {showAssessment && (
        <div className="grid grid-cols-1 w-full gap-3">
          {assessmentOptions.map((option) => {
            const IconComponent = option.icon
            return (
              <TooltipProvider key={option.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectedAssessment === option.value ? "default" : "outline"}
                      onClick={() => onAssessmentChange(option.value)}
                      size="sm"
                      className="flex-shrink-0 justify-start text-left h-8 px-2"
                    >
                      <div className="flex items-center gap-2">
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                        <span className="truncate">{option.label}</span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black/80 text-white">
                    <p className="text-sm">{option.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
      )}
    </div>
  )
}

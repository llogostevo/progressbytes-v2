import type { Answer } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react"

interface FeedbackDisplayProps {
  answer: Answer
}

export function FeedbackDisplay({ answer }: FeedbackDisplayProps) {
  const { score, ai_feedback, self_assessed } = answer

  const scoreConfig = {
    green: {
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      badgeColor: "bg-emerald-500 hover:bg-emerald-500",
      title: self_assessed ? "Fully Understood" : "Excellent",
    },
    amber: {
      icon: AlertTriangle,
      color: "bg-amber-100 text-amber-800 border-amber-200",
      badgeColor: "bg-amber-500 hover:bg-amber-500",
      title: self_assessed ? "Partially Understood" : "Partially Correct",
    },
    red: {
      icon: AlertCircle,
      color: "bg-red-100 text-red-800 border-red-200",
      badgeColor: "bg-red-500 hover:bg-red-500",
      title: self_assessed ? "Need More Practice" : "Needs Improvement",
    },
  }

  const config = scoreConfig[score]
  const Icon = config.icon

  return (
    <div className={`p-4 rounded-md border ${config.color}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">{self_assessed ? "Self-Assessment" : "AI Feedback"}</h3>
            <Badge className={config.badgeColor}>{config.title}</Badge>
          </div>
          {ai_feedback && <p>{ai_feedback}</p>}
          {!ai_feedback && self_assessed && (
            <p className="text-sm text-muted-foreground">
              You've marked this answer as <strong>{config.title.toLowerCase()}</strong>. Keep practicing to improve
              your understanding.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

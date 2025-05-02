"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, AlertCircle } from "lucide-react"
import type { ScoreType } from "@/lib/types"

interface SelfAssessmentProps {
  onSelectScore: (score: ScoreType) => void
}

export function SelfAssessment({ onSelectScore }: SelfAssessmentProps) {
  const [selectedScore, setSelectedScore] = useState<ScoreType | null>(null)

  const handleScoreSelect = (score: ScoreType) => {
    setSelectedScore(score)
    onSelectScore(score)
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
        <h3 className="font-medium mb-3">Self-Assessment</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Compare your answer with the model answer above and rate your understanding:
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant={selectedScore === "green" ? "default" : "outline"}
            className={selectedScore === "green" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            onClick={() => handleScoreSelect("green")}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Green (Fully Understood)
          </Button>

          <Button
            variant={selectedScore === "amber" ? "default" : "outline"}
            className={selectedScore === "amber" ? "bg-amber-500 hover:bg-amber-600" : ""}
            onClick={() => handleScoreSelect("amber")}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Amber (Partially Understood)
          </Button>

          <Button
            variant={selectedScore === "red" ? "default" : "outline"}
            className={selectedScore === "red" ? "bg-red-500 hover:bg-red-600" : ""}
            onClick={() => handleScoreSelect("red")}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Red (Need More Practice)
          </Button>
        </div>
      </div>
    </div>
  )
}

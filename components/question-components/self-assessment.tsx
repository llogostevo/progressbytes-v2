"use client"

import { useState } from "react"
import type { ScoreType } from "@/lib/types"
import { AmberButton } from "./self-assessment/amber-button"
import { GreenButton } from "./self-assessment/green-button"
import { RedButton } from "./self-assessment/red-button"

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
          Compare your answer with the model answer above and rate your understanding
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <GreenButton
            isSelected={selectedScore === "green"}
            onClick={() => handleScoreSelect("green")}
          />
          <AmberButton
            isSelected={selectedScore === "amber"}
            onClick={() => handleScoreSelect("amber")}
          />
          <RedButton
            isSelected={selectedScore === "red"}
            onClick={() => handleScoreSelect("red")}
          />
        </div>
      </div>
    </div>
  )
}

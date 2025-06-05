import React, { useState } from "react"
import { Button } from "@/components/ui/button"

interface Subtopic {
  id: string
  subtopictitle: string
}

interface SubtopicFilterProps {
  selectedSubtopics: string[]
  onSubtopicChange: (subtopics: string[]) => void
  subtopics: Subtopic[]
  className?: string
}

export function SubtopicFilter({ selectedSubtopics, onSubtopicChange, subtopics, className = "" }: SubtopicFilterProps) {
  const [showSubtopics, setShowSubtopics] = useState(selectedSubtopics.length > 0)

  const handleAllSubtopicsClick = () => {
    onSubtopicChange([])
    setShowSubtopics(false)
  }

  const handleSubtopicClick = (subtopicId: string) => {
    const newSelectedSubtopics = selectedSubtopics.includes(subtopicId)
      ? selectedSubtopics.filter(t => t !== subtopicId)
      : [...selectedSubtopics, subtopicId]
    
    // If we're deselecting the last subtopic, hide the subtopics
    if (selectedSubtopics.includes(subtopicId) && newSelectedSubtopics.length === 0) {
      setShowSubtopics(false)
    }
    
    onSubtopicChange(newSelectedSubtopics)
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex gap-2 mb-5">
        <Button
          variant={selectedSubtopics.length === 0 ? "default" : "outline"}
          onClick={handleAllSubtopicsClick}
          size="sm"
          className="flex-shrink-0"
        >
          All Subtopics
        </Button>
        {!showSubtopics && (
          <Button
            variant="outline"
            onClick={() => setShowSubtopics(true)}
            size="sm"
            className="flex-shrink-0"
          >
            Show Subtopics
          </Button>
        )}
      </div>
      {showSubtopics && (
        <div className="grid grid-cols-3 w-full gap-3">
          {subtopics.map((subtopic) => (
            <Button
              key={subtopic.id}
              variant={selectedSubtopics.includes(subtopic.id) ? "default" : "outline"}
              onClick={() => handleSubtopicClick(subtopic.id)}
              size="sm"
              className="flex-shrink-0 justify-start text-left h-8 px-2"
            >
              <span className="truncate">{subtopic.subtopictitle}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
} 
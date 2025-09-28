import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { filterOn, filterOff } from "@/components/ui/filter-toasts"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleAllSubtopicsClick = () => {
    onSubtopicChange([])
    setShowSubtopics(false)
  }

  const handleSubtopicClick = (subtopicId: string) => {
    const isCurrentlySelected = selectedSubtopics.includes(subtopicId)
    const newSelectedSubtopics = isCurrentlySelected
      ? selectedSubtopics.filter(t => t !== subtopicId)
      : [...selectedSubtopics, subtopicId]

    // Find the subtopic name for better toast messages
    const subtopic = subtopics.find(s => s.id === subtopicId)
    const subtopicName = subtopic?.subtopictitle || subtopicId

    // Show appropriate toast based on action
    if (isCurrentlySelected) {
      // Deselecting
      filterOff(`Deselected: ${subtopicName} `)
      // If we're deselecting the last subtopic, hide the subtopics
      if (newSelectedSubtopics.length === 0) {
        setShowSubtopics(false)
      }
    } else {
      // Selecting
      filterOn(`Selected: ${subtopicName}`)
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
        <div className="hidden sm:block">
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
      </div>
      {(showSubtopics || isMobile) && (
        <div className="grid grid-cols-3 w-full gap-3">
          {/* TooltipProvider is used to delay all tooltips from appearing - this overrides the global 
          delayDuration in the tooltip component */}
          <TooltipProvider delayDuration={3000}>
            {subtopics.map((subtopic) => (
              <Tooltip key={subtopic.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedSubtopics.includes(subtopic.id) ? "default" : "outline"}
                    onClick={() => handleSubtopicClick(subtopic.id)}
                    size="sm"
                    className="flex-shrink-0 justify-start text-left h-8 px-2"
                  >
                    <span className="truncate">{subtopic.subtopictitle}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-black/80 text-white max-w-xs">
                  <p className="text-sm">{subtopic.subtopictitle}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>

        </div>
      )}
    </div>
  )
} 
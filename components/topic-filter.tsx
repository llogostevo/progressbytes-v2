import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { DynamicIcon } from "@/components/ui/dynamicicon"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Topic {
  id: string
  name: string
  description: string
  icon?: string
  slug: string
  unit: number
  disabled?: boolean
  topicnumber?: string
}

interface TopicFilterProps {
  selectedTopics: string[]
  onTopicChange: (topics: string[]) => void
  topics: Topic[]
  className?: string
}

// Helper function to compare topic numbers like "1.1.1", "1.1.2", etc.
function compareTopicNumbers(a?: string, b?: string) {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] ?? 0;
    const bVal = bParts[i] ?? 0;
    if (aVal !== bVal) return aVal - bVal;
  }
  return 0;
}

// Estimate: button height ~32px, gap-2 = 8px, so 3 rows: 3*32 + 2*8 = 112px

export function TopicFilter({ selectedTopics, onTopicChange, topics, className = "" }: TopicFilterProps) {
  const [showTopics, setShowTopics] = useState(selectedTopics.length > 0)
  
  // Sort all topics by their topic number
  const sortedTopics = [...topics].sort((a, b) => compareTopicNumbers(a.topicnumber, b.topicnumber))

  const handleAllTopicsClick = () => {
    onTopicChange([])
    setShowTopics(false)
  }

  const handleTopicClick = (topicSlug: string) => {
    const newSelectedTopics = selectedTopics.includes(topicSlug)
      ? selectedTopics.filter(t => t !== topicSlug)
      : [...selectedTopics, topicSlug]
    
    // If we're deselecting the last topic, hide the topics
    if (selectedTopics.includes(topicSlug) && newSelectedTopics.length === 0) {
      setShowTopics(false)
    }
    
    onTopicChange(newSelectedTopics)
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex gap-2 mb-5">
        <Button
          variant={selectedTopics.length === 0 ? "default" : "outline"}
          onClick={handleAllTopicsClick}
          size="sm"
          className="flex-shrink-0"
        >
          All Topics
        </Button>
        {!showTopics && (
          <Button
            variant="outline"
            onClick={() => setShowTopics(true)}
            size="sm"
            className="flex-shrink-0"
          >
            Show Topics
          </Button>
        )}
      </div>
      {showTopics && (
        <div className="grid grid-cols-3 w-full gap-3">
          {sortedTopics.map((topic) => (
            <TooltipProvider key={topic.slug}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTopics.includes(topic.slug) ? "default" : "outline"}
                    onClick={() => handleTopicClick(topic.slug)}
                    size="sm"
                    className="flex-shrink-0 justify-start text-left h-8 px-2"
                  >
                    {topic.icon && <DynamicIcon iconName={topic.icon} size={12} className="mr-1 flex-shrink-0" />}
                    {topic.topicnumber && (
                      <span className="text-muted-foreground mr-1 flex-shrink-0">{topic.topicnumber}</span>
                    )}
                    <span className="truncate">{topic.name}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-black/80 text-white">
                  <p className="text-sm">
                    {topic.topicnumber && <span className="text-muted-foreground mr-1">{topic.topicnumber}</span>}
                    {topic.name}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
    </div>
  )
} 
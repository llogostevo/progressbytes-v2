import React from "react"
import { Button } from "@/components/ui/button"
import { DynamicIcon } from "@/components/ui/dynamicicon"

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
  selectedTopic: string | null
  onTopicChange: (topic: string | null) => void
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

export function TopicFilter({ selectedTopic, onTopicChange, topics, className = "" }: TopicFilterProps) {
  // Sort all topics by their topic number
  const sortedTopics = [...topics].sort((a, b) => compareTopicNumbers(a.topicnumber, b.topicnumber))

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-5">
        <Button
          variant={selectedTopic === null ? "default" : "outline"}
          onClick={() => onTopicChange(null)}
          size="sm"
          className="flex-shrink-0"
        >
          All Topics
        </Button>
      </div>
      <div className="grid grid-cols-3 w-full gap-3">
        {sortedTopics.map((topic) => (
          <Button
            key={topic.slug}
            variant={selectedTopic === topic.slug ? "default" : "outline"}
            onClick={() => onTopicChange(selectedTopic === topic.slug ? null : topic.slug)}
            size="sm"
            className="flex-shrink-0 justify-start text-left h-8 px-2"
          >
            {topic.icon && <DynamicIcon iconName={topic.icon} size={12} className="mr-1 flex-shrink-0" />}
            {topic.topicnumber && (
              <span className="text-muted-foreground mr-1 flex-shrink-0">{topic.topicnumber}</span>
            )}
            <span className="truncate">{topic.name}</span>
          </Button>
        ))}
      </div>
    </div>
  )
} 
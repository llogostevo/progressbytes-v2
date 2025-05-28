import React from "react"
import { topics } from "@/lib/data"
import { Button } from "@/components/ui/button"

// Map unit numbers to full unit names
const unitNames: Record<number, string> = {
  1: "Computer Systems",
  2: "Programming",
  // Add more units as needed
}

interface TopicFilterProps {
  selectedTopic: string | null
  onTopicChange: (topic: string | null) => void
  className?: string
}

// Estimate: button height ~32px, gap-2 = 8px, so 3 rows: 3*32 + 2*8 = 112px
const MAX_ROWS = 3
const BUTTON_HEIGHT = 32
const GAP = 8
const MAX_HEIGHT = MAX_ROWS * BUTTON_HEIGHT + (MAX_ROWS - 1) * GAP // 112px

export function TopicFilter({ selectedTopic, onTopicChange, className = "" }: TopicFilterProps) {
  // Group topics by unit
  const topicsByUnit = topics.reduce((acc, topic) => {
    const unit = topic.unit || 0
    if (!acc[unit]) {
      acc[unit] = []
    }
    acc[unit].push(topic)
    return acc
  }, {} as Record<number, typeof topics>)

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-2">
        <Button
          variant={selectedTopic === null ? "default" : "outline"}
          onClick={() => onTopicChange(null)}
          size="sm"
          className="flex-shrink-0"
        >
          All Topics
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(topicsByUnit).map(([unit, unitTopics]) => (
          <div key={unit} className="space-y-2">
            <h3 className="text-base font-semibold text-muted-foreground mb-1">
              {unitNames[Number(unit)] || `Unit ${unit}`}
            </h3>
            <div
              className="grid gap-2"
              style={{ gridAutoFlow: 'column', gridTemplateRows: 'repeat(3, minmax(0, 1fr))' }}
            >
              {unitTopics.map((topic) => (
                <Button
                  key={topic.slug}
                  variant={selectedTopic === topic.slug ? "default" : "outline"}
                  onClick={() => onTopicChange(topic.slug)}
                  size="sm"
                  className="flex-shrink-0"
                >
                  {topic.icon && React.createElement(topic.icon, { size: 14, className: "mr-1" })}
                  {topic.name}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
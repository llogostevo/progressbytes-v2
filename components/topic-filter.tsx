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

// Map unit numbers to full unit names
const unitNames: Record<number, string> = {
  1: "Computer Systems",
  2: "Programming",
  // Add more units as needed
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
  // Group topics by unit
  const topicsByUnit = topics.reduce((acc, topic) => {
    const unit = topic.unit || 0
    if (!acc[unit]) {
      acc[unit] = []
    }
    acc[unit].push(topic)
    return acc
  }, {} as Record<number, Topic[]>)

  // Sort topics within each unit by their topic number
  Object.keys(topicsByUnit).forEach(unit => {
    topicsByUnit[Number(unit)].sort((a, b) => compareTopicNumbers(a.topicnumber, b.topicnumber))
  })

  const unitEntries = Object.entries(topicsByUnit)

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
      <div className="grid grid-cols-4 w-full gap-6">
        {unitEntries.map(([unit, unitTopics], idx) => (
          <div
            key={unit}
            className={`space-y-2 rounded-md px-5 py-5 ${idx !== 0 ? 'border-t border-muted' : ''} bg-muted/50`}
          >
            <h3 className="text-base font-semibold text-muted-foreground mb-3">
              {unitNames[Number(unit)] || `Unit ${unit}`}
            </h3>
            <div
              className="grid gap-2 w-full overflow-hidden"
              style={{ gridAutoFlow: 'column', gridTemplateRows: 'repeat(3, minmax(0, 1fr))', minWidth: 0 }}
            >
              {unitTopics.map((topic) => (
                <Button
                  key={topic.slug}
                  variant={selectedTopic === topic.slug ? "default" : "outline"}
                  onClick={() => onTopicChange(selectedTopic === topic.slug ? null : topic.slug)}
                  size="sm"
                  className="flex-shrink-0 justify-start text-left"
                >
                  {topic.icon && <DynamicIcon iconName={topic.icon} size={14} className="mr-1" />}
                  {topic.topicnumber && (
                    <span className="text-muted-foreground mr-1">{topic.topicnumber}</span>
                  )}
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
import { TopicCard } from "@/components/topic-card"
import type { Topic } from "@/lib/types"

interface TopicGridProps {
  topics: Topic[]
  userType?: string
}

export function TopicGrid({ topics, userType }: TopicGridProps) {
  // Group topics by unit and sort by topic number
  const groupedTopics = topics.reduce((acc, topic) => {
    const unit = topic.unit || 1 // Default to unit 1 if not specified
    if (!acc[unit]) {
      acc[unit] = []
    }
    acc[unit].push(topic)
    return acc
  }, {} as Record<number, Topic[]>)

  // Sort topics within each unit by their topic number
  Object.keys(groupedTopics).forEach(unit => {
    groupedTopics[Number(unit)].sort((a, b) => {
      const aNum = a.topicnumber ?? 0
      const bNum = b.topicnumber ?? 0
      return aNum - bNum
    })
  })

  // Sort units numerically
  const sortedUnits = Object.keys(groupedTopics).sort((a, b) => Number(a) - Number(b))

  return (
    <div className="space-y-10">
      {sortedUnits.map(unit => (
        <div key={unit}>
          <h2 className="text-2xl font-bold mb-4">Unit {unit}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedTopics[Number(unit)].map((topic) => (
              <TopicCard key={topic.id} topic={topic} userType={userType} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

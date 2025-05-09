import { TopicCard } from "@/components/topic-card"
import type { Topic } from "@/lib/types"

interface TopicGridProps {
  topics: Topic[]
  userType?: string
}

export function TopicGrid({ topics, userType }: TopicGridProps) {
  // Group topics by unit
  const unit1Topics = topics.filter((topic) => topic.unit === 1)
  const unit2Topics = topics.filter((topic) => topic.unit === 2)

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold mb-4">Unit 1: Computer Systems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unit1Topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} userType={userType} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Unit 2: Computational Thinking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unit2Topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} userType={userType} />
          ))}
        </div>
      </div>
    </div>
  )
}

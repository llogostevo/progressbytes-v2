import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Topic } from "@/lib/types"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { DynamicIcon } from "@/components/ui/dynamicicon"

interface TopicCardProps {
  topic: Topic
  userType?: string
}

export function TopicCard({ topic, userType }: TopicCardProps) {
  const isDisabled = topic.disabled

  // Determine the number of questions based on access level
  let numberOfQuestions: number
  if (userType === "revision" || userType === "revisionAI") {
    numberOfQuestions = topic.questionCount
  } else if (userType === "basic") {
    numberOfQuestions = 10
  } else {
    numberOfQuestions = 5
  }

  // Calculate the actual number of available questions
  const availableQuestions = Math.min(numberOfQuestions, topic.questionCount)

  return (
    <Card
      className={`h-full flex flex-col transition-all ${!isDisabled ? "hover:shadow-md hover:shadow-emerald-100" : "opacity-80"}`}
    >
      <CardHeader className="pb-3">
        {/* Topic number badge positioned at top right */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDisabled ? "bg-gray-100" : "bg-emerald-50"}`}>
              <span className={isDisabled ? "text-gray-400" : "text-emerald-600"}>
                <DynamicIcon iconName={topic.icon} size={20} />
              </span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold leading-tight">{topic.name}</CardTitle>
            </div>
          </div>
          {topic.topicnumber && (
            <Badge variant="outline" className="text-xs font-medium shrink-0 text-muted-foreground">
              {topic.topicnumber}
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm leading-relaxed">{topic.summary}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow pt-0">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Questions available</span>
          <span className="font-medium text-foreground">
            {availableQuestions} of {topic.questionCount}
          </span>
        </div>

        {/* Progress bar showing question availability */}
        <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${isDisabled ? "bg-gray-200" : "bg-emerald-100"}`}
            style={{ width: `${(availableQuestions / topic.questionCount) * 100}%` }}
          ></div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        {isDisabled ? (
          <Button className="w-full" variant="outline" disabled>
            Coming Soon
          </Button>
        ) : (
          <Link href={`/questions/${topic.slug}`} className="w-full">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              Start Quiz
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Topic } from "@/lib/types"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import React from "react"
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
    numberOfQuestions = topic.questions.length
  } else if (userType === "basic") {
    // numberOfQuestions = 10
    numberOfQuestions = topic.questions.length
  } else {
    // numberOfQuestions = 5
    numberOfQuestions = topic.questions.length  
  }

  // Calculate the actual number of available questions
  const availableQuestions = Math.min(numberOfQuestions, topic.questionCount)

  return (
    <Card className={`h-full flex flex-col transition-all ${!isDisabled ? "hover:shadow-md" : "opacity-80"}`}>
      <CardHeader className="relative">
        {/* Pill in the top-right */}
        {topic.topicnumber && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-muted text-xs font-semibold text-muted-foreground border border-border shadow">
            {topic.topicnumber}
          </span>
        )}
        <CardTitle className="flex items-center gap-3">
          <span className={isDisabled ? "text-gray-400" : "text-emerald-500"}>
            <DynamicIcon iconName={topic.icon} size={25} />
          </span>
          <span className="font-semibold text-lg">{topic.name}</span>
        </CardTitle>
        {/* <CardDescription>{topic.description}</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{availableQuestions} of {topic.questionCount} questions available</p>
      </CardContent>
      <CardFooter>
        {isDisabled ? (
          <Button className="w-full" variant="outline" disabled>
            Coming Soon
          </Button>
        ) : (
          <Link href={`/questions/${topic.slug}`} className="w-full">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}

import { TopicGrid } from "@/components/topic-grid"
import { topics, currentUser } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Settings, Sparkles } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const hasPaid = currentUser.has_paid

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">GCSE Computer Science Quiz</h1>
          {hasPaid && (
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          )}
        </div>

        {!hasPaid && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4 mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row items-start sm:items-center gap-3">
              <div className="shrink-0 bg-emerald-100 p-2 rounded-full">
                <Sparkles className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-emerald-800">Free Version</h3>
                <p className="text-sm text-emerald-700">
                  You're using the free version with self-assessment. Upgrade to get AI-powered feedback.
                </p>
              </div>
              <div className="mt-3 sm:mt-0">
                <Link href="/coming-soon">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    Upgrade
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <p className="text-base md:text-lg text-muted-foreground">
            Select a topic below to test your knowledge with {hasPaid ? "AI-marked" : "self-assessed"} questions
          </p>
        </div>

        <TopicGrid topics={topics} />
      </div>
    </div>
  )
}

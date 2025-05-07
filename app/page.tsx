import { TopicGrid } from "@/components/topic-grid"
import { topics } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Settings, Sparkles, User, Star } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"

export default async function Home() {
  const supabase = await createClient()

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get the user's profile data including user_type
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('email', user?.email)
    .single()

  const userType = profile?.user_type
  const freeUser = !user || user.email === "student@example.com"

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">GCSE Computer Science Quiz</h1>
          {userType === 'basic' || userType === 'revision' || userType === 'revision-plus' && (
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          )}
        </div>

        {/* Free Version Call to Action */}
        {freeUser && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg p-4 mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row items-start sm:items-center gap-3">
              <div className="shrink-0 bg-red-100 p-2 rounded-full">
                <User className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-red-800">Free Version</h3>
                <p className="text-sm text-red-700">
                  You&apos;re using the free version with limited questions. Sign up to get more questions.
                </p>
              </div>
              <div className="mt-3 sm:mt-0">
                <Link href="/login?tab=register">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Signed Up Free Version Call to Action */}
        {userType === 'basic' && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row items-start sm:items-center gap-3">
              <div className="shrink-0 bg-amber-100 p-2 rounded-full">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-amber-800">Signed Up Version</h3>
                <p className="text-sm text-amber-700">
                  You&apos;re using the free version. Upgrade to get full access to all questions.
                </p>
              </div>
              <div className="mt-3 sm:mt-0">
                <Link href="/coming-soon">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                    Upgrade
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Premium Version Call to Action */}
        {userType === 'revision' && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4 mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row items-start sm:items-center gap-3">
              <div className="shrink-0 bg-emerald-100 p-2 rounded-full">
                <Sparkles className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-emerald-800">Premium Version</h3>
                <p className="text-sm text-emerald-700">
                  You&apos;re using the premium version with self-assessment. Coming soon get AI-powered feedback.
                </p>
              </div>
              <div className="mt-3 sm:mt-0">
                <Link href="/coming-soon">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    Register Interest for AI
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <p className="text-base md:text-lg text-muted-foreground">
            Select a topic below to test your knowledge with {userType == "revision plus" ? "AI-marked" : "self-assessed"} questions
          </p>
        </div>

        <TopicGrid topics={topics} userType={userType} />
      </div>
    </div>
  )
}

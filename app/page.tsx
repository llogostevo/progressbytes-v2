import { TopicGrid } from "@/components/topic-grid"
import { topics } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { CTABanner } from "@/components/cta-banner"
import { UserLogin } from "@/components/user-login"

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

  // Track page visit
  if (user) {
    await supabase.from('user_activity').insert({
      user_id: user.id,
      event: 'visited_home',
      path: '/',
      user_email: user.email
    })
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">GCSE Computer Science Quiz</h1>
          <UserLogin email={user?.email} />

          {userType === 'basic' || userType === 'revision' || userType === 'revision-plus' && (
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          )}
        </div>

        {/* CTA Banner */}
        <div className="mb-6 md:mb-8">
          {freeUser && <CTABanner variant="free" />}
          {userType === 'basic' && <CTABanner variant="basic" />}
          {userType === 'revision' && <CTABanner variant="premium" />}
        </div>

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

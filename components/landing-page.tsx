import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { Pricing } from "@/components/pricing"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Pricing />
        <section className="w-full py-12 md:py-24 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-md space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold">Get Started Today</h2>
                <p className="text-muted-foreground">
                  Sign up to access OCR Computer Science quizzes and track your progress.
                </p>
              </div>
              <div className="flex justify-center">
                <Button asChild size="lg">
                  <Link href="/login">Sign In or Register</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

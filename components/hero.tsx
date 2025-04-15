import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Master OCR Computer Science
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Interactive quizzes designed specifically for OCR Computer Science students. Test your knowledge, track
                your progress, and identify areas for improvement.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Comprehensive coverage of all OCR Computer Science topics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Multiple-choice questions with detailed explanations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Track your progress and identify weak areas</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="#login">Get Started</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Ready for your exams?</h2>
              <p className="text-muted-foreground">
                Our platform helps you prepare for OCR Computer Science exams with targeted practice questions and
                progress tracking.
              </p>
            </div>
            <div className="mt-4 grid gap-4">
              <div className="rounded-md bg-muted p-4">
                <div className="font-medium">Example Question:</div>
                <p className="mt-2">What does CPU stand for?</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border border-primary"></div>
                    <span>Central Processing Unit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border"></div>
                    <span>Computer Processing Unit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border"></div>
                    <span>Central Program Unit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

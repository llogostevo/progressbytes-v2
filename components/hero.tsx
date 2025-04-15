"use client"

import { LoginForm } from "@/components/login-form"
import { useMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  const isMobile = useMobile()

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Master Coding Challenges with ProgressBytes
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                A platform for students to practice coding challenges, track progress, and for teachers to monitor
                student development.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="#signup">Get Started</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
            {isMobile && (
              <div className="mt-8 rounded-lg border bg-card p-6">
                <LoginForm />
              </div>
            )}
          </div>
          {!isMobile && (
            <div className="rounded-lg border bg-card p-6">
              <LoginForm />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

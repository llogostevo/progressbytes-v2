import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function Pricing() {
  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Simple Pricing</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Affordable access to comprehensive OCR Computer Science quizzes.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-md pt-12">
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Student Access</CardTitle>
              <CardDescription>Everything you need to excel in OCR Computer Science</CardDescription>
              <div className="mt-4 text-4xl font-bold">
                £1<span className="text-lg font-normal">/student</span>
              </div>
              <p className="text-sm text-muted-foreground">One-time payment for full access</p>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Access to all units, topics, and subtopics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unlimited quizzes and practice questions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Progress tracking dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Performance analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Detailed explanations for all answers</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Get Started</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}

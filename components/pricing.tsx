import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function Pricing() {
  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">Pricing</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Simple, transparent pricing</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Choose the plan that&apos;s right for you and your students.
            </p>
          </div>
        </div>
        <div className="grid gap-6 pt-12 lg:grid-cols-3 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Student</CardTitle>
              <CardDescription>For individual students looking to improve their coding skills.</CardDescription>
              <div className="mt-4 text-4xl font-bold">Free</div>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Access to all coding challenges</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Save and track completed challenges</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Basic code editor</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Community support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Sign Up</Button>
            </CardFooter>
          </Card>
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Teacher Basic</CardTitle>
              <CardDescription>For teachers with small classes.</CardDescription>
              <div className="mt-4 text-4xl font-bold">Free</div>
              <p className="text-sm text-muted-foreground">Up to 5 students</p>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>All Student features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Track student progress</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Provide feedback on solutions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Basic analytics</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Sign Up</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Teacher Premium</CardTitle>
              <CardDescription>For teachers with larger classes.</CardDescription>
              <div className="mt-4 text-4xl font-bold">
                £30<span className="text-lg font-normal">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">Up to 30 students (£1 per additional student)</p>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>All Teacher Basic features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Advanced testing for students</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Detailed performance analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Sign Up</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}

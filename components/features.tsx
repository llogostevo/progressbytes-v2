import { CheckCircle, Code, Users, LineChart } from "lucide-react"

export function Features() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Everything you need to master coding
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              ProgressBytes provides a comprehensive platform for both students and teachers to excel in coding
              challenges.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 md:gap-12">
          <div className="grid gap-6">
            <div className="flex items-start gap-4">
              <Code className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Coding Challenges</h3>
                <p className="text-muted-foreground">
                  Access a wide range of coding challenges designed to improve your programming skills.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Progress Tracking</h3>
                <p className="text-muted-foreground">
                  Save your challenges and mark them as completed to track your progress over time.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="flex items-start gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Teacher Monitoring</h3>
                <p className="text-muted-foreground">
                  Teachers can track student progress and provide feedback on their solutions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <LineChart className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Advanced Testing</h3>
                <p className="text-muted-foreground">
                  Premium tiers include access to advanced testing features to validate your code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

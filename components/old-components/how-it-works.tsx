import { ArrowRight, BookOpen, CheckSquare, Layers, List } from "lucide-react"

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">How It Works</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform organizes OCR Computer Science content in a structured way to help you learn efficiently.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl mt-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Layers className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Structured Learning Path</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold">Units</h4>
                    <p className="text-sm text-muted-foreground">
                      Major sections of the OCR Computer Science curriculum
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <ArrowRight className="mx-auto h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold">Topics</h4>
                    <p className="text-sm text-muted-foreground">Key areas within each unit</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <ArrowRight className="mx-auto h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold">Subtopics</h4>
                    <p className="text-sm text-muted-foreground">Specific concepts within each topic</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <ArrowRight className="mx-auto h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold">Questions</h4>
                    <p className="text-sm text-muted-foreground">Multiple-choice questions to test your knowledge</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-start gap-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold">Study Dashboard</h3>
                    <p className="text-muted-foreground">
                      Track your progress across all units and topics. See which areas need more attention based on your
                      quiz results.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-start gap-4">
                  <List className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold">Targeted Practice</h3>
                    <p className="text-muted-foreground">
                      Focus on specific units or topics, or take comprehensive quizzes covering multiple areas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-start gap-4">
                  <CheckSquare className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold">Immediate Feedback</h3>
                    <p className="text-muted-foreground">
                      Get instant feedback on your answers and see explanations for correct solutions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-lg border bg-card p-6">
            <h3 className="text-xl font-bold mb-4">Database Structure</h3>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border rounded-lg">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Table
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        >
                          Purpose
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">units</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          Major sections of the curriculum
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">topics</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          Key areas within each unit
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">subtopics</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          Specific concepts within topics
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">questions</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          Multiple-choice questions for each subtopic
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">answers</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          Possible answers for each question (with correct flag)
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">user_answers</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          Records of student answers and correctness
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

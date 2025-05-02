"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, CheckCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { z } from "zod"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  userType: z.enum(["teacher", "student", "other"], {
    required_error: "Please select a user type",
  }),
  examYear: z.enum(["2025", "2026", "2027", "not-applicable"], {
    required_error: "Please select when you'll be sitting your GCSE",
  }),
})

type FormData = z.infer<typeof formSchema>

export default function ComingSoonPage() {
  const [formData, setFormData] = useState<Partial<FormData>>({
    userType: undefined,
    examYear: undefined,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate form data
      formSchema.parse(formData)

      // In a real app, this would send the data to a server
      console.log("Form submitted:", formData)

      // Show success message
      setIsSubmitted(true)
      setErrors({})
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to a simple object
        const formattedErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(formattedErrors)
      }
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </div>

        {isSubmitted ? (
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                Thank You!
              </CardTitle>
              <CardDescription className="text-emerald-700">
                We've received your information and will notify you when AI feedback becomes available.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-700">
                In the meantime, you can continue using the free version with self-assessment to improve your Computer
                Science knowledge.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/" className="w-full">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Return to Home</Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-amber-500" />
                <CardTitle className="text-2xl">AI Feedback Coming Soon</CardTitle>
              </div>
              <CardDescription>
                Our AI-powered feedback system is currently in development and will be available soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                <h3 className="font-medium text-amber-800 mb-2">Want to know when it's available?</h3>
                <p className="text-sm text-amber-700">
                  Leave your details below and we'll notify you as soon as our AI feedback feature is ready.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label>User Type</Label>
                  <RadioGroup
                    defaultValue={formData.userType}
                    onValueChange={(value) => handleChange("userType", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="teacher" id="teacher" />
                      <Label htmlFor="teacher">Teacher</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student">Student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                  {errors.userType && <p className="text-sm text-red-500">{errors.userType}</p>}
                </div>

                <div className="space-y-2">
                  <Label>When will you be sitting your GCSE?</Label>
                  <RadioGroup
                    defaultValue={formData.examYear}
                    onValueChange={(value) => handleChange("examYear", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2025" id="2025" />
                      <Label htmlFor="2025">2025</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2026" id="2026" />
                      <Label htmlFor="2026">2026</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2027" id="2027" />
                      <Label htmlFor="2027">2027</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not-applicable" id="not-applicable" />
                      <Label htmlFor="not-applicable">Not Applicable</Label>
                    </div>
                  </RadioGroup>
                  {errors.examYear && <p className="text-sm text-red-500">{errors.examYear}</p>}
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Notify Me When Available
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

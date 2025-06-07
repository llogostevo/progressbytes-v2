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
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  userType: z.enum(["teacher", "student", "other"], {
    required_error: "Please select a user type",
  }),
  examYear: z.enum(["2025", "2026", "2027", "not-applicable"], {
    required_error: "Please select when you'll be sitting your GCSE",
  }),
  school: z.string().min(1, { message: "Please enter your school name" }),
})

type FormData = z.infer<typeof formSchema>

export default function ComingSoonPage() {
  const [formData, setFormData] = useState<Partial<FormData>>({
    userType: undefined,
    examYear: undefined,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data
      formSchema.parse(formData)

      // Create Supabase client
      const supabase = createClient()

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('You must be logged in to submit this form')
      }

      // Log the data we're about to send
      console.log('Submitting form data:', formData)

      // Insert data into Supabase
      const { error } = await supabase
        .from('ai_upgrade')
        .insert([
          {
            email: formData.email,
            user_type: formData.userType,
            exam_year: formData.examYear,
            school: formData.school,
            created_at: new Date().toISOString(),
          },
        ])

      if (error) {
        console.error('Supabase error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          error: error
        })
        throw new Error(`Supabase error: ${error.message}`)
      }

      // Update the user's profile to hide the banner
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ ai_interest_banner: false })
        .eq('email', user.email)

      if (profileError) {
        console.error('Error updating profile:', profileError)
        // Don't throw here, as the main form submission was successful
      }

      // Show success message
      setIsSubmitted(true)
      setErrors({})
      toast.success('Thank you for your interest! We will notify you when AI feedback becomes available.')
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
      } else {
        // Handle other errors
        console.error('Error submitting form:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        setErrors({ submit: errorMessage })
        toast.error(`Failed to submit form: ${errorMessage}`)
      }
    } finally {
      setIsSubmitting(false)
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
                We&apos;ve received your information and will notify you when AI feedback becomes available.
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
          <Card className="border-0 shadow-sm">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-amber-500" />
                <CardTitle className="text-2xl">AI Feedback Coming Soon</CardTitle>
              </div>
              <CardDescription>
                Our AI-powered feedback system is currently in development and will be available soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <h3 className="font-medium text-amber-800 mb-2">Want to know when it&apos;s available?</h3>
                <p className="text-sm text-amber-700">
                  Leave your details below and we&apos;ll notify you as soon as our AI feedback feature is ready.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="h-10"
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school" className="text-sm font-medium">School Name</Label>
                  <Input
                    id="school"
                    type="text"
                    placeholder="Your school name"
                    onChange={(e) => handleChange("school", e.target.value)}
                    className="h-10"
                  />
                  {errors.school && <p className="text-sm text-red-500">{errors.school}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">User Type</Label>
                  <div className="ml-2 mt-2">
                    <RadioGroup
                      defaultValue={formData.userType}
                      onValueChange={(value) => handleChange("userType", value)}
                      className="space-y-0"
                    >
                      <div className="flex items-center space-x-2 group">
                        <RadioGroupItem value="teacher" id="teacher" className="border-muted-foreground text-muted-foreground group-data-[state=checked]:border-black group-data-[state=checked]:text-black" />
                        <Label htmlFor="teacher" className="text-sm text-muted-foreground group-data-[state=checked]:text-black">Teacher</Label>
                      </div>
                      <div className="flex items-center space-x-2 group">
                        <RadioGroupItem value="student" id="student" className="border-muted-foreground text-muted-foreground group-data-[state=checked]:border-black group-data-[state=checked]:text-black" />
                        <Label htmlFor="student" className="text-sm text-muted-foreground group-data-[state=checked]:text-black">Student</Label>
                      </div>
                      <div className="flex items-center space-x-2 group">
                        <RadioGroupItem value="other" id="other" className="border-muted-foreground text-muted-foreground group-data-[state=checked]:border-black group-data-[state=checked]:text-black" />
                        <Label htmlFor="other" className="text-sm text-muted-foreground group-data-[state=checked]:text-black">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {errors.userType && <p className="text-sm text-red-500">{errors.userType}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">When will you be sitting your GCSE?</Label>
                  <div className="ml-2 mt-2">
                    <RadioGroup
                      defaultValue={formData.examYear}
                      onValueChange={(value) => handleChange("examYear", value)}
                      className="space-y-0"
                    >
                      <div className="flex items-center space-x-2 group">
                        <RadioGroupItem value="2025" id="2025" className="border-muted-foreground text-muted-foreground group-data-[state=checked]:border-black group-data-[state=checked]:text-black" />
                        <Label htmlFor="2025" className="text-sm text-muted-foreground group-data-[state=checked]:text-black">2025</Label>
                      </div>
                      <div className="flex items-center space-x-2 group">
                        <RadioGroupItem value="2026" id="2026" className="border-muted-foreground text-muted-foreground group-data-[state=checked]:border-black group-data-[state=checked]:text-black" />
                        <Label htmlFor="2026" className="text-sm text-muted-foreground group-data-[state=checked]:text-black">2026</Label>
                      </div>
                      <div className="flex items-center space-x-2 group">
                        <RadioGroupItem value="2027" id="2027" className="border-muted-foreground text-muted-foreground group-data-[state=checked]:border-black group-data-[state=checked]:text-black" />
                        <Label htmlFor="2027" className="text-sm text-muted-foreground group-data-[state=checked]:text-black">2027</Label>
                      </div>
                      <div className="flex items-center space-x-2 group">
                        <RadioGroupItem value="not-applicable" id="not-applicable" className="border-muted-foreground text-muted-foreground group-data-[state=checked]:border-black group-data-[state=checked]:text-black" />
                        <Label htmlFor="not-applicable" className="text-sm text-muted-foreground group-data-[state=checked]:text-black">Not Applicable</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {errors.examYear && <p className="text-sm text-red-500">{errors.examYear}</p>}
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-10" disabled={isSubmitting}>
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

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Book, GraduationCap, School, BookMarked, Library, BookOpenCheck, BookOpenText, BookmarkCheck, BookmarkPlus, BookmarkX, User, CreditCard } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { redirect } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Course {
  name: string
  slug: string
  description: string
  icon: string
}

type UserRole = 'admin' | 'student' | 'teacher'
type UserType = 'basic' | 'revision' | 'revisionAI'

export default function SettingsPage() {
  const [userType, setUserType] = useState<UserType | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userCourses, setUserCourses] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [addCourseDialogOpen, setAddCourseDialogOpen] = useState(false)
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)

  const supabase = createClient()

  const handleDeleteCourse = async () => {
    if (!courseToDelete || !userEmail || deleteConfirmation !== "delete") return

    setIsDeleting(true)
    const supabase = createClient()

    try {
      // Get current courses
      const { data: profile } = await supabase
        .from("profiles")
        .select("courses")
        .eq("email", userEmail)
        .single()

      if (!profile) throw new Error("Profile not found")

      // Remove the course from the array
      const updatedCourses = profile.courses.filter((course: string) => course !== courseToDelete)

      // Update the profile
      const { error } = await supabase
        .from("profiles")
        .update({ courses: updatedCourses })
        .eq("email", userEmail)

      if (error) throw error

      // Update local state
      setUserCourses(updatedCourses)
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
      setDeleteConfirmation("")
    } catch (error) {
      console.error("Error deleting course:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddCourse = async (courseSlug: string) => {
    if (!userEmail) return

    setIsAddingCourse(true)
    const supabase = createClient()

    try {
      // Get current courses
      const { data: profile } = await supabase
        .from("profiles")
        .select("courses")
        .eq("email", userEmail)
        .single()

      if (!profile) throw new Error("Profile not found")

      // Add the course if it's not already in the array
      if (!profile.courses.includes(courseSlug)) {
        const updatedCourses = [...profile.courses, courseSlug]

        // Update the profile
        const { error } = await supabase
          .from("profiles")
          .update({ courses: updatedCourses })
          .eq("email", userEmail)

        if (error) throw error

        // Update local state
        setUserCourses(updatedCourses)
      }

      setAddCourseDialogOpen(false)
    } catch (error) {
      console.error("Error adding course:", error)
    } finally {
      setIsAddingCourse(false)
    }
  }

  const handlePlanSelect = async (planType: UserType) => {
    if (!userEmail || planType === userType) return

    setIsLoadingCheckout(true)
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: getPriceIdForPlan(planType),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (!data.sessionId) {
        throw new Error('No session ID returned')
      }

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'An error occurred during checkout')
    } finally {
      setIsLoadingCheckout(false)
    }
  }

  const getPriceIdForPlan = (planType: UserType): string => {
    switch (planType) {
      case 'revision':
        return process.env.NEXT_PUBLIC_STRIPE_REVISION_PRICE_ID!
      case 'revisionAI':
        return process.env.NEXT_PUBLIC_STRIPE_REVISION_AI_PRICE_ID!
      default:
        return process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID!
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        redirect('/')
      }
      setUserEmail(user.email || null)

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("userid", user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
      } else {
        setUserType(profile?.user_type)
        setUserRole(profile?.role || 'student')
        setUserCourses(profile?.courses || [])
      }
    }

    const fetchCourses = async () => {
      const { data: courses, error } = await supabase
        .from("courses")
        .select("*")
        .order('name')

      if (error) {
        console.error("Error fetching courses:", error)
      } else {
        setAvailableCourses(courses || [])
      }
    }

    fetchUser()
    fetchCourses()
    setIsLoading(false)
  }, [supabase])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Link href="/" className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* User Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Your account information and subscription status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <User className="h-6 w-6 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <GraduationCap className="h-6 w-6 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Role</h3>
                <p className="text-sm text-muted-foreground capitalize">{userRole}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Subscription</h3>
                <p className="text-sm text-muted-foreground capitalize">{userType || 'Basic'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Choose a plan that best fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Basic Plan */}
            <Card className={userType === 'basic' ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <CardDescription>Essential features for self-study</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Access to all questions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Book className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Basic progress tracking</span>
                  </div>
                  <Button 
                    className="w-full" 
                    variant={userType === 'basic' ? 'default' : 'outline'}
                    onClick={() => handlePlanSelect('basic')}
                    disabled={isLoadingCheckout}
                  >
                    {userType === 'basic' ? 'Current Plan' : isLoadingCheckout ? 'Loading...' : 'Select Plan'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Revision Plan */}
            <Card className={userType === 'revision' ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle>Revision</CardTitle>
                <CardDescription>Enhanced learning experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Everything in Basic</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookmarkCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Detailed progress analytics</span>
                  </div>
                  <Button 
                    className="w-full" 
                    variant={userType === 'revision' ? 'default' : 'outline'}
                    onClick={() => handlePlanSelect('revision')}
                    disabled={isLoadingCheckout}
                  >
                    {userType === 'revision' ? 'Current Plan' : isLoadingCheckout ? 'Loading...' : 'Select Plan'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Revision AI Plan */}
            <Card className={userType === 'revisionAI' ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle>Revision AI</CardTitle>
                <CardDescription>AI-powered learning experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <BookOpenText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Everything in Revision</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">AI-powered feedback</span>
                  </div>
                  <Button 
                    className="w-full" 
                    variant={userType === 'revisionAI' ? 'default' : 'outline'}
                    onClick={() => handlePlanSelect('revisionAI')}
                    disabled={isLoadingCheckout}
                  >
                    {userType === 'revisionAI' ? 'Current Plan' : isLoadingCheckout ? 'Loading...' : 'Select Plan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Course Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Courses</CardTitle>
              <CardDescription>Manage your enrolled courses</CardDescription>
            </div>
            <Button onClick={() => setAddCourseDialogOpen(true)} disabled={isAddingCourse}>
              <BookmarkPlus className="h-4 w-4 mr-2" />
              {isAddingCourse ? 'Adding...' : 'Add Course'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No courses enrolled yet</p>
            ) : (
              userCourses.map((courseSlug) => {
                const course = availableCourses.find(c => c.slug === courseSlug)
                if (!course) return null

                return (
                  <Card key={courseSlug}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {course.icon === 'book' && <Book className="h-6 w-6 text-muted-foreground" />}
                          {course.icon === 'library' && <Library className="h-6 w-6 text-muted-foreground" />}
                          {course.icon === 'bookmarked' && <BookMarked className="h-6 w-6 text-muted-foreground" />}
                          <div>
                            <h3 className="font-medium">{course.name}</h3>
                            <p className="text-sm text-muted-foreground">{course.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCourseToDelete(courseSlug)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <BookmarkX className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Course Dialog */}
      <Dialog open={addCourseDialogOpen} onOpenChange={setAddCourseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Course</DialogTitle>
            <DialogDescription>
              Select a course to add to your profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableCourses
              .filter(course => !userCourses.includes(course.slug))
              .map(course => (
                <Card 
                  key={course.slug} 
                  className={`cursor-pointer hover:bg-muted/50 ${isAddingCourse ? 'opacity-50 pointer-events-none' : ''}`} 
                  onClick={() => handleAddCourse(course.slug)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                      {course.icon === 'book' && <Book className="h-6 w-6 text-muted-foreground" />}
                      {course.icon === 'library' && <Library className="h-6 w-6 text-muted-foreground" />}
                      {course.icon === 'bookmarked' && <BookMarked className="h-6 w-6 text-muted-foreground" />}
                      <div>
                        <h3 className="font-medium">{course.name}</h3>
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmation">Type &quot;delete&quot; to confirm</Label>
              <Input
                id="confirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="delete"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCourse}
                disabled={deleteConfirmation !== "delete" || isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Course"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

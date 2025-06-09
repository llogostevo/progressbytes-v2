"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Book, GraduationCap, School, BookMarked, Library, BookOpenCheck, BookOpenText, BookmarkCheck, BookmarkPlus, User, CreditCard, Plus, Copy, Eye, Trash2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { redirect } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { loadStripe } from '@stripe/stripe-js'
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface Course {
  name: string
  slug: string
  description: string
  icon: string
  unit: number
}

interface Class {
  id: string
  name: string
  join_code: string
  teacher_id: string
  created_at: string
  teacher?: {
    email: string
    full_name: string
  }
}

interface ClassMember {
  id: string
  class_id: string
  student_id: string
  joined_at: string
  class: Class
  members?: {
    student_id: string
    joined_at: string
    student: {
      email: string
      full_name: string
    }
  }[]
}

interface SupabaseMembership {
  id: string
  class_id: string
  student_id: string
  joined_at: string
  class: {
    id: string
    name: string
    join_code: string
    teacher_id: string
    created_at: string
    teacher: {
      email: string
      full_name: string
    }
  }
  members?: SupabaseMember[]
}

interface SupabaseMember {
  student_id: string
  joined_at: string
  student: {
    email: string
    full_name: string
  }
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
  const [createClassDialogOpen, setCreateClassDialogOpen] = useState(false)
  const [newClassName, setNewClassName] = useState("")
  const [isCreatingClass, setIsCreatingClass] = useState(false)
  const [userClasses, setUserClasses] = useState<Class[]>([])
  const [showJoinCodeDialogOpen, setShowJoinCodeDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [deleteClassDialogOpen, setDeleteClassDialogOpen] = useState(false)
  const [classToDelete, setClassToDelete] = useState<Class | null>(null)
  const [deleteClassConfirmation, setDeleteClassConfirmation] = useState("")
  const [isDeletingClass, setIsDeletingClass] = useState(false)
  const [joinClassDialogOpen, setJoinClassDialogOpen] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [isJoiningClass, setIsJoiningClass] = useState(false)
  const [studentClasses, setStudentClasses] = useState<ClassMember[]>([])
  const [viewClassDialogOpen, setViewClassDialogOpen] = useState(false)
  const [selectedMembership, setSelectedMembership] = useState<ClassMember | null>(null)
  const [leaveClassDialogOpen, setLeaveClassDialogOpen] = useState(false)
  const [leaveClassConfirmation, setLeaveClassConfirmation] = useState("")
  const [isLeavingClass, setIsLeavingClass] = useState(false)

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

  const generateJoinCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      toast.error('Please enter a class name')
      return
    }

    setIsCreatingClass(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const joinCode = generateJoinCode()
      const { data: newClass, error } = await supabase
        .from('classes')
        .insert([
          {
            name: newClassName.trim(),
            join_code: joinCode,
            teacher_id: user.id
          }
        ])
        .select()
        .single()

      if (error) throw error

      setUserClasses(prev => [...prev, newClass])
      setCreateClassDialogOpen(false)
      setNewClassName("")
      toast.success('Class created successfully')
    } catch (error) {
      console.error('Error creating class:', error)
      toast.error('Failed to create class')
    } finally {
      setIsCreatingClass(false)
    }
  }

  const handleCopyJoinCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Join code copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy join code')
    }
  }

  const handleDeleteClass = async () => {
    if (!classToDelete || deleteClassConfirmation !== "delete") return

    setIsDeletingClass(true)
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classToDelete.id)

      if (error) throw error

      setUserClasses(prev => prev.filter(c => c.id !== classToDelete.id))
      setDeleteClassDialogOpen(false)
      setClassToDelete(null)
      setDeleteClassConfirmation("")
      toast.success('Class deleted successfully')
    } catch (error) {
      console.error('Error deleting class:', error)
      toast.error('Failed to delete class')
    } finally {
      setIsDeletingClass(false)
    }
  }

  const handleJoinClass = async () => {
    if (!joinCode.trim()) {
      toast.error('Please enter a join code')
      return
    }

    setIsJoiningClass(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      // First, find the class with the given join code
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('join_code', joinCode.trim())
        .single()

      if (classError || !classData) {
        throw new Error('Invalid join code')
      }

      // Check if student is already a member
      const { data: existingMember } = await supabase
        .from('class_members')
        .select('*')
        .eq('class_id', classData.id)
        .eq('student_id', user.id)
        .single()

      if (existingMember) {
        throw new Error('You are already a member of this class')
      }

      // Add student to class
      const { data: newMember, error: joinError } = await supabase
        .from('class_members')
        .insert([
          {
            class_id: classData.id,
            student_id: user.id,
            joined_at: new Date().toISOString()
          }
        ])
        .select(`
          *,
          class:classes(*)
        `)
        .single()

      if (joinError) throw joinError

      setStudentClasses(prev => [...prev, newMember])
      setJoinClassDialogOpen(false)
      setJoinCode("")
      toast.success('Successfully joined class')
    } catch (error) {
      console.error('Error joining class:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to join class')
    } finally {
      setIsJoiningClass(false)
    }
  }

  const handleLeaveClass = async () => {
    if (!selectedMembership || leaveClassConfirmation !== "delete") return

    setIsLeavingClass(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { error } = await supabase
        .from('class_members')
        .delete()
        .eq('class_id', selectedMembership.class_id)
        .eq('student_id', user.id)

      if (error) throw error

      setStudentClasses(prev => prev.filter(m => 
        m.class_id !== selectedMembership.class_id || m.student_id !== user.id
      ))
      setLeaveClassDialogOpen(false)
      setSelectedMembership(null)
      setLeaveClassConfirmation("")
      toast.success('Successfully left class')
    } catch (error) {
      console.error('Error leaving class:', error)
      toast.error('Failed to leave class')
    } finally {
      setIsLeavingClass(false)
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
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

      // Fetch user's classes
      if (profile?.role === 'teacher') {
        // Fetch classes where user is the teacher
        const { data: classes, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id)

        if (classesError) {
          console.error('Error fetching teaching classes:', classesError)
        } else {
          setUserClasses(classes || [])
        }
      }

      // Fetch classes where user is a student (for both students and teachers)
      const { data: memberships, error: membershipsError } = await supabase
        .from('class_members')
        .select(`
          class_id,
          student_id,
          joined_at,
          class:classes!inner (
            id,
            name,
            join_code,
            teacher_id,
            created_at,
            teacher:profiles!classes_teacher_id_fkey (
              email
            )
          )
        `)
        .eq('student_id', user.id)

      if (membershipsError) {
        console.error('Error fetching class memberships:', membershipsError)
      } else {
        // For each membership, fetch the class members
        const membershipsWithMembers = await Promise.all(
          ((memberships as unknown) as SupabaseMembership[] || []).map(async (membership) => {
            const { data: members, error: membersError } = await supabase
              .from('class_members')
              .select(`
                student_id,
                joined_at,
                student:profiles!class_members_student_id_fkey (
                  email
                )
              `)
              .eq('class_id', membership.class_id)

            if (membersError) {
              console.error('Error fetching class members:', membersError)
              return membership
            }

            return {
              ...membership,
              members: ((members as unknown) as SupabaseMember[])
            }
          })
        )

        // Transform the data to match our interface
        const transformedMemberships: ClassMember[] = membershipsWithMembers.map(membership => ({
          id: membership.id,
          class_id: membership.class_id,
          student_id: membership.student_id,
          joined_at: membership.joined_at,
          class: {
            id: membership.class.id,
            name: membership.class.name,
            join_code: membership.class.join_code,
            teacher_id: membership.class.teacher_id,
            created_at: membership.class.created_at,
            teacher: membership.class.teacher
          },
          members: membership.members?.map((member: SupabaseMember) => ({
            student_id: member.student_id,
            joined_at: member.joined_at,
            student: member.student
          }))
        }))
        
        console.log('Transformed memberships:', transformedMemberships) // Debug log
        setStudentClasses(transformedMemberships)
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
      {userRole !== 'student' && (
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
      )}

      {/* Course Management */}
      <Card className="mb-8">
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
                  <Card key={`enrolled-course-${courseSlug}`}>
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
                          <Trash2 className="h-4 w-4" />
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

      {/* Teacher Class Membership */}
      {userRole === 'teacher' && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Teacher Class Membership</CardTitle>
                <CardDescription>Manage your teaching classes</CardDescription>
              </div>
              <Button onClick={() => setCreateClassDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Class
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userClasses.length === 0 ? (
                <div className="text-center py-8">
                  <School className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">You are not currently teaching any classes</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setCreateClassDialogOpen(true)}
                  >
                    Create Your First Class
                  </Button>
                </div>
              ) : (
                userClasses.map((classItem) => (
                  <Card key={`teaching-class-${classItem.id}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{classItem.name}</h3>
                          <div className="mt-2 flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              Join Code: {classItem.join_code}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedClass(classItem)
                              setShowJoinCodeDialogOpen(true)
                            }}
                            title="Show Join Code"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setClassToDelete(classItem)
                              setDeleteClassDialogOpen(true)
                            }}
                            title="Delete Class"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Class Membership */}
      {(userRole === 'student' || userRole === 'teacher') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Student Class Membership</CardTitle>
                <CardDescription>View and join classes as a student</CardDescription>
              </div>
              <Button onClick={() => setJoinClassDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Join Class
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentClasses.length === 0 ? (
                <div className="text-center py-8">
                  <School className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">You are not currently enrolled in any classes</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setJoinClassDialogOpen(true)}
                  >
                    Join Your First Class
                  </Button>
                </div>
              ) : (
                studentClasses.map((membership) => (
                  <Card key={`enrolled-class-${membership.class_id}-${membership.student_id}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{membership.class.name}</h3>
                          <div className="mt-2 flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              Joined {new Date(membership.joined_at).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedMembership(membership)
                              setViewClassDialogOpen(true)
                            }}
                            title="View Class Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedMembership(membership)
                              setLeaveClassDialogOpen(true)
                            }}
                            title="Leave Class"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
                  key={`available-course-${course.slug}`}
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

      {/* Create Class Dialog */}
      <Dialog open={createClassDialogOpen} onOpenChange={setCreateClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Create a new class and get a join code for your students
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="className">Class Name</Label>
              <Input
                id="className"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Enter class name"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateClassDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateClass}
                disabled={isCreatingClass || !newClassName.trim()}
              >
                {isCreatingClass ? 'Creating...' : 'Create Class'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Show Join Code Dialog */}
      <Dialog open={showJoinCodeDialogOpen} onOpenChange={setShowJoinCodeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Class Join Code</DialogTitle>
            <DialogDescription>
              Share this code with your students so they can join your class
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-4xl font-mono font-bold tracking-wider mb-4">
                {selectedClass?.join_code}
              </div>
              <Button
                variant="outline"
                onClick={() => selectedClass && handleCopyJoinCode(selectedClass.join_code)}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowJoinCodeDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Class Dialog */}
      <Dialog open={deleteClassDialogOpen} onOpenChange={setDeleteClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this class? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deleteConfirmation">Type &quot;delete&quot; to confirm</Label>
              <Input
                id="deleteConfirmation"
                value={deleteClassConfirmation}
                onChange={(e) => setDeleteClassConfirmation(e.target.value)}
                placeholder="delete"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteClassDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteClass}
                disabled={deleteClassConfirmation !== "delete" || isDeletingClass}
              >
                {isDeletingClass ? "Deleting..." : "Delete Class"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Class Dialog */}
      <Dialog open={joinClassDialogOpen} onOpenChange={setJoinClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Class</DialogTitle>
            <DialogDescription>
              Enter the join code provided by your teacher
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="joinCode">Join Code</Label>
              <Input
                id="joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter join code"
                className="uppercase"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setJoinClassDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleJoinClass}
                disabled={isJoiningClass || !joinCode.trim()}
              >
                {isJoiningClass ? 'Joining...' : 'Join Class'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Class Dialog */}
      <Dialog open={viewClassDialogOpen} onOpenChange={setViewClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Class Details</DialogTitle>
            <DialogDescription>
              Information about the class and its members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMembership && (
              <>
                <div className="space-y-2">
                  <h3 className="font-medium">Class Information</h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Name:</span> {selectedMembership.class.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Teacher:</span> {selectedMembership.class.teacher?.full_name || selectedMembership.class.teacher?.email || 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Joined:</span> {new Date(selectedMembership.joined_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Class Members</h3>
                  <div className="space-y-2">
                    {selectedMembership.members?.map((member) => (
                      <div key={member.student_id} className="flex items-center justify-between text-sm">
                        <span>{member.student.full_name || member.student.email}</span>
                        <Badge variant="secondary" className="text-xs">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Class Dialog */}
      <Dialog open={leaveClassDialogOpen} onOpenChange={setLeaveClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave this class? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leaveConfirmation">Type &quot;delete&quot; to confirm</Label>
              <Input
                id="leaveConfirmation"
                value={leaveClassConfirmation}
                onChange={(e) => setLeaveClassConfirmation(e.target.value)}
                placeholder="delete"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLeaveClassDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleLeaveClass}
                disabled={leaveClassConfirmation !== "delete" || isLeavingClass}
              >
                {isLeavingClass ? "Leaving..." : "Leave Class"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

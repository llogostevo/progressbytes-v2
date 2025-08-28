"use client"

import { createClient } from "@/utils/supabase/client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { redirect } from "next/navigation"
// import { loadStripe } from '@stripe/stripe-js'


// import type { Plan } from '@/lib/types';
import { UserType, userAccessLimits } from "@/lib/access";
import { useAccess } from "@/hooks/useAccess";


// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Book, GraduationCap, School, BookMarked, Library, User, CreditCard, Plus, Copy, Eye, Trash2, Upload, FileText, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { isTeacher } from "@/lib/access"
import UpgradePageClient from "./upgrade/UpgradePageClient"

// Initialize Stripe
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

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

interface ClassMemberRow {
  student_id: string
  joined_at: string
  class: {
    id: string
    teacher_id: string
  }[]
}

interface ProfileRow {
  userid: string
  email: string
  forename: string | null
  lastname: string | null
}




type UserRole = 'regular' | 'admin'

export default function SettingsPageCLient() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsPageContent />
    </Suspense>
  )
}

function SettingsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    </div>
  )
}

function SettingsPageContent() {
  const { maxClasses, maxStudentsPerClass } = useAccess()
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
  // const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)
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
  const [deleteMemberDialogOpen, setDeleteMemberDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<SupabaseMember | null>(null)
  const [isDeletingMember, setIsDeletingMember] = useState(false)


  // Teacher: add students by email or CSV
  const [addStudentEmail, setAddStudentEmail] = useState("")
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const [isBulkAdding, setIsBulkAdding] = useState(false)
  const [selectedClassMembers, setSelectedClassMembers] = useState<SupabaseMember[] | null>(null)

  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()


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


  // const cancelAllUserSubscriptions = async (userId: string): Promise<void> => {
  //   try {
  //     // Get user's profile to check if they have a Stripe customer ID
  //     const { data: profile, error: profileError } = await supabase
  //       .from('profiles')
  //       .select('stripe_customer_id')
  //       .eq('userid', userId)
  //       .single();

  //     if (profileError || !profile) {
  //       console.error('Error fetching profile or no profile found:', profileError);
  //       return; // No profile or customer ID, nothing to cancel
  //     }

  //     // If user has a Stripe customer ID, cancel all their active subscriptions
  //     if (profile.stripe_customer_id) {
  //       // Import stripe dynamically to avoid server-side import issues
  //       const { stripe } = await import('@/utils/stripe/stripe');

  //       const activeSubscriptions = await stripe.subscriptions.list({
  //         customer: profile.stripe_customer_id,
  //         status: 'active',
  //       });

  //       // Cancel all active subscriptions
  //       for (const subscription of activeSubscriptions.data) {
  //         await stripe.subscriptions.cancel(subscription.id);
  //         console.log(`Cancelled subscription ${subscription.id} for user ${userId}`);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error cancelling subscriptions for user:', userId, error);
  //     // Don't throw - let the calling function handle the error
  //   }
  // };


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


  // const handlePlanSelect = async (plan: Plan) => {
  //   if (!userEmail || plan.slug === userType) return;

  //   setIsLoadingCheckout(true);
  //   try {
  //     // If it's a free plan
  //     if (plan.price === 0) {
  //       const { data: { user } } = await supabase.auth.getUser();
  //       if (!user) throw new Error('User not found');

  //       // Check if user currently has a paid plan
  //       const { data: profile, error } = await supabase
  //         .from('profiles')
  //         .select('user_type, stripe_customer_id')
  //         .eq('userid', user.id)
  //         .single();

  //       if (error || !profile) throw new Error('Could not fetch user profile');

  //       // If they're on a paid plan, just update to free plan
  //       // The webhook will handle any subscription cancellation when Stripe sends events
  //       // TODO: need to code this from the DB rather than directly in the code here
  //       // TODO: cache the plan data
  //       if ((profile.user_type !== 'basic' && profile.user_type !== 'teacherBasic') && profile.stripe_customer_id) {
  //         // Cancel the subscription via API
  //         const cancelResponse = await fetch('/api/cancel-subscription', {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //         });

  //         if (!cancelResponse.ok) {
  //           const cancelData = await cancelResponse.json();
  //           throw new Error(cancelData.error || 'Failed to cancel subscription');
  //         }

  //         toast.info('Switching to free plan. Your subscription will be cancelled automatically.');
  //       }

  //       // Update to free plan
  //       const { error: updateError } = await supabase
  //         .from('profiles')
  //         .update({
  //           user_type: plan.slug,
  //           plan_end_date: null,
  //         })
  //         .eq('userid', user.id);

  //       if (updateError) throw updateError;

  //       setUserType(plan.slug);
  //       toast.success(`Successfully switched to ${plan.name}`);
  //       return;
  //     }

  //     // For paid plans — handle subscription creation/update
  //     const response = await fetch('/api/create-checkout-session', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         priceId: plan.stripe_price_id,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.error || 'Failed to create checkout session');
  //     }

  //     // Check if this was a direct subscription update (no checkout needed)
  //     if (data.success) {
  //       toast.success('Plan updated successfully!');
  //       setUserType(plan.slug);
  //       return;
  //     }

  //     // Otherwise, redirect to Stripe checkout
  //     if (!data.sessionId) {
  //       throw new Error('No session ID returned');
  //     }

  //     const stripe = await stripePromise;
  //     if (!stripe) {
  //       throw new Error('Stripe failed to load');
  //     }

  //     const { error: stripeError } = await stripe.redirectToCheckout({
  //       sessionId: data.sessionId,
  //     });

  //     if (stripeError) throw stripeError;

  //   } catch (error) {
  //     console.error('Error:', error);
  //     toast.error(
  //       error instanceof Error
  //         ? error.message
  //         : 'An error occurred during checkout, please contact support'
  //     );
  //   } finally {
  //     setIsLoadingCheckout(false);
  //   }
  // };

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

    // Check if user has reached their class limit
    if (userClasses.length >= maxClasses) {
      toast.error('You have reached your limit of classes, you will need to upgrade to add more classes')
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
    } catch (err) {
      console.error('Error creating class:', err)
      toast.error('Failed to create class')
    } finally {
      setIsCreatingClass(false)
    }
  }

  const handleCopyJoinCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Join code copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy join code: ' + (err as Error).message)
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

      // Get teacher's profile to check their access limits
      const { data: teacherProfile, error: teacherError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('userid', classData.teacher_id)
        .single()

      if (teacherError || !teacherProfile) {
        throw new Error('Could not verify teacher information')
      }

      // Get current student count in the class
      const { data: currentStudents, error: countError } = await supabase
        .from('class_members')
        .select('student_id', { count: 'exact' })
        .eq('class_id', classData.id)

      if (countError) {
        throw new Error('Could not verify class capacity')
      }

      const currentStudentCount = currentStudents?.length || 0

      // Get teacher's max students per class limit
      const teacherUserType = teacherProfile.user_type as UserType
      const teacherMaxStudents = userAccessLimits[teacherUserType]?.maxStudentsPerClass || 0

      // Check if class is full
      if (currentStudentCount >= teacherMaxStudents) {
        throw new Error('This class is full. Please contact your teacher to upgrade their plan or remove some students.')
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

  const handleDeleteClassMember = async () => {

    // Teacher context: removing from selectedClass dialog
    if (memberToDelete && selectedClass) {
      setIsDeletingMember(true)
      try {
        const { error } = await supabase
          .from('class_members')
          .delete()
          .eq('class_id', selectedClass.id)
          .eq('student_id', memberToDelete.student_id)

        if (error) throw error

        setSelectedClassMembers(prev => (prev || []).filter(m => m.student_id !== memberToDelete.student_id))
        setDeleteMemberDialogOpen(false)
        setMemberToDelete(null)
        toast.success('Student removed from class')
      } catch (error) {
        console.error('Error removing student:', error)
        toast.error('Failed to remove student from class')
      } finally {
        setIsDeletingMember(false)
      }
      return
    }

    // Student context: user leaving a class via their own membership card

    if (!memberToDelete || !selectedMembership) return

    setIsDeletingMember(true)
    try {
      const { error } = await supabase
        .from('class_members')
        .delete()
        .eq('class_id', selectedMembership.class_id)
        .eq('student_id', memberToDelete.student_id)

      if (error) throw error

      if (selectedMembership.members) {
        const updatedMembers = selectedMembership.members.filter(
          member => member.student_id !== memberToDelete.student_id
        )
        setSelectedMembership({
          ...selectedMembership,
          members: updatedMembers
        })
      }

      setDeleteMemberDialogOpen(false)
      setMemberToDelete(null)
      toast.success('Student removed from class')
    } catch (error) {
      console.error('Error removing student:', error)
      toast.error('Failed to remove student from class')
    } finally {
      setIsDeletingMember(false)
    }
  }

  // --- Teacher helpers: fetch, add, and bulk-add students to a class ---

  // Download CSV Template helper
  const handleDownloadCSVTemplate = () => {
    const header = 'email\n'
    const sampleRows = [
      'student1@example.com',
      'student2@example.com',
      'student3@example.com',
    ]
    const csv = header + sampleRows.join('\n') + '\n'

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_emails_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  const fetchSelectedClassMembers = async (classId: string) => {
    try {
      // Ensure we're acting as the teacher of this class (helps satisfy RLS)
      const { data: authData } = await supabase.auth.getUser()
      const teacherId = authData?.user?.id
      if (!teacherId) {
        toast.error('Not authenticated')
        setSelectedClassMembers([])
        return
      }

      // Fetch class_members for this class and teacher
      const { data, error } = await supabase
        .from('class_members')
        .select(`
          student_id,
          joined_at,
          class:classes!inner ( id, teacher_id )
        `)
        .eq('class_id', classId)
        .eq('class.teacher_id', teacherId)

      if (error) {
        console.error('Error fetching class members:', error)
        toast.error('Failed to load class members')
        setSelectedClassMembers([])
        return
      }

      // Get all student IDs
      const studentIds = (data || []).map((row: ClassMemberRow) => row.student_id)
      if (!studentIds.length) {
        setSelectedClassMembers([])
        return
      }
      // Fetch profiles for these students
      const { data: profiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('userid, email, forename, lastname')
        .in('userid', studentIds)

      console.log('studentIds:', studentIds)
      console.log('profiles fetched:', profiles)
      console.log('profiles error:', profilesErr)


      if (profilesErr) {
        console.error('Error fetching profiles:', profilesErr)
        toast.error('Failed to load student profiles')
        setSelectedClassMembers([])
        return
      }
      const profilesById = new Map<string, ProfileRow>((profiles || []).map((p: ProfileRow) => [p.userid, p]))
      // Normalize result
      const membersOnly = (data || []).map((m: ClassMemberRow) => {
        const profile = profilesById.get(m.student_id)
        console.log('profile', profile)
        const fullName = profile ? `${profile.forename ?? ''} ${profile.lastname ?? ''}`.trim() : ''

        return {
          student_id: m.student_id,
          joined_at: m.joined_at,
          student: {
            email: profile?.email || 'No email found',
            full_name: fullName,
          },
        }
      }) as SupabaseMember[]
      setSelectedClassMembers(membersOnly)
    } catch (e) {
      console.error('Error fetching class members (exception):', e)
      toast.error('Failed to load class members')
      setSelectedClassMembers([])
    }
  }

  const addStudentToClassByEmail = async (classId: string, email: string) => {
    try {
      setIsAddingStudent(true)
      const trimmed = email.trim().toLowerCase()
      if (!trimmed) {
        toast.error('Please enter an email')
        return
      }

      // Check if user has reached their student limit for this class
      const currentStudentCount = selectedClassMembers?.length || 0
      if (currentStudentCount >= maxStudentsPerClass) {
        toast.error('You have reached your limit of students for this class, you will need to upgrade to add more students')
        return
      }
      // Find user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('userid, email, forename, lastname')
        .eq('email', trimmed)
        .single()

      if (profileError || !profile) {
        toast.error(`Email not recognised: ${trimmed}`)
        return
      }

      // Already a member?
      const { data: existing } = await supabase
        .from('class_members')
        .select('student_id')
        .eq('class_id', classId)
        .eq('student_id', profile.userid)
        .maybeSingle()

      if (existing) {
        toast.info(`${trimmed} is already in this class`)
        return
      }

      // Add member
      const { data: inserted, error: joinError } = await supabase
        .from('class_members')
        .insert([{
          class_id: classId,
          student_id: profile.userid,
          joined_at: new Date().toISOString(),
        }])
        .select('student_id, joined_at')
        .single()

      if (joinError) throw joinError

      const normalizedMember: SupabaseMember = {
        student_id: inserted.student_id,
        joined_at: inserted.joined_at,
        student: {
          email: profile.email,
          full_name: `${profile.forename ?? ''} ${profile.lastname ?? ''}`.trim(),
        },
      }

      if (selectedClass?.id === classId) {
        setSelectedClassMembers(prev => ([...(prev || []), normalizedMember]))
      }
      toast.success(`Added ${profile.email} to class`)
      setAddStudentEmail("")
    } catch (e) {
      console.error('Error adding student:', e)
      toast.error('Failed to add student')
    } finally {
      setIsAddingStudent(false)
    }
  }

  const parseCSVEmails = (text: string): string[] => {
    // Split on commas, newlines, or semicolons, trim, dedupe, basic email shape
    const tokens = text.split(/[\n,;\s]+/).map(t => t.trim().toLowerCase()).filter(Boolean)
    const unique = Array.from(new Set(tokens))
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return unique.filter(e => emailRegex.test(e))
  }

  const bulkAddStudentsFromCSV = async (classId: string, csvText: string) => {
    setIsBulkAdding(true)
    try {
      const emails = parseCSVEmails(csvText)
      if (emails.length === 0) {
        toast.error('No valid emails found in CSV')
        return
      }

      // Check if user has reached their student limit for this class
      const currentStudentCount = selectedClassMembers?.length || 0
      if (currentStudentCount >= maxStudentsPerClass) {
        toast.error('You have reached your limit of students for this class, you will need to upgrade to add more students')
        return
      }

      let added = 0
      const failed: string[] = []

      for (const email of emails) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('userid, email, forename, lastname')
          .eq('email', email)
          .maybeSingle()

        if (!profile) { failed.push(`${email} (not recognised)`); continue }

        const { data: existing } = await supabase
          .from('class_members')
          .select('student_id')
          .eq('class_id', classId)
          .eq('student_id', profile.userid)
          .maybeSingle()

        if (existing) { continue }

        // Check if we've reached the student limit during bulk add
        if (added >= maxStudentsPerClass - currentStudentCount) {
          failed.push(`Failed - (limit reached)`)
          // add all the remaining emails to the failed list
          for (const e of emails.slice(added + 1)) {
            failed.push(`${e} - (limit reached)`)
          }
          continue
        }

        const { data: inserted, error: joinError } = await supabase
          .from('class_members')
          .insert([{ class_id: classId, student_id: profile.userid, joined_at: new Date().toISOString() }])
          .select('student_id, joined_at')
          .single()

        if (joinError) { failed.push(`${email} (error)`); continue }

        const normalizedMember: SupabaseMember = {
          student_id: inserted.student_id,
          joined_at: inserted.joined_at,
          student: {
            email: profile.email,
            full_name: `${profile.forename ?? ''} ${profile.lastname ?? ''}`.trim(),
          },
        }

        added += 1
        if (selectedClass?.id === classId) {
          setSelectedClassMembers(prev => ([...(prev || []), normalizedMember]))
        }
      }

      if (added > 0) toast.success(`Added ${added} student${added === 1 ? '' : 's'}`)
      if (failed.length > 0) toast.error(`Failed: ${failed.join(', ')}`)
    } catch (e) {
      toast.error('Bulk add operation failed. Please check you have a valid plan and you have not reached your student limit.' + e)
    } finally {
      setIsBulkAdding(false)
    }
  }


  useEffect(() => {
    // Check for success/cancel parameters from Stripe checkout
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success === 'true') {
      toast.success('Payment successful! Your plan has been updated.')
    } else if (canceled === 'true') {
      toast.error('Payment was canceled. Your plan remains unchanged.')
    }

    // Remove query params from the URL
    if (success || canceled) {
      router.replace('/settings')  // Replaces current history entry
    }

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
        setUserRole(profile?.role || 'regular')
        setUserCourses(profile?.courses || [])
      }

      // Fetch user's classes (use freshly fetched profile type, not state)
      const isTeacherRole = isTeacher(profile?.user_type as UserType | null)
      if (isTeacherRole) {
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
              console.error('Error fetching class members (student view):', membersError)
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

    // const fetchPlans = async () => {
    //   const { data, error } = await supabase
    //     .from('plans')
    //     .select('*')
    //     .order('price', { ascending: true });
    //   if (!error) setPlans(data || []);
    // };

    fetchUser()
    fetchCourses()
    // fetchPlans();
    setIsLoading(false)
  }, [supabase, searchParams, router,])

  // const studentPlans = plans.filter(plan => plan.plan_type === 'student');
  // const teacherPlans = plans.filter(plan => plan.plan_type === 'teacher');

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
      <div className="max-w-4xl mx-auto">
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


        <div id="plans">
          <UpgradePageClient />
        </div>
        {/* Course Management - removed for now until multiple courses are supported */}
        {/* <Card className="mb-8">
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
        </Card> */}

        {/* Teacher Class Membership */}
        {isTeacher(userType) && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Teacher Class Membership</CardTitle>
                  <CardDescription>Manage your teaching classes</CardDescription>
                </div>
                {(userClasses.length < maxClasses) && (
                  <Button onClick={() => setCreateClassDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Class
                  </Button>
                )}
                {userClasses.length >= maxClasses && (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">You have reached your limit of classes</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/settings/#teacher-plans')}
                    >
                      Upgrade Plan
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <School className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">You are not currently teaching any classes</p>
                    {userClasses.length < maxClasses ? (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setCreateClassDialogOpen(true)}
                      >
                        Create Your First Class
                      </Button>
                    ) : (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">You have reached your limit of classes</p>
                        <Button
                          variant="outline"
                          onClick={() => router.push('/settings/upgrade')}
                        >
                          Upgrade Plan
                        </Button>
                      </div>
                    )}
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
                                fetchSelectedClassMembers(classItem.id)
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
                {userClasses.length > 0 && userClasses.length >= maxClasses && (
                  <div className="text-center py-4 border-t border-muted">
                    <p className="text-sm text-muted-foreground mb-2">You have reached your limit of classes</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/settings/#teacher-plans')}
                    >
                      Upgrade Plan
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show Join Code Dialog */}
        {/* <Dialog open={showJoinCodeDialogOpen} onOpenChange={setShowJoinCodeDialogOpen}> */}
        <Dialog open={showJoinCodeDialogOpen} onOpenChange={(open) => { setShowJoinCodeDialogOpen(open); if (!open) { setSelectedClass(null); setSelectedClassMembers(null); setAddStudentEmail("") } }}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedClass?.name}</DialogTitle>
              <DialogDescription>
                Class details and management
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Join Code Display */}
              <div className="bg-muted p-6 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Class Join Code</p>
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
              {/* Add Student by Email */}
              <div className="space-y-2">
                <h4 className="font-medium">Add Student by Email</h4>
                {(selectedClassMembers || []).length < maxStudentsPerClass ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="student@example.com"
                      value={addStudentEmail}
                      onChange={(e) => setAddStudentEmail(e.target.value)}
                      disabled={isAddingStudent}
                    />
                    <Button onClick={() => selectedClass && addStudentToClassByEmail(selectedClass.id, addStudentEmail)} disabled={isAddingStudent}>
                      {isAddingStudent ? 'Adding…' : 'Add'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4 border border-muted rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground mb-2">You have reached your limit of students for this class</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/settings/#teacher-plans')}
                    >
                      Upgrade Plan
                    </Button>
                  </div>
                )}
              </div>

              {/* Bulk Add via CSV */}
              <div className="space-y-4 p-4 border border-dashed border-muted-foreground/25 rounded-lg bg-muted/20">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-medium">Bulk Add via CSV</h4>
                </div>
                <p className="text-sm text-muted-foreground">Upload a CSV file containing a list of email addresses (header optional).</p>
                
                {(selectedClassMembers || []).length >= maxStudentsPerClass && (
                  <div className="text-center py-2 border border-orange-200 rounded-lg bg-orange-50">
                    <p className="text-sm text-orange-700">You have reached your student limit. Bulk add will be disabled.</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="relative">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept=".csv"
                        id="csv-upload"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file || !selectedClass) return
                          const text = await file.text()
                          bulkAddStudentsFromCSV(selectedClass.id, text)
                          // reset the input so the same file can be selected again if needed
                          e.currentTarget.value = ''
                        }}
                        disabled={isBulkAdding || (selectedClassMembers || []).length >= maxStudentsPerClass}
                        className="hidden"
                      />
                      <label
                        htmlFor="csv-upload"
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors ${isBulkAdding || (selectedClassMembers || []).length >= maxStudentsPerClass ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        <Upload className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {isBulkAdding ? 'Processing...' : 'Choose CSV File'}
                        </span>
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {isBulkAdding ? 'Uploading students...' : 'or drag and drop'}
                      </span>
                    </div>
                    {isBulkAdding && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span>Processing CSV...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadCSVTemplate}
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Template</span>
                    </Button>
                    <span className="text-xs text-muted-foreground">Get a sample CSV format</span>
                  </div>
                </div>
              </div>


              {/* Class Members */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Class Members</h4>
                  <Badge variant={(selectedClassMembers || []).length >= maxStudentsPerClass ? "destructive" : "secondary"}>
                    {(selectedClassMembers || []).length} / {maxStudentsPerClass} Students
                  </Badge>
                </div>
                <div className="space-y-2">
                  {(selectedClassMembers || []).map(member => (
                    <div
                      key={member.student_id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {member.student.email}
                          </p>
                          {member.student.full_name && member.student.full_name.trim().length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {member.student.full_name}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setMemberToDelete(member)
                          setDeleteMemberDialogOpen(true)
                        }}
                        title="Remove Student"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Student Class Membership */}
        {(userType === 'basic' || userType === 'revision' || userType === 'revisionAI' || isTeacher(userType)) && (
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
                            {(userType === 'basic' || userType === 'revision' || userType === 'revisionAI') && (
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
                            )}
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
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Join Class</DialogTitle>
              <DialogDescription>
                Enter the join code provided by your teacher. Note: Classes may have capacity limits based on the teacher&apos;s plan.
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
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Class Details</DialogTitle>
              <DialogDescription>
                Information about the class
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedMembership && (
                <div className="space-y-4">
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
                </div>
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

        {/* Delete Member Dialog */}
        <Dialog open={deleteMemberDialogOpen} onOpenChange={setDeleteMemberDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Student</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this student from the class? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteMemberDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteClassMember}
                  disabled={isDeletingMember}
                >
                  {isDeletingMember ? "Removing..." : "Remove Student"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

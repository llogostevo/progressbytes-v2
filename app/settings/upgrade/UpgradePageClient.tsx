"use client"

import { createClient } from "@/utils/supabase/client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { redirect } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import type { Plan } from "@/lib/types"
import type { UserType, User } from "@/lib/access"
import { userAccessLimits, isSponsoredPlan } from "@/lib/access"
import { cleanupExcessResources } from "@/lib/utils"

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, BookOpenCheck, BookOpenText, School, Gift } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

export default function UpgradePageClient() {
  const [userType, setUserType] = useState<UserType | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])

  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Helper function to check if switching to a plan with fewer classes or students
  // const checkIfDowngrade = (currentPlan: UserType | null, newPlan: UserType): { isDowngrade: boolean; type?: 'student' | 'teacher' } => {
  //   if (!currentPlan) return { isDowngrade: false }

  //   const currentLimits = userAccessLimits[currentPlan]
  //   const newLimits = userAccessLimits[newPlan]

  //   if (!currentLimits || !newLimits) return { isDowngrade: false }

  //   // Check if both plans are teacher plans (have class limits)
  //   if (currentLimits.maxClasses !== undefined && newLimits.maxClasses !== undefined) {
  //     // Check if new plan has fewer classes or fewer students per class
  //     const isDowngrade = newLimits.maxClasses < currentLimits.maxClasses ||
  //       (newLimits.maxStudentsPerClass || 0) < (currentLimits.maxStudentsPerClass || 0)
  //     return { isDowngrade, type: 'teacher' }
  //   }

  //   // Check if both plans are student plans (no class limits, but have question limits)
  //   if (currentLimits.maxClasses === undefined && newLimits.maxClasses === undefined) {
  //     // Check if new plan has fewer questions per day or per topic
  //     const isDowngrade = newLimits.maxQuestionsPerDay < currentLimits.maxQuestionsPerDay ||
  //       newLimits.maxQuestionsPerTopic < currentLimits.maxQuestionsPerTopic
  //     return { isDowngrade, type: 'student' }
  //   }

  //   // Check if switching from teacher to student plan (losing class management capabilities)
  //   if (currentLimits.maxClasses !== undefined && newLimits.maxClasses === undefined) {
  //     return { isDowngrade: true, type: 'teacher' }
  //   }

  //   // Check if switching from student to teacher plan (losing unlimited questions)
  //   if (currentLimits.maxClasses === undefined && newLimits.maxClasses !== undefined) {
  //     // Only show warning if the teacher plan has limited questions
  //     const isDowngrade = newLimits.maxQuestionsPerDay < currentLimits.maxQuestionsPerDay ||
  //       newLimits.maxQuestionsPerTopic < currentLimits.maxQuestionsPerTopic
  //     return { isDowngrade, type: 'student' }
  //   }

  //   return { isDowngrade: false }
  // }


  type TeacherUsage = {
    classesCount: number;
    perClass: Array<{ class_id: string; students: number }>;
    maxClassSizeObserved: number;
    sponsoredDistinct: number;
  };

  type DowngradeViolation =
    | { code: 'max_classes'; current: number; limit: number }
    | { code: 'max_students_per_class'; class_id: string; current: number; limit: number }
    | { code: 'sponsored_students'; current: number; limit: number };

  const normInf = (n: number | undefined) => (n === undefined ? Infinity : n);

  // NEW FETCH TEACHER USAGE FUNCTION
  async function fetchTeacherUsage(
    supabase: ReturnType<typeof createClient>,
    teacherId: string
  ): Promise<TeacherUsage> {
    // 1) Get class IDs owned by the teacher
    const { data: classes, error: clsErr } = await supabase
      .from('classes')
      .select('id')
      .eq('teacher_id', teacherId);

    if (clsErr) throw clsErr;

    const classIds = (classes ?? []).map(c => c.id as string);
    const classesCount = classIds.length;

    if (classIds.length === 0) {
      return {
        classesCount: 0,
        perClass: [],
        maxClassSizeObserved: 0,
        sponsoredDistinct: 0,
      };
    }

    // 2) Pull memberships for those classes (class_id, student_id, is_sponsored)
    //    NOTE: This fetches rows client-side; fine for modest sizes.
    const { data: members, error: memErr } = await supabase
      .from('class_members')
      .select('class_id, student_id, is_sponsored')
      .in('class_id', classIds);

    if (memErr) throw memErr;

    // 3) Aggregate on the client
    const perClassMap = new Map<string, Set<string>>();
    const sponsoredSet = new Set<string>();

    for (const row of members ?? []) {
      const class_id = row.class_id as string;
      const student_id = row.student_id as string;
      if (!perClassMap.has(class_id)) perClassMap.set(class_id, new Set());
      perClassMap.get(class_id)!.add(student_id);
      if (row.is_sponsored) sponsoredSet.add(student_id); // distinct across all classes
    }

    const perClass: Array<{ class_id: string; students: number }> = [];
    let maxClassSizeObserved = 0;

    for (const [class_id, set] of perClassMap.entries()) {
      const students = set.size;
      perClass.push({ class_id, students });
      if (students > maxClassSizeObserved) maxClassSizeObserved = students;
    }

    return {
      classesCount,
      perClass,
      maxClassSizeObserved,
      sponsoredDistinct: sponsoredSet.size,
    };
  }

  // NEW COMPARE USAGE TO PLAN FUNCTION

  function compareUsageToPlan(
    usage: TeacherUsage,
    targetPlan: UserType
  ): { ok: boolean; violations: DowngradeViolation[] } {
    const limits = userAccessLimits[targetPlan];
    const violations: DowngradeViolation[] = [];

    // classes
    const maxClasses = normInf(limits.maxClasses);
    if (usage.classesCount > maxClasses) {
      violations.push({
        code: 'max_classes',
        current: usage.classesCount,
        limit: maxClasses,
      });
    }

    // students per class
    const perClassLimit = normInf(limits.maxStudentsPerClass);
    if (Number.isFinite(perClassLimit)) {
      for (const row of usage.perClass) {
        if (row.students > perClassLimit) {
          violations.push({
            code: 'max_students_per_class',
            class_id: row.class_id,
            current: row.students,
            limit: perClassLimit,
          });
        }
      }
    }

    // sponsored seats (distinct across all teacher classes)
    const sponsoredLimit = limits.sponsoredStudents ?? 0;
    if (usage.sponsoredDistinct > sponsoredLimit) {
      violations.push({
        code: 'sponsored_students',
        current: usage.sponsoredDistinct,
        limit: sponsoredLimit,
      });
    }

    return { ok: violations.length === 0, violations };
  }



  // NEW CHECK IF DOWNGRADE FUNCTION

  const checkIfDowngrade = (
    currentPlan: UserType | null,
    newPlan: UserType
  ): { isDowngrade: boolean; type?: 'student' | 'teacher'; hardBlock?: boolean } => {
    if (!currentPlan) return { isDowngrade: false };

    const cur = userAccessLimits[currentPlan];
    const nxt = userAccessLimits[newPlan];

    // Teacher ↔ Teacher
    if (cur.isTeacher && nxt.isTeacher) {
      const isDowngrade =
        (nxt.maxClasses ?? Infinity) < (cur.maxClasses ?? Infinity) ||
        (nxt.maxStudentsPerClass ?? Infinity) < (cur.maxStudentsPerClass ?? Infinity) ||
        (nxt.sponsoredStudents ?? 0) < (cur.sponsoredStudents ?? 0);
      return { isDowngrade, type: 'teacher', hardBlock: false };
    }

    // Student ↔ Student
    if (!cur.isTeacher && !nxt.isTeacher) {
      const isDowngrade =
        nxt.maxQuestionsPerDay < cur.maxQuestionsPerDay ||
        nxt.maxQuestionsPerTopic < cur.maxQuestionsPerTopic;
      return { isDowngrade, type: 'student', hardBlock: false };
    }

    // Teacher → Student: always a capability downgrade, **hard block** until clean
    if (cur.isTeacher && !nxt.isTeacher) {
      return { isDowngrade: true, type: 'teacher', hardBlock: true };
    }

    // Student → Teacher: optional warning if Q caps reduce
    const maybeStudentLoss =
      !cur.isTeacher && nxt.isTeacher &&
      (nxt.maxQuestionsPerDay < cur.maxQuestionsPerDay ||
        nxt.maxQuestionsPerTopic < cur.maxQuestionsPerTopic);
    return { isDowngrade: maybeStudentLoss, type: maybeStudentLoss ? 'student' : undefined, hardBlock: false };
  };




  // const handlePlanSelect = async (plan: Plan) => {
  //   if (!userEmail || plan.slug === userType) return

  //   // Check if this is a downgrade and get the type
  //   const downgradeInfo = checkIfDowngrade(userType, plan.slug)

  //   if (downgradeInfo.isDowngrade) {
  //     const message = downgradeInfo.type === 'student'
  //       ? "You're switching to a plan with fewer features. This may affect your current setup."
  //       : "You're switching to a plan with fewer classes or students. You will lose permenant access to your current classes and students if you are above the limits of the selected plan. "

  //     toast.error("Plan Downgrade Warning", {
  //       description: message,
  //       action: {
  //         label: "Continue",
  //         onClick: () => processPlanChange(plan)
  //       },
  //       cancel: {
  //         label: "Cancel",
  //         onClick: () => {
  //           toast.info("Your plan hasn't changed")
  //         }
  //       },
  //       duration: Infinity
  //     })
  //     return
  //   }

  //   // If not a downgrade, proceed directly
  //   processPlanChange(plan)
  // }

  // const handlePlanSelect = async (plan: Plan) => {
  //   if (!userEmail || plan.slug === userType) return;

  //   // UI downgrade warning (static, based on plan metadata)
  //   const downgradeInfo = checkIfDowngrade(userType, plan.slug);

  //   // If teacher-type target, fetch live usage and enforce limits
  //   if (user && isTeacherPlan({ user_type: plan.slug })) {
  //     const { data: { user: authUser } } = await supabase.auth.getUser();
  //     if (!authUser) {
  //       toast.error("Not signed in");
  //       return;
  //     }

  //     try {
  //       const usage = await fetchTeacherUsage(supabase, authUser.id);
  //       const { ok, violations } = compareUsageToPlan(usage, plan.slug as UserType);

  //       if (!ok) {
  //         // Build a friendly message
  //         const lines = violations.map(v => {
  //           if (v.code === 'max_classes') {
  //             return `Classes: ${v.current}, you must be below the limit of ${v.limit}`;
  //           }
  //           if (v.code === 'max_students_per_class') {
  //             return `Class ${v.class_id.slice(0, 6)}… has ${v.current} students, you must be below the limit of ${v.limit}`;
  //           }
  //           if (v.code === 'sponsored_students') {
  //             return `Sponsored students: ${v.current}, you must be below the limit of ${v.limit}`;
  //           }
  //           return '';
  //         }).filter(Boolean);

  //         toast.error("Reduce usage before downgrading", {
  //           description: lines.join('\n'),
  //           duration: 12000,
  //           closeButton: true,
  //         });
  //         return; // BLOCK downgrade
  //       }
  //     } catch (e) {
  //       console.error(e);
  //       toast.error("Couldn’t verify limits. Please try again.");
  //       return;
  //     }
  //   }

  //   // If we get here, either not a teacher target plan or usage is within limits
  //   if (downgradeInfo.isDowngrade) {
  //     const message = downgradeInfo.type === 'student'
  //       ? "You're switching to a plan with fewer features. This may affect your current setup."
  //       : "You're switching to a plan with fewer classes/students. Ensure you are within limits.";

  //     toast.error("Plan Downgrade Warning", {
  //       description: message,
  //       action: { label: "Continue", onClick: () => processPlanChange(plan) },
  //       cancel: { label: "Cancel", onClick: () => toast.info("Your plan hasn't changed") },
  //       duration: Infinity
  //     });
  //     return;
  //   }

  //   processPlanChange(plan);
  // };

  // const handlePlanSelect = async (plan: Plan) => {
  //   if (!userEmail || plan.slug === userType) return;

  //   const downgradeInfo = checkIfDowngrade(userType, plan.slug);

  //   // If moving to a *student* plan from a *teacher* plan, require zero classes & zero sponsored
  //   if (downgradeInfo.hardBlock) {
  //     const { data: { user: authUser } } = await supabase.auth.getUser();
  //     if (!authUser) {
  //       toast.error("Not signed in");
  //       return;
  //     }

  //     try {
  //       const usage = await fetchTeacherUsage(supabase, authUser.id);
  //       const hasAnyClasses = usage.classesCount > 0;
  //       const hasAnySponsored = usage.sponsoredDistinct > 0;

  //       if (hasAnyClasses || hasAnySponsored) {
  //         const lines: string[] = [];
  //         if (hasAnyClasses) lines.push(`• Delete all classes you own (${usage.classesCount}).`);
  //         if (hasAnySponsored) lines.push(`• Unsponsor all students (${usage.sponsoredDistinct}).`);

  //         toast.error("Clean up required before switching to a student plan", {
  //           description: lines.join("\n"),
  //           duration: 12000,
  //           closeButton: true
  //         });
  //         return; // BLOCK — no “Continue”
  //       }
  //       // Clean (no classes/sponsorships) → proceed
  //       processPlanChange(plan);
  //       return;
  //     } catch (e) {
  //       console.error(e);
  //       toast.error("Couldn&apos;t verify your current usage. Please try again.");
  //       return;
  //     }
  //   }

  //   // For other downgrades: if it’s a teacher target, also enforce within-limits
  //   if (user && isTeacherPlan({ user_type: plan.slug })) {
  //     const { data: { user: authUser } } = await supabase.auth.getUser();
  //     if (!authUser) {
  //       toast.error("Not signed in");
  //       return;
  //     }
  //     try {
  //       const usage = await fetchTeacherUsage(supabase, authUser.id);
  //       const { ok, violations } = compareUsageToPlan(usage, plan.slug as UserType);
  //       if (!ok) {
  //         const lines = violations.map(v => {
  //           if (v.code === 'max_classes') return `• Reduce classes to ${v.limit} (currently ${v.current}).`;
  //           if (v.code === 'max_students_per_class') return `• Class ${v.class_id.slice(0, 6)}… has ${v.current} students (limit ${v.limit}).`;
  //           if (v.code === 'sponsored_students') return `• Reduce sponsored students to ${v.limit} (currently ${v.current}).`;
  //           return '';
  //         }).filter(Boolean);
  //         toast.error("Reduce usage before downgrading", {
  //           description: lines.join("\n"),
  //           duration: 12000,
  //           closeButton: true
  //         });
  //         return; // BLOCK
  //       }
  //     } catch (e) {
  //       console.error(e);
  //       toast.error("Couldn&apos;t verify limits. Please try again.");
  //       return;
  //     }
  //   }

  //   // Soft downgrades (student↔student, student→teacher warnings)
  //   if (downgradeInfo.isDowngrade) {
  //     const message =
  //       downgradeInfo.type === 'student'
  //         ? "You're switching to a plan with fewer features. This may affect your current setup."
  //         : "You're switching to a plan with fewer classes/students. Ensure you are within limits.";
  //     toast.error("Plan Downgrade Warning", {
  //       description: message,
  //       action: { label: "Continue", onClick: () => processPlanChange(plan) },
  //       cancel: { label: "Cancel", onClick: () => toast.info("Your plan hasn't changed") },
  //       duration: Infinity
  //     });
  //     return;
  //   }

  //   processPlanChange(plan);
  // };

  const handlePlanSelect = async (plan: Plan) => {
    if (!userEmail || plan.slug === userType) return;

    const isTeacherTarget = plan.plan_type === "teacher";
    const currentIsTeacher = !!(userType && userAccessLimits[userType]?.isTeacher);
    const downgradeInfo = checkIfDowngrade(userType, plan.slug);

    // 1) Hard block only when moving FROM teacher TO student
    if (currentIsTeacher && !isTeacherTarget) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { toast.error("Not signed in"); return; }

      try {
        const usage = await fetchTeacherUsage(supabase, authUser.id);
        const hasAnyClasses = usage.classesCount > 0;
        const hasAnySponsored = usage.sponsoredDistinct > 0;

        if (hasAnyClasses || hasAnySponsored) {
          const lines: string[] = [];
          if (hasAnyClasses) lines.push(`• Delete all classes you own (${usage.classesCount}).`);
          if (hasAnySponsored) lines.push(`• Unsponsor all students (${usage.sponsoredDistinct}).`);

          toast.error("Clean up required before switching to a student plan", {
            description: lines.join("\n"),
            duration: 12000,
            closeButton: true
          });
          return; // BLOCK
        }

        // Clean → proceed
        processPlanChange(plan);
        return;
      } catch (e) {
        console.error(e);
        toast.error("Couldn’t verify your current usage. Please try again.");
        return;
      }
    }

    // 2) Teacher → Teacher: enforce target plan limits (BLOCK if over)
    let limitsCheckOk: boolean | undefined = undefined;
    if (isTeacherTarget) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { toast.error("Not signed in"); return; }

      try {
        const usage = await fetchTeacherUsage(supabase, authUser.id);
        const { ok, violations } = compareUsageToPlan(usage, plan.slug as UserType);

        if (!ok) {
          const lines = violations.map(v => {
            if (v.code === 'max_classes') return `• Reduce classes to ${v.limit} (currently ${v.current}).`;
            if (v.code === 'max_students_per_class') return `• Class ${v.class_id.slice(0, 6)}… has ${v.current} (limit ${v.limit}).`;
            if (v.code === 'sponsored_students') return `• Reduce sponsored students to ${v.limit} (currently ${v.current}).`;
            return '';
          }).filter(Boolean);

          toast.error("Reduce usage before downgrading", {
            description: lines.join("\n"),
            duration: 12000,
            closeButton: true
          });
          return; // BLOCK
        }

        limitsCheckOk = ok; // true
      } catch (e) {
        console.error(e);
        toast.error("Couldn’t verify limits. Please try again.");
        return;
      }
    }

    // 3) Soft warning ONLY if it's a downgrade AND we are within limits (or non-teacher target)
    if (downgradeInfo.isDowngrade && (limitsCheckOk ?? true)) {
      toast.error("Plan Downgrade Warning", {
        description:
          downgradeInfo.type === 'student'
            ? "You're switching to a plan with fewer features. This may affect your current setup."
            : "You're switching to a plan with fewer classes/students. Ensure you are within limits.",
        action: { label: "Continue", onClick: () => processPlanChange(plan) },
        cancel: { label: "Cancel", onClick: () => toast.info("Your plan hasn't changed") },
        duration: Infinity
      });
      return;
    }

    // 4) Everything OK → proceed
    processPlanChange(plan);
  };


  const processPlanChange = async (plan: Plan) => {
    setIsLoadingCheckout(true)
    try {
      // Check if user is on a sponsored plan
      if (user && isSponsoredPlan(user)) {
        toast.error("Sponsored Plan", {
          description: "You are on a sponsored plan, please contact your sponsor if you wish to change your plan - you will need to ask them to remove your sponsorship.",
          duration: 5000
        })
        setIsLoadingCheckout(false)
        return
      }
      // If it's a free plan
      if (plan.price === 0) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("User not found")

        // Check if user currently has a paid plan
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("user_type, stripe_customer_id")
          .eq("userid", user.id)
          .single()

        if (error || !profile) throw new Error("Could not fetch user profile")

        // If they're on a paid plan, just update to free plan
        if (profile.user_type !== "basic" && profile.user_type !== "teacherBasic" && profile.stripe_customer_id) {
          // Cancel the subscription via API
          const cancelResponse = await fetch("/api/cancel-subscription", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (!cancelResponse.ok) {
            const cancelData = await cancelResponse.json()
            throw new Error(cancelData.error || "Failed to cancel subscription")
          }

          toast.info("Switching to free plan. Your subscription will be cancelled automatically.")
        }

        // Update to free plan
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            user_type: plan.slug,
            plan_end_date: null,
          })
          .eq("userid", user.id)

        if (updateError) throw updateError

        // Clean up excess classes and students for the new plan
        await cleanupExcessResources(supabase, user.id, plan.slug as UserType)

        setUserType(plan.slug)
        toast.success(`Successfully switched to ${plan.name}`)
        return
      }

      // For paid plans — handle subscription creation/update
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.stripe_price_id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Check if this was a direct subscription update (no checkout needed)
      if (data.success) {
        toast.success("Plan updated successfully!")
        setUserType(plan.slug)
        return
      }

      // Otherwise, redirect to Stripe checkout
      if (!data.sessionId) {
        throw new Error("No session ID returned")
      }

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error("Stripe failed to load")
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (stripeError) throw stripeError
    } catch (error) {
      console.error("Error:", error)
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoadingCheckout(false)
    }
  }

  useEffect(() => {
    // Check for success/cancel parameters from Stripe checkout
    const success = searchParams.get("success")
    const canceled = searchParams.get("canceled")

    if (success === "true") {
      toast.success("Payment successful! Your plan has been updated.")
    } else if (canceled === "true") {
      toast.error("Payment was cancelled. Your plan remains unchanged.")
    }

    // Remove query params from the URL
    if (success || canceled) {
      router.replace("/settings/upgrade")
    }

    const fetchUser = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        redirect("/")
      }
      setUserEmail(user.email || null)

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type, role")
        .eq("userid", user.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
      } else {
        setUserType(profile?.user_type)
        if (profile?.user_type) {
          setUser({
            user_type: profile.user_type,
            email: user.email || undefined,
            role: profile.role || 'regular'
          })
        }
      }
    }

    const fetchPlans = async () => {
      const { data, error } = await supabase.from("plans").select("*").order("price", { ascending: true })
      if (!error) setPlans(data || [])
    }

    fetchUser()
    fetchPlans()
  }, [supabase, searchParams, router])

  const studentPlans = plans.filter((plan) => plan.plan_type === "student")
  const teacherPlans = plans.filter((plan) => plan.plan_type === "teacher")
  const isUserSponsored = user ? isSponsoredPlan(user) : false



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Sponsored Plan Card */}
        {isUserSponsored && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Gift className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle className="text-green-800">Sponsored Plan</CardTitle>
                  <CardDescription className="text-green-700">
                    You are currently on a sponsored plan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 text-sm whitespace-pre-line">
                {
                  `Your current plan is sponsored, which means you have access to premium features at no cost.

              Go to the classes section on the settings page to view your joined classes and identify your sponsor. If you have any questions about your plan, contact your sponsor.
              
                `}<em>{`NB. If you delete your sponsored class membership, you will lose access to the premium features and revert to a free plan.`
                }</em>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Student Plans */}
        {!isUserSponsored && studentPlans.length > 0 && (
          <Card id="student-plans" className="mb-8">
            <CardHeader>
              <CardTitle>Student Plans</CardTitle>
              <CardDescription>Choose a student plan that fits your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {studentPlans.map((plan) => (
                  <Card
                    key={plan.slug}
                    className={`relative${userType === plan.slug ? " border-primary" : ""}${plan.active === false ? " opacity-50 pointer-events-none" : ""}`}
                  >
                    <CardHeader>
                      {plan.slug === "basic" && <BookOpen className="h-6 w-6 text-muted-foreground mb-2" />}
                      {plan.slug === "revision" && <BookOpenCheck className="h-6 w-6 text-muted-foreground mb-2" />}
                      {plan.slug === "revisionAI" && <BookOpenText className="h-6 w-6 text-muted-foreground mb-2" />}
                      {plan.active === false && (
                        <Badge className="absolute top-2 right-2 bg-gray-400 text-white">Coming Soon</Badge>
                      )}
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-lg font-semibold">
                          {plan.active ? `£${plan.price} /month` : "Price: TBC"}
                        </div>
                        {Array.isArray(plan.features) && plan.features.length > 0 && (
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {plan.features.map((feature, idx) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                        )}
                        <Button
                          className="w-full"
                          variant={userType === plan.slug ? "default" : "outline"}
                          onClick={() => handlePlanSelect(plan)}
                          disabled={isLoadingCheckout || !plan.active}
                        >
                          {userType === plan.slug
                            ? "Current Plan"
                            : !plan.active
                              ? "Coming Soon"
                              : isLoadingCheckout
                                ? "Loading..."
                                : "Select Plan"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Teacher Plans */}
        {!isUserSponsored && teacherPlans.length > 0 && (
          <Card id="teacher-plans" className="mb-8">
            <CardHeader>
              <CardTitle>Teacher Plans</CardTitle>
              <CardDescription>Choose a teacher plan that fits your classroom needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {teacherPlans.map((plan) => (
                  <Card
                    key={plan.slug}
                    className={`relative${userType === plan.slug ? " border-primary" : ""}${plan.active === false ? " opacity-50 pointer-events-none" : ""}`}
                  >
                    <CardHeader>
                      {plan.slug === "teacherBasic" && <School className="h-6 w-6 text-muted-foreground mb-2" />}
                      {plan.slug === "teacherPremium" && <School className="h-6 w-6 text-primary mb-2" />}
                      {plan.active === false && (
                        <Badge className="absolute top-2 right-2 bg-gray-400 text-white">Coming Soon</Badge>
                      )}
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-lg font-semibold">
                          {plan.active ? `£${plan.price} /month` : "Price: TBC"}
                        </div>
                        {Array.isArray(plan.features) && plan.features.length > 0 && (
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {plan.features.map((feature, idx) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                        )}
                        <Button
                          className="w-full"
                          variant={userType === plan.slug ? "default" : "outline"}
                          onClick={() => handlePlanSelect(plan)}
                          disabled={isLoadingCheckout || !plan.active}
                        >
                          {userType === plan.slug
                            ? "Current Plan"
                            : !plan.active
                              ? "Coming Soon"
                              : isLoadingCheckout
                                ? "Loading..."
                                : "Select Plan"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

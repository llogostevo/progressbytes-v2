"use client"

import { createClient } from "@/utils/supabase/client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { redirect } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import type { Plan } from "@/lib/types"
import type { UserType } from "@/lib/access"
import { userAccessLimits } from "@/lib/access"

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, BookOpenCheck, BookOpenText, School } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

export default function UpgradePageClient() {
  const [userType, setUserType] = useState<UserType | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])

  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Helper function to check if switching to a plan with fewer classes or students
  const checkIfDowngrade = (currentPlan: UserType | null, newPlan: UserType): { isDowngrade: boolean; type?: 'student' | 'teacher' } => {
    if (!currentPlan) return { isDowngrade: false }
    
    const currentLimits = userAccessLimits[currentPlan]
    const newLimits = userAccessLimits[newPlan]
    
    if (!currentLimits || !newLimits) return { isDowngrade: false }
    
    // Check if both plans are teacher plans (have class limits)
    if (currentLimits.maxClasses !== undefined && newLimits.maxClasses !== undefined) {
      // Check if new plan has fewer classes or fewer students per class
      const isDowngrade = newLimits.maxClasses < currentLimits.maxClasses || 
             (newLimits.maxStudentsPerClass || 0) < (currentLimits.maxStudentsPerClass || 0)
      return { isDowngrade, type: 'teacher' }
    }
    
    // Check if both plans are student plans (no class limits, but have question limits)
    if (currentLimits.maxClasses === undefined && newLimits.maxClasses === undefined) {
      // Check if new plan has fewer questions per day or per topic
      const isDowngrade = newLimits.maxQuestionsPerDay < currentLimits.maxQuestionsPerDay ||
             newLimits.maxQuestionsPerTopic < currentLimits.maxQuestionsPerTopic
      return { isDowngrade, type: 'student' }
    }
    
    // Check if switching from teacher to student plan (losing class management capabilities)
    if (currentLimits.maxClasses !== undefined && newLimits.maxClasses === undefined) {
      return { isDowngrade: true, type: 'teacher' }
    }
    
    // Check if switching from student to teacher plan (losing unlimited questions)
    if (currentLimits.maxClasses === undefined && newLimits.maxClasses !== undefined) {
      // Only show warning if the teacher plan has limited questions
      const isDowngrade = newLimits.maxQuestionsPerDay < currentLimits.maxQuestionsPerDay ||
             newLimits.maxQuestionsPerTopic < currentLimits.maxQuestionsPerTopic
      return { isDowngrade, type: 'student' }
    }
    
    return { isDowngrade: false }
  }

  const handlePlanSelect = async (plan: Plan) => {
    if (!userEmail || plan.slug === userType) return

    // Check if this is a downgrade and get the type
    const downgradeInfo = checkIfDowngrade(userType, plan.slug)
    
    if (downgradeInfo.isDowngrade) {
      const message = downgradeInfo.type === 'student' 
        ? "You're switching to a plan with fewer features. This may affect your current setup."
        : "You're switching to a plan with fewer classes or students. This may affect your current setup."
      
      toast.error("Plan Downgrade Warning", {
        description: message,
        action: {
          label: "Continue",
          onClick: () => processPlanChange(plan)
        },
        cancel: {
          label: "Cancel",
          onClick: () => {
            toast.info("Your plan hasn't changed")
          }
        },
        duration: Infinity
      })
      return
    }

    // If not a downgrade, proceed directly
    processPlanChange(plan)
  }

  const processPlanChange = async (plan: Plan) => {
    setIsLoadingCheckout(true)
    try {
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
      toast.error("Payment was canceled. Your plan remains unchanged.")
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
        .select("user_type")
        .eq("userid", user.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
      } else {
        setUserType(profile?.user_type)
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

  

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">

      {/* Student Plans */}
      {studentPlans.length > 0 && (
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
      {teacherPlans.length > 0 && (
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

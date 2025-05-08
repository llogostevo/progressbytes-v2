"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { currentUser } from "@/lib/data"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { redirect } from "next/navigation"

export default function SettingsPage() {
  const [userType, setUserType] = useState<"revision" | "revisionAI" | null>(null)

  // redirect('/')
  
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: {user}, error } = await supabase.auth.getUser()
      if (error) {
        redirect('/')
      }

      const { data: { profiles } } = await supabase
        .from("profiles")
        .select("*")
        .eq("userid", user?.id)
        .single()

      setUserType(profiles?.user_type)
    }

    fetchUser()
  }, [supabase.auth])
  



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account details and subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="text-sm text-muted-foreground">{currentUser.email}</div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                    AI Feedback Mode
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {userType === "revisionAI" ? "You have access to AI-powered feedback" : "Upgrade to get AI-powered feedback"}
                  </p>
                </div>
                <Switch checked={userType === "revisionAI"} id="paid-mode" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{userType === "revisionAI" ? "Premium Plan" : "Free Plan"}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {userType === "revisionAI"
                      ? "Full access to all features including AI feedback"
                      : "Limited access with self-assessment only"}
                  </p>
                </div>
                <Link href="/coming-soon">
                  <Button
                    variant={userType === "revisionAI" ? "outline" : "default"}
                    className={userType === "revisionAI" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  >
                    {userType === "revisionAI" ? "Downgrade" : "Upgrade"}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useSearchParams } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Suspense } from 'react'
import { Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"


export function LoginForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  )
}

function LoginFormContent() {
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'login'
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<string>("basic")

  // const handleLogin = async (formData: FormData) => {
  //   setIsLoading(true)
  //   try {
  //     await login(formData)
  //   } catch {
  //     setIsLoading(false)
  //   }
  // }
  const supabase = createClient()
  const router = useRouter()

  // Login handler
  const handleLogin = async (formData: FormData) => {
    setIsLoading(true)
    const email = formData.get("login-email") as string
    const password = formData.get("login-password") as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error(error.message)
      setIsLoading(false)
      return
    }

    router.push("/")      // soft navigation
    router.refresh()      // refresh client state (important!)
  }



  // const handleSignup = async (formData: FormData) => {
  //   setIsLoading(true)
  //   try {
  //     await signup(formData)
  //   } catch {
  //     setIsLoading(false)
  //   }
  // }


  const handleSignup = async (formData: FormData) => {
    setIsLoading(true)

    const email = formData.get("register-email") as string
    const password = formData.get("register-password") as string
    const confirmPassword = formData.get("register-confirm-password") as string
    const school = formData.get("register-school") as string

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Determine user type based on email domain
    if (email.endsWith("@centralfoundationboys.co.uk")) {
      setUserType("revision")
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(`Signup failed: ${error.message}`)
      setIsLoading(false)
      return
    }

    if (authData.user) {
              const { error: profileError } = await supabase
          .from("profiles")
          .update({ 
            school, 
            user_type: userType, 
            role: "regular" })
          .eq("userid", authData.user.id)

      if (profileError) {
        toast.error(`Profile update failed: ${profileError.message}`)
      } else {
        toast.success("Account created successfully!")
      }
    }

    router.push("/")
    router.refresh()
  }



  return (
    <div className="space-y-4">
      {/* Error display component wrapped in Suspense for better loading experience */}
      <Suspense fallback={null}>
        <ErrorDisplay />
      </Suspense>

      {/* Tabbed interface for switching between login and register forms */}
      <Tabs defaultValue={tab} className="w-full">

        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login" className="data-[state=active]:text-emerald-800">Login</TabsTrigger>
          <TabsTrigger value="register" className="data-[state=active]:text-emerald-800">Register</TabsTrigger>
        </TabsList>

        {/* Login Tab Content */}
        <TabsContent value="login" className="space-y-4">
          {/* Login Form */}
          <form className="space-y-4">
            {/* Email Input Field */}
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-emerald-800">Email*</Label>
              <Input
                id="login-email"
                name="login-email"
                placeholder="myemail@example.com"
                type="email"
                required
              />
            </div>

            {/* Password Input Field with Forgot Password Link */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-emerald-800">Password*</Label>
                <Link href="/auth/reset-password" className="text-xs text-emerald-600 hover:text-emerald-800 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="login-password"
                name="login-password"
                type="password"
                required
              />
            </div>

            {/* Login Button - Calls the login server action */}
            <Button
              onClick={(e) => {
                e.preventDefault()
                handleLogin(new FormData(e.currentTarget.form!))
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </TabsContent>

        {/* Register Tab Content */}
        <TabsContent value="register" className="space-y-4">
          {/* Registration Form */}
          <form className="space-y-4">
            {/* Email Input Field */}
            <div className="space-y-2">
              <Label htmlFor="register-email" className="text-emerald-800">Email*</Label>
              <p className="text-xs text-muted-foreground m-1 italic">Use your school email</p>
              <Input
                id="register-email"
                name="register-email"
                placeholder="myemail@example.com"
                type="email"
                required
              />
            </div>

            {/* School Input Field */}
            <div className="space-y-2">
              <Label htmlFor="register-school" className="text-emerald-800">School*</Label>
              <Input
                id="register-school"
                name="register-school"
                type="text"
                required
              />
            </div>

            {/* Password Input Field */}
            <div className="space-y-2">
              <Label htmlFor="register-password" className="text-emerald-800">Password*</Label>
              <Input
                id="register-password"
                name="register-password"
                type="password"
                required
              />
            </div>

            {/* Confirm Password Input Field */}
            <div className="space-y-2">
              <Label htmlFor="register-confirm-password" className="text-emerald-800">Confirm Password*</Label>
              <Input
                id="register-confirm-password"
                name="register-confirm-password"
                type="password"
                required
              />
            </div>

            {/* Register Button - Calls the signup server action */}
            {/* <Button
              formAction={handleSignup}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button> */}

            <Button
              onClick={(e) => {
                e.preventDefault()
                handleSignup(new FormData(e.currentTarget.form!))
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

          </form>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <span className="ml-4 text-lg text-emerald-800">Signing you in...</span>
        </div>
      )}

      {/* Divider Line */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
      </div>

      {/* Terms and Privacy Policy Links */}
      <p className="text-center text-xs text-muted-foreground">
        By signing up, you agree to our{" "}
        <Link href="/terms-of-service" className="text-emerald-600 hover:text-emerald-800 hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="text-emerald-600 hover:text-emerald-800 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}

/**
 * ErrorDisplay Component
 * 
 * This component displays error messages from URL search parameters.
 * It's used to show authentication errors returned from the server.
 */
function ErrorDisplay() {
  // Get error from URL search parameters
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  // Get the appropriate error message based on the error code
  const errorMessage = getErrorMessage(error)

  // Don't render anything if there's no error
  if (!errorMessage) return null

  // Display the error message in a red box
  return (
    <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
      {errorMessage}
    </div>
  )
}

/**
 * getErrorMessage Function
 * 
 * Maps error codes to user-friendly error messages.
 * 
 * @param error - The error code from the URL
 * @returns A user-friendly error message or null if no error
 */
function getErrorMessage(error: string | null) {
  if (!error) return null

  switch (error) {
    case 'missing-fields':
      return 'Email and password are required'
    case 'passwords-dont-match':
      return 'Passwords do not match'
    case 'Invalid login credentials':
      return 'Invalid email or password'
    default:
      return 'An error occurred. Please try again.'
  }
}

"use client"

// import { useState } from "react"
import { login, signup } from './actions'
import { useSearchParams } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Suspense } from 'react'

export function LoginForm() {
  return (
    <div className="space-y-4">
      <Suspense fallback={null}>
        <ErrorDisplay />
      </Suspense>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login" className="space-y-4">
          {/* <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="m@example.com" type="email" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-xs text-muted-foreground hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" />
          </div>
          <Button formAction={login} className="w-full" type="submit">
            Sign In
          </Button> */}
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" placeholder="m@example.com" type="email" required />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>

                <Link href="/reset-password" className="text-xs text-muted-foreground hover:underline">
                  Forgot password?
                </Link>

              </div>
              <Input id="password" name="password" type="password" required />
            </div>


            <Button formAction={login} className="w-full" type="submit">
              Sign In
            </Button>



          </form>


        </TabsContent>
        <TabsContent value="register" className="space-y-4">
          {/* <div className="space-y-2">
            <Label htmlFor="new-email">Email</Label>
            <Input id="new-email" placeholder="m@example.com" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Password</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button formAction={signup} className="w-full" type="submit">
            Create Account
          </Button> */}


          {/* NEW PASSWORD */}
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input id="new-email" name="email" placeholder="m@example.com" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Password</Label>
              <Input id="new-password" name="password" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" name="confirm-password" type="password" required />
            </div>
            <Button formAction={signup} className="w-full" type="submit">
              Create Account
            </Button>

          </form>
        </TabsContent>
      </Tabs>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        By signing up, you agree to our{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}

function ErrorDisplay() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const errorMessage = getErrorMessage(error)
  
  if (!errorMessage) return null
  
  return (
    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
      {errorMessage}
    </div>
  )
}

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

"use client"

// import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComputerIcon as Microsoft, Github } from "lucide-react"

export function LoginForm() {

  // const [activeTab, setActiveTab] = useState("login")

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Welcome to ProgressBytes</h2>
        <p className="text-sm text-muted-foreground">Sign in to your account or create a new one</p>
      </div>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login" className="space-y-4">
          <div className="space-y-2">
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
          <Button className="w-full" type="submit">
            Sign In
          </Button>
        </TabsContent>
        <TabsContent value="register" className="space-y-4">
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label>Account Type</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input type="radio" id="student" name="account-type" value="student" defaultChecked />
                <Label htmlFor="student">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="teacher" name="account-type" value="teacher" />
                <Label htmlFor="teacher">Teacher</Label>
              </div>
            </div>
          </div>
          <Button className="w-full" type="submit">
            Create Account
          </Button>
        </TabsContent>
      </Tabs>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="w-full">
          <Microsoft className="mr-2 h-4 w-4" />
          Microsoft
        </Button>
        <Button variant="outline" className="w-full">
          <Github className="mr-2 h-4 w-4" />
          Google
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
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

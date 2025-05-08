'use client'

import { LoginForm } from "./login-form"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold text-emerald-800">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <div className="p-6 pt-0">
            <LoginForm />
          </div>
        </Card>
      </div>
    </div>
  )
}

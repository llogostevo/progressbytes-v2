'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!email) {
      setMessage('Please enter your email address')
      setLoading(false)
      return
    }

    try {
      console.log('Attempting to reset password for email:', email)
      const redirectTo = `${window.location.origin}/auth/confirm?next=/account/update-password`
      console.log('Redirect URL:', redirectTo)
      
      const { error: updateError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (updateError) {
        console.error('Reset password error:', updateError)
        if (updateError.message.includes('Email rate limit exceeded')) {
          setMessage('Too many attempts. Please try again later.')
        } else if (updateError.message.includes('Invalid email')) {
          setMessage('Please enter a valid email address')
        } else {
          setMessage(`Error: ${updateError.message}`)
        }
      } else {
        console.log('Password reset email sent successfully')
        setMessage('Check your email for the password reset link')
      }
    } catch (error) {
      console.error('Unexpected error during password reset:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setMessage(`An error occurred. Please try again. ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
          </Link>
        </div>
        
        <Card>
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold text-emerald-800">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email address and we&apos;ll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {message && (
                <div className="text-sm text-center text-muted-foreground">{message}</div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
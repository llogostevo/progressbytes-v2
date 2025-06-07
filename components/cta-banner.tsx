"use client"

import { Button } from "@/components/ui/button"
import { User, Star, Sparkles, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CTABannerProps {
  variant: 'free' | 'basic' | 'premium'
  userEmail?: string
}

export function CTABanner({ variant, userEmail }: CTABannerProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const supabase = createClient()

  const handleClose = async () => {
    if (userEmail) {
      const { error } = await supabase
        .from('profiles')
        .update({ ai_interest_banner: false })
        .eq('email', userEmail)

      if (error) {
        console.error('Error updating profile:', error)
      }
    }
  }

  const handleCloseClick = () => {
    setShowDialog(true)
  }

  const handleConfirmClose = async () => {
    await handleClose()
    setShowDialog(false)
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  if (variant === 'free') {
    return (
      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row items-start sm:items-center gap-3">
          <div className="shrink-0 bg-red-100 p-2 rounded-full">
            <User className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Free Version</h3>
            <p className="text-sm text-red-700 mt-2">
              <strong>Sign up with your school email</strong> to get more questions.
            </p>
          </div>
          <div className="mt-3 sm:mt-0">
            <Link href="/login?tab=register">
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'basic') {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row items-start sm:items-center gap-3">
          <div className="shrink-0 bg-amber-100 p-2 rounded-full">
            <Star className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-amber-800">Signed Up Version</h3>
            <p className="text-sm text-amber-700">
              You&apos;re using the free version. Upgrade to get full access to all questions.
            </p>
          </div>
          <div className="mt-3 sm:mt-0">
            <Link href="/coming-soon">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                Upgrade
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'premium') {
    return (
      <>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4 relative">
          <button
            onClick={handleCloseClick}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-emerald-100 transition-colors z-10 cursor-pointer"
          >
            <X className="h-4 w-4 text-emerald-600" />
          </button>
          <div className="flex flex-col md:flex-row items-start sm:items-center gap-3 pr-8">
            <div className="shrink-0 bg-emerald-100 p-2 rounded-full">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-emerald-800">Premium Version</h3>
              <p className="text-sm text-emerald-700">
                You&apos;re using the premium version with self-assessment. Coming soon get AI-powered feedback.
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <Link href="/coming-soon">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Register Interest for AI
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                Why not register your interest first? We&apos;ll let you know when AI-powered feedback becomes available.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Keep Banner
              </Button>
              <Link href="/coming-soon" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  Register Interest
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleConfirmClose}>
                Remove Banner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return null
} 
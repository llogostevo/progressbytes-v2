import { Button } from "@/components/ui/button"
import { User, Star, Sparkles } from "lucide-react"
import Link from "next/link"

interface CTABannerProps {
  variant: 'free' | 'basic' | 'premium'
}

export function CTABanner({ variant }: CTABannerProps) {
  if (variant === 'free') {
    return (
      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row items-start sm:items-center gap-3">
          <div className="shrink-0 bg-red-100 p-2 rounded-full">
            <User className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Free Version</h3>
            <p className="text-sm text-red-700">
              You&apos;re using the free version with limited questions. Sign up to get more questions.
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
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row items-start sm:items-center gap-3">
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
    )
  }

  return null
} 
"use client"

import Link from "next/link"
import { Brain, LogOut, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavBar } from "./nav-bar"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [supabase])

  const handleAuth = async () => {
    if (isLoggedIn) {
      await supabase.auth.signOut()
      setIsLoggedIn(false)
      router.push('/')
    } else {
      router.push('/login')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 ml-10">
          <Brain className="h-6 w-6 text-primary" />
          <Link href="/" className="font-bold text-xl">
            Quiz - ProgressBytes
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <NavBar />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleAuth}
            className="flex items-center gap-2"
          >
            {isLoggedIn ? (
              <>
                <LogOut className="h-4 w-4" />
                Logout
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Login
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
} 
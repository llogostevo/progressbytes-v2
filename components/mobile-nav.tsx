"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart2, BookOpen, Menu, LogOut, LogIn, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { LucideIcon } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('userid', user.id)
          .single()
        setUserRole(profile?.role || null)
      }
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

  const navigationItems: NavItem[] = [
    {
      title: "Quizzes",
      href: "/",
      icon: BookOpen,
    },
    {
      title: "Progress",
      href: "/progress",
      icon: BarChart2,
    },
    {
      title: "Revisit",
      href: "/revisit",
      icon: BookOpen,
    },
    ...(userRole === 'admin' || userRole === 'teacher' ? [{
      title: "Analytics",
      href: "/analytics",
      icon: BarChart2,
    }] : []),
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="md:hidden px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="pr-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
          <div className="flex flex-col space-y-3">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.title}
              </Link>
            ))}
            <Button
              variant="ghost"
              onClick={handleAuth}
              className="flex items-center text-sm font-medium transition-colors hover:text-primary text-foreground/60"
            >
              {isLoggedIn ? (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

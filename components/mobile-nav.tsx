"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart2, BookOpen, Menu, X, User, LogOut, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"

type NavItem = {
  name: string;
  href?: string;
  onClick?: () => void;
  icon: React.ElementType;
}

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [freeUser, setFreeUser] = useState(false)
  const [userType, setUserType] = useState<"basic" | "revision" | "revisionAI" | "admin" | null>(null)
  const supabase = createClient()

  const checkSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setFreeUser(!session);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profiles } = await supabase.from("profiles").select("user_type").eq("userid", user.id).single();
      setUserType(profiles?.user_type);
    }
  }, [supabase]);

  /* TODO: check whether this is a secure approach */

  useEffect(() => {
    checkSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setFreeUser(!session);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, checkSession]);

  // Add effect to check session on route changes
  useEffect(() => {
    checkSession();
  }, [pathname, checkSession]);

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setFreeUser(true)
    router.push("/")
  }

  const navItems: (NavItem | null)[] = [
    {
      name: "Quizzes",
      href: "/",
      icon: BookOpen,
    },
    {
      name: "Progress",
      href: "/progress",
      icon: BarChart2,
    },
    {
      name: "Revisit",
      href: "/revisit",
      icon: BookOpen,
    },
    userType === "admin" ? {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    } : null,
    freeUser === true ? {
      name: "Login",
      href: "/login",
      icon: User,
    } : {
      name: "Logout",
      onClick: handleLogout,
      icon: LogOut,
    }
  ]

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="sticky top-0 z-10 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-emerald-600">ProgressBytes Quiz</span>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.filter((item): item is NavItem => item !== null).map((item) => (
              item.onClick ? (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                    "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </button>
              ) : (
                <div key={item.name} className="flex items-center gap-2">
                  <Link
                    href={item.href || '#'}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                      pathname === item.href
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>

                </div>
              )
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b border-gray-200">
            {navItems.filter((item): item is NavItem => item !== null).map((item) => (
              item.onClick ? (
                <button
                  key={item.name}
                  onClick={() => {
                    item.onClick?.()
                    setIsMenuOpen(false)
                  }}
                  className={cn(
                    "flex items-center w-full px-3 py-3 text-base font-medium rounded-md transition-colors cursor-pointer",
                    "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              ) : (
                <div key={item.name}>
                  <Link
                    href={item.href || '#'}
                    className={cn(
                      "flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors cursor-pointer",
                      pathname === item.href
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

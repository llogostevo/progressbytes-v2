"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart2, BookOpen, Menu, X, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { currentUser } from "@/lib/data"
import { createClient } from "@/utils/supabase/client"

export function MobileNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const freeUser = currentUser.email === "student@example.com"

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
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
    freeUser ? {
      name: "Login",
      href: "/login",
      icon: User,
    } : {
      name: "Logout",
      onClick: handleLogout,
      icon: LogOut,
    },
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
            {navItems.map((item) => (
              item.onClick ? (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              )
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b border-gray-200">
            {navItems.map((item) => (
              item.onClick ? (
                <button
                  key={item.name}
                  onClick={() => {
                    item.onClick()
                    setIsMenuOpen(false)
                  }}
                  className={cn(
                    "flex items-center w-full px-3 py-3 text-base font-medium rounded-md transition-colors",
                    "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

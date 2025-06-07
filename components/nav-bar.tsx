"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { BookOpen, BarChart2, Settings, LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

export function NavBar() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('userid', user.id)
          .single()
        setUserRole(profile?.role || null)
      }
    }
    fetchUserRole()
  }, [supabase])

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
    <nav className="flex items-center space-x-1">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md",
            pathname === item.href
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <item.icon className="h-4 w-4 mr-2" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
} 
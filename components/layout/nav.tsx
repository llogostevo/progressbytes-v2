"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, LogIn, LogOut, BookOpen, BarChart2, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { useAuth } from "@/app/providers/AuthProvider"
import { isAdmin, isTeacher } from "@/lib/access"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isLoggedIn, userRole, userType, refreshUser } = useAuth() // global context

  const handleAuth = async () => {
    if (isLoggedIn) {
      await supabase.auth.signOut()
      refreshUser()
      router.push('/')
    } else {
      router.push('/login')
    }
  }


  const navigationItems: NavItem[] = [
    { title: "Quizzes", href: "/", icon: BookOpen },
    { title: "Progress", href: "/progress", icon: BarChart2 },
    { title: "Revisit", href: "/revisit", icon: BookOpen },
    ...(isTeacher(userType)
      ? [{ title: "Analytics", href: "/analytics", icon: BarChart2 }]
      : []),
    ...(isAdmin(userRole)
        ? [{ title: "Admin", href: "/#", icon: BarChart2 }]
        : []),
    { title: "Settings", href: "/settings", icon: Settings },
  ]

    return (
        <>
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1">
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
                <Button
                    variant="ghost"
                    onClick={handleAuth}
                    className="flex items-center text-sm font-medium transition-colors hover:text-foreground hover:bg-muted/50"
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
            </nav>

            {/* Mobile Nav */}
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            className="px-0 text-base hover:bg-transparent"
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
            </div>
        </>
    )
}

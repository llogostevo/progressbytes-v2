"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, LogIn, LogOut, BookOpen, BarChart2, Settings, Calendar, Zap, ClipboardList, GraduationCap, FileText, Sparkles, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { useAuth } from "@/app/providers/AuthProvider"
import { isTeacherPlan, User, UserType } from "@/lib/access"
import { useState } from "react"
import { BetaBadge } from "@/components/ui/beta-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  isBeta: boolean
}

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isLoggedIn, userType, isAdmin: isAdminUser, refreshUser } = useAuth() // global context
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleAuth = async () => {
    if (isLoggedIn) {
      await supabase.auth.signOut()
      refreshUser()
      router.push('/')
    } else {
      router.push('/login')
    }
    setIsMobileMenuOpen(false) // Close mobile menu after auth action
  }


  const navigationItems: NavItem[] = [
    { title: "Quizzes", href: "/", icon: BookOpen, isBeta: false },
    { title: "Progress", href: "/progress", icon: BarChart2, isBeta: false },
    { title: "Revisit", href: "/revisit", icon: BookOpen, isBeta: false },
    ...(!isTeacherPlan({ user_type: userType as UserType } as User)
      ? [
          { title: "ProgressBoost", href: "/progress-boost", icon: Zap, isBeta: true }
        ]
      : []),
    { title: "Settings", href: "/settings", icon: Settings, isBeta: false },
  ]

  const teacherMenuItems = [
    { title: "Assess", href: "/assess", icon: ClipboardList },
    { title: "Analytics", href: "/analytics", icon: BarChart2 },
    { title: "Coverage", href: "/coverage", icon: Calendar },
    { title: "Test Builder", href: "/testbuilder", icon: FileText },
    ...(isAdminUser
      ? [{ title: "Question Builder", href: "/superpanel/superpanel2", icon: Sparkles }]
      : []),
  ]

    return (
        <>
            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-1">
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
                        {item.isBeta && <BetaBadge className="ml-2" size="sm"/>}
                    </Link>
                ))}
                
                {/* Teacher Tools Dropdown */}
                {isTeacherPlan({ user_type: userType as UserType } as User) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md",
                                    ["/assess", "/analytics", "/coverage", "/testbuilder", "/superpanel/superpanel2"].includes(pathname)
                                        ? "bg-muted text-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Teacher Tools
                                <ChevronDown className="h-4 w-4 ml-1" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Teaching Features</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {teacherMenuItems.map((item) => (
                                <DropdownMenuItem key={item.href} asChild>
                                    <Link
                                        href={item.href}
                                        className="flex items-center cursor-pointer"
                                    >
                                        <item.icon className="h-4 w-4 mr-2" />
                                        {item.title}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

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
            <div className="lg:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
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
                                        onClick={() => setIsMobileMenuOpen(false)}
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
                                
                                {/* Teacher Tools Section */}
                                {isTeacherPlan({ user_type: userType as UserType } as User) && (
                                    <>
                                        <div className="pt-3 pb-2">
                                            <div className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-0">
                                                <GraduationCap className="h-3 w-3 mr-2" />
                                                Teacher Tools
                                            </div>
                                        </div>
                                        {teacherMenuItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={cn(
                                                    "flex items-center text-sm font-medium transition-colors hover:text-primary pl-5",
                                                    pathname === item.href
                                                        ? "text-foreground"
                                                        : "text-foreground/60"
                                                )}
                                            >
                                                <item.icon className="h-4 w-4 mr-2" />
                                                {item.title}
                                            </Link>
                                        ))}
                                    </>
                                )}

                                <Button
                                    variant="ghost"
                                    onClick={handleAuth}
                                    className="flex items-center mt-4 ml-0.5 text-sm font-medium transition-colors hover:text-primary text-foreground/60 justify-start p-0 h-auto"
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
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    )
}

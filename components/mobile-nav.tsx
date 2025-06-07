"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart2, BookOpen, Menu, X, User, LogOut, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LucideIcon } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

const navigationItems: NavItem[] = [
  {
    title: "Quizzes",
    href: "/quizzes",
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
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart2,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [freeUser, setFreeUser] = useState(false)
  const supabase = createClient()

  const checkSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setFreeUser(!session);

    // const { data: { user } } = await supabase.auth.getUser();
    // if (user) {
    //   const { data: profiles } = await supabase.from("profiles").select("user_type").eq("userid", user.id).single();
    // }
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
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
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

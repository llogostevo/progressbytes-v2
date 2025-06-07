import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, BarChart2, Settings, LucideIcon } from "lucide-react"

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

export function NavBar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex items-center space-x-4">
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
  )
} 
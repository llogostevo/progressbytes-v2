import Link from "next/link"
import { Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-6 w-6" />
          <Link href="/" className="font-bold text-xl">
            ProgressBytes
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
            Pricing
          </Link>
          <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="hidden md:inline-flex">
            <Link href="#login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="#signup">Sign up</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

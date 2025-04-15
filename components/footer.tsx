import Link from "next/link"
import { Code } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex items-center gap-2">
          <Code className="h-6 w-6" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ProgressBytes. All rights reserved.
          </p>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
            Terms
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
            Privacy
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
}

import Link from "next/link"
import { Brain } from "lucide-react"
import { Nav } from "@/components/layout/nav"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-5 md:px-8">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <Link href="/" className="font-bold text-xl">
            Quiz - ProgressBytes
          </Link>
        </div>
        <Nav />
      </div>
    </header>
  )
}

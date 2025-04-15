"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-bold text-xl" onClick={() => setOpen(false)}>
            ProgressBytes
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <nav className="flex flex-col gap-4 mt-8">
          <Link href="#features" className="text-lg font-medium" onClick={() => setOpen(false)}>
            Features
          </Link>
          <Link href="#pricing" className="text-lg font-medium" onClick={() => setOpen(false)}>
            Pricing
          </Link>
          <Link href="#about" className="text-lg font-medium" onClick={() => setOpen(false)}>
            About
          </Link>
          <Link href="#login" className="text-lg font-medium" onClick={() => setOpen(false)}>
            Log in
          </Link>
          <Link href="#signup" className="text-lg font-medium" onClick={() => setOpen(false)}>
            Sign up
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

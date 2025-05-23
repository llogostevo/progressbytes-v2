import Link from "next/link"
import { Laptop } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-3 md:h-14 md:flex-row">
          <div className="flex items-center gap-2">
            <Laptop className="h-5 w-5 text-emerald-600" />
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} ProgressBytes (developed by Lloyd Stevens). All rights reserved.

            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/privacy-policy"
              className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/privacy-policy/student"
              className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Student Privacy
            </Link>
            {/* <Link
              href="#"
              className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Contact
            </Link> */}
          </nav>
        </div>
      </div>
    </footer>
  )
}

import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { Footer } from "@/components/footer"
import { Analytics } from "@vercel/analytics/react"
import { Header } from "@/components/layout/Header"
import { AuthProvider } from "./providers/AuthProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ProgressBytes Quiz",
  description: "Test your Computer Science knowledge with interactive quizzes",
  icons: {
    icon: "/favicon.svg",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">{children}</main>
          <Footer />
        </AuthProvider>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}

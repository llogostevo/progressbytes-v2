import { Shield, Eye, Server, Users, FileCheck, Lock } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPolicyStudent() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto border-none shadow-sm">
          <CardHeader className="bg-white p-8 border-b">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-slate-900">Student-Friendly Privacy Policy</h1>
            </div>
            <p className="text-slate-500">Last updated: 2nd May 2025</p>
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-slate-600 leading-relaxed mb-8 text-lg">
              This page explains how we protect your data when you use this app — whether you're at school, home, or
              somewhere else. You can use some parts of the app without logging in, and we collect as little info as
              possible.
            </p>

            <div className="space-y-8">
              <PolicySection
                icon={<Eye />}
                title="What We Collect"
                content={
                  <div className="space-y-3">
                    <p>• If you don't log in: page visits, clicks, device type, and cookies</p>
                    <p>• If you log in: name or nickname, email, saved answers or progress</p>
                  </div>
                }
              />

              <PolicySection
                icon={<FileCheck />}
                title="Why We Collect It"
                content={<p>To help you use the app, save your work, and make the app better for everyone.</p>}
              />

              <PolicySection
                icon={<Server />}
                title="Where It's Stored"
                content={<p>We use Supabase to store data safely in Europe (Germany). They follow all GDPR rules.</p>}
              />

              <PolicySection
                icon={<Users />}
                title="Who Can See It"
                content={<p>Only you, the app team (us), and trusted services like Supabase can see your data.</p>}
              />

              <PolicySection
                icon={<FileCheck />}
                title="Your Rights"
                content={
                  <p>You can ask to see your data, change it, or delete it by emailing us at [Your Email Address].</p>
                }
              />

              <PolicySection
                icon={<Lock />}
                title="Staying Safe"
                content={<p>We do our best to keep your info safe and never sell your data to anyone.</p>}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PolicySection({ 
  icon, 
  title, 
  content 
}: { 
  icon: React.ReactNode
  title: string
  content: React.ReactNode 
}) {
  return (
    <div className="group">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-full bg-emerald-100 text-emerald-700 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white">
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-emerald-700 group-hover:text-emerald-600 transition-colors duration-300">
          {title}
        </h2>
      </div>
      <div className="ml-12 text-slate-600 leading-relaxed">{content}</div>
      <Separator className="mt-6 opacity-30" />
    </div>
  )
}

import { Shield, Database, Lock, FileText, Server, Share, Clock, UserCheck, Bell } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface PolicySection {
  id: string
  icon: React.ReactNode
  title: string
  content: React.ReactNode
}

export default function PrivacyPolicyMain() {
  const sections: PolicySection[] = [
    {
      id: "who-we-are",
      icon: <Shield />,
      title: "1. Who We Are",
      content: 'This application is operated by ProgressBytes, a project developed and maintained by Lloyd Stevens (“we”, “us”, or “our”)',
    },
    {
      id: "data-collect",
      icon: <Database />,
      title: "2. What Data We Collect",
      content: (
        <div className="space-y-2">
          <p>We may collect the following types of personal data:</p>
          <p>• Name and email address (for login and identification)</p>
          <p>• School affiliation (to assign users to the correct institution)</p>
          <p>• Usage data (such as when you log in, progress tracking, and responses to activities)</p>
          <p>• Technical data (browser type, operating system, IP address)</p>
          <p>We do not knowingly collect or process special category data (e.g., health, race, religion).</p>
        </div>
      ),
    },
    {
      id: "how-we-use",
      icon: <FileText />,
      title: "3. How We Use Your Data",
      content: (
        <div className="space-y-2">
          <p>We use the data to:</p>
          <p>• Provide access to the application</p>
          <p>• Track user progress and responses</p>
          <p>• Communicate with you if needed</p>
          <p>• Improve the performance and security of the app</p>
          <p>We do not use your data for marketing purposes.</p>
        </div>
      ),
    },
    {
      id: "legal-basis",
      icon: <FileText />,
      title: "4. Legal Basis for Processing",
      content: (
        <div className="space-y-2">
          <p>Under the GDPR, the legal bases we rely on are:</p>
          <p>• Consent – where you have given us clear permission</p>
          <p>• Legitimate interests – to operate and improve the app effectively</p>
          <p>• Contract – to provide our service to users in line with our terms</p>
        </div>
      ),
    },
    {
      id: "data-storage",
      icon: <Server />,
      title: "5. Data Storage and Hosting",
      content: (
        <div className="space-y-2">
          <p>We use Supabase as our backend service provider. Supabase stores all data securely in the EU (Frankfurt, Germany) using Amazon Web Services (AWS).</p>
          <p>
            Supabase complies with GDPR. You can read their privacy policy{" "}
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              here
            </a>.
          </p>
          <p>All data is encrypted in transit and at rest.</p>
        </div>
      ),
    },
    {
      id: "sharing-data",
      icon: <Share />,
      title: "6. Who We Share Data With",
      content: (
        <div className="space-y-2">
          <p>We do not sell or share your personal data with third parties except:</p>
          <p>• Supabase (data processor for hosting and backend functions)</p>
          <p>• Relevant school staff for monitoring student progress (where applicable)</p>
          <p>• Legal authorities, if required by law</p>
        </div>
      ),
    },
    {
      id: "data-retention",
      icon: <Clock />,
      title: "7. How Long We Keep Your Data",
      content: "We keep personal data only as long as necessary to fulfill the purposes outlined in this policy, or as required by law. You can request deletion at any time.",
    },
    {
      id: "your-rights",
      icon: <UserCheck />,
      title: "8. Your Rights",
      content: (
        <div className="space-y-2">
          <p>You have the following rights under GDPR:</p>
          <p>• Access your personal data</p>
          <p>• Correct inaccurate data</p>
          <p>• Request deletion</p>
          <p>• Object to or restrict processing</p>
          <p>• Data portability</p>
          <p>• Withdraw consent at any time</p>
          <p>To exercise these rights, contact us at progressbytes@gmail.com</p>
        </div>
      ),
    },
    {
      id: "security",
      icon: <Lock />,
      title: "9. Data Security",
      content: "We take appropriate measures to protect your data, including encryption, role-based access control, and secure hosting.",
    },
    {
      id: "changes",
      icon: <Bell />,
      title: "10. Changes to This Policy",
      content: "We may update this privacy policy to reflect changes in the law or our services. We will notify users of any significant changes.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-slate-800 p-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            </div>
            <p className="text-slate-300">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <p className="text-slate-600 leading-relaxed mb-8">We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share your personal data when you use our application.</p>
            {sections.map((section) => (
              <PolicySection key={section.id} icon={section.icon} title={section.title} content={section.content} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PolicySection({ icon, title, content }: { icon: React.ReactNode; title: string; content: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-full bg-slate-200 text-slate-700">
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-slate-700">
          {title}
        </h2>
      </div>
      <div className="ml-12 text-slate-600 leading-relaxed">{content}</div>
      <Separator className="mt-6 opacity-30" />
    </div>
  )
}
// 
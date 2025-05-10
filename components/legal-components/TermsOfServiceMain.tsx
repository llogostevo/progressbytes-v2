import { Scale, BookOpen, AlertCircle, Shield, Clock, FileText, UserCheck, Bell, Lock, Globe, PenLine, Users, Gavel, Mail, HelpCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface TermsSection {
  id: string
  icon: React.ReactNode
  title: string
  content: React.ReactNode
}

export default function TermsOfServiceMain() {
  const sections: TermsSection[] = [
    {
      id: "acceptance",
      icon: <Scale />,
      title: "1. Acceptance of Terms",
      content: "By accessing and using ProgressBytes, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this application. You must be at least 13 years old to use ProgressBytes.",
    },
    {
      id: "use-licence",
      icon: <BookOpen />,
      title: "2. Use Licence",
      content: (
        <div className="space-y-2">
          <p>Permission is granted to temporarily use ProgressBytes for personal, educational, non-commercial purposes, subject to the following restrictions:</p>
          <p>• You must not modify or copy the materials</p>
          <p>• You must not use the materials for any commercial purpose</p>
          <p>• You must not attempt to decompile or reverse-engineer any software contained in ProgressBytes</p>
          <p>• You must not remove any copyright or other proprietary notations from the materials</p>
        </div>
      ),
    },
    {
      id: "user-account",
      icon: <UserCheck />,
      title: "3. User Account",
      content: (
        <div className="space-y-2">
          <p>To use certain features of ProgressBytes, you must register for an account. You agree to:</p>
          <p>• Provide accurate and complete information</p>
          <p>• Maintain the security of your account</p>
          <p>• Notify us immediately of any unauthorised use</p>
          <p>• Accept responsibility for all activities under your account</p>
          <p>Users under 13 are not permitted to create an account or use the service.</p>
        </div>
      ),
    },
    {
      id: "privacy",
      icon: <Shield />,
      title: "4. Privacy",
      content: (
        <div className="space-y-2">
          <p>Your use of ProgressBytes is also governed by our <a href="/privacy-policy" className="text-blue-600 underline">Privacy Policy</a>, which explains how we collect, use, and protect your data. We collect school email addresses and school names to manage access and, potentially, to contact schools in the future. By using this service, you consent to this use of your data.</p>
        </div>
      ),
    },
    {
      id: "educational-use",
      icon: <Globe />,
      title: "5. Educational Use Only",
      content: "ProgressBytes is intended solely for educational use. It is not a replacement for formal classroom instruction or certified educational programmes.",
    },
    {
      id: "user-content",
      icon: <PenLine />,
      title: "6. User-Generated Content",
      content: (
        <div className="space-y-2">
          <p>Users may input code, answers, and other content into the app. By doing so, you grant ProgressBytes a non-exclusive, royalty-free licence to use, display, and analyse this content for the purpose of improving and delivering the service. You are responsible for the legality and accuracy of any content you submit.</p>
        </div>
      ),
    },
    {
      id: "disclaimer",
      icon: <AlertCircle />,
      title: "7. Disclaimer",
      content: (
        <div className="space-y-2">
          <p>ProgressBytes is provided &apos;as is&apos;. We make no warranties, expressed or implied, and hereby disclaim all warranties including:</p>
          <p>• The accuracy of the materials</p>
          <p>• The reliability of the service</p>
          <p>• The availability of the service</p>
          <p>• The security of the service</p>
        </div>
      ),
    },
    {
      id: "limitations",
      icon: <Lock />,
      title: "8. Limitations",
      content: "In no event shall ProgressBytes or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use ProgressBytes.",
    },
    {
      id: "indemnification",
      icon: <Users />,
      title: "9. Indemnification",
      content: "You agree to indemnify and hold harmless ProgressBytes and its affiliates from any claims, damages, liabilities or expenses arising from your use of the service or your breach of these Terms of Service.",
    },
    {
      id: "revisions",
      icon: <Clock />,
      title: "10. Revisions and Errata",
      content: "The materials appearing on ProgressBytes could include technical, typographical, or photographic errors. We do not warrant that any of the materials are accurate, complete, or current.",
    },
    {
      id: "links",
      icon: <FileText />,
      title: "11. Links",
      content: "ProgressBytes has not reviewed all of the sites linked to its application and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by ProgressBytes.",
    },
    {
      id: "modifications",
      icon: <Bell />,
      title: "12. Modifications to Terms",
      content: "We may revise these Terms of Service at any time without notice. By using ProgressBytes, you agree to be bound by the current version of these Terms of Service.",
    },
    {
      id: "governing-law",
      icon: <Gavel />,
      title: "13. Governing Law",
      content: "These Terms of Service are governed by and construed in accordance with the laws of the United Kingdom. Any disputes arising shall be resolved in the UK courts.",
    },
    {
      id: "exam-style-content",
      icon: <HelpCircle />,
      title: "14. Exam-Style Content Disclaimer",
      content: (
        <div className="space-y-2">
          <p>The questions, model answers, and mark schemes provided in ProgressBytes are designed to be exam-style but are not official exam board materials. They have not been ratified by any examination board.</p>
          <p>While we aim to include a broad range of possible question types, it is not possible to cover every variation or format that may appear in a real examination.</p>
          <p>Students are advised to also review official past papers and mark schemes from the relevant examination board as part of their preparation.</p>
        </div>
      ),
    },
    {
      id: "contact",
      icon: <Mail />,
      title: "15. Contact",
      content: "If you have any questions about these Terms, please contact us at progressbytes@gmail.com.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-slate-800 p-8">
            <div className="flex items-center gap-3 mb-2">
              <Scale className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
            </div>
            <p className="text-slate-300">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <p className="text-slate-600 leading-relaxed mb-8">Please read these Terms of Service carefully before using ProgressBytes. By accessing or using our service, you agree to be bound by these terms.</p>
            {sections.map((section) => (
              <TermsSection key={section.id} icon={section.icon} title={section.title} content={section.content} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TermsSection({ icon, title, content }: { icon: React.ReactNode; title: string; content: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-centre gap-3 mb-3">
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

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import QuestionManager from "./QuestionManager"
import { Shield, Database, Settings } from "lucide-react"

export default async function SuperPanel() {
  const supabase = await createClient()

  // Get the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get the user's profile
  const { data: profilesData } = await supabase.from("profiles").select("*").eq("userid", user?.id).single()

  // Check if the user is an admin
  if (!profilesData.admin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Admin Panel</h1>
              <p className="text-slate-600 dark:text-slate-400">Manage questions and system settings</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Questions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">--</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Question Types</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">7</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Settings className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Topics</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">--</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <Database className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Question Management</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Create, edit, and manage quiz questions</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <QuestionManager />
          </div>
        </div>
      </div>
    </div>
  )
}

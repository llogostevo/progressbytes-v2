import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import QuestionManager from "./QuestionManager"

export default async function SuperPanel() {
  const supabase = await createClient()

  // Get the user
  const {data:{user}} = await supabase.auth.getUser()

  // Get the user's profile
  const {data: profilesData} = await supabase
    .from("profiles")
    .select("*")
    .eq("userid", user?.id)
    .single()

  // Check if the user is an admin
  if (!profilesData.admin) {
    redirect("/")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Question Management</h2>
        <QuestionManager />
      </div>
    </div>
  )
}

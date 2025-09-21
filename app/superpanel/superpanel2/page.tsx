import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import ImprovedQuestionManager from "./ImprovedQuestionManager"

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
    <div className="min-h-screen bg-background">
      <ImprovedQuestionManager />
    </div>
  )
}

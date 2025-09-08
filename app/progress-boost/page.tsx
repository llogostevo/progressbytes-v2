import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import ProgressBoostClient from "./ProgressBoostClient"

export default async function ProgressBoostPage() {
  const supabase = await createClient()
  
  // Check authentication at the server level
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  // Check if user is a student (not a teacher)
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("userid", user.id)
    .single()

  if (profile?.user_type?.startsWith('teacher')) {
    redirect('/')
  }

  return <ProgressBoostClient />
}

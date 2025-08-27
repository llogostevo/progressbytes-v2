import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import ProgressPageClient from "./ProgressPageClient"

export default async function ProgressPage() {
  const supabase = await createClient()
  
  // Check authentication at the server level
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  return <ProgressPageClient />
}
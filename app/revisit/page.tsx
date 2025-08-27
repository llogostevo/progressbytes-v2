import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import RevisitPageClient from "./RevisitPageClient"

export default async function RevisitPage() {
  const supabase = await createClient()
  
  // Check authentication at the server level
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  return <RevisitPageClient />
}
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import SettingsPageClient from "./SettingsPageClient"

export default async function SettingsPage() {
  const supabase = await createClient()
  
  // Check authentication at the server level
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  return <SettingsPageClient />
}
// import { createClient } from "@/utils/supabase/server"
// import { redirect } from "next/navigation"
import UpgradePageClient from "./UpgradePageClient"

export default async function UpgradePage() {
  // const supabase = await createClient()

  // // Check authentication at the server level
  // const {
  //   data: { user },
  //   error,
  // } = await supabase.auth.getUser()

  // if (error || !user) {
  //   redirect("/login")
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center mb-8">
          <h1 className="text-2xl font-bold">Upgrade Plans</h1>
        </div>
        <UpgradePageClient />
      </div>
    </div>

  )
}

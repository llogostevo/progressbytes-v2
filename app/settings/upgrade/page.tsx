import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import UpgradePageClient from "./UpgradePageClient"

function UpgradePageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Plans Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function UpgradePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <h1 className="text-2xl font-bold">Upgrade Plans</h1>
        </div>
        <Suspense fallback={<UpgradePageSkeleton />}>
          <UpgradePageClient />
        </Suspense>
      </div>
    </div>
  )
}

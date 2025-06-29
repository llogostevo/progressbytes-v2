'use client';

import { CTABanner } from "@/components/cta-banner"
import { TopicGrid } from "@/components/topic-grid"
import { useAccess } from "@/hooks/useAccess"
import type { Topic } from "@/lib/types"

interface HomeAccessControlProps {
  user: any
  userType?: string
  showAIInterestBanner: boolean
  topics: Topic[]
}

export function HomeAccessControl({ user, userType, showAIInterestBanner, topics }: HomeAccessControlProps) {
  const access = useAccess()
  const freeUser = !user

  return (
    <>
      {/* CTA Banner */}
      <div className="mb-6 md:mb-8">
        {freeUser && <CTABanner variant="free" />}
        {userType === 'basic' && <CTABanner variant="basic" />}
        {userType === 'revision' && showAIInterestBanner && <CTABanner variant="premium" userEmail={user?.email} />}
      </div>

      <TopicGrid topics={topics} userType={userType} />
    </>
  )
} 
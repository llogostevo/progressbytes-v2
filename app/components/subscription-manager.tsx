"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function SubscriptionManager() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(priceId)
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')
  
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          email: user.email,
        }),
      })
  
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create checkout session')
      }
  
      const { sessionId } = await response.json()
      
      if (!sessionId) {
        throw new Error('No session ID returned')
      }
  
      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      const { error } = await stripe!.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Basic Plan */}
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Basic Plan</CardTitle>
          <CardDescription className="text-xs">Free access with limited features</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow pb-2">
          <div className="text-xl font-bold">£0</div>
          <ul className="mt-2 space-y-1 text-sm">
            <li>5 questions per day</li>
            <li>5 total questions limit</li>
            <li>Basic self-assessment</li>
          </ul>
        </CardContent>
        <CardFooter className="pt-2 mt-auto">
          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => handleSubscribe('price_1RXTEGCKC8acZCBT5m8JCJ0R')}
            disabled={true}
          >
            Current Plan
          </Button>
        </CardFooter>
      </Card>

      {/* Revision Plan */}
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Revision Plan</CardTitle>
          <CardDescription className="text-xs">Full access to all questions</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow pb-2">
          <div className="text-xl font-bold">£1/month</div>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Unlimited questions per day</li>
            <li>Unlimited total questions</li>
            <li>Full access to all topics</li>
            <li>Detailed explanations</li>
          </ul>
        </CardContent>
        <CardFooter className="pt-2 mt-auto">
          <Button 
            className="w-full"
            onClick={() => handleSubscribe('price_1RXTF3CKC8acZCBTqz12OiY1')}
            disabled={loading === 'price_1RXTF3CKC8acZCBTqz12OiY1'}
          >
            {loading === 'price_1RXTF3CKC8acZCBTqz12OiY1' ? 'Loading...' : 'Upgrade'}
          </Button>
        </CardFooter>
      </Card>

      {/* AI Revision Plan */}
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">AI Revision Plan</CardTitle>
          <CardDescription className="text-xs">Full access with AI feedback</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow pb-2">
          <div className="text-xl font-bold">£10/month</div>
          <ul className="mt-2 space-y-1 text-sm">
            <li>All Revision Plan features</li>
            <li>AI-powered feedback</li>
            <li>Personalised learning insights</li>
          </ul>
        </CardContent>
        <CardFooter className="pt-2 mt-auto">
          <Button 
            className="w-full"
            onClick={() => handleSubscribe('price_1RXTFSCKC8acZCBTcTqE8OM6')}
            disabled={loading === 'price_1RXTFSCKC8acZCBTcTqE8OM6'}
          >
            {loading === 'price_1RXTFSCKC8acZCBTcTqE8OM6' ? 'Loading...' : 'Upgrade'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
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

      const { sessionId } = await response.json()
      
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
    <div className="grid gap-4">
      {/* Basic Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Plan</CardTitle>
          <CardDescription>Free access with limited features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">£0</div>
          <ul className="mt-4 space-y-2">
            <li>5 questions per day</li>
            <li>5 total questions limit</li>
            <li>Basic self-assessment</li>
          </ul>
        </CardContent>
        <CardFooter>
            {/* Basic Plan */}
          <Button 
            className="w-full"
            onClick={() => handleSubscribe('price_1RXTEGCKC8acZCBT5m8JCJ0R')}
            disabled={loading === 'price_1RXTEGCKC8acZCBT5m8JCJ0R'}
          >
            {loading === 'price_1RXTEGCKC8acZCBT5m8JCJ0R' ? 'Loading...' : 'Current Plan'}
          </Button>
        </CardFooter>
      </Card>

      {/* Revision Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Revision Plan</CardTitle>
          <CardDescription>Full access to all questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">£1/month</div>
          <ul className="mt-4 space-y-2">
            <li>Unlimited questions per day</li>
            <li>Unlimited total questions</li>
            <li>Full access to all topics</li>
            <li>Detailed explanations</li>
          </ul>
        </CardContent>
        <CardFooter>
            {/* revision plan */}
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
      <Card>
        <CardHeader>
          <CardTitle>AI Revision Plan</CardTitle>
          <CardDescription>Full access with AI feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">£10/month</div>
          <ul className="mt-4 space-y-2">
            <li>All Revision Plan features</li>
            <li>AI-powered feedback</li>
            <li>Personalized learning insights</li>
          </ul>
        </CardContent>
        <CardFooter>
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
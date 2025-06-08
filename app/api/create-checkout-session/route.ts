import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/utils/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { priceId } = body

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Get the current user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Create checkout session
    console.log('Site URL:', process.env.NEXT_PUBLIC_SITE_URL)
    
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      throw new Error('NEXT_PUBLIC_SITE_URL is not defined')
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL.trim()
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      throw new Error('NEXT_PUBLIC_SITE_URL must start with http:// or https://')
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/settings?success=true`,
      cancel_url: `${baseUrl}/settings?canceled=true`,
      metadata: {
        userId: user.id,
      },
    })

    if (!session.id) {
      throw new Error('No session ID returned from Stripe')
    }

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating checkout session' },
      { status: 500 }
    )
  }
}
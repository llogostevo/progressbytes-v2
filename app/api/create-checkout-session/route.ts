import { NextResponse } from 'next/server'
import { stripe } from '@/utils/stripe/stripe'

export async function POST(req: Request) {
  try {
    const { priceId, userId, email } = await req.json()
    
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    })

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?canceled=true`,
      metadata: {
        userId,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    )
  }
}
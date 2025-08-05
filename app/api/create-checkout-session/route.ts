
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { stripe } from '@/utils/stripe/stripe';

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

    // Check if user already has a Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, user_type')
      .eq('userid', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          email: profile?.email || user.email,
          metadata: {
            user_id: user.id,
          },
        })

        customerId = customer.id

        // Store the new customer ID in the profiles table
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('userid', user.id)

        if (updateError) {
          console.error('Error updating profile with customer ID:', updateError)
          // Don't fail the request, but log the error
        }
      } catch (stripeError) {
        console.error('Error creating Stripe customer:', stripeError)
        return NextResponse.json(
          { error: 'Failed to create customer' },
          { status: 500 }
        )
      }
    }

    // Check for existing active subscriptions
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    })

    // Cancel all existing subscriptions before creating new one
    for (const subscription of existingSubscriptions.data) {
      await stripe.subscriptions.cancel(subscription.id, {
        prorate: true, // This will refund the unused portion
      })
      console.log(`Cancelled existing subscription ${subscription.id} with proration`)
    }

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
      customer: customerId,
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
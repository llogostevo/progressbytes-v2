import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { stripe } from '@/utils/stripe/stripe'

export async function POST() {
  try {
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

    // Get user's profile to check if they have a Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, user_type')
      .eq('userid', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    // Check if user has a Stripe customer ID
    if (!profile.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 400 }
      )
    }

    // Check if user is currently on a paid plan
    const isOnPaidPlan = profile.user_type !== 'basic' && profile.user_type !== 'teacherBasic'
    
    if (!isOnPaidPlan) {
      return NextResponse.json(
        { error: 'User is not on a paid plan' },
        { status: 400 }
      )
    }

    // Get all active subscriptions for the customer
    const activeSubscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
    })

    if (activeSubscriptions.data.length === 0) {
      return NextResponse.json(
        { error: 'No active subscriptions found' },
        { status: 400 }
      )
    }

    // Cancel all active subscriptions with proration
    const cancelledSubscriptions = []
    
    for (const subscription of activeSubscriptions.data) {
      try {
        const cancelledSubscription = await stripe.subscriptions.cancel(subscription.id, {
          prorate: true, // This will refund the unused portion
        })
        
        cancelledSubscriptions.push({
          id: cancelledSubscription.id,
          status: cancelledSubscription.status,
        })
        
        console.log(`Cancelled subscription ${subscription.id} for user ${user.id}`)
      } catch (cancelError) {
        console.error(`Error cancelling subscription ${subscription.id}:`, cancelError)
        return NextResponse.json(
          { error: `Failed to cancel subscription ${subscription.id}` },
          { status: 500 }
        )
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Successfully cancelled ${cancelledSubscriptions.length} subscription(s)`,
      cancelledSubscriptions,
    })

  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error cancelling subscription' },
      { status: 500 }
    )
  }
}
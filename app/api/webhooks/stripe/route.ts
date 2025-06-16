import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/stripe';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

// Interface to extend Stripe's Subscription type with custom billing cycle fields
interface ExtendedSubscription extends Stripe.Subscription {
  billing_cycle?: {
    anchor: number;
    ends_at: number;
  };
}

/**
 * Stripe webhook handler for processing subscription-related events
 * This endpoint handles subscription creation, updates, and deletion events from Stripe
 */
export async function POST(req: Request) {
  // Get the raw request body and signature from headers
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');
  
  // Verify webhook signature is present
  if (!signature) {
    return new NextResponse('No signature', { status: 400 });
  }

  try {
    // Verify the webhook signature using Stripe's secret
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Initialize Supabase client for database operations
    const supabase = await createClient();

    // Handle different types of subscription events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as ExtendedSubscription;

        // Extract the price ID from the subscription
        const priceId = subscription.items.data[0].price.id;

        // Query the database to get the plan details associated with this price ID
        const { data: plan } = await supabase
          .from('plans')
          .select('slug')
          .eq('stripe_price_id', priceId)
          .single();

        if (!plan) {
          console.error(`Plan not found for price ID: ${priceId}`);
          break;
        }

        // Update the subscription record in the database with latest Stripe data
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: subscription.metadata.userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status,
            current_period_start: new Date((subscription.billing_cycle?.anchor ?? 0) * 1000),
            current_period_end: new Date((subscription.billing_cycle?.ends_at ?? 0) * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end
          });

        // Update the user's profile with their new subscription plan
        await supabase
          .from('profiles')
          .update({ user_type: plan.slug })
          .eq('userid', subscription.metadata.userId);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        // Mark the subscription as canceled in the database
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);

        // Reset the user's profile to the basic plan when subscription is canceled
        await supabase
          .from('profiles')
          .update({ user_type: 'basic' })
          .eq('userid', subscription.metadata.userId);

        break;
      }
    }

    // Return success response if all operations completed successfully
    return new NextResponse(null, { status: 200 });
  } catch (err) {
    // Log and return error response if any operation fails
    console.error('Error processing webhook:', err);
    return new NextResponse('Webhook error', { status: 400 });
  }
}
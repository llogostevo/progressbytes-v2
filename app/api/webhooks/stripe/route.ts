import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/stripe';
// import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin as supabase } from '@/utils/supabase/admin';   // supabaseAdmin is the admin client and will bypass RLS and has been imported from utils/supabase/admin.ts 

import Stripe from 'stripe';

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
    // const supabase = await createClient(); // This is the server component client and won't bypass RLS
    // supabaseAdmin is the admin client and will bypass RLS and has been imported from utils/supabase/admin.ts at the top of the file

    // Handle different types of subscription events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;


        // Cancel all other active subscriptions for this customer except the current one being created or updated to
        const activeSubs = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
        });

        for (const sub of activeSubs.data) {
          if (sub.id !== subscription.id) {
            await stripe.subscriptions.cancel(sub.id);
            console.log(`Cancelled existing subscription ${sub.id}`);
          }
        }


        // Retrieve the customer to get the user ID
        // const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;

        // Look up the user from the profiles table using the stripe_customer_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('userid')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profileError || !profile) {
          console.error(`User not found for Stripe customer ID: ${customerId}`, profileError);
          break;
        }

        const userId = profile.userid;

        // Extract the price ID from the subscription
        const priceId = subscription.items.data[0].price.id;
        console.log('priceId', priceId);

        // Query the database to get the plan details associated with this price ID
        const { data: plan, error: planError } = await supabase
          .from('plans')
          .select('slug')
          .eq('stripe_price_id', priceId)
          .single();

        if (planError || !plan) {
          console.error(`Plan not found for price ID: ${priceId}`, planError);
          break;
        }

        const item = subscription.items.data[0];

        if (!item) {
          console.error(`Item not found for subscription: ${subscription.id}`);
          break;
        }

        const periodEnd = item.current_period_end
          ? new Date(item.current_period_end * 1000).toISOString()
          : null;

        await supabase
          .from('profiles')
          .update({
            user_type: plan.slug,
            plan_end_date: periodEnd
          })
          .eq('userid', userId);

        break;
      }


      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find the user based on stripe_customer_id
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('userid')
          .eq('stripe_customer_id', customerId)
          .single();

        if (error || !profile) {
          console.error(`User not found for Stripe customer ID on cancel: ${customerId}`, error);
          break;
        }

        await supabase
          .from('profiles')
          .update({
            user_type: 'basic',
            plan_end_date: null
          })
          .eq('userid', profile.userid);

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
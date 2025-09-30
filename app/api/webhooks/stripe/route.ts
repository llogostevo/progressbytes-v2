
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/stripe';
import { supabaseAdmin as supabase } from '@/utils/supabase/admin';

import Stripe from 'stripe';
import { isTeacherPlan, User } from '@/lib/access';
import { UserType } from '@/lib/access';
import { cleanupExcessResources } from '@/lib/utils';



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

    // Handle different types of subscription events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Look up the user from the profiles table using the stripe_customer_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('userid, user_type')
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
          .select('slug, sponsoredStudents')
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
        console.log('plan', plan);
        const { error: updateError, data: updatedProfile } = await supabase
          .from('profiles')
          .update({
            user_type: plan.slug,
            plan_end_date: periodEnd,
            max_sponsored_seats: plan.sponsoredStudents
          })
          .eq('userid', userId)
          .select();

        if (updateError) {
          console.error(`Error updating profile for user ${userId}:`, updateError);
        } else {
          console.log(`Plan updated for user ${userId} from ${profile.user_type} to ${plan.slug} with max_sponsored_seats: ${plan.sponsoredStudents}`);
          console.log('updatedProfile', updatedProfile);
        }

        // Clean up excess classes and students for the new plan
        await cleanupExcessResources(supabase, userId, plan.slug);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('userid, user_type')
          .eq('stripe_customer_id', customerId)
          .single();

        if (error || !profile) {
          console.error(`User not found for Stripe customer ID on cancel: ${customerId}`, error);
          break;
        }

        // Check if the customer still has other active subscriptions
        const activeSubs = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
        });

        if (activeSubs.data.length === 0) {

          // Determine the appropriate downgrade plan based on current user type
          let downgradePlan = 'basic';

          if (isTeacherPlan({ user_type: profile.user_type as UserType } as User)) {
            // If user is a teacher, downgrade to teacherBasic instead of basic
            downgradePlan = 'teacherBasic';
          }


          // Only downgrade if no active subscriptions remain
          await supabase
            .from('profiles')
            .update({
              user_type: downgradePlan,
              plan_end_date: null,
            })
            .eq('userid', profile.userid);

          // Clean up excess classes and students for the downgraded plan
          await cleanupExcessResources(supabase, profile.userid, downgradePlan);

          console.log(`Downgraded ${profile.userid} to ${downgradePlan} due to no active subscriptions`);
        } else {
          console.log(`Subscription deleted, but user ${profile.userid} still has active plans`);
        }

        break;
      }

      // Add this case to your webhook
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;

        // Check if customer has any active subscriptions
        const activeSubs = await stripe.subscriptions.list({
          customer: customerId,
          status: 'active',
        });

        if (activeSubs.data.length === 0) {
          // Downgrade to basic if no active subscriptions
          const { data: profile } = await supabase
            .from('profiles')
            .select('userid')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile) {
            await supabase
              .from('profiles')
              .update({
                user_type: 'basic',
                plan_end_date: null,
              })
              .eq('userid', profile.userid);

            // Clean up excess classes and students for the basic plan
            await cleanupExcessResources(supabase, profile.userid, 'basic');
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        // Handle successful payments for subscription updates
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded for invoice:', invoice.id);
        // The subscription.updated event will handle the profile update
        break;
      }

      case 'invoice.payment_failed': {
        // Handle failed payments
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment failed for invoice:', invoice.id);
        // You might want to send an email to the user or take other actions
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
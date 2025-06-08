import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/stripe';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

interface ExtendedSubscription extends Stripe.Subscription {
  billing_cycle?: {
    anchor: number;
    ends_at: number;
  };
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');
  if (!signature) {
    return new NextResponse('No signature', { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    const supabase = await createClient();
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as ExtendedSubscription;

        const priceId = subscription.items.data[0].price.id;

        // Get the plan details from the price ID
        const { data: plan } = await supabase
          .from('plans')
          .select('slug')
          .eq('stripe_price_id', priceId)
          .single();

        if (!plan) {
          console.error(`Plan not found for price ID: ${priceId}`);
          break;
        }

        // Update subscription in database using new fields from stripe
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

        await supabase
          .from('profiles')
          .update({ user_type: plan.slug })
          .eq('userid', subscription.metadata.userId);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        // Mark subscription as canceled
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);

          // Reset user's profile to basic plan
        await supabase
        .from('profiles')
        .update({ user_type: 'basic' })
        .eq('userid', subscription.metadata.userId);

        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new NextResponse('Webhook error', { status: 400 });
  }
}
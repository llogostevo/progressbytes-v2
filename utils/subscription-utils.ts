import { stripe } from '@/utils/stripe/stripe';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function cancelAllUserSubscriptions(userId: string): Promise<void> {
  try {
    // Get user's profile to check if they have a Stripe customer ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('userid', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile or no profile found:', profileError);
      return; // No profile or customer ID, nothing to cancel
    }

    // If user has a Stripe customer ID, cancel all their active subscriptions
    if (profile.stripe_customer_id) {
      const activeSubscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'active',
      });

      // Cancel all active subscriptions
      for (const subscription of activeSubscriptions.data) {
        await stripe.subscriptions.cancel(subscription.id);
        console.log(`Cancelled subscription ${subscription.id} for user ${userId}`);
      }
    }
  } catch (error) {
    console.error('Error cancelling subscriptions for user:', userId, error);
    // Don't throw - let the calling function handle the error
  }
} 
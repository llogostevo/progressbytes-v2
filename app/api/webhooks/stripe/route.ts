
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/stripe';
import { supabaseAdmin as supabase } from '@/utils/supabase/admin';

import Stripe from 'stripe';
import { isTeacher, userAccessLimits } from '@/lib/access';
import type { UserType } from '@/lib/access';

/**
 * Clean up excess classes and students when a user changes plans
 */
async function cleanupExcessResources(userId: string, newPlanSlug: string) {
  try {
    const newPlanLimits = userAccessLimits[newPlanSlug as UserType];
    if (!newPlanLimits) {
      console.error('Invalid plan slug for cleanup:', newPlanSlug);
      return;
    }

    const cleanupResults = {
      classesDeleted: 0,
      studentsRemoved: 0,
      classesChecked: 0
    };

    // Only perform cleanup for teacher plans (plans with class limits)
    if (newPlanLimits.maxClasses !== undefined) {
      // Get all classes for this teacher
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('teacher_id', userId)
        .order('created_at', { ascending: true });

      if (classesError) {
        console.error('Error fetching classes for cleanup:', classesError);
        return;
      }

      if (classes && classes.length > 0) {
        cleanupResults.classesChecked = classes.length;

        // If teacher has more classes than allowed, delete excess classes
        if (classes.length > newPlanLimits.maxClasses) {
          const classesToDelete = classes.slice(newPlanLimits.maxClasses);
          const classIdsToDelete = classesToDelete.map(c => c.id);

          // Delete class members for these classes first (due to foreign key constraints)
          const { error: membersDeleteError } = await supabase
            .from('class_members')
            .delete()
            .in('class_id', classIdsToDelete);

          if (membersDeleteError) {
            console.error('Error deleting class members during cleanup:', membersDeleteError);
            return;
          }

          // Delete the excess classes
          const { error: classesDeleteError } = await supabase
            .from('classes')
            .delete()
            .in('id', classIdsToDelete);

          if (classesDeleteError) {
            console.error('Error deleting classes during cleanup:', classesDeleteError);
            return;
          }

          cleanupResults.classesDeleted = classesToDelete.length;
        }

        // Check remaining classes for excess students
        const remainingClasses = classes.slice(0, newPlanLimits.maxClasses);
        
        for (const classItem of remainingClasses) {
          // Get current student count for this class
          const { data: classMembers, error: membersError } = await supabase
            .from('class_members')
            .select('student_id')
            .eq('class_id', classItem.id);

          if (membersError) {
            console.error('Error fetching class members during cleanup:', membersError);
            continue;
          }

          const currentStudentCount = classMembers?.length || 0;
          const maxStudentsPerClass = newPlanLimits.maxStudentsPerClass || 0;

          // If class has more students than allowed, remove excess students
          if (currentStudentCount > maxStudentsPerClass) {
            const studentsToRemove = currentStudentCount - maxStudentsPerClass;
            
            // Get the most recently added students to remove
            const { data: recentMembers, error: recentError } = await supabase
              .from('class_members')
              .select('student_id')
              .eq('class_id', classItem.id)
              .order('joined_at', { ascending: false })
              .limit(studentsToRemove);

            if (recentError) {
              console.error('Error fetching recent members during cleanup:', recentError);
              continue;
            }

            if (recentMembers && recentMembers.length > 0) {
              const studentIdsToRemove = recentMembers.map(m => m.student_id);
              
              const { error: removeError } = await supabase
                .from('class_members')
                .delete()
                .eq('class_id', classItem.id)
                .in('student_id', studentIdsToRemove);

              if (removeError) {
                console.error('Error removing students from class during cleanup:', removeError);
                continue;
              }

              cleanupResults.studentsRemoved += studentIdsToRemove.length;
            }
          }
        }
      }
    }

    console.log(`Cleanup completed for user ${userId}:`, cleanupResults);
  } catch (error) {
    console.error('Error in cleanupExcessResources:', error);
  }
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

    // Handle different types of subscription events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

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

        // Clean up excess classes and students for the new plan
        await cleanupExcessResources(userId, plan.slug);

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

          if (isTeacher(profile.user_type)) {
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
          await cleanupExcessResources(profile.userid, downgradePlan);

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
            await cleanupExcessResources(profile.userid, 'basic');
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
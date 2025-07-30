import { supabaseAdmin as supabase } from '@/utils/supabase/admin'
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}
type Interval = 'day' | 'week' | 'month' | 'year';

interface Plan {
  name: string;
  slug: string;
  description: string;
  price: number;
  interval: Interval;
  features: string[];
  daily_question_limit: number | null;
  total_question_limit: number | null;
  has_ai_feedback: boolean;
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
});

export const plans: Record<string, Plan> = {
  basic: {
    name: 'Basic Plan',
    slug: 'basic',
    description: 'Limited access to questions with self-assessment only',
    price: 0,
    interval: 'month',
    features: [
      '5 questions per day',
      '5 total questions limit',
      'Basic self-assessment'
    ],
    daily_question_limit: 5,
    total_question_limit: 5,
    has_ai_feedback: false
  },
  revision: {
    name: 'Revision Plan',
    slug: 'revision',
    description: 'Full access to all questions and topics',
    price: 1,
    interval: 'month',
    features: [
      'Unlimited questions per day',
      'Unlimited total questions',
      'Full access to all topics',
      'Detailed explanations'
    ],
    daily_question_limit: null, // unlimited
    total_question_limit: null, // unlimited
    has_ai_feedback: false
  },
  revisionAI: {
    name: 'AI Revision Plan',
    slug: 'revisionAI',
    description: 'Full access to all features including AI-powered feedback',
    price: 10,
    interval: 'month',
    features: [
      'Unlimited questions per day',
      'Unlimited total questions',
      'Full access to all topics',
      'AI-powered feedback',
      'Personalized learning insights'
    ],
    daily_question_limit: null, // unlimited
    total_question_limit: null, // unlimited
    has_ai_feedback: true
  },
  teacherBasic: {
    name: 'Teacher Basic',
    slug: 'teacherBasic',
    description: 'Free teacher plan (1 class, 2 students)',
    price: 0,
    interval: 'month',
    features: ['1 class', 'Up to 2 students'],
    daily_question_limit: null,
    total_question_limit: null,
    has_ai_feedback: false
  },
  teacherPlan: {
    name: 'Teacher Plan',
    slug: 'teacherPlan',
    description: 'Teacher plan (1 class, 10 students)',
    price: 5,
    interval: 'month',
    features: ['1 class', 'Up to 10 students'],
    daily_question_limit: null,
    total_question_limit: null,
    has_ai_feedback: false
  },
  teacherPremium: {
    name: 'Teacher Premium',
    slug: 'teacherPremium',
    description: 'Paid teacher plan (multiple classes, unlimited students)',
    price: 20, 
    interval: 'month',
    features: ['Unlimited classes', 'Unlimited students'],
    daily_question_limit: null,
    total_question_limit: null,
    has_ai_feedback: false
  }
};

// export async function createStripeProducts() {
//   const supabase = await createClient();
  
//   for (const [key, plan] of Object.entries(plans)) {
//     // Create Stripe product
//     const product = await stripe.products.create({
//       name: plan.name,
//       description: plan.description,
//       metadata: {
//         plan_slug: plan.slug
//       }
//     });

//     // Create Stripe price
//     const price = await stripe.prices.create({
//       product: product.id,
//       unit_amount: Math.round(plan.price * 100), // Convert to cents
//       currency: 'gbp',
//       recurring: {
//         interval: plan.interval
//       }
//     });

//     // Store in Supabase
//     const { error } = await supabase
//       .from('plans')
//       .upsert({
//         name: plan.name,
//         slug: plan.slug,
//         description: plan.description,
//         stripe_price_id: price.id,
//         stripe_product_id: product.id,
//         price: plan.price,
//         interval: plan.interval,
//         features: plan.features,
//         daily_question_limit: plan.daily_question_limit,
//         total_question_limit: plan.total_question_limit,
//         has_ai_feedback: plan.has_ai_feedback
//       });

//     if (error) {
//       console.error(`Error creating plan ${plan.slug}:`, error);
//     }
//   }
// }

export async function createStripeProducts() {
  // const supabase = await createClient();
  
  for (const plan of Object.values(plans)) {
    // Skip free plans (no Stripe product/price needed)
    if (plan.price === 0) {
      // Optionally, still upsert the plan in your DB for tracking
      await supabase
        .from('plans')
        .upsert({
          name: plan.name,
          slug: plan.slug,
          description: plan.description,
          price: plan.price,
          interval: plan.interval,
          features: plan.features,
          daily_question_limit: plan.daily_question_limit,
          total_question_limit: plan.total_question_limit,
          has_ai_feedback: plan.has_ai_feedback
        });
      continue;
    }

    // Create Stripe product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: {
        plan_slug: plan.slug
      }
    });

    // Create Stripe price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(plan.price * 100), // Convert to cents
      currency: 'gbp',
      recurring: {
        interval: plan.interval
      }
    });

    // Store in Supabase
    const { error } = await supabase
      .from('plans')
      .upsert({
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        stripe_price_id: price.id,
        stripe_product_id: product.id,
        price: plan.price,
        interval: plan.interval,
        features: plan.features,
        daily_question_limit: plan.daily_question_limit,
        total_question_limit: plan.total_question_limit,
        has_ai_feedback: plan.has_ai_feedback
      });

    if (error) {
      console.error(`Error creating plan ${plan.slug}:`, error);
    }
  }
}
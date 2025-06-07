import { createClient } from '@/utils/supabase/server';
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
  apiVersion: '2025-05-28.basil',
  typescript: true,
});

export const plans: Record<string, Plan> = {
  basic: {
    name: 'Basic Plan',
    slug: 'basic',
    description: 'Limited access with self-assessment only',
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
  }
};

export async function createStripeProducts() {
  const supabase = await createClient();
  
  for (const [key, plan] of Object.entries(plans)) {
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
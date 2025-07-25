// app/api/dev-create-stripe-products/route.ts
import { NextResponse } from 'next/server'
import { createStripeProducts } from '@/utils/stripe/stripe'

export async function POST() {
  console.log('POST /api/dev-create-stripe-products called');
  try {
    await createStripeProducts()
    console.log('createStripeProducts finished');
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in createStripeProducts:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

// export async function POST() {
//     return NextResponse.json({ test: true });
//   }
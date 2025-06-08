// app/api/setup-plans/route.ts
import { NextResponse } from 'next/server'
import { createStripeProducts } from '@/utils/stripe/stripe'

export async function POST() {
  try {
    await createStripeProducts()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting up plans:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error setting up plans' },
      { status: 500 }
    )
  }
}
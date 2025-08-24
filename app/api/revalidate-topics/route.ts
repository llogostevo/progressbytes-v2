import { revalidateTag } from 'next/cache'

export async function POST() {
  revalidateTag('topics')
  return new Response('OK')
}
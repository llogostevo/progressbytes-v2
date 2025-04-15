'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Get form data
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm-password') as string

  // Validate inputs
  if (!email || !password) {
    console.error('Email and password are required')
    redirect('/login?error=missing-fields')
  }

  if (password !== confirmPassword) {
    console.error('Passwords do not match')
    redirect('/login?error=passwords-dont-match')
  }

  const data = {
    email,
    password,
  }
  
  console.log('Signup data:', data)

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error)
    redirect('/login?error=' + error.message)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
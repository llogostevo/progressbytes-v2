'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

/**
 * Login Action
 * 
 * This server action handles user login by authenticating with Supabase.
 * It's called when a user submits the login form.
 * 
 * @param formData - Form data containing email and password
 */
export async function login(formData: FormData) {
  // Create a Supabase client for server-side operations
  const supabase = await createClient()
  console.log("login")

  // Extract email and password from form data
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: (formData.get('login-email') as string).toLowerCase(),
    password: formData.get('login-password') as string,
  }
  console.log(data.email)
  // Attempt to sign in with email and password
  const { error } = await supabase.auth.signInWithPassword(data)

  // If there's an error, redirect to the error page
  if (error) {
    redirect('/error')
  }

  // Revalidate the root path to update any cached data
  revalidatePath('/', 'layout')

  // Redirect to the home page after successful login
  redirect('/')
}

/**
 * Signup Action
 * 
 * This server action handles user registration by creating a new user in Supabase Auth.
 * It's called when a user submits the registration form.
 * 
 * @param formData - Form data containing email, password, confirm password, and school
 */
export async function signup(formData: FormData) {
  // Create a Supabase client for server-side operations
  const supabase = await createClient()

  // Extract form data
  const email = (formData.get('register-email') as string).toLowerCase()
  const password = formData.get('register-password') as string
  const confirmPassword = formData.get('register-confirm-password') as string
  const school = formData.get('register-school') as string
  let user_type = 'basic' as string

  // Log form data for debugging (remove in production)
  console.log('Email:', email)
  console.log('Password:', password)
  console.log('Confirm Password:', confirmPassword)
  console.log('School:', school)

  // Validate required fields
  if (!email || !password) {
    console.error('Email and password are required')
    redirect('/login?error=missing-fields')
  }

  // Validate that passwords match
  if (password !== confirmPassword) {
    console.error('Passwords do not match')
    redirect('/login?error=passwords-dont-match')
  }

  /*TODO: need to setup database function to create user profile in profiles table, including setting user_type to revision for
  central foundation boys school email addressses */

  // Format the data for Supabase Auth
  // The school field is stored in the user's metadata
  const data = {
    email,
    password,
    options: {
      data: {
        school: school || '' // Ensure school is never null
      }
    }
  }

 // check if the email  is central foundation boys school
 if (email.includes('centralfoundationboys.co.uk')) {
  // set user_type to revision
  user_type = 'revision'
 }

  // Attempt to sign up the user with Supabase Auth
  const { data: authData, error } = await supabase.auth.signUp(data)

  if (authData.user) {
    await supabase
      .from('profiles')
      .update({ school, user_type })
      .eq('userid', authData.user.id)
  }

  // If there's an error, redirect to the login page with the error message
  if (error) {
    console.error('Signup error:', error)
    // redirect('/login?error=' + error.message)
    redirect('/error')

  }

  // Log successful signup for debugging (remove in production)
  console.log('Signup successful:', JSON.stringify(authData, null, 2))

  // Revalidate the root path to update any cached data
  revalidatePath('/', 'layout')

  // Redirect to the home page after successful signup
  redirect('/')
}
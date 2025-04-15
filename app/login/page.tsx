import { LoginForm } from "./login-form"

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const errorMessage = getErrorMessage(searchParams.error)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted">
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-md">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        {errorMessage && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {errorMessage}
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  )
}

function getErrorMessage(error?: string) {
  if (!error) return null
  
  switch (error) {
    case 'missing-fields':
      return 'Email and password are required'
    case 'passwords-dont-match':
      return 'Passwords do not match'
    case 'Invalid login credentials':
      return 'Invalid email or password'
    default:
      return 'An error occurred. Please try again.'
  }
}

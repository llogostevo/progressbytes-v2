import { UserIcon } from "lucide-react"

interface UserLoginProps {
  email: string | undefined
}

export function UserLogin({ email }: UserLoginProps) {
  if (!email) return null

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <UserIcon className="w-4 h-4" />
      {email}
    </div>
  )
} 
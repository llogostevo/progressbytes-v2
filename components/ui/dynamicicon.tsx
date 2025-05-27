import * as Icons from 'lucide-react'
import { LucideProps } from 'lucide-react'

type IconName = keyof typeof Icons

interface DynamicIconProps extends LucideProps {
  iconName: IconName
}

export function DynamicIcon({ iconName, ...props }: DynamicIconProps) {
  const LucideIcon = Icons[iconName] as React.FC<LucideProps>

  if (!LucideIcon) return null

  return <LucideIcon {...props} />
}

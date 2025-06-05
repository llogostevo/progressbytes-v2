import * as lucideIcons from 'lucide-react'
import { LucideProps } from 'lucide-react'
import { isValidElementType } from 'react-is'
import { type ElementType } from 'react'


function toPascalCase(str: string = ''): string {
  return str
    .split(/[-_]/g)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

interface DynamicIconProps extends LucideProps {
  iconName?: string
}

export function DynamicIcon({ iconName, ...props }: DynamicIconProps) {
  const fallbackName = 'MonitorSmartphone'
  const pascalName = toPascalCase(iconName || '')
  const fallbackIcon = lucideIcons[fallbackName as keyof typeof lucideIcons]
  const icon = lucideIcons[pascalName as keyof typeof lucideIcons]

  // Ensure it's a valid React component
  const SelectedIcon = isValidElementType(icon) ? (icon as ElementType) : (fallbackIcon as ElementType)

  return <SelectedIcon {...props} />
}

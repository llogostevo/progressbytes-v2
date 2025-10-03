import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const betaBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
        subtle:
          "border-muted-foreground/20 bg-muted/50 text-muted-foreground",
        outline:
          "border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-300",
      },
      size: {
        sm: "px-1 text-[0.5rem] leading-none ",
        default: "px-2 py-1 text-xs",
        lg: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BetaBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof betaBadgeVariants> {
  children?: React.ReactNode
}

function BetaBadge({ className, variant, size, children, ...props }: BetaBadgeProps) {
  return (
    <span className={cn(betaBadgeVariants({ variant, size }), className)} {...props}>
      {children || "BETA"}
    </span>
  )
}

export { BetaBadge, betaBadgeVariants }

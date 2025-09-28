import { toast } from "sonner"
import React from "react"

// Custom icons for filter toasts
const FilterOnIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.5 4.5L6 12L2.5 8.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const FilterOffIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 8H12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

// Custom toast functions for filter actions
export const filterOn = (message: string) => {
  toast.success(message, {
    icon: <FilterOnIcon />,
  })
}

export const filterOff = (message: string) => {
  toast.error(message, {
    icon: <FilterOffIcon />,
  })
}

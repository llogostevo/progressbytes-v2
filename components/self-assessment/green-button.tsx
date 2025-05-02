"use client"

import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface GreenButtonProps {
  isSelected: boolean
  onClick: () => void
}

export function GreenButton({ isSelected, onClick }: GreenButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className={`relative h-auto py-4 group transition-all duration-200 ${
              isSelected
                ? "ring-4 ring-emerald-200 bg-emerald-50 border-emerald-500"
                : "border-2 hover:border-emerald-500 hover:bg-emerald-50"
            }`}
            onClick={onClick}
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-2 bg-emerald-500 transition-all ${
                isSelected ? "opacity-100" : "opacity-70 group-hover:opacity-100"
              }`}
            />
            <div className="flex flex-col items-center w-full">
              <div
                className={`flex items-center justify-center size-14 rounded-full mb-2 transition-all ${
                  isSelected ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                <CheckCircle width={40} height={40} strokeWidth={2} className="min-w-[40px] min-h-[40px]" />
              </div>
              <span className={`font-medium ${isSelected ? "text-emerald-700" : "text-gray-700"}`}>Confident</span>
              <span className="text-xs text-gray-500 mt-1">I understand this fully</span>
            </div>
            {isSelected && (
              <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1">
                <CheckCircle className="size-4" />
              </div>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>You&apos;ll revisit this topic occasionally for reinforcement</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { type ButtonProps, buttonVariants } from "@/components/ui/button"

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

function Pagination({ className, ...props }: PaginationProps) {
  return <div className={cn("flex items-center justify-center space-x-2", className)} {...props} />
}
Pagination.displayName = "Pagination"

export { Pagination }
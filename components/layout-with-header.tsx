import Header from "./header"
import type { ReactNode } from "react"

interface LayoutWithHeaderProps {
  children: ReactNode
}

export default function LayoutWithHeader({ children }: LayoutWithHeaderProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  )
}


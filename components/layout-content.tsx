import type { ReactNode } from "react"

interface LayoutContentProps {
  children: ReactNode
}

export default function LayoutContent({ children }: LayoutContentProps) {
  return <div className="flex-1">{children}</div>
}


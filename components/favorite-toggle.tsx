"use client"

import type React from "react"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface FavoriteToggleProps {
  item: {
    name: string
    reason: string
    features: string[]
    imageUrl: string
    officialUrl: string
  }
  className?: string
  size?: "sm" | "md" | "lg"
}

export function FavoriteToggle({ item, className, size = "md" }: FavoriteToggleProps) {
  // 実際のアプリではコンテキストからお気に入り状態を取得
  const [isFavorite, setIsFavorite] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const { toast } = useToast()

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    const newState = !isFavorite
    setIsFavorite(newState)

    toast({
      title: newState ? "お気に入りに追加しました" : "お気に入りから削除しました",
      description: `${item.name}を${newState ? "お気に入りに追加" : "お気に入りから削除"}しました`,
      duration: 2000,
    })
  }

  // サイズに基づいてスタイルを設定
  const sizeStyles = {
    sm: {
      button: "h-7 w-7",
      icon: "h-4 w-4",
    },
    md: {
      button: "h-8 w-8",
      icon: "h-5 w-5",
    },
    lg: {
      button: "h-10 w-10",
      icon: "h-6 w-6",
    },
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        `${sizeStyles[size].button} rounded-full`,
        isFavorite
          ? "bg-white/90 text-yellow-500 hover:bg-white hover:text-yellow-600"
          : "bg-white/80 text-gray-500 hover:bg-white/90 hover:text-gray-600",
        "transition-all",
        isAnimating ? "scale-125" : "",
        className,
      )}
      onClick={handleToggle}
      aria-label={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
    >
      <Star className={cn(sizeStyles[size].icon, isFavorite ? "fill-current" : "", "transition-all")} />
    </Button>
  )
}


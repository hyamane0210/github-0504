"use client"

import type React from "react"
import { Star } from "lucide-react"
import { useFavorites } from "@/contexts/favorites-context"
import type { RecommendationItem } from "@/types/recommendations"
import { useState, useCallback, memo } from "react"

interface FavoriteIconProps {
  item: RecommendationItem | { name: string }
  size?: "sm" | "md" | "lg"
  className?: string
}

// メモ化してコンポーネントの不要な再レンダリングを防止
export const FavoriteIcon = memo(function FavoriteIcon({ item, size = "md", className = "" }: FavoriteIconProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const [isHovering, setIsHovering] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const isFav = isFavorite(item.name)

  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 300)

      if (isFav) {
        removeFavorite(item.name)
      } else if ("reason" in item) {
        addFavorite(item)
      } else {
        // 最小限の情報しかない場合は基本情報を作成
        const favoriteItem: RecommendationItem = {
          name: item.name,
          reason: `${item.name}をお気に入りに追加しました`,
          features: ["お気に入りから追加"],
          imageUrl: "/placeholder.svg?height=400&width=400",
          officialUrl: `https://example.com/${encodeURIComponent(item.name)}`,
        }
        addFavorite(favoriteItem)
      }
    },
    [isFav, item, addFavorite, removeFavorite],
  )

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
    <button
      className={`flex items-center justify-center ${sizeStyles[size].button} rounded-full 
      ${
        isFav
          ? "bg-yellow-500 text-white shadow-md"
          : "bg-white/80 text-gray-500 hover:bg-white hover:text-yellow-500 shadow"
      } 
      transition-all ${isAnimating ? "scale-125" : ""} ${className}`}
      onClick={handleToggleFavorite}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-label={isFav ? "お気に入りから削除" : "お気に入りに追加"}
    >
      <Star
        className={`${sizeStyles[size].icon} ${isFav || (isHovering && !isFav) ? "fill-current" : ""} 
          transition-all`}
      />
    </button>
  )
})
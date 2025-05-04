"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { RecommendationItem } from "@/components/recommendations"

type FavoritesContextType = {
  favorites: RecommendationItem[]
  addFavorite: (item: RecommendationItem) => void
  removeFavorite: (name: string) => void
  isFavorite: (name: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<RecommendationItem[]>([])

  // ローカルストレージからお気に入りを読み込む
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites")
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites))
      } catch (e) {
        console.error("Failed to parse favorites from localStorage", e)
      }
    }
  }, [])

  // お気に入りが変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites))
  }, [favorites])

  const addFavorite = (item: RecommendationItem) => {
    setFavorites((prev) => {
      // 既に存在する場合は追加しない
      if (prev.some((fav) => fav.name === item.name)) {
        return prev
      }
      return [...prev, item]
    })
  }

  const removeFavorite = (name: string) => {
    setFavorites((prev) => prev.filter((item) => item.name !== name))
  }

  const isFavorite = (name: string) => {
    return favorites.some((item) => item.name === name)
  }

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}


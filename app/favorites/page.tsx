"use client"

import { useState, useEffect } from "react"
import { useFavorites } from "@/contexts/favorites-context"
import { getRecommendations } from "@/app/actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Sparkles, ChevronLeft, ChevronRight, Star } from "lucide-react"
import type { RecommendationItem } from "@/components/recommendations"
import { useVisitHistory } from "@/hooks/use-visit-history"
import { Pagination } from "@/components/ui/pagination"
import Link from "next/link"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"

// サンプルキーワード（具体的な例）
const sampleKeywords = [
  "ケンドリック・ラマー",
  "BTS（防弾少年団）",
  "ショーシャンクの空に",
  "鬼滅の刃",
  "呪術廻戦",
  "ナイキ",
  "スタジオジブリ",
  "ビヨンセ",
  "進撃の巨人",
  "インターステラー",
]

// カテゴリーフィルター定義
const filterCategories = [
  { id: "all", name: "すべて" },
  { id: "artists", name: "アーティスト" },
  { id: "celebrities", name: "芸能人" },
  { id: "media", name: "映画/アニメ" },
  { id: "fashion", name: "ファッション" },
]

export default function FavoritesManagerPage() {
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { isFirstVisit, markAsReturningVisitor } = useVisitHistory()
  const [activeCategory, setActiveCategory] = useState("all")
  const [recommendedItems, setRecommendedItems] = useState<RecommendationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [customSearchTerm, setCustomSearchTerm] = useState("")
  const [step, setStep] = useState(1) // ステップ1: 選択、ステップ2: 検索
  const [showQuickSelect, setShowQuickSelect] = useState(isFirstVisit)

  // ページネーション用の状態
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12 // 1ページあたりのアイテム数

  // 初期データの読み込み
  useEffect(() => {
    loadRecommendations()

    // 初回訪問者にはクイック選択を表示
    if (isFirstVisit) {
      // setActiveTab("quick-select") を削除

      // 5秒後に初回訪問フラグを更新
      const timer = setTimeout(() => {
        markAsReturningVisitor()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isFirstVisit, markAsReturningVisitor])

  // おすすめアイテムの読み込み
  const loadRecommendations = async () => {
    setLoading(true)
    try {
      const keyword = sampleKeywords[Math.floor(Math.random() * sampleKeywords.length)]
      const data = await getRecommendations(keyword)

      // すべてのカテゴリーからアイテムを結合
      const allItems = [
        ...(data.artists || []),
        ...(data.celebrities || []),
        ...(data.media || []),
        ...(data.fashion || []),
      ]

      // すでにお気に入りにあるアイテムを除外
      const filteredItems = allItems.filter((item) => !favorites.some((fav) => fav.name === item.name))

      setRecommendedItems(filteredItems)
    } catch (error) {
      console.error("おすすめの取得に失敗しました", error)
    } finally {
      setLoading(false)
    }
  }

  // カテゴリーでお気に入りをフィルタリング
  const filteredFavorites = favorites.filter((item) => {
    if (activeCategory === "all") return true

    const text = `${item.name} ${item.reason} ${item.features.join(" ")}`.toLowerCase()

    if (
      activeCategory === "artists" &&
      (text.includes("アーティスト") || text.includes("歌手") || text.includes("バンド") || text.includes("音楽"))
    ) {
      return true
    } else if (
      activeCategory === "celebrities" &&
      (text.includes("芸能人") || text.includes("俳優") || text.includes("女優") || text.includes("タレント"))
    ) {
      return true
    } else if (
      activeCategory === "media" &&
      (text.includes("映画") || text.includes("アニメ") || text.includes("ドラマ") || text.includes("作品"))
    ) {
      return true
    } else if (
      activeCategory === "fashion" &&
      (text.includes("ファッション") || text.includes("ブランド") || text.includes("服") || text.includes("スタイル"))
    ) {
      return true
    }

    return false
  })

  // ページネーション用のデータ
  const paginatedFavorites = filteredFavorites.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage)

  // ページ変更ハンドラー
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">お気に入り</h1>
        <p className="text-muted-foreground">お気に入りコンテンツの追加と管理</p>
      </div>

      {/* お気に入りの概要 - コンパクトに */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">お気に入りの状況</h3>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-bold">{favorites.length}アイテム</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {filterCategories.map((category) => {
              const count = favorites.filter((item) => {
                const text = `${item.name} ${item.reason} ${item.features.join(" ")}`.toLowerCase()

                if (category.id === "all") return true
                if (
                  category.id === "artists" &&
                  (text.includes("アーティスト") ||
                    text.includes("歌手") ||
                    text.includes("バンド") ||
                    text.includes("音楽"))
                ) {
                  return true
                } else if (
                  category.id === "celebrities" &&
                  (text.includes("芸能人") ||
                    text.includes("俳優") ||
                    text.includes("女優") ||
                    text.includes("タレント"))
                ) {
                  return true
                } else if (
                  category.id === "media" &&
                  (text.includes("映画") || text.includes("アニメ") || text.includes("ドラマ") || text.includes("作品"))
                ) {
                  return true
                } else if (
                  category.id === "fashion" &&
                  (text.includes("ファッション") ||
                    text.includes("ブランド") ||
                    text.includes("服") ||
                    text.includes("スタイル"))
                ) {
                  return true
                }

                return false
              }).length

              return (
                <div
                  key={category.id}
                  className={`bg-muted/30 rounded-lg p-2 text-center cursor-pointer ${
                    activeCategory === category.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <p className="text-xs text-muted-foreground">{category.name}</p>
                  <p className="text-lg font-bold">{count}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 bg-muted/30 rounded-lg">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">まだお気に入りがありません</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            「検索」または「おすすめ」から好きなコンテンツを見つけて、お気に入りに追加しましょう。
          </p>
          <Button asChild>
            <Link href="/recommended">
              <Sparkles className="mr-2 h-4 w-4" />
              おすすめを見る
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {paginatedFavorites.map((item, index) => (
              <FavoriteCard key={index} item={item} />
            ))}
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="mx-4 flex items-center">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// コンパクトなお気に入りカードコンポーネント
function FavoriteCard({ item }: { item: RecommendationItem }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-square w-full">
        <ImageWithFallback
          src={item.imageUrl || "/placeholder.svg?height=200&width=200"}
          alt={item.name}
          fill
          className="object-cover"
          fallbackText={item.name.substring(0, 2)}
          identifier={`favorite-card-${item.name}`}
        />
        <FavoriteToggle item={item} size="sm" />
      </div>
      <CardContent className="p-2">
        <h4 className="font-medium text-sm truncate">{item.name}</h4>
        <p className="text-xs text-muted-foreground line-clamp-2 h-10">{item.reason}</p>
      </CardContent>
    </Card>
  )
}

// FavoriteToggleコンポーネント（既存のものを使用）
function FavoriteToggle({ item, size = "sm" }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const [isAnimating, setIsAnimating] = useState(false)

  const isFav = isFavorite(item.name)

  const handleToggleFavorite = (e) => {
    e.stopPropagation()
    e.preventDefault()

    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    if (isFav) {
      removeFavorite(item.name)
    } else if ("reason" in item) {
      addFavorite(item)
    }
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
      className={`absolute top-2 right-2 ${sizeStyles[size].button} rounded-full
        ${
          isFav
            ? "bg-white/90 text-yellow-500 hover:bg-white hover:text-yellow-600"
            : "bg-white/80 text-gray-500 hover:bg-white/90 hover:text-gray-600"
        }
        transition-all ${isAnimating ? "scale-125" : ""}`}
      onClick={handleToggleFavorite}
      aria-label={isFav ? "お気に入りから削除" : "お気に入りに追加"}
    >
      <Star
        className={`${sizeStyles[size].icon} ${isFav ? "fill-current" : ""}
          transition-all`}
      />
    </Button>
  )
}


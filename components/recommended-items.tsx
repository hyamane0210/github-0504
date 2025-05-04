"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { FavoriteIcon } from "./favorite-icon"
import type { RecommendationItem } from "./recommendations"
import { ImageWithFallback } from "./ui/image-with-fallback"

// 詳細ダイアログの内容を別コンポーネントとして分離
const ItemDetailContent = ({
  item,
  onSearch,
}: {
  item: RecommendationItem
  onSearch: () => void
}) => (
  <>
    <DialogHeader>
      <DialogTitle className="text-xl">{item.name}</DialogTitle>
    </DialogHeader>
    <div className="max-h-[60vh] overflow-y-auto pr-4">
      <div className="space-y-4">
        <div className="relative w-full h-64 rounded-md overflow-hidden">
          <ImageWithFallback
            src={item.imageUrl || "/placeholder.svg?height=400&width=400"}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 500px"
            loading="lazy"
            fallbackText={item.name.substring(0, 2)}
            identifier={item.name}
          />
          <div className="absolute top-2 right-2 transform hover:scale-110 transition-transform duration-200">
            <FavoriteIcon item={item} size="lg" />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg">提案理由</h3>
          <p className="text-muted-foreground">{item.reason}</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg">特徴</h3>
          <ul className="list-disc pl-5 text-muted-foreground">
            {item.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg">公式サイト</h3>
          <a
            href={item.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-primary hover:underline"
          >
            {item.officialUrl.replace(/^https?:\/\//, "").split("/")[0]}
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
    <DialogFooter className="mt-4">
      <Button onClick={onSearch} className="w-full bg-[#454545] hover:bg-[#454545]/90">
        <Search className="mr-2 h-4 w-4" />「{item.name}」で検索
      </Button>
    </DialogFooter>
  </>
)

interface RecommendedItemsProps {
  items: RecommendationItem[]
  title?: string
  subtitle?: string
  emptyMessage?: string
  showBadge?: boolean
  badgeText?: string
}

export function RecommendedItems({
  items,
  title = "おすすめアイテム",
  subtitle,
  emptyMessage = "おすすめアイテムがありません",
  showBadge = false,
  badgeText = "おすすめ",
}: RecommendedItemsProps) {
  const router = useRouter()
  const [selectedItem, setSelectedItem] = useState<RecommendationItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [visibleItems, setVisibleItems] = useState<RecommendationItem[]>([])
  const [isIntersecting, setIsIntersecting] = useState(false)

  // 初期表示時は最初の10アイテムのみ表示
  useEffect(() => {
    setVisibleItems(items.slice(0, 10))
  }, [items])

  // Intersection Observerを使用して画面内に入ったときに残りのアイテムを読み込む
  useEffect(() => {
    if (!isIntersecting || visibleItems.length >= items.length) return

    // 残りのアイテムを読み込む
    setVisibleItems(items)
  }, [isIntersecting, items, visibleItems.length])

  // Intersection Observer設定
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("load-more-trigger")
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  const handleItemClick = (item: RecommendationItem) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  // おすすめ検索を実行する関数
  const handleRecommendedSearch = () => {
    if (selectedItem) {
      // ダイアログを閉じる
      setIsDialogOpen(false)

      // 検索ページに遷移して自動的に検索を実行
      router.push(`/search?q=${encodeURIComponent(selectedItem.name)}`)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {showBadge && (
            <Badge variant="outline" className="bg-yellow-50">
              {badgeText}
            </Badge>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {visibleItems.map((item, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <div onClick={() => handleItemClick(item)}>
              <div className="relative aspect-square w-full group">
                <ImageWithFallback
                  src={item.imageUrl || "/placeholder.svg?height=400&width=400"}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  loading={index < 5 ? "eager" : "lazy"}
                  fallbackText={item.name.substring(0, 2)}
                  identifier={item.name}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200"></div>
                <div className="absolute top-2 right-2 transform scale-100 group-hover:scale-110 transition-transform duration-200">
                  <FavoriteIcon item={item} size="md" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end">
                  <p className="text-white text-xs p-2">お気に入りに追加</p>
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-sm mb-1 line-clamp-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 h-10">{item.reason}</p>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* 残りのアイテムを読み込むためのトリガー要素 */}
      {visibleItems.length < items.length && (
        <div id="load-more-trigger" className="h-10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      )}

      {/* 詳細ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedItem && (
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
            <Suspense
              fallback={
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              }
            >
              <ItemDetailContent item={selectedItem} onSearch={handleRecommendedSearch} />
            </Suspense>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}


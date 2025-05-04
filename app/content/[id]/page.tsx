"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Share2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { FavoriteIcon } from "@/components/favorite-icon"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

export default function ContentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [item, setItem] = useState<any>(null)
  const [prevItem, setPrevItem] = useState<any>(null)
  const [nextItem, setNextItem] = useState<any>(null)

  useEffect(() => {
    const searchResults = sessionStorage.getItem("searchResults")
    if (searchResults) {
      const results = JSON.parse(searchResults)
      const allItems = [
        ...results.artists,
        ...results.celebrities,
        ...results.media,
        ...results.fashion,
      ]

      const currentIndex = allItems.findIndex((item) => item.name === decodeURIComponent(params.id as string))
      if (currentIndex !== -1) {
        setItem(allItems[currentIndex])
        setPrevItem(currentIndex > 0 ? allItems[currentIndex - 1] : null)
        setNextItem(currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null)
      }
    }
  }, [params.id])

  const handleShare = async () => {
    if (!item) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.name,
          text: item.reason,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "URLをコピーしました",
          description: "共有用URLをクリップボードにコピーしました。",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("共有エラー:", error)
    }
  }

  if (!item) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="text-center">コンテンツが見つかりません</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          戻る
        </Button>
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          共有
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左カラム: 画像 */}
        <div className="relative">
          <div className="relative aspect-square md:aspect-[4/3] w-full overflow-hidden rounded-lg">
            <ImageWithFallback
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              fallbackText={item.name.substring(0, 2)}
              identifier={item.name}
              priority
            />
            <div className="absolute top-4 right-4">
              <FavoriteIcon item={item} size="lg" />
            </div>
          </div>
        </div>

        {/* 右カラム: コンテンツ情報 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{item.reason}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">特徴</h2>
            <div className="flex flex-wrap gap-2">
              {item.features.map((feature: string, index: number) => (
                <Badge key={index} variant="outline" className="text-sm py-1">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">公式サイト</h2>
            <a
              href={item.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-primary hover:underline text-lg"
            >
              {item.officialUrl.replace(/^https?:\/\//, "").split("/")[0]}
              <ExternalLink className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 border-t pt-8">
        {prevItem ? (
          <Button variant="outline" onClick={() => router.push(`/content/${encodeURIComponent(prevItem.name)}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {prevItem.name}
          </Button>
        ) : (
          <div />
        )}
        {nextItem ? (
          <Button variant="outline" onClick={() => router.push(`/content/${encodeURIComponent(nextItem.name)}`)}>
            {nextItem.name}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
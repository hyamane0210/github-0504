"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ChevronRight, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useFavorites } from "@/contexts/favorites-context"
import { FavoriteToggle } from "@/components/favorite-toggle"

export default function FavoritesPreview() {
  const { favorites } = useFavorites()
  const [isClient, setIsClient] = useState(false)

  // クライアントサイドでのみレンダリングを確認
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <Heart className="mr-2 h-5 w-5 text-[#454545]" />
          お気に入り
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/favorites" className="flex items-center">
            すべて見る
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {favorites.length > 0 ? (
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex space-x-4">
            {favorites.slice(0, 5).map((favorite) => (
              <Card key={favorite.name} className="w-[250px] flex-shrink-0">
                <div className="relative aspect-square">
                  <Image
                    src={favorite.imageUrl || "/placeholder.svg?height=400&width=400"}
                    alt={favorite.name}
                    fill
                    className="object-cover rounded-t-lg"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <FavoriteToggle item={favorite} className="absolute top-2 right-2" />
                  <Badge className="absolute bottom-2 left-2 bg-black/60 hover:bg-black/70">
                    {favorite.features[0]}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold truncate">{favorite.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10">{favorite.reason}</p>
                </CardContent>
              </Card>
            ))}

            {/* お気に入り追加カード */}
            <Card className="w-[250px] flex-shrink-0 border-dashed">
              <Link href="/search" className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-[#454545]" />
                </div>
                <h3 className="font-semibold">新しいお気に入りを追加</h3>
                <p className="text-sm text-muted-foreground mt-2">検索して新しいコンテンツを見つけましょう</p>
              </Link>
            </Card>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <Card className="p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">お気に入りがありません</h3>
          <p className="text-muted-foreground mb-4">コンテンツを検索して、お気に入りに追加しましょう</p>
          <Button asChild className="bg-[#454545] hover:bg-[#454545]/90">
            <Link href="/search">検索する</Link>
          </Button>
        </Card>
      )}
    </section>
  )
}


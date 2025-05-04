"use client"

import type { RecommendationItem } from "./recommendations"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FavoriteIcon } from "./favorite-icon"
import { Card, CardContent } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { useRouter } from "next/navigation"
import { ImageWithFallback } from "./ui/image-with-fallback"

export default function CategoryView({ items }: { items: RecommendationItem[] }) {
  const router = useRouter()
  const [selectedItem, setSelectedItem] = useState<RecommendationItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 18 // 1ページあたりのアイテム数

  const handleItemClick = (item: RecommendationItem) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  const handleRecommendedSearch = () => {
    if (selectedItem) {
      setIsDialogOpen(false)
      router.push(`/search?q=${encodeURIComponent(selectedItem.name)}`)
    }
  }

  // データが少ない場合は、同じデータを繰り返して30個以上にする
  const extendedItems = Array(Math.ceil(30 / items.length))
    .fill([...items])
    .flat()
    .slice(0, 50) // 最大50個まで用意しておく

  // ページネーション用のデータ
  const paginatedItems = extendedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(extendedItems.length / itemsPerPage)

  // ページ変更ハンドラー
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {paginatedItems.map((item, index) => (
          <Card
            key={`${item.name}-${index}`}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            <div className="relative aspect-square w-full">
              <ImageWithFallback
                src={item.imageUrl || "/placeholder.svg?height=400&width=400"}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16.6vw"
                loading={index < 6 ? "eager" : "lazy"}
                fallbackText={item.name.substring(0, 2)}
                identifier={`${item.name}-${index}`}
              />
              <FavoriteIcon item={item} size="sm" />
            </div>
            <CardContent className="p-2">
              <h4 className="font-medium text-sm truncate">{item.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 h-10">{item.reason}</p>
            </CardContent>
          </Card>
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

      {/* 詳細ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedItem && (
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedItem.name}</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-4">
              <div className="space-y-4">
                <div className="relative w-full h-64 rounded-md overflow-hidden">
                  <ImageWithFallback
                    src={selectedItem.imageUrl || "/placeholder.svg?height=400&width=400"}
                    alt={selectedItem.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 500px"
                    loading="lazy"
                    fallbackText={selectedItem.name.substring(0, 2)}
                    identifier={selectedItem.name}
                  />
                  <div className="absolute top-2 right-2">
                    <FavoriteIcon item={selectedItem} size="lg" />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">提案理由</h3>
                  <p className="text-muted-foreground">{selectedItem.reason}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">特徴</h3>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    {selectedItem.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">公式サイト</h3>
                  <a
                    href={selectedItem.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary hover:underline"
                  >
                    {selectedItem.officialUrl.replace(/^https?:\/\//, "").split("/")[0]}
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button onClick={handleRecommendedSearch} className="w-full bg-[#454545] hover:bg-[#454545]/90">
                <Search className="mr-2 h-4 w-4" />「{selectedItem.name}」で検索
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
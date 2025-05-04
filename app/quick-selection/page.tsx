"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Heart, Check, ArrowRight } from "lucide-react"
import { useFavorites } from "@/contexts/favorites-context"
import { Badge } from "@/components/ui/badge"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useVisitHistory } from "@/hooks/use-visit-history"

// クイック選択用のカテゴリーとアイテム
const quickSelectionItems = [
  {
    category: "アーティスト",
    type: "artists",
    items: [
      {
        id: "artist-1",
        name: "ケンドリック・ラマー",
        image: "/placeholder.svg?height=200&width=200",
        tags: ["ヒップホップ", "ラップ", "ピューリッツァー賞受賞"],
      },
      {
        id: "artist-2",
        name: "BTS",
        image: "/placeholder.svg?height=200&width=200",
        tags: ["K-POP", "ダンス", "国際的"],
      },
      {
        id: "artist-3",
        name: "テイラー・スウィフト",
        image: "/placeholder.svg?height=200&width=200",
        tags: ["ポップ", "カントリー", "自伝的歌詞"],
      },
      {
        id: "artist-4",
        name: "ビリー・アイリッシュ",
        image: "/placeholder.svg?height=200&width=200",
        tags: ["ポップ", "オルタナティブ", "グラミー賞受賞"],
      },
    ],
  },
  {
    category: "映画/アニメ",
    type: "media",
    items: [
      {
        id: "media-1",
        name: "鬼滅の刃",
        image: "/placeholder.svg?height=200&width=200",
        tags: ["アニメ", "アクション", "時代物"],
      },
      {
        id: "media-2",
        name: "インセプション",
        image: "/placeholder.svg?height=200&width=200",
        tags: ["SF", "クリストファー・ノーラン", "複雑な展開"],
      },
      {
        id: "media-3",
        name: "進撃の巨人",
        image: "/placeholder.svg?height=200&width=200",
        tags: ["アニメ", "ダーク", "ファンタジー"],
      },
      {
        id: "media-4",
        name: "千と千尋の神隠し",
        image: "/placeholder.svg?height=200&width=200",
        tags: ["アニメ映画", "スタジオジブリ", "ファンタジー"],
      },
    ],
  },
  {
    category: "ファッション",
    type: "fashion",
    items: [
      {
        id: "fashion-1",
        name: "ナイキ",
        image: "/placeholder.svg?height=200&width=200",
        tags: ["スポーツウェア", "スニーカー", "アスレチック"],
      },
      {
        id: "fashion-2",
        name: "ザラ",
        image: "/placeholder.svg?height=200&width=200",
        tags: ["ファストファッション", "トレンディ", "手頃な価格"],
      },
      {
        id: "fashion-3",
        name: "グッチ",
        image: "/placeholder.svg?height=200&width=200",
        tags: ["高級", "ハイファッション", "イタリア"],
      },
      {
        id: "fashion-4",
        name: "ユニクロ",
        image: "/placeholder.svg?height=200&width=200",
        tags: ["ベーシック", "ミニマリスト", "日本"],
      },
    ],
  },
]

export default function QuickSelectionPage() {
  const router = useRouter()
  const { addFavorite, isFavorite } = useFavorites()
  const { goToGuidedSearch, completeOnboarding } = useOnboarding()
  const { isFirstVisit, isLoaded } = useVisitHistory()
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // 初回訪問でない場合の処理
  useEffect(() => {
    if (isLoaded && !isFirstVisit) {
      // オンボーディングが完了している場合はホームにリダイレクト
      const hasCompletedOnboarding = localStorage.getItem("onboarding-completed") === "true"
      if (hasCompletedOnboarding) {
        router.push("/")
      }
    }
  }, [isFirstVisit, router, isLoaded])

  const toggleItem = (
    item: { id: string; name: string; image: string; tags?: string[] },
    category: string,
    type: string,
  ) => {
    // 選択状態を切り替え
    setSelectedItems((prev) => {
      if (prev.includes(item.id)) {
        return prev.filter((id) => id !== item.id)
      } else {
        return [...prev, item.id]
      }
    })

    // お気に入りに追加/削除
    if (!isFavorite(item.name)) {
      const favoriteItem = {
        name: item.name,
        reason: `${category}カテゴリーからクイック選択で追加されました`,
        features: [...(item.tags || []), category, "クイック選択"],
        imageUrl: item.image,
        officialUrl: `https://example.com/${encodeURIComponent(item.name)}`,
      }
      addFavorite(favoriteItem)
    }
  }

  // 次のステップ（ガイド付き検索）に進む
  const handleContinue = () => {
    // 選択したアイテムの情報を収集
    const selectedItemsInfo = []

    for (const category of quickSelectionItems) {
      for (const item of category.items) {
        if (selectedItems.includes(item.id)) {
          selectedItemsInfo.push({
            ...item,
            type: category.type,
          })
        }
      }
    }

    // 選択したアイテムがある場合はガイド付き検索に遷移
    if (selectedItemsInfo.length > 0) {
      goToGuidedSearch(selectedItemsInfo)
    } else {
      // 選択がない場合もガイド付き検索へ（空の配列を渡す）
      goToGuidedSearch([])
    }
  }

  // スキップしてホームに戻る
  const handleSkip = () => {
    completeOnboarding()
  }

  // ローディング中は何も表示しない
  if (!isLoaded) {
    return null
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <div className="text-center mb-6 md:mb-8">
        <div className="inline-flex items-center justify-center bg-[#f5f5f5] p-3 rounded-full mb-3 md:mb-4">
          <Heart className="h-7 w-7 md:h-8 md:w-8 text-[#454545]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3">好きなコンテンツを選んでみましょう</h1>
        <p className="text-muted-foreground mb-3 md:mb-4 max-w-2xl mx-auto text-sm md:text-base">
          興味のあるコンテンツを選択して、すぐにパーソナライズされた体験を始めましょう。
          <br className="hidden md:block" />
          選択したアイテムはお気に入りに追加され、あなた専用のおすすめが表示されます。
        </p>
        <Badge variant="outline" className="bg-yellow-50">
          {selectedItems.length}個選択中
        </Badge>
      </div>

      <div className="space-y-6 md:space-y-8 mb-6 md:mb-8">
        {quickSelectionItems.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-3 md:space-y-4">
            <h3 className="text-lg md:text-xl font-semibold">{category.category}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {category.items.map((item) => {
                const isSelected = selectedItems.includes(item.id)
                return (
                  <Card
                    key={item.id}
                    className={`cursor-pointer transition-all overflow-hidden ${
                      isSelected ? "ring-2 ring-[#454545]" : "hover:shadow-md"
                    }`}
                    onClick={() => toggleItem(item, category.category, category.type)}
                  >
                    <div className="relative aspect-square w-full">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                        <div className="p-3 text-white">
                          <p className="font-medium text-sm md:text-base">{item.name}</p>
                          {item.tags && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.tags.slice(0, 2).map((tag, idx) => (
                                <span key={idx} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#454545] text-white rounded-full w-6 h-6 flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          {selectedItems.length === 0
            ? "コンテンツを選択するとお気に入りに追加されます"
            : `${selectedItems.length}個のコンテンツをお気に入りに追加しました`}
        </p>
        <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
          <Button variant="outline" onClick={handleSkip} className="flex-1 sm:flex-auto">
            スキップ
          </Button>
          <Button onClick={handleContinue} className="bg-[#454545] hover:bg-[#454545]/90 flex-1 sm:flex-auto">
            {selectedItems.length > 0 ? "選択したコンテンツで検索" : "次へ"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}


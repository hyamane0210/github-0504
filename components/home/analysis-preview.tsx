"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BarChart3, ChevronRight, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFavorites } from "@/contexts/favorites-context"

// カテゴリーを判定する関数
const getCategoryForItem = (item: any): string => {
  const text = `${item.name} ${item.reason} ${item.features.join(" ")}`.toLowerCase()

  if (text.includes("アーティスト") || text.includes("歌手") || text.includes("バンド") || text.includes("音楽")) {
    return "artists"
  } else if (text.includes("芸能人") || text.includes("俳優") || text.includes("女優") || text.includes("タレント")) {
    return "celebrities"
  } else if (text.includes("映画") || text.includes("アニメ") || text.includes("ドラマ") || text.includes("作品")) {
    return "media"
  } else if (
    text.includes("ファッション") ||
    text.includes("ブランド") ||
    text.includes("服") ||
    text.includes("スタイル")
  ) {
    return "fashion"
  }

  return "other"
}

// パーソナリティタイプを取得する関数
const getPersonalityType = (dominantCategory: string) => {
  const personalityTypes = {
    artists: {
      title: "アーティスティックソウル",
      emoji: "🎵",
      description: "音楽と芸術を通じて世界を感じ、表現することを大切にするタイプです。",
      color: "#8A2BE2", // ブルーバイオレット
    },
    media: {
      title: "ビジュアルストーリーテラー",
      emoji: "🎬",
      description: "映像や物語を通じて様々な世界を体験することを楽しむタイプです。",
      color: "#4169E1", // ロイヤルブルー
    },
    fashion: {
      title: "トレンドセッター",
      emoji: "👗",
      description: "ファッションやスタイルを通じて自己表現を楽しむタイプです。",
      color: "#FF1493", // ディープピンク
    },
    celebrities: {
      title: "カルチャーコネクター",
      emoji: "🌟",
      description: "エンターテイメントや文化的トレンドを通じて人々とつながるタイプです。",
      color: "#FF4500", // オレンジレッド
    },
    other: {
      title: "エクスプローラー",
      emoji: "🔍",
      description: "様々なジャンルやカテゴリーのコンテンツを探求することを楽しむタイプです。",
      color: "#20B2AA", // ライトシーグリーン
    },
  }

  return personalityTypes[dominantCategory] || personalityTypes.other
}

export default function AnalysisPreview() {
  const { favorites } = useFavorites()
  const [isClient, setIsClient] = useState(false)
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [personalityType, setPersonalityType] = useState<any>(null)

  // クライアントサイドでのみレンダリングを確認
  useEffect(() => {
    setIsClient(true)
  }, [])

  // お気に入りからカテゴリーデータを生成
  useEffect(() => {
    if (favorites.length > 0) {
      const categories: Record<string, number> = {
        artists: 0,
        celebrities: 0,
        media: 0,
        fashion: 0,
        other: 0,
      }

      favorites.forEach((item) => {
        const category = getCategoryForItem(item)
        categories[category]++
      })

      const data = Object.entries(categories)
        .filter(([_, count]) => count > 0)
        .map(([category, count]) => ({
          name: category,
          value: count,
          id: category,
        }))
        .sort((a, b) => b.value - a.value)

      setCategoryData(data)

      // 最も割合の高いカテゴリーからパーソナリティタイプを設定
      if (data.length > 0) {
        const dominantCategory = data[0].id
        setPersonalityType(getPersonalityType(dominantCategory))
      }
    }
  }, [favorites])

  if (!isClient) {
    return null
  }

  // お気に入りが少ない場合
  if (favorites.length < 3) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-[#454545]" />
            性格タイプ診断
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/analysis" className="flex items-center">
              診断する
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Card className="p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">分析するデータが不足しています</h3>
          <p className="text-muted-foreground mb-4">
            より正確な性格タイプ診断のために、さらにお気に入りを追加してください
          </p>
          <Button asChild className="bg-[#454545] hover:bg-[#454545]/90">
            <Link href="/search">コンテンツを探す</Link>
          </Button>
        </Card>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-[#454545]" />
          性格タイプ診断
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/analysis" className="flex items-center">
            詳細を見る
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* パーソナリティタイプカード */}
      {personalityType && (
        <Card className="overflow-hidden">
          <div className="h-2" style={{ backgroundColor: personalityType.color }}></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4" />
                あなたの性格タイプ
              </div>
              <Badge style={{ backgroundColor: personalityType.color, color: "white" }}>
                {personalityType.emoji} {personalityType.title}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{personalityType.description}</p>
            <Button asChild size="sm" className="w-full" style={{ backgroundColor: personalityType.color }}>
              <Link href="/analysis">詳細な診断結果を見る</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  )
}


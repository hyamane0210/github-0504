"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useFavorites } from "@/contexts/favorites-context"
import { getRecommendations } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Sparkles, Info, Music, Film, ShoppingBag, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"
import type { RecommendationItem } from "@/components/recommendations"

// 動的インポートで遅延読み込み
const RecommendedItems = dynamic(() => import("@/components/recommended-items").then((mod) => mod.RecommendedItems), {
  loading: () => (
    <div className="flex justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
  ssr: false,
})

// キーワードデータをメモ化
const recommendedKeywords = {
  artists: ["米津玄師", "BTS", "テイラー・スウィフト", "ブルーノ・マーズ"],
  media: ["鬼滅の刃", "千と千尋の神隠し", "進撃の巨人", "ストレンジャー・シングス"],
  fashion: ["ナイキ", "ユニクロ", "グッチ", "ザラ"],
  celebrities: ["ゼンデイヤ", "トム・ホランド", "菅田将暉", "新垣結衣"],
}

const trendingKeywords = {
  artists: ["NewJeans", "Billie Eilish", "Olivia Rodrigo", "YOASOBI"],
  media: ["推しの子", "SPY×FAMILY", "ジョジョの奇妙な冒険", "ワンピース"],
  fashion: ["ZARA", "H&M", "UNIQLO", "Supreme"],
  celebrities: ["小松菜奈", "山田裕貴", "浜辺美波", "北村匠海"],
}

export default function RecommendedPage() {
  const { favorites } = useFavorites()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("artists")
  const [viewMode, setViewMode] = useState<Record<string, "recommended" | "trending">>({
    artists: "recommended",
    media: "recommended",
    fashion: "recommended",
    celebrities: "recommended",
  })
  const [recommendations, setRecommendations] = useState<Record<string, RecommendationItem[]>>({
    artists: [],
    media: [],
    fashion: [],
    celebrities: [],
  })
  const [error, setError] = useState<string | null>(null)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // 初期データの読み込み - アクティブなタブのみ最初に読み込む
  useEffect(() => {
    if (!initialLoadDone) {
      loadRecommendationsForTab(activeTab)
      setInitialLoadDone(true)
    }
  }, [activeTab, initialLoadDone])

  // タブが変更されたときに、そのタブのデータがまだ読み込まれていなければ読み込む
  useEffect(() => {
    if (initialLoadDone && recommendations[activeTab].length === 0) {
      loadRecommendationsForTab(activeTab)
    }
  }, [activeTab, initialLoadDone, recommendations])

  // viewModeが変更されたときに再読み込みするための関数
  const handleViewModeChange = useCallback((genre: string, mode: "recommended" | "trending") => {
    setViewMode((prev) => ({ ...prev, [genre]: mode }))
    loadRecommendationsForTab(genre)
  }, [])

  // 特定のタブのみのデータを読み込む最適化された関数
  const loadRecommendationsForTab = useCallback(
    async (tabName: string) => {
      setLoading(true)
      setError(null)

      try {
        const keywords = viewMode[tabName] === "recommended" ? recommendedKeywords[tabName] : trendingKeywords[tabName]

        const results: RecommendationItem[] = []

        for (const term of keywords) {
          const data = await getRecommendations(term)
          // 対応するジャンルのデータを追加
          if (data[tabName] && data[tabName].length > 0) {
            // お気に入りに既に追加されているアイテムを除外
            const newItems = data[tabName].filter((item) => !favorites.some((fav) => fav.name === item.name))
            results.push(...newItems)
          }
        }

        // 重複を削除
        const uniqueResults = Array.from(new Map(results.map((item) => [item.name, item])).values())

        // 既存のデータを保持しながら、新しいデータで更新
        setRecommendations((prev) => ({
          ...prev,
          [tabName]: uniqueResults,
        }))
      } catch (error) {
        console.error("おすすめの取得に失敗しました", error)
        setError("おすすめの取得中にエラーが発生しました。もう一度お試しください。")
      } finally {
        setLoading(false)
      }
    },
    [favorites, viewMode],
  )

  // 全てのタブのデータを読み込む関数
  const loadRecommendations = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // アクティブなタブのみ再読み込み
      await loadRecommendationsForTab(activeTab)
    } catch (error) {
      console.error("おすすめの取得に失敗しました", error)
      setError("おすすめの取得中にエラーが発生しました。もう一度お試しください。")
    } finally {
      setLoading(false)
    }
  }, [activeTab, loadRecommendationsForTab])

  // タブのアイコンを取得
  const getTabIcon = useCallback((tab: string) => {
    switch (tab) {
      case "artists":
        return <Music className="h-4 w-4 mr-2" />
      case "media":
        return <Film className="h-4 w-4 mr-2" />
      case "fashion":
        return <ShoppingBag className="h-4 w-4 mr-2" />
      case "celebrities":
        return <Users className="h-4 w-4 mr-2" />
      default:
        return <Sparkles className="h-4 w-4 mr-2" />
    }
  }, [])

  // タブのタイトルを取得
  const getTabTitle = useCallback((tab: string) => {
    switch (tab) {
      case "artists":
        return "アーティスト"
      case "media":
        return "映画/アニメ"
      case "fashion":
        return "ファッション"
      case "celebrities":
        return "芸能人"
      default:
        return tab
    }
  }, [])

  // タブの内容をメモ化
  const tabContent = useMemo(() => {
    return Object.keys(recommendations).map((genre) => (
      <TabsContent key={genre} value={genre} className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getTabIcon(genre)}
            <h2 className="text-xl font-bold">{getTabTitle(genre)}</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-muted rounded-full p-1 flex">
              <Button
                variant={viewMode[genre] === "recommended" ? "default" : "ghost"}
                size="sm"
                className={`rounded-full px-3 ${viewMode[genre] === "recommended" ? "bg-[#454545]" : ""}`}
                onClick={() => handleViewModeChange(genre, "recommended")}
              >
                おすすめ
              </Button>
              <Button
                variant={viewMode[genre] === "trending" ? "default" : "ghost"}
                size="sm"
                className={`rounded-full px-3 ${viewMode[genre] === "trending" ? "bg-[#454545]" : ""}`}
                onClick={() => handleViewModeChange(genre, "trending")}
              >
                トレンド
              </Button>
            </div>
            <Badge variant="outline" className="bg-yellow-50">
              新しい発見
            </Badge>
          </div>
        </div>

        {recommendations[genre].length === 0 ? (
          <Alert className="bg-muted/30 border-muted">
            <AlertDescription className="flex items-center">
              <Info className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">
                {viewMode[genre] === "recommended" ? "おすすめ" : "トレンド"}の{getTabTitle(genre)}
                が見つかりませんでした。他のジャンルを試してみてください。
              </span>
            </AlertDescription>
          </Alert>
        ) : (
          <RecommendedItems
            items={recommendations[genre]}
            subtitle={
              viewMode[genre] === "recommended"
                ? "あなたに合うかもしれない新しいコンテンツです"
                : "今人気のコンテンツです"
            }
            showBadge={true}
            badgeText={viewMode[genre] === "recommended" ? "おすすめ" : "トレンド"}
          />
        )}

        <div className="flex justify-center mt-4">
          <Button onClick={loadRecommendations} variant="outline">
            <Sparkles className="mr-2 h-4 w-4" />
            新しい{viewMode[genre] === "recommended" ? "おすすめ" : "トレンド"}を表示
          </Button>
        </div>
      </TabsContent>
    ))
  }, [recommendations, viewMode, getTabIcon, getTabTitle, handleViewModeChange, loadRecommendations])

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">おすすめ</h1>
        <p className="text-muted-foreground">ジャンル別のおすすめコンテンツを探索しましょう</p>
      </div>

      {loading && !initialLoadDone ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">おすすめコンテンツを読み込み中...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="artists" className="flex items-center">
              <Music className="h-4 w-4 mr-2" />
              アーティスト
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center">
              <Film className="h-4 w-4 mr-2" />
              映画/アニメ
            </TabsTrigger>
            <TabsTrigger value="fashion" className="flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              ファッション
            </TabsTrigger>
            <TabsTrigger value="celebrities" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              芸能人
            </TabsTrigger>
          </TabsList>

          {loading && initialLoadDone ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            tabContent
          )}
        </Tabs>
      )}
    </div>
  )
}


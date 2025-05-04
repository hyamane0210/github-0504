"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, AlertTriangle, Info, Heart } from "lucide-react"
import { useFavorites } from "@/contexts/favorites-context"
import { getRecommendations } from "@/app/actions"
import { Recommendations } from "@/components/recommendations"
import { Badge } from "@/components/ui/badge"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useVisitHistory } from "@/hooks/use-visit-history"
import { Alert, AlertDescription } from "@/components/ui/alert"

// アイテムの型定義
interface ItemType {
  id: string
  name: string
  image: string
  tags: string[]
  type?: string
}

export default function GuidedSearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { completeOnboarding } = useOnboarding()
  const { isFirstVisit, isLoaded } = useVisitHistory()
  const { favorites, addFavorite, isFavorite } = useFavorites()

  // 選択されたアイテム
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null)

  // 前のページから渡されたアイテム
  const [preSelectedItems, setPreSelectedItems] = useState<ItemType[]>([])

  // 検索関連
  const [recommendations, setRecommendations] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // エラー状態
  const [error, setError] = useState<string | null>(null)
  const [isClientReady, setIsClientReady] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  // URLパラメータの処理済みフラグ
  const paramsProcessedRef = useRef(false)

  // クライアントサイドでのみ実行される処理を確認
  useEffect(() => {
    setIsClientReady(true)
  }, [])

  // 初回訪問でない場合の処理
  useEffect(() => {
    if (!isClientReady || !isLoaded) return

    try {
      // オンボーディングが完了している場合はホームにリダイレクト
      const hasCompletedOnboarding = localStorage.getItem("onboarding-completed") === "true"
      if (!isFirstVisit && hasCompletedOnboarding) {
        router.push("/")
      }
    } catch (err) {
      console.error("ローカルストレージの読み込みエラー:", err)
      setError("設定の読み込み中にエラーが発生しました。")
    }
  }, [isFirstVisit, router, isLoaded, isClientReady])

  // URLからクエリパラメータを取得（一度だけ実行）
  useEffect(() => {
    if (!isClientReady || !searchParams || paramsProcessedRef.current) return

    try {
      // 選択されたアイテムの情報を取得
      const itemsParam = searchParams.get("items")

      if (itemsParam) {
        try {
          const decodedItems = JSON.parse(decodeURIComponent(itemsParam)) as ItemType[]
          setPreSelectedItems(decodedItems)

          // 最初のアイテムを自動選択して検索を実行
          if (decodedItems.length > 0) {
            setSelectedItem(decodedItems[0])
            performSearch(decodedItems[0])
          }

          paramsProcessedRef.current = true
        } catch (e) {
          console.error("アイテムのパース中にエラーが発生しました", e)
          setError("選択されたアイテムの読み込みに失敗しました。")
          paramsProcessedRef.current = true
        }
      } else {
        // アイテムがない場合はクイック選択ページにリダイレクト
        router.push("/quick-selection")
        paramsProcessedRef.current = true
      }
    } catch (err) {
      console.error("URLパラメータの処理エラー:", err)
      setError("URLパラメータの処理中にエラーが発生しました。")
      paramsProcessedRef.current = true
    }
  }, [searchParams, isClientReady, router])

  // 検索を実行する関数
  const performSearch = useCallback(async (item: ItemType) => {
    if (!item || !item.name) {
      setError("検索するアイテムが指定されていません。")
      return
    }

    setError(null)
    setLoading(true)

    try {
      // 検索キーワードを構築（タグも含める）
      let searchQuery = item.name
      if (item.tags && item.tags.length > 0) {
        // 最初の2つのタグだけを使用
        searchQuery = `${item.name} ${item.tags.slice(0, 2).join(" ")}`
      }

      const results = await getRecommendations(searchQuery)

      if (!results) {
        throw new Error("検索結果が取得できませんでした。")
      }

      // 検索結果が空かどうかチェック
      const hasResults = Object.values(results).some((category: any) => Array.isArray(category) && category.length > 0)

      if (!hasResults) {
        setError(`「${item.name}」に関連するコンテンツが見つかりませんでした。別のアイテムを選択してください。`)
      } else {
        setRecommendations(results)
      }
    } catch (error) {
      console.error("検索中にエラーが発生しました", error)
      setError("検索中にエラーが発生しました。もう一度お試しください。")
      setRecommendations(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // アイテムを選択して検索を実行
  const handleSelectItem = (item: ItemType) => {
    setSelectedItem(item)
    performSearch(item)

    // お気に入りに追加されていない場合は追加
    if (!isFavorite(item.name)) {
      const categoryName = getCategoryNameFromType(item.type || "")
      const favoriteItem = {
        name: item.name,
        reason: `${item.name}を選択しました`,
        features: [`${getCategoryNameFromType(item.type || "")}カテゴリーから選択`],
        imageUrl: item.image || "/placeholder.svg?height=400&width=400",
        officialUrl: `https://example.com/${encodeURIComponent(item.name)}`,
      }
      addFavorite(favoriteItem)
    }
  }

  // タイプからカテゴリー名を取得
  const getCategoryNameFromType = (type: string): string => {
    switch (type) {
      case "artists":
        return "アーティスト"
      case "media":
        return "映画/アニメ"
      case "fashion":
        return "ファッション"
      case "celebrities":
        return "芸能人"
      default:
        return "その他"
    }
  }

  // アプリを始める
  const finishOnboarding = () => {
    if (isNavigating) return

    setIsNavigating(true)

    try {
      completeOnboarding()
    } catch (err) {
      console.error("オンボーディング完了処理エラー:", err)
      // エラーが発生しても強制的にホームに遷移
      router.push("/")
    }
  }

  // クイック選択に戻る
  const goBackToQuickSelection = () => {
    if (isNavigating) return

    setIsNavigating(true)

    try {
      router.push("/quick-selection")
    } catch (err) {
      console.error("ページ遷移エラー:", err)
      setError("ページ遷移中にエラーが発生しました。")
      setIsNavigating(false)
    }
  }

  // クライアントサイドでの準備ができていない場合はローディング表示
  if (!isClientReady || !isLoaded) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      {/* エラー表示 */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 選択されたアイテムがない場合のガイダンス */}
      {preSelectedItems.length === 0 && (
        <Alert className="mb-6 bg-muted/30 border-muted">
          <AlertDescription className="flex items-center">
            <Info className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">
              選択されたコンテンツがありません。クイック選択に戻って、コンテンツを選択してください。
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* 選択可能なアイテム一覧 */}
      {preSelectedItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">選択したコンテンツ</h2>
          <div className="flex flex-wrap gap-2">
            {preSelectedItems.map((item, index) => {
              const isSelected = selectedItem?.id === item.id
              return (
                <Button
                  key={`${item.id}-${index}`}
                  variant={isSelected ? "default" : "outline"}
                  className={`rounded-full ${isSelected ? "bg-[#454545]" : ""}`}
                  onClick={() => handleSelectItem(item)}
                >
                  {item.name}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* 検索中のローディング表示 */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">「{selectedItem?.name}」に関連するコンテンツを検索中...</span>
        </div>
      )}

      {/* 検索結果 */}
      {recommendations && !loading && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Heart className="mr-2 h-5 w-5 text-primary" />「{selectedItem?.name}」に関連するおすすめ
            </h2>
            <Badge variant="outline" className="bg-yellow-50">
              検索完了
            </Badge>
          </div>
          <Recommendations data={recommendations} searchTerm={selectedItem?.name || ""} />
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={goBackToQuickSelection} disabled={isNavigating}>
          {isNavigating ? <Loader2 className="h-4 w-4 animate-spin" /> : "クイック選択に戻る"}
        </Button>
        <Button onClick={finishOnboarding} className="bg-[#454545] hover:bg-[#454545]/90" disabled={isNavigating}>
          {isNavigating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              処理中...
            </>
          ) : (
            <>
              アプリを始める
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}


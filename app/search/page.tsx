"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { getRecommendations } from "@/app/actions"
import { Recommendations } from "@/components/recommendations"
import { Loader2, SearchIcon, History, Sparkles } from "lucide-react"
import { FanIcon as FavoriteIcon, Search } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

// Recent searches (specific examples)
const recentSearches: string[] = []
const popularSearches: string[] = [
  "インセプション",
  "テイラー・スウィフト",
  "進撃の巨人",
  "ナイキ",
  "ビリー・アイリッシュ",
  "鬼滅の刃",
]

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchHistory, setSearchHistory] = useState(recentSearches)
  const [initialSearchDone, setInitialSearchDone] = useState(false)

  useEffect(() => {
    const query = searchParams.get("q")
    if (query && !initialSearchDone) {
      setSearchTerm(query)
      handleSearch(query)
      setInitialSearchDone(true)
    }
  }, [searchParams, initialSearchDone])

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setError("検索キーワードを入力してください")
      return
    }

    setLoading(true)
    setError("")
    setSearchTerm(term)

    try {
      const results = await getRecommendations(term)
      setRecommendations(results)

      if (!searchHistory.includes(term)) {
        setSearchHistory((prev) => [term, ...prev].slice(0, 5))
      }
    } catch (err) {
      setError("おすすめの取得中にエラーが発生しました。もう一度お試しください。")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchTerm)
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">検索</h1>
        <p className="text-muted-foreground">
          アーティスト、映画、アニメ、ファッションブランドなどを検索して、おすすめを見つけましょう
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="例: ケンドリック・ラマー、千と千尋の神隠し、ワンピース、アディダス..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 text-lg"
              />
              <Button type="submit" className="absolute right-1 top-1/2 transform -translate-y-1/2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    検索中
                  </>
                ) : (
                  "検索"
                )}
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>
        </CardContent>
      </Card>

      {!recommendations && !loading && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <Sparkles className="h-5 w-5 mr-2 text-[#454545]" />
                <h2 className="text-lg font-semibold">人気の検索</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term, index) => (
                  <Button key={index} variant="outline" className="rounded-full" onClick={() => handleSearch(term)}>
                    {term}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <History className="h-5 w-5 mr-2 text-[#454545]" />
                <h2 className="text-lg font-semibold">最近の検索</h2>
              </div>
              {searchHistory.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((term, index) => (
                    <Button key={index} variant="outline" className="rounded-full" onClick={() => handleSearch(term)}>
                      {term}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">最近の検索履歴はありません</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      <Suspense fallback={
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        {recommendations && !loading && <Recommendations data={recommendations} searchTerm={searchTerm} />}
      </Suspense>

      {recommendations === null && searchTerm !== "" && !loading && (
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="text-center max-w-md">
            <div className="h-16 w-16 text-muted-foreground mx-auto mb-4 flex items-center justify-center">
              <FavoriteIcon item={{ name: "empty" }} size="lg" className="static" />
            </div>
            <h1 className="text-2xl font-bold mb-4">検索結果が見つかりませんでした</h1>
            <p className="text-muted-foreground mb-6 line-clamp-2 h-10">別のキーワードで検索してみてください。</p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/search">
                  <Search className="mr-2 h-4 w-4" />
                  新しい検索
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
"use client"

import { CardContent } from "@/components/ui/card"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useVisitHistory } from "@/hooks/use-visit-history"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Search, Heart, BarChart2, ArrowRight, Star, Sparkles, Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { markVisitedInSession, hasVisitedInSession, markInitialRedirectDone } from "@/utils/session-utils"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"

export default function WelcomePage() {
  const router = useRouter()
  const { isFirstVisit, markAsReturningVisitor, isLoaded } = useVisitHistory()
  const { startOnboarding, startQuickSelection } = useOnboarding()

  // エラー状態とクライアントサイド準備状態
  const [error, setError] = useState<string | null>(null)
  const [isClientReady, setIsClientReady] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  // useMemoを使用して計算結果をキャッシュ
  const isNewUser = useMemo(() => {
    return isLoaded && isFirstVisit
  }, [isLoaded, isFirstVisit])

  // クライアントサイドでのみ実行される処理を確認
  useEffect(() => {
    setIsClientReady(true)

    // ウェルカムページにアクセスした場合、セッション訪問済みとしてマーク
    markVisitedInSession()
    // 初回リダイレクト完了としてマーク
    markInitialRedirectDone()

    // デバッグ用ログ
    console.log("Welcome page loaded, marked as visited")
  }, [])

  // 初回訪問でない場合かつセッション内で既に訪問済みの場合はホームページにリダイレクト
  useEffect(() => {
    if (!isClientReady || !isLoaded) return

    try {
      // すでにオンボーディングを完了している場合はホームにリダイレクト
      const hasCompletedOnboarding = localStorage.getItem("onboarding-completed") === "true"
      const visitedInSession = hasVisitedInSession()

      if (!isFirstVisit && hasCompletedOnboarding && visitedInSession) {
        console.log("User already completed onboarding, redirecting to home")
        router.push("/")
      }
    } catch (err) {
      console.error("ローカルストレージの読み込みエラー:", err)
      setError("設定の読み込み中にエラーが発生しました。")
      // エラーが発生しても処理を続行
    }
  }, [isFirstVisit, router, isLoaded, isClientReady])

  const handleGetStarted = () => {
    if (isNavigating) return

    setIsNavigating(true)
    setError(null)

    try {
      // 初回訪問フラグを更新
      markAsReturningVisitor()
      // セッション訪問済みとしてマーク
      markVisitedInSession()
      // クイック選択ページに遷移
      startQuickSelection()
    } catch (err) {
      console.error("ナビゲーションエラー:", err)
      setError("ページ遷移中にエラーが発生しました。もう一度お試しください。")
      setIsNavigating(false)
    }
  }

  // ローディング中は適切なローディング表示
  if (!isClientReady || !isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* エラー表示 */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* ヒーローセクション */}
      <section className="relative bg-gradient-to-r from-[#454545] to-[#828282] py-16 md:py-20 px-4 md:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#454545]/90 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 w-full md:w-1/2 h-full hidden md:block">
          <div className="relative w-full h-full">
            <ImageWithFallback
              src="/placeholder.svg?height=500&width=600"
              alt="Hero image"
              fill
              className="object-cover opacity-80"
              fallbackText="MP"
              identifier="welcome-hero"
              priority
            />
          </div>
        </div>
        <div className="container mx-auto relative z-20 max-w-6xl">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 transition-colors">
              {isNewUser ? "ようこそ" : "おすすめ"}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
              あなただけの
              <br />
              コンテンツ体験を発見しよう
            </h1>
            <p className="text-white/90 mb-8 text-lg max-w-xl">
              アーティスト、映画、アニメ、ファッションなど、あなたの興味に合わせたおすすめを見つけましょう
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-[#454545] hover:bg-white/90 shadow-lg"
                onClick={handleGetStarted}
                disabled={isNavigating}
              >
                {isNavigating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    読み込み中...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-5 w-5" />
                    使ってみる
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">My Projectの特徴</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              あなたの好みを理解し、新しい発見をサポートする機能が充実しています
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-6">
                <div className="bg-[#f5f5f5] rounded-full w-12 md:w-14 h-12 md:h-14 flex items-center justify-center mb-4 md:mb-6 mx-auto">
                  <Search className="h-6 md:h-7 w-6 md:w-7 text-[#454545]" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-center">簡単検索</h3>
                <p className="text-muted-foreground text-center text-sm md:text-base">
                  好きなアーティストや作品を検索するだけで、関連する新しいコンテンツを発見できます。
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-6">
                <div className="bg-[#f5f5f5] rounded-full w-12 md:w-14 h-12 md:h-14 flex items-center justify-center mb-4 md:mb-6 mx-auto">
                  <Heart className="h-6 md:h-7 w-6 md:w-7 text-[#454545]" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-center">お気に入り管理</h3>
                <p className="text-muted-foreground text-center text-sm md:text-base">
                  気に入ったコンテンツをお気に入りに追加して、カテゴリー別に整理できます。
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-6">
                <div className="bg-[#f5f5f5] rounded-full w-12 md:w-14 h-12 md:h-14 flex items-center justify-center mb-4 md:mb-6 mx-auto">
                  <BarChart2 className="h-6 md:h-7 w-6 md:w-7 text-[#454545]" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-center">好み分析</h3>
                <p className="text-muted-foreground text-center text-sm md:text-base">
                  お気に入りに追加したコンテンツから、あなたの好みを分析して新しい提案を受け取れます。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-[#f5f5f5]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">使い方</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              3つの簡単なステップであなたに合ったコンテンツを見つけましょう
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <div className="text-center">
              <div className="bg-white rounded-full w-14 md:w-16 h-14 md:h-16 flex items-center justify-center mb-4 md:mb-6 mx-auto shadow-md">
                <span className="text-[#454545] font-bold text-xl md:text-2xl">1</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">好きなコンテンツを選択</h3>
              <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6">
                まずは好きなアーティストや作品を選んで、あなたの好みを教えてください。
              </p>
              <div className="relative h-32 md:h-40 rounded-lg overflow-hidden shadow-md mx-auto max-w-xs">
                <ImageWithFallback
                  src="/placeholder.svg?height=200&width=300"
                  alt="コンテンツ選択"
                  fill
                  className="object-cover"
                  fallbackText="選択"
                  identifier="step1-image"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Star className="h-8 md:h-10 w-8 md:w-10 text-white" />
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full w-14 md:w-16 h-14 md:h-16 flex items-center justify-center mb-4 md:mb-6 mx-auto shadow-md">
                <span className="text-[#454545] font-bold text-xl md:text-2xl">2</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">おすすめを発見</h3>
              <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6">
                あなたの好みに基づいて、新しいおすすめコンテンツが表示されます。
              </p>
              <div className="relative h-32 md:h-40 rounded-lg overflow-hidden shadow-md mx-auto max-w-xs">
                <ImageWithFallback
                  src="/placeholder.svg?height=200&width=300"
                  alt="おすすめ発見"
                  fill
                  className="object-cover"
                  fallbackText="発見"
                  identifier="step2-image"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Sparkles className="h-8 md:h-10 w-8 md:w-10 text-white" />
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full w-14 md:w-16 h-14 md:h-16 flex items-center justify-center mb-4 md:mb-6 mx-auto shadow-md">
                <span className="text-[#454545] font-bold text-xl md:text-2xl">3</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">お気に入りに追加</h3>
              <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6">
                気に入ったコンテンツをお気に入りに追加して、いつでも見返せるようにしましょう。
              </p>
              <div className="relative h-32 md:h-40 rounded-lg overflow-hidden shadow-md mx-auto max-w-xs">
                <ImageWithFallback
                  src="/placeholder.svg?height=200&width=300"
                  alt="お気に入り追加"
                  fill
                  className="object-cover"
                  fallbackText="追加"
                  identifier="step3-image"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Heart className="h-8 md:h-10 w-8 md:w-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-gradient-to-r from-[#454545] to-[#828282] text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">あなただけのコンテンツ体験を始めましょう</h2>
          <p className="text-white/80 mb-6 md:mb-8 max-w-2xl mx-auto text-sm md:text-base">
            好きなアーティストや作品から、新しい発見の旅に出かけましょう。 My Project
            があなたの好みに合わせたコンテンツをご紹介します。
          </p>
          <Button
            size="lg"
            className="bg-white text-[#454545] hover:bg-white/90 shadow-lg w-full sm:w-auto"
            onClick={handleGetStarted}
            disabled={isNavigating}
          >
            {isNavigating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                読み込み中...
              </>
            ) : (
              <>
                使ってみる
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </section>
    </div>
  )
}


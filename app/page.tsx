import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import HeroSection from "@/components/home/hero-section"
import FavoritesPreview from "@/components/home/favorites-preview"
import AnalysisPreview from "@/components/home/analysis-preview"
import FeaturesSection from "@/components/home/features-section"

export default function HomePage() {
  return (
    <>
      {/* ヒーローセクション - メイン検索機能 */}
      <HeroSection />

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* お気に入りセクション */}
        <Suspense fallback={<SectionSkeleton title="お気に入り" />}>
          <FavoritesPreview />
        </Suspense>

        {/* 自己分析セクション */}
        <Suspense fallback={<SectionSkeleton title="あなたの分析" />}>
          <AnalysisPreview />
        </Suspense>

        {/* 機能セクション */}
        <FeaturesSection />
      </div>
    </>
  )
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-[200px] rounded-lg" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}


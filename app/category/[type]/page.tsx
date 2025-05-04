import { getRecommendations } from "@/app/actions"
import CategoryView from "@/components/category-view"
import { notFound } from "next/navigation"

type CategoryParams = {
  params: {
    type: string
  }
  searchParams: {
    q?: string
  }
}

interface RecommendationsData {
  artists: any[]
  celebrities: any[]
  media: any[]
  fashion: any[]
}

const categoryMap: Record<string, keyof RecommendationsData> = {
  artists: "artists",
  celebrities: "celebrities",
  media: "media",
  fashion: "fashion",
}

const categoryTitles: Record<string, string> = {
  artists: "アーティスト",
  celebrities: "芸能人/インフルエンサー",
  media: "映画/アニメ",
  fashion: "ファッションブランド",
}

export default async function CategoryPage({ params, searchParams }: CategoryParams) {
  const { type } = params
  const { q = "米津玄師" } = searchParams // デフォルト検索キーワード

  if (!categoryMap[type]) {
    return notFound()
  }

  const data = await getRecommendations(q)
  const categoryKey = categoryMap[type]
  const categoryTitle = categoryTitles[type]
  const items = data[categoryKey]

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{categoryTitle}</h1>
        <p className="text-muted-foreground">
          「{q}」に関連する{categoryTitle}の一覧
        </p>
      </div>
      <CategoryView items={items} />
    </div>
  )
}


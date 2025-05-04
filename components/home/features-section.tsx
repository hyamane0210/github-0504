import { Search, Heart, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function FeaturesSection() {
  const features = [
    {
      icon: Search,
      title: "簡単検索",
      description: "好きなアーティストや作品を検索するだけで、関連する新しいコンテンツを発見できます。",
    },
    {
      icon: Heart,
      title: "お気に入り管理",
      description: "気に入ったコンテンツをお気に入りに追加して、カテゴリー別に整理できます。",
    },
    {
      icon: BarChart3,
      title: "好み分析",
      description: "お気に入りに追加したコンテンツから、あなたの好みを分析して新しい提案を受け取れます。",
    },
  ]

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-center">主な機能</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="overflow-hidden border-t-4 border-t-[#454545]">
            <CardContent className="p-6 text-center">
              <div className="bg-[#454545]/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-[#454545]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}


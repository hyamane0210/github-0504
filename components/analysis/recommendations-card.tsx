import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface RecommendationsCardProps {
  recommendations: {
    category: string
    items: {
      name: string
      description: string
      link?: string
    }[]
    color: string
  }[]
}

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>あなたへのおすすめ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recommendations.map((category) => (
            <div key={category.category} className="space-y-3">
              <h3 className="font-semibold text-sm pb-1 border-b" style={{ borderColor: category.color }}>
                {category.category}
              </h3>
              <div className="grid gap-2 md:grid-cols-2">
                {category.items.map((item, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                      {item.link && (
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link href={item.link}>
                            詳細 <ChevronRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


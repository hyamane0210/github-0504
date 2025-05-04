import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface CompatibleTypesProps {
  mainType: {
    id: string
    title: string
    emoji: string
    color: string
  }
  compatibleTypes: {
    id: string
    title: string
    emoji: string
    description: string
    color: string
    matchPercentage: number
  }[]
}

export function CompatibleTypes({ mainType, compatibleTypes }: CompatibleTypesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <span className="mr-2">{mainType.emoji}</span>
          相性の良いタイプ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {mainType.title}
          タイプの方と相性が良い他のタイプです。これらのタイプの人と交流することで、新しい視点や体験を得られるかもしれません。
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {compatibleTypes.map((type) => (
            <Card key={type.id} className="overflow-hidden">
              <div className="h-1" style={{ backgroundColor: type.color }}></div>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold flex items-center">
                    <span className="mr-1">{type.emoji}</span> {type.title}
                  </h3>
                  <Badge style={{ backgroundColor: type.color, color: "white" }}>{type.matchPercentage}% マッチ</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{type.description}</p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/analysis/types/${type.id}`}>
                    詳細を見る <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


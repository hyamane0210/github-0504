import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TraitsCardProps {
  traits: {
    name: string
    description: string
    score: number
    color: string
  }[]
  typeColor: string
}

export function TraitsCard({ traits, typeColor }: TraitsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>性格特性</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {traits.map((trait) => (
            <div key={trait.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{trait.name}</h3>
                <Badge style={{ backgroundColor: typeColor, color: "white" }}>{trait.score}/10</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{trait.description}</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${trait.score * 10}%`,
                    backgroundColor: trait.color || typeColor,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


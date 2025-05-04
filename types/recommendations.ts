export interface RecommendationItem {
  name: string
  reason: string
  features: string[]
  imageUrl: string
  officialUrl: string
}

export interface RecommendationsData {
  artists: RecommendationItem[]
  celebrities: RecommendationItem[]
  media: RecommendationItem[]
  fashion: RecommendationItem[]
}

export type CategoryMapping = {
  artists: string
  celebrities: string
  media: string
  fashion: string
}
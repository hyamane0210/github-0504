
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
  movies: RecommendationItem[]
  anime: RecommendationItem[]
  fashion: RecommendationItem[]
}

export type CategoryMapping = {
  artists: string
  celebrities: string
  movies: string
  anime: string
  fashion: string
}

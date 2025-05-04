import { type RecommendationItem } from "@/types/recommendations"
import SpotifyWebApi from "spotify-web-api-node"
import OpenAI from "openai"
import { backOff } from "exponential-backoff"

const TMDB_API_KEY = '54e195c2638c743569208621cccf44fc'
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

// Initialize Spotify client with environment variables
const SPOTIFY_CLIENT_ID = 'd605ccf114744dddaaabee21d3e9be70'
const SPOTIFY_CLIENT_SECRET = '16757188b768471bb2b868e8f814fec0'

// Initialize Spotify client
const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000'
})

let spotifyTokenExpirationTime = 0
let tokenRetryCount = 0
const MAX_TOKEN_RETRIES = 3
const TOKEN_RETRY_DELAY = 1000 // 1 second delay between retries
let tokenRefreshPromise: Promise<void> | null = null // For preventing concurrent token refreshes

// Get Wikipedia image
async function getWikipediaImage(name: string): Promise<string | null> {
  try {
    // Search for article
    const searchResponse = await fetch(
      `https://ja.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(
        name,
      )}&origin=*`,
    )
    const searchData = await searchResponse.json()
    if (!searchData.query?.search?.[0]?.pageid) {
      return null
    }

    // Get article info
    const pageId = searchData.query.search[0].pageid
    const imageResponse = await fetch(
      `https://ja.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&pithumbsize=500&pageids=${pageId}&origin=*`,
    )
    const imageData = await imageResponse.json()
    const thumbnail = imageData.query?.pages?.[pageId]?.thumbnail?.source

    return thumbnail || null
  } catch (error) {
    console.error("Error getting Wikipedia image:", error)
    return null
  }
}

// Get Spotify token with exponential backoff
async function getSpotifyToken(): Promise<void> {
  const now = Date.now()

  if (now < spotifyTokenExpirationTime && spotifyApi.getAccessToken()) {
    return
  }

  try {
    const data = await spotifyApi.clientCredentialsGrant()
    const accessToken = data.body["access_token"]
    
    if (!accessToken) {
      throw new Error("No access token received")
    }

    spotifyTokenExpirationTime = now + (data.body["expires_in"] - 60) * 1000
    spotifyApi.setAccessToken(accessToken)
  } catch (error) {
    console.error("Failed to get Spotify token:", error)
    throw error
  }
}

// Get Spotify artist image with improved error handling
async function getSpotifyArtistImage(name: string): Promise<string | null> {
  try {
    await getSpotifyToken()
    
    const searchResult = await spotifyApi.searchArtists(name, { limit: 1 })
    
    if (searchResult.body.artists?.items.length > 0) {
      const artist = searchResult.body.artists.items[0]
      if (artist.images && artist.images.length > 0) {
        return artist.images[0].url
      }
    }
    return null
  } catch (error) {
    console.error("Error getting Spotify artist image:", error)
    return null
  }
}

// Get TMDB image
async function getTMDBImage(name: string, type: "person" | "media"): Promise<string | null> {
  if (!TMDB_API_KEY) {
    console.error("TMDB API key is not configured")
    return null
  }

  try {
    const endpoint = type === "person" ? "person" : "multi"
    const response = await fetch(
      `${TMDB_BASE_URL}/search/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(name)}&language=ja-JP`,
    )
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`)
    }
    const data = await response.json()
    const result = data.results[0]
    if (result) {
      const imagePath = type === "person" ? result.profile_path : result.poster_path
      if (imagePath) {
        return `${TMDB_IMAGE_BASE_URL}/w500${imagePath}`
      }
    }
    return null
  } catch (error) {
    console.error("Error getting TMDB image:", error)
    return null
  }
}

// Get artist image (Spotify → TMDB → Wikipedia → Default)
async function getArtistImage(name: string): Promise<string | null> {
  try {
    // Parallel requests for better performance
    const [spotifyImage, tmdbImage, wikiImage] = await Promise.allSettled([
      getSpotifyArtistImage(name),
      getTMDBImage(name, "person"),
      getWikipediaImage(name)
    ])

    // Use the first successful result
    if (spotifyImage.status === 'fulfilled' && spotifyImage.value) return spotifyImage.value
    if (tmdbImage.status === 'fulfilled' && tmdbImage.value) return tmdbImage.value
    if (wikiImage.status === 'fulfilled' && wikiImage.value) return wikiImage.value

    return "/placeholder.svg?height=400&width=400"
  } catch (error) {
    console.error("Error getting artist image:", error)
    if (error instanceof Error) {
      throw new Error(`画像の取得に失敗しました: ${error.message}`)
    }
    return "/placeholder.svg?height=400&width=400"
  }
}

// Get person image (TMDB → Wikipedia → Default)
async function getPersonImage(name: string): Promise<string | null> {
  try {
    // 1. Try TMDB
    const tmdbImage = await getTMDBImage(name, "person")
    if (tmdbImage) return tmdbImage

    // 2. Try Wikipedia
    const wikiImage = await getWikipediaImage(name)
    if (wikiImage) return wikiImage

    // 3. Default image
    return "/placeholder.svg?height=400&width=400"
  } catch (error) {
    console.error("Error getting person image:", error)
    return "/placeholder.svg?height=400&width=400"
  }
}

// Get media image (TMDB → Wikipedia → Default)
async function getMediaImage(name: string): Promise<string | null> {
  try {
    // 1. Try TMDB
    const tmdbImage = await getTMDBImage(name, "media")
    if (tmdbImage) return tmdbImage

    // 2. Try Wikipedia
    const wikiImage = await getWikipediaImage(name)
    if (wikiImage) return wikiImage

    // 3. Default image
    return "/placeholder.svg?height=400&width=400"
  } catch (error) {
    console.error("Error getting media image:", error)
    return "/placeholder.svg?height=400&width=400"
  }
}

// Get fashion brand image (Wikipedia → Default)
async function getFashionImage(name: string): Promise<string | null> {
  try {
    // 1. Try Wikipedia
    const wikiImage = await getWikipediaImage(name)
    if (wikiImage) return wikiImage

    // 2. Default image
    return "/placeholder.svg?height=400&width=400"
  } catch (error) {
    console.error("Error getting fashion image:", error)
    return "/placeholder.svg?height=400&width=400"
  }
}

// Add cache implementation
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour
const imageCache = new Map<string, { url: string; timestamp: number }>()

// Get recommendations
export async function getRecommendations(query: string) {
  try {
    // Get related items for each category using OpenAI
    const [artists, celebrities, media, fashion] = await Promise.all([
      getRelatedItems(query, "音楽アーティスト"),
      getRelatedItems(query, "芸能人/インフルエンサー"),
      getRelatedItems(query, "映画/アニメ作品"),
      getRelatedItems(query, "ファッションブランド"),
    ])

    // Limit each category to 10 items
    const limitedArtists = artists.slice(0, 10)
    const limitedCelebrities = celebrities.slice(0, 10)
    const limitedMedia = media.slice(0, 10)
    const limitedFashion = fashion.slice(0, 10)

    // Process items in batches to prevent too many concurrent requests
    const batchSize = 5
    const processItems = async <T extends { name: string }>(
      items: T[],
      getImage: (name: string) => Promise<string | null>,
      baseUrl: string
    ) => {
      const processed: (T & { imageUrl: string; officialUrl: string })[] = []
      
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        const batchResults = await Promise.all(
          batch.map(async (item) => {
            // Check cache first
            const cacheKey = `${item.name}-${getImage.name}`
            const cached = imageCache.get(cacheKey)
            
            let imageUrl: string
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
              imageUrl = cached.url
            } else {
              imageUrl = await getImage(item.name) || "/placeholder.svg?height=400&width=400"
              imageCache.set(cacheKey, { url: imageUrl, timestamp: Date.now() })
            }

            return {
              ...item,
              imageUrl,
              officialUrl: `${baseUrl}${encodeURIComponent(item.name)}`,
            }
          })
        )
        processed.push(...batchResults)
      }
      
      return processed
    }

    // Process each category with optimized batch processing
    const [processedArtists, processedCelebrities, processedMedia, processedFashion] = await Promise.all([
      processItems(limitedArtists, getArtistImage, "https://open.spotify.com/search/"),
      processItems(limitedCelebrities, getPersonImage, "https://www.themoviedb.org/search?query="),
      processItems(limitedMedia, getMediaImage, "https://www.themoviedb.org/search?query="),
      processItems(limitedFashion, getFashionImage, "https://www.google.com/search?q="),
    ])

    return {
      artists: processedArtists,
      celebrities: processedCelebrities,
      media: processedMedia,
      fashion: processedFashion,
    }
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    throw new Error("APIキーが設定されていないか、リクエストに失敗しました。Secretsでの設定を確認してください。")

    return {
      artists: defaultItems,
      celebrities: defaultItems,
      media: defaultItems,
      fashion: defaultItems,
    }
  }
}

// Get related items using OpenAI
async function getRelatedItems(query: string, category: string) {
  try {
    const response = await fetch("/api/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, category }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.items
  } catch (error) {
    console.error("Error getting related items:", error)
    return Array(10).fill({
      name: "推奨アイテム",
      reason: "関連性のある推奨アイテムです",
      features: ["特徴1", "特徴2", "特徴3"],
    })
  }
}
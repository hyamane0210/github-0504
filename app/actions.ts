import { type RecommendationItem } from "@/types/recommendations"
import SpotifyWebApi from "spotify-web-api-node"
import OpenAI from "openai"
import { backOff } from "exponential-backoff"

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"
const TMDB_IMAGE_SIZE = "w342" // Changed from w500 for better performance

// Validate image URL
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

// Initialize Spotify client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
})

async function getSpotifyToken(): Promise<void> {
  try {
    const response = await fetch('/api/spotify')
    const data = await response.json()

    if (!data.token) {
      throw new Error('Failed to get Spotify token')
    }

    spotifyApi.setAccessToken(data.token)
  } catch (error) {
    console.error("[Spotify] Failed to get token:", error)
    throw error
  }
}

// Get Spotify artist image with improved error handling
async function getSpotifyArtistImage(name: string): Promise<string | null> {
  try {
    // Try Spotify first
    await getSpotifyToken()
    console.debug(`[Spotify] Searching for artist: ${name}`)

    const searchResult = await spotifyApi.searchArtists(name, { limit: 1 })
    console.debug(`[Spotify] Search response:`, JSON.stringify(searchResult.body, null, 2))

    if (searchResult?.body?.artists?.items?.[0]) {
      const artist = searchResult.body.artists.items[0]
      console.debug(`[Spotify] Found artist:`, artist.name)

      if (!artist.images || artist.images.length === 0) {
        console.debug(`[Spotify] No images found for artist: ${artist.name}`)
        return null
      }

      // Sort images by size and find the first valid URL
      const sortedImages = [...artist.images].sort((a, b) => (b.width || 0) - (a.width || 0))
      const artistImage = sortedImages.find(img => isValidImageUrl(img.url))

      if (artistImage) {
        console.debug(`[Spotify] Found image for ${name}:`, artistImage.url)
        return artistImage.url
      } else {
        console.debug(`[Spotify] No valid image URLs found for ${name}`)
      }
    } else {
      console.debug(`[Spotify] No artist found for: ${name}`)
    }

    // If Spotify fails, try LastFM
    try {
      console.debug(`[LastFM] Searching for ${name}`)
      const response = await fetch(`/api/lastfm?artist=${encodeURIComponent(name)}`)
      const result = await response.json()

      // LastFMの画像を優先順位に従って取得
      if (result?.artist?.image) {
        const sizePreference = ['large', 'medium', 'extralarge']
        for (const size of sizePreference) {
          const image = result.artist.image.find(img => 
            img.size === size && 
            img['#text'] && 
            isValidImageUrl(img['#text'])
          )

          if (image) {
            console.debug(`[LastFM] Found ${size} image for ${name}:`, image['#text'])
            return image['#text']
          }
        }
      }
    } catch (lastfmError) {
      console.error("Error getting LastFM artist image:", lastfmError)
    }

    return null
  } catch (error) {
    console.error("Error getting artist images:", error)
    return null
  }
}

// Get TMDB image
async function getTMDBImage(name: string, type: "person" | "media"): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/tmdb?type=${type}&query=${encodeURIComponent(name)}`
    )

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`)
    }

    const data = await response.json()
    if (!data.results?.length) {
      return null
    }

    const result = data.results[0]
    const imagePath = type === "person" ? result.profile_path : result.poster_path

    if (!imagePath) {
      return null
    }

    return `${TMDB_IMAGE_BASE_URL}/${TMDB_IMAGE_SIZE}${imagePath}`
  } catch (error) {
    console.error("Error getting TMDB image:", error)
    if (error instanceof Error) {
      console.error(error.message)
    }
    return null
  }
}

// Get artist image (Spotify → TMDB → Wikipedia → Default)
async function getArtistImage(name: string): Promise<string | null> {
  try {
    // Try Spotify first
    const spotifyImage = await getSpotifyArtistImage(name)
    if (spotifyImage) return spotifyImage

    // Then try TMDB
    const tmdbImage = await getTMDBImage(name, "person")
    if (tmdbImage) return tmdbImage

    // Then try Wikipedia
    const wikiImage = await getWikipediaImage(name)
    if (wikiImage) return wikiImage

    // Default image as last resort
    return "/placeholder.svg?height=400&width=400"
  } catch (error) {
    console.error("Error getting artist image:", error)
    if (error instanceof Error) {
      throw new Error(`画像の取得に失敗しました: ${error.message}`)
    }
    return "/placeholder.svg?height=400&width=400"
  }
}

// Get person image (TMDB → Spotify → Wikipedia → Default)
async function getPersonImage(name: string): Promise<string | null> {
  try {
    // 1. Try TMDB
    const tmdbImage = await getTMDBImage(name, "person")
    if (tmdbImage) return tmdbImage

    // 2. Try Spotify
    const spotifyImage = await getSpotifyArtistImage(name)
    if (spotifyImage) return spotifyImage

    // 3. Try Wikipedia
    const wikiImage = await getWikipediaImage(name)
    if (wikiImage) return wikiImage

    // 4. Default image
    return "/placeholder.svg?height=400&width=400"
  } catch (error) {
    console.error("Error getting person image:", error)
    return "/placeholder.svg?height=400&width=400"
  }
}

// Get movie image (TMDB → Wikipedia → Default)
async function getMovieImage(name: string): Promise<string | null> {
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

// Get recommendations
export async function getRecommendations(query: string) {
  try {
    // Get related items for each category using OpenAI
    const [artists, celebrities, movies, anime, fashion] = await Promise.all([
      getRelatedItems(query, "音楽アーティスト"),
      getRelatedItems(query, "芸能人/インフルエンサー"),
      getRelatedItems(query, "映画作品"),
      getRelatedItems(query, "アニメ作品"),
      getRelatedItems(query, "ファッションブランド"),
    ])

    // Limit each category to 10 items
    const limitedArtists = artists.slice(0, 10)
    const limitedCelebrities = celebrities.slice(0, 10)
    const limitedMovies = movies.slice(0, 10)
    const limitedAnime = anime.slice(0, 10)
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
    const [processedArtists, processedCelebrities, processedMovies, processedAnime, processedFashion] = await Promise.all([
      processItems(limitedArtists, getArtistImage, "https://open.spotify.com/search/"),
      processItems(limitedCelebrities, getPersonImage, "https://www.themoviedb.org/search?query="),
      processItems(limitedMovies, getMovieImage, "https://www.themoviedb.org/search?query="),
      processItems(limitedAnime, getAnimeImage, "https://www.themoviedb.org/search?query="),
      processItems(limitedFashion, getFashionImage, "https://www.google.com/search?q="),
    ])

    return {
      artists: processedArtists,
      celebrities: processedCelebrities,
      movies: processedMovies,
      anime: processedAnime,
      fashion: processedFashion,
    }
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    throw new Error("APIキーが設定されていないか、リクエストに失敗しました。Secretsでの設定を確認してください。")
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

const defaultItems = Array(10).fill({
  name: "推奨アイテム",
  reason: "関連性のある推奨アイテムです",
  features: ["特徴1", "特徴2", "特徴3"],
})

// Get anime image (TMDB → Wikipedia → Default)
async function getAnimeImage(name: string): Promise<string | null> {
  try {
    // Try TMDB with specific anime type
    const response = await fetch(`/api/tmdb?type=anime&query=${encodeURIComponent(name)}`)
    if (response.ok) {
      const data = await response.json()
      const animeResult = data.results?.find((item: any) => 
        item.media_type === 'tv' || item.media_type === 'movie'
      )

      if (animeResult?.poster_path) {
        return `${TMDB_IMAGE_BASE_URL}/${TMDB_IMAGE_SIZE}${animeResult.poster_path}`
      }
    }

    // Try Wikipedia with anime validation
    const wikiImage = await getWikipediaImage(name)
    if (wikiImage) return wikiImage

    return "/placeholder.svg?height=400&width=400"
  } catch (error) {
    console.error("Error getting anime image:", error)
    return "/placeholder.svg?height=400&width=400"
  }
}
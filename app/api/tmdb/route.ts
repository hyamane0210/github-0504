import { NextResponse } from 'next/server'

const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const type = searchParams.get('type') as 'person' | 'movie' | 'anime'

  if (!query || !type) {
    return NextResponse.json({ error: 'Query and type parameters are required' }, { status: 400 })
  }

  try {
    let endpoint = "person"
    let additionalParams = "&include_adult=false"

    if (type === "movie") {
      endpoint = "movie"
    } else if (type === "anime") {
      endpoint = "tv"
      additionalParams += "&with_keywords=210024" // Anime keyword
    }

    const response = await fetch(
      `${TMDB_BASE_URL}/search/${endpoint}?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=ja-JP${additionalParams}`
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('TMDB API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      return NextResponse.json({ 
        error: 'Failed to fetch from TMDB',
        details: response.statusText 
      }, { status: response.status })
    }

    const data = await response.json()
    if (!data.results?.length) {
      return NextResponse.json({ results: [] })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('TMDB API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'

const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const type = searchParams.get('type') as 'person' | 'media'
  
  if (!query || !type) {
    return NextResponse.json({ error: 'Query and type parameters are required' }, { status: 400 })
  }

  try {
    const endpoint = type === "person" ? "person" : "multi"
    const response = await fetch(
      `${TMDB_BASE_URL}/search/${endpoint}?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=ja-JP`
    )
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('TMDB API error:', error)
    return NextResponse.json({ error: 'Failed to fetch from TMDB' }, { status: 500 })
  }
}

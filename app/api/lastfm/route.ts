
import { NextResponse } from 'next/server'
const LastFMClient = require('lastfm-node-client')

const lastfm = new LastFMClient(process.env.LASTFM_API_KEY)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const artist = searchParams.get('artist')
  
  if (!artist) {
    return NextResponse.json({ error: 'Artist parameter is required' }, { status: 400 })
  }

  try {
    const result = await lastfm.artist.getInfo({ 
      artist: artist,
      autocorrect: 1
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('LastFM API error:', error)
    return NextResponse.json({ error: 'Failed to fetch from LastFM' }, { status: 500 })
  }
}

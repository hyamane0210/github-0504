
import { NextResponse } from 'next/server'
import SpotifyWebApi from 'spotify-web-api-node'

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
})

let tokenExpirationTime = 0

async function getValidToken() {
  const now = Date.now()
  if (now < tokenExpirationTime && spotifyApi.getAccessToken()) {
    return spotifyApi.getAccessToken()
  }

  try {
    const data = await spotifyApi.clientCredentialsGrant()
    const accessToken = data.body['access_token']
    tokenExpirationTime = now + (data.body['expires_in'] - 60) * 1000
    spotifyApi.setAccessToken(accessToken)
    return accessToken
  } catch (error) {
    console.error('Error getting Spotify token:', error)
    return null
  }
}

export async function GET() {
  try {
    const token = await getValidToken()
    if (!token) {
      return NextResponse.json({ error: 'Failed to get token' }, { status: 500 })
    }
    return NextResponse.json({ token })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Add Redis-like in-memory cache
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour
const recommendationsCache = new Map<string, { data: any; timestamp: number }>()

// Initialize OpenAI client with environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      )
    }

    const { query, category } = await request.json()
    
    // Generate cache key
    const cacheKey = `${query}-${category}`
    
    // Check cache
    const cached = recommendationsCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    const prompt = `
以下のアイテムに関連する${category}を10個提案してください。

カテゴリー別の制限事項:
- 音楽アーティストの場合:
  * 音楽活動（作曲、作詞、演奏、歌唱等）を主な活動として行っている個人またはグループのみ
  * 音楽活動が副次的な活動である者も含む
  * バンド、ソロアーティスト、音楽グループなどに限定
  * 俳優や芸能人が副業で行う音楽活動は含む

- 芸能人/インフルエンサーの場合:
  * 個人（自然人）のみを対象とする
  * グループ、ユニット、団体は除外
  * 架空のキャラクターは除外
  * 実在する人物のみを対象とする

- 映画/アニメの場合
  * 映画かアニメのみを対象とする

- ファッションブランドの場合:
  * ファッションブランドのみを対象とする
  * 


関連性の基準:
- 同じ雰囲気やスタイル
- 共通のファン層
- コラボレーション経験
- 同時期の活動や影響関係
- 同じジャンルやカテゴリー
- SNSやメディア等でファンであることを明言している

アイテム: ${query}

注意事項:
- 必ず日本語で回答してください
- 日本語名が一般的な場合は日本語表記を優先してください
- 海外アーティストや作品でも、日本での一般的な呼び方がある場合はそちらを使用してください
- カテゴリーの制限事項を厳密に守ってください

回答は以下のJSON形式で提供してください:
{
  "items": [
    {
      "name": "アイテム名",
      "reason": "関連性の説明（200文字以内）",
      "features": ["特徴1", "特徴2", "特徴3"]
    }
  ]
}
`

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたはエンターテインメントと文化に関する専門家です。日本のユーザー向けに情報を提供します。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    })

    const result = JSON.parse(response.choices[0].message.content)
    
    // Cache the result
    recommendationsCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in recommendations API:", error)
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    )
  }
}
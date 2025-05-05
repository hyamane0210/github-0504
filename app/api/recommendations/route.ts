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
  * 音楽活動（作曲、作詞、演奏、歌唱等）を主な活動としている個人またはグループ。
  * 音楽活動が副次的である場合（例：俳優や芸能人が行う音楽活動）も含む。
  * バンド、ソロアーティスト、音楽グループなどに限定する。

- 芸能人/インフルエンサーの場合:
  * 個人（自然人）のみを対象とする。
  * グループ、ユニット、団体は除外する。
  * 架空のキャラクターは除外する。

- 映画の場合:
  * 商業作品として公開された実写映画作品のみを対象とする。
  * アニメーション作品は除外する。
  * ドキュメンタリーや実験映画も含む。

- アニメの場合:
  * 商業作品として公開されたアニメーション作品のみを対象とする。
  * テレビアニメ、劇場アニメ、OVA作品を含む。
  * 実写作品は除外する。

- ファッションブランドの場合:
  * 衣料品、服飾雑貨などを企画、製造、販売するブランドのみを対象とする。

- 関連性の基準:
以下の基準を総合的に考慮し、推薦元アイテムとの関連性が高いアイテムを選定してください。
  * 同じ雰囲気やスタイルを持っているか
  * 共通のファン層がいるか
  * 過去にコラボレーション経験があるか
  * 同時代に活動しており、相互に影響関係が見られるか
  * 同じジャンルやカテゴリーに属しているか
  * SNSやメディア等で推薦元アイテムへの好意（ファンであること等）を公言しているか

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
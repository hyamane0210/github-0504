"use client"

import { useFavorites } from "@/contexts/favorites-context"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Heart, Share2, UserCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Progress } from "@/components/ui/progress"
import confetti from "canvas-confetti"
import { PersonalityResultCard } from "@/components/analysis/personality-result-card"
import { CompatibleTypes } from "@/components/analysis/compatible-types"
import { TraitsCard } from "@/components/analysis/traits-card"
import { RecommendationsCard } from "@/components/analysis/recommendations-card"

// Analysis helper functions
function analyzeCategories(favorites) {
  // If no favorites, return empty object with zero counts
  if (!favorites || favorites.length === 0) {
    return {
      artists: 0,
      celebrities: 0,
      media: 0,
      fashion: 0,
    }
  }

  // Rest of the function remains the same
  const categories = {
    artists: 0,
    celebrities: 0,
    media: 0,
    fashion: 0,
  }

  // Category keywords
  const categoryKeywords = {
    artists: ["singer", "band", "musician", "artist", "music", "song", "vocal"],
    celebrities: ["actor", "actress", "talent", "model", "influencer", "celebrity"],
    media: ["movie", "anime", "drama", "show", "series", "film", "story"],
    fashion: ["brand", "fashion", "clothing", "apparel", "design", "style", "collection"],
  }

  favorites.forEach((item) => {
    // Infer category from reason and features
    const text = `${item.name} ${item.reason} ${item.features.join(" ")}`.toLowerCase()

    let matched = false
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          categories[category]++
          matched = true
          break
        }
      }
      if (matched) break
    }

    // If no match, try to infer from URL
    if (!matched) {
      const url = item.officialUrl.toLowerCase()
      if (url.includes("music") || url.includes("artist") || url.includes("band")) {
        categories.artists++
      } else if (url.includes("actor") || url.includes("talent") || url.includes("model")) {
        categories.celebrities++
      } else if (url.includes("movie") || url.includes("anime") || url.includes("drama")) {
        categories.media++
      } else if (url.includes("brand") || url.includes("fashion") || url.includes("wear")) {
        categories.fashion++
      } else {
        // Default to media
        categories.media++
      }
    }
  })

  return categories
}

// Keyword analysis
function analyzeKeywords(favorites) {
  // If no favorites, return empty array
  if (!favorites || favorites.length === 0) {
    return []
  }

  // Rest of the function remains the same
  const keywords = {}
  const stopWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "with",
    "by",
    "about",
    "as",
    "of",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "shall",
    "should",
    "can",
    "could",
    "may",
    "might",
  ]

  favorites.forEach((item) => {
    const text = `${item.name} ${item.reason} ${item.features.join(" ")}`
    const words = text.split(/\s+|,|\.|;|:/)

    words.forEach((word) => {
      if (word.length > 1 && !stopWords.includes(word.toLowerCase())) {
        keywords[word] = (keywords[word] || 0) + 1
      }
    })
  })

  // Sort by occurrence count
  return Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }))
}

// Trend analysis
function analyzeTrends(favorites) {
  // If no favorites, return empty array
  if (!favorites || favorites.length === 0) {
    return ["まだお気に入りがありません。分析を開始するにはコンテンツを追加してください。"]
  }

  // Rest of the function remains the same
  const trends = []

  const categories = analyzeCategories(favorites)
  // Make sure categories is not null before using Object.entries
  if (categories) {
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]

    if (topCategory[0] === "artists") {
      trends.push("音楽に対する関心が高いようです。様々なアーティストの音楽を楽しんでいます。")
    } else if (topCategory[0] === "celebrities") {
      trends.push("芸能人やインフルエンサーに興味があるようです。エンターテインメント業界の動向に敏感かもしれません。")
    } else if (topCategory[0] === "media") {
      trends.push(
        "映画やアニメなどの視覚コンテンツを好む傾向があります。ストーリー性のある作品を楽しんでいるようです。",
      )
    } else if (topCategory[0] === "fashion") {
      trends.push("ファッションやブランドへの関心が高いです。スタイルやトレンドに敏感な傾向があります。")
    }
  }

  // Analyze based on number of favorites
  if (favorites.length > 10) {
    trends.push("多様なコンテンツに興味を持っています。好奇心旺盛で新しい体験に開かれている傾向があります。")
  } else if (favorites.length > 5) {
    trends.push("特定の分野に絞った興味を持っているようです。明確な好みの傾向が見られます。")
  } else {
    trends.push(
      "お気に入りがまだ少ないです。より詳細な分析のために、もっと多くのコンテンツを探索することをお勧めします。",
    )
  }

  return trends
}

// パーソナリティタイプの定義
const personalityTypes = {
  artistic_soul: {
    id: "artistic_soul",
    title: "アーティスティックソウル",
    emoji: "🎵",
    description: "音楽と芸術を通じて世界を感じ、表現することを大切にするタイプです。",
    longDescription:
      "あなたは音楽や芸術を通じて感情や思考を表現することに喜びを見出します。様々なアーティストや音楽ジャンルに興味を持ち、新しい音楽体験を常に求めています。感受性が豊かで、音楽や芸術作品から深い感動を得ることができます。創造性と表現力に優れ、自分自身の感情を音楽や芸術を通じて表現することも好みます。",
    traits: ["感受性豊か", "創造的", "表現力がある", "情熱的", "内省的"],
    compatibleTypes: ["ビジュアルストーリーテラー", "トレンドセッター", "カルチャーコネクター"],
    color: "#8A2BE2", // ブルーバイオレット
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  visual_storyteller: {
    id: "visual_storyteller",
    title: "ビジュアルストーリーテラー",
    emoji: "🎬",
    description: "映像や物語を通じて様々な世界を体験することを楽しむタイプです。",
    longDescription:
      "あなたは映画やアニメなどの視覚的なストーリーテリングに魅了され、様々な世界や物語を体験することを好みます。想像力が豊かで、物語の深層に隠されたメッセージや象徴を見つけることに長けています。異なる文化や時代を映像作品を通じて探索することに喜びを感じ、感情移入能力が高く、キャラクターの心情や動機を深く理解することができます。",
    traits: ["想像力豊か", "共感力がある", "観察力に優れる", "物語を分析する力", "視覚的思考"],
    compatibleTypes: ["アーティスティックソウル", "カルチャーコネクター", "エクスプローラー"],
    color: "#4169E1", // ロイヤルブルー
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  trend_setter: {
    id: "trend_setter",
    title: "トレンドセッター",
    emoji: "👗",
    description: "ファッションやスタイルを通じて自己表現を楽しむタイプです。",
    longDescription:
      "あなたは自己表現の手段としてファッションやスタイルを重視し、トレンドに敏感でありながらも独自のスタイルを大切にしています。美的センスに優れ、色や形、テクスチャーの組み合わせに鋭い感覚を持っています。外見を通じて内面を表現することに関心があり、ファッションやデザインを通じて自分らしさを表現することを楽しんでいます。新しいトレンドやスタイルに常にアンテナを張り、自分のスタイルに取り入れることに積極的です。",
    traits: ["美的センスがある", "自己表現を大切にする", "トレンドに敏感", "個性的", "視覚的センスに優れる"],
    compatibleTypes: ["アーティスティックソウル", "カルチャーコネクター", "エクスプローラー"],
    color: "#FF1493", // ディープピンク
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  culture_connector: {
    id: "culture_connector",
    title: "カルチャーコネクター",
    emoji: "🌟",
    description: "エンターテイメントや文化的トレンドを通じて人々とつながるタイプです。",
    longDescription:
      "あなたはエンターテイメント業界の動向に敏感で、芸能人やインフルエンサーの活動に強い関心を持っています。文化的トレンドを早く察知し、社会的なつながりを重視する傾向があります。コミュニケーション能力に優れ、文化的な話題を通じて様々な人々と交流することを楽しみます。メディアリテラシーが高く、エンターテイメントや文化が社会に与える影響について深い理解を持っています。",
    traits: ["社交的", "トレンドに敏感", "コミュニケーション能力が高い", "文化的感度が高い", "人間関係を大切にする"],
    compatibleTypes: ["ビジュアルストーリーテラー", "トレンドセッター", "エクスプローラー"],
    color: "#FF4500", // オレンジレッド
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
  explorer: {
    id: "explorer",
    title: "エクスプローラー",
    emoji: "🔍",
    description: "様々なジャンルやカテゴリーのコンテンツを探求することを楽しむタイプです。",
    longDescription:
      "あなたは幅広い興味を持ち、様々なジャンルやカテゴリーのコンテンツを探求することを楽しんでいます。好奇心旺盛で、新しい発見や体験に常にオープンな姿勢を持っています。多様な分野に関心を持ち、それぞれの分野から知識や経験を吸収することに喜びを感じます。適応力が高く、異なるコンテキストや環境にも柔軟に対応することができます。常に学び続けることを大切にし、自分の視野を広げることに積極的です。",
    traits: ["好奇心旺盛", "適応力がある", "多様性を重視", "学習意欲が高い", "柔軟性がある"],
    compatibleTypes: ["ビジュアルストーリーテラー", "トレンドセッター", "カルチャーコネクター"],
    color: "#20B2AA", // ライトシーグリーン
    imageUrl: "/placeholder.svg?height=200&width=400",
  },
}

// パーソナリティタイプを決定する関数
function determinePersonalityType(categories) {
  // カテゴリーの合計を計算
  const total = Object.values(categories).reduce((sum, count) => sum + count, 0)
  if (total === 0) return personalityTypes.explorer

  // 各カテゴリーの割合を計算
  const percentages = {
    artists: (categories.artists / total) * 100,
    celebrities: (categories.celebrities / total) * 100,
    media: (categories.media / total) * 100,
    fashion: (categories.fashion / total) * 100,
  }

  // 最も割合の高いカテゴリーを特定
  let highestCategory = "artists"
  let highestPercentage = percentages.artists

  Object.entries(percentages).forEach(([category, percentage]) => {
    if (percentage > highestPercentage) {
      highestCategory = category
      highestPercentage = percentage
    }
  })

  // カテゴリーに基づいてパーソナリティタイプを返す
  switch (highestCategory) {
    case "artists":
      return personalityTypes.artistic_soul
    case "media":
      return personalityTypes.visual_storyteller
    case "fashion":
      return personalityTypes.trend_setter
    case "celebrities":
      return personalityTypes.culture_connector
    default:
      return personalityTypes.explorer
  }
}

// 相性の良いタイプを取得する関数
function getCompatibleTypes(mainType, categories) {
  const compatibleTypeIds = mainType.compatibleTypes
    .map((name) => {
      // 名前からIDを取得
      for (const [id, type] of Object.entries(personalityTypes)) {
        if (type.title === name) return id
      }
      return null
    })
    .filter((id) => id !== null)

  // 相性の良いタイプを取得
  return compatibleTypeIds.map((id) => {
    const type = personalityTypes[id]

    // マッチ度を計算（実際のアプリではより複雑なロジックになる）
    let matchPercentage = 70 + Math.floor(Math.random() * 20)

    // カテゴリーに基づいてマッチ度を調整
    if (id === "artistic_soul" && categories.artists > 0) {
      matchPercentage += 5
    } else if (id === "visual_storyteller" && categories.media > 0) {
      matchPercentage += 5
    } else if (id === "trend_setter" && categories.fashion > 0) {
      matchPercentage += 5
    } else if (id === "culture_connector" && categories.celebrities > 0) {
      matchPercentage += 5
    }

    // 最大100%に制限
    matchPercentage = Math.min(matchPercentage, 98)

    return {
      ...type,
      matchPercentage,
    }
  })
}

// 特性スコアを計算する関数
function calculateTraitScores(personalityType, keywords) {
  // 特性の定義
  const traitDefinitions = {
    感受性豊か: {
      description: "音楽や芸術から深い感動を得ることができ、感情を豊かに表現できる特性です。",
      keywords: ["感動", "感情", "表現", "音楽", "芸術"],
    },
    創造的: {
      description: "新しいアイデアや表現方法を生み出す能力に優れた特性です。",
      keywords: ["創造", "アイデア", "オリジナル", "新しい", "独自"],
    },
    表現力がある: {
      description: "自分の考えや感情を効果的に伝えることができる特性です。",
      keywords: ["表現", "伝える", "コミュニケーション", "表現力", "伝達"],
    },
    情熱的: {
      description: "物事に対して強い熱意や情熱を持って取り組む特性です。",
      keywords: ["情熱", "熱意", "エネルギー", "熱心", "情熱的"],
    },
    内省的: {
      description: "自分自身の思考や感情を深く考察する傾向がある特性です。",
      keywords: ["内省", "考察", "思考", "分析", "自己理解"],
    },
    想像力豊か: {
      description: "様々な状況や可能性を心の中で思い描くことができる特性です。",
      keywords: ["想像", "創造", "空想", "イメージ", "ビジョン"],
    },
    共感力がある: {
      description: "他者の感情や状況を理解し、感情を共有できる特性です。",
      keywords: ["共感", "理解", "感情", "思いやり", "感情移入"],
    },
    観察力に優れる: {
      description: "細部に注意を払い、周囲の状況を正確に把握できる特性です。",
      keywords: ["観察", "注意", "詳細", "把握", "認識"],
    },
    物語を分析する力: {
      description: "物語の構造や意味を深く理解し分析できる特性です。",
      keywords: ["分析", "理解", "物語", "構造", "意味"],
    },
    視覚的思考: {
      description: "情報を視覚的にイメージし処理する傾向がある特性です。",
      keywords: ["視覚", "イメージ", "画像", "映像", "ビジュアル"],
    },
    美的センスがある: {
      description: "美しさや調和を認識し、評価する能力に優れた特性です。",
      keywords: ["美的", "センス", "美しさ", "調和", "デザイン"],
    },
    自己表現を大切にする: {
      description: "自分らしさを表現することを重視する特性です。",
      keywords: ["自己表現", "個性", "自分らしさ", "表現", "アイデンティティ"],
    },
    トレンドに敏感: {
      description: "最新の流行や傾向をいち早く察知できる特性です。",
      keywords: ["トレンド", "流行", "最新", "傾向", "ファッション"],
    },
    個性的: {
      description: "他者とは異なる独自の特徴や個性を持つ特性です。",
      keywords: ["個性", "ユニーク", "独自", "特徴", "オリジナル"],
    },
    視覚的センスに優れる: {
      description: "色や形、配置などの視覚的要素のバランスを判断する能力に優れた特性です。",
      keywords: ["視覚", "センス", "デザイン", "色", "形"],
    },
    社交的: {
      description: "他者と積極的に交流し、関係を築くことを好む特性です。",
      keywords: ["社交", "交流", "コミュニケーション", "人間関係", "対人"],
    },
    コミュニケーション能力が高い: {
      description: "効果的に情報や感情を伝え、他者と意思疎通できる特性です。",
      keywords: ["コミュニケーション", "伝達", "対話", "表現", "交流"],
    },
    文化的感度が高い: {
      description: "様々な文化的要素や背景を理解し、尊重できる特性です。",
      keywords: ["文化", "多様性", "理解", "感度", "国際"],
    },
    人間関係を大切にする: {
      description: "他者との関係性を重視し、維持・発展させることを大切にする特性です。",
      keywords: ["人間関係", "絆", "友情", "つながり", "コミュニティ"],
    },
    好奇心旺盛: {
      description: "新しい知識や経験を求め、探求することを好む特性です。",
      keywords: ["好奇心", "探求", "学習", "興味", "発見"],
    },
    適応力がある: {
      description: "新しい状況や環境に柔軟に対応できる特性です。",
      keywords: ["適応", "柔軟", "対応", "変化", "順応"],
    },
    多様性を重視: {
      description: "様々な視点や背景を尊重し、価値を見出す特性です。",
      keywords: ["多様性", "多様", "様々", "異なる", "多角的"],
    },
    学習意欲が高い: {
      description: "新しい知識やスキルを積極的に学ぼうとする特性です。",
      keywords: ["学習", "勉強", "知識", "スキル", "成長"],
    },
    柔軟性がある: {
      description: "固定観念にとらわれず、様々な可能性を受け入れられる特性です。",
      keywords: ["柔軟", "適応", "オープン", "受容", "変化"],
    },
  }

  // パーソナリティタイプの特性を取得
  const traits = personalityType.traits

  // 各特性のスコアを計算
  return traits.map((trait) => {
    const definition = traitDefinitions[trait] || {
      description: "この特性はあなたの個性を表しています。",
      keywords: [],
    }

    // 基本スコア
    let score = 6

    // キーワードに基づいてスコアを調整
    if (keywords && keywords.length > 0) {
      const relevantKeywords = keywords.filter((k) =>
        definition.keywords.some((keyword) => k.word.toLowerCase().includes(keyword.toLowerCase())),
      )

      // 関連キーワードがあればスコアを上げる（最大+3）
      score += Math.min(3, relevantKeywords.length)
    }

    // ランダム要素を追加（±1）
    score += Math.floor(Math.random() * 3) - 1

    // 範囲を制限
    score = Math.max(5, Math.min(10, score))

    return {
      name: trait,
      description: definition.description,
      score,
      color: personalityType.color,
    }
  })
}

// おすすめを生成する関数
function generateRecommendations(personalityType) {
  // パーソナリティタイプに基づいたおすすめを返す
  const recommendations = [
    {
      category: "コンテンツ",
      items: [],
      color: personalityType.color,
    },
    {
      category: "アクティビティ",
      items: [],
      color: personalityType.color,
    },
    {
      category: "サービス",
      items: [],
      color: personalityType.color,
    },
  ]

  // タイプに基づいておすすめを設定
  switch (personalityType.id) {
    case "artistic_soul":
      recommendations[0].items = [
        {
          name: "音楽ドキュメンタリー",
          description: "アーティストの創作過程や音楽の歴史を深く掘り下げたドキュメンタリー作品",
          link: "/search?q=音楽ドキュメンタリー",
        },
        {
          name: "インディーミュージック",
          description: "主流から離れた独自の表現を追求するインディーアーティストの作品",
          link: "/search?q=インディーミュージック",
        },
      ]
      recommendations[1].items = [
        {
          name: "ライブ鑑賞",
          description: "生の演奏から得られる感動と一体感を体験できるライブイベント",
          link: "/search?q=ライブイベント",
        },
        {
          name: "楽器演奏",
          description: "自分自身で音楽を創造し表現するための楽器演奏の習得",
          link: "/search?q=楽器レッスン",
        },
      ]
      recommendations[2].items = [
        {
          name: "音楽ストリーミング",
          description: "幅広いジャンルの音楽を探索できる音楽ストリーミングサービス",
          link: "/search?q=音楽ストリーミング",
        },
        {
          name: "音楽制作アプリ",
          description: "自分だけの音楽を作成できる直感的な音楽制作アプリケーション",
          link: "/search?q=音楽制作アプリ",
        },
      ]
      break

    case "visual_storyteller":
      recommendations[0].items = [
        {
          name: "クラシック映画",
          description: "映画史に残る名作から学ぶストーリーテリングの真髄",
          link: "/search?q=クラシック映画",
        },
        {
          name: "アニメシリーズ",
          description: "深いテーマと魅力的なキャラクターを持つ長編アニメシリーズ",
          link: "/search?q=アニメシリーズ",
        },
      ]
      recommendations[1].items = [
        {
          name: "映画祭参加",
          description: "新しい映像作品と出会い、クリエイターと交流できる映画祭",
          link: "/search?q=映画祭",
        },
        {
          name: "映像制作",
          description: "自分の視点でストーリーを伝える映像制作の体験",
          link: "/search?q=映像制作",
        },
      ]
      recommendations[2].items = [
        {
          name: "映画レビューサイト",
          description: "様々な視点から映画を分析し、新たな発見をもたらすレビューサイト",
          link: "/search?q=映画レビュー",
        },
        {
          name: "映像ストリーミング",
          description: "世界中の多様な映像作品にアクセスできるストリーミングサービス",
          link: "/search?q=映像ストリーミング",
        },
      ]
      break

    case "trend_setter":
      recommendations[0].items = [
        {
          name: "ファッション雑誌",
          description: "最新のトレンドと独自のスタイルを融合するためのインスピレーション源",
          link: "/search?q=ファッション雑誌",
        },
        {
          name: "デザイナーブランド",
          description: "独創的なビジョンと高品質な素材で作られたデザイナーズアイテム",
          link: "/search?q=デザイナーブランド",
        },
      ]
      recommendations[1].items = [
        {
          name: "ファッションショー",
          description: "最先端のデザインとクリエイティビティを体験できるファッションイベント",
          link: "/search?q=ファッションショー",
        },
        {
          name: "スタイリング体験",
          description: "プロのスタイリストから学ぶパーソナルスタイリングのテクニック",
          link: "/search?q=パーソナルスタイリング",
        },
      ]
      recommendations[2].items = [
        {
          name: "ファッションアプリ",
          description: "自分のワードローブを管理し、新しいスタイルを提案するアプリケーション",
          link: "/search?q=ファッションアプリ",
        },
        {
          name: "サステナブルファッション",
          description: "環境に配慮しながらスタイルを楽しめるサステナブルなファッションブランド",
          link: "/search?q=サステナブルファッション",
        },
      ]
      break

    case "culture_connector":
      recommendations[0].items = [
        {
          name: "エンタメニュース",
          description: "最新のエンターテイメント業界の動向を把握できるニュースメディア",
          link: "/search?q=エンタメニュース",
        },
        {
          name: "セレブリティドキュメンタリー",
          description: "有名人の舞台裏や人生を深く掘り下げたドキュメンタリー作品",
          link: "/search?q=セレブリティドキュメンタリー",
        },
      ]
      recommendations[1].items = [
        {
          name: "ファンミーティング",
          description: "好きな芸能人やインフルエンサーと交流できるファンイベント",
          link: "/search?q=ファンミーティング",
        },
        {
          name: "カルチャーフェス",
          description: "様々な文化やエンターテイメントが融合する多様性に富んだフェスティバル",
          link: "/search?q=カルチャーフェスティバル",
        },
      ]
      recommendations[2].items = [
        {
          name: "SNSプラットフォーム",
          description: "最新のトレンドや情報を共有し、コミュニティとつながるソーシャルメディア",
          link: "/search?q=SNSプラットフォーム",
        },
        {
          name: "エンタメサブスク",
          description: "多様なエンターテイメントコンテンツにアクセスできるサブスクリプションサービス",
          link: "/search?q=エンタメサブスクリプション",
        },
      ]
      break

    case "explorer":
      recommendations[0].items = [
        {
          name: "ドキュメンタリーシリーズ",
          description: "様々な分野や文化を探索できる知的好奇心を刺激するドキュメンタリー",
          link: "/search?q=ドキュメンタリーシリーズ",
        },
        {
          name: "ポッドキャスト",
          description: "多様なトピックについて深く掘り下げた知識を得られるオーディオコンテンツ",
          link: "/search?q=ポッドキャスト",
        },
      ]
      recommendations[1].items = [
        {
          name: "ワークショップ参加",
          description: "新しいスキルや知識を体験的に学べる参加型のワークショップ",
          link: "/search?q=ワークショップ",
        },
        {
          name: "文化体験",
          description: "異なる文化や伝統を直接体験できるイマーシブな活動",
          link: "/search?q=文化体験",
        },
      ]
      recommendations[2].items = [
        {
          name: "オンライン学習",
          description: "様々な分野の知識やスキルを自分のペースで学べるオンラインプラットフォーム",
          link: "/search?q=オンライン学習",
        },
        {
          name: "キュレーションサービス",
          description: "あなたの興味に合わせて多様なコンテンツを提案するパーソナライズサービス",
          link: "/search?q=コンテンツキュレーション",
        },
      ]
      break
  }

  return recommendations
}

export default function AnalysisPage() {
  const { favorites } = useFavorites()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [categoryData, setCategoryData] = useState(null)
  const [keywordData, setKeywordData] = useState(null)
  const [trends, setTrends] = useState([])
  const [personalityType, setPersonalityType] = useState(null)
  const [compatibleTypes, setCompatibleTypes] = useState([])
  const [traitScores, setTraitScores] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Only run analysis if there are favorites
    if (favorites.length > 0) {
      // Slight delay to show loading
      setTimeout(() => {
        const categories = analyzeCategories(favorites)
        setCategoryData(categories)

        const keywords = analyzeKeywords(favorites)
        setKeywordData(keywords)

        const analyzedTrends = analyzeTrends(favorites)
        setTrends(analyzedTrends)

        // パーソナリティタイプの分析
        const type = determinePersonalityType(categories)
        setPersonalityType(type)

        // 相性の良いタイプを取得
        const compatibles = getCompatibleTypes(type, categories)
        setCompatibleTypes(compatibles)

        // 特性スコアを計算
        const traits = calculateTraitScores(type, keywords)
        setTraitScores(traits)

        // おすすめを生成
        const recs = generateRecommendations(type)
        setRecommendations(recs)

        setLoading(false)

        // 分析完了時に紙吹雪エフェクトを表示
        setShowConfetti(true)
      }, 1000)
    } else {
      // If no favorites, just stop loading
      setLoading(false)
      // Initialize with empty data to prevent null errors
      setCategoryData({ artists: 0, celebrities: 0, media: 0, fashion: 0 })
      setKeywordData([])
      setTrends([])
      setPersonalityType(personalityTypes.explorer)
      setCompatibleTypes([])
      setTraitScores([])
      setRecommendations([])
    }
  }, [favorites])

  // 紙吹雪エフェクト
  useEffect(() => {
    if (showConfetti) {
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const randomInRange = (min, max) => Math.random() * (max - min) + min

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // 左右から紙吹雪を発射
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      }, 250)

      // クリーンアップ
      return () => clearInterval(interval)
    }
  }, [showConfetti])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold">あなたの好みを分析中...</h2>
        <p className="text-muted-foreground">お気に入りコンテンツから性格タイプを診断しています</p>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] max-w-md mx-auto text-center">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">分析するデータがありません</h1>
        <p className="text-muted-foreground mb-6">
          性格タイプ診断を行うには、まずコンテンツをお気に入りに追加してください。好きなアーティストや作品を見つけて、
          ハートアイコンをクリックしましょう。
        </p>
        <Button asChild>
          <Link href="/favorites">お気に入りへ移動</Link>
        </Button>
      </div>
    )
  }

  // Convert category data for chart visualization
  const categoryChartData = Object.entries(categoryData).map(([name, value]) => {
    const categoryNames = {
      artists: "アーティスト",
      celebrities: "芸能人",
      media: "映画/アニメ",
      fashion: "ファッション",
    }
    return {
      name: categoryNames[name] || name,
      value: value,
    }
  })

  // 分析データの整形
  const analysisData = {
    categories: categoryChartData.map((cat) => ({
      name: cat.name,
      value: Math.round((cat.value / favorites.length) * 100),
      color:
        cat.name === "アーティスト"
          ? "bg-[#8A2BE2]"
          : cat.name === "芸能人"
            ? "bg-[#FF4500]"
            : cat.name === "映画/アニメ"
              ? "bg-[#4169E1]"
              : "bg-[#FF1493]",
    })),
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">性格タイプ診断</h1>
        <p className="text-muted-foreground">{favorites.length}個のお気に入りアイテムに基づく性格タイプ分析</p>
      </div>

      <Tabs defaultValue="personality" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="personality">性格タイプ</TabsTrigger>
          <TabsTrigger value="compatibility">相性</TabsTrigger>
          <TabsTrigger value="traits">特性</TabsTrigger>
          <TabsTrigger value="recommendations">おすすめ</TabsTrigger>
        </TabsList>

        {/* 性格タイプタブ */}
        <TabsContent value="personality" className="space-y-6">
          {personalityType && (
            <PersonalityResultCard
              personalityType={personalityType}
              categoryData={analysisData.categories}
              userName={user?.name || "あなた"}
              keywords={keywordData}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCircle2 className="mr-2 h-5 w-5" />
                あなたの好みの傾向
              </CardTitle>
              <CardDescription>お気に入りから分析された傾向</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {trends.map((trend, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>{trend}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 相性タブ */}
        <TabsContent value="compatibility" className="space-y-6">
          {personalityType && compatibleTypes.length > 0 && (
            <CompatibleTypes mainType={personalityType} compatibleTypes={compatibleTypes} />
          )}

          <Card>
            <CardHeader>
              <CardTitle>カテゴリー分布</CardTitle>
              <CardDescription>お気に入りのカテゴリー分布</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisData.categories.map((category) => (
                  <div key={category.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{category.name}</span>
                      <span className="font-medium">{category.value}%</span>
                    </div>
                    <Progress value={category.value} className={category.color} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 特性タブ */}
        <TabsContent value="traits" className="space-y-6">
          {personalityType && traitScores.length > 0 && (
            <TraitsCard traits={traitScores} typeColor={personalityType.color} />
          )}

          <Card>
            <CardHeader>
              <CardTitle>キーワード分析</CardTitle>
              <CardDescription>お気に入りから抽出された特徴的なキーワード</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {keywordData.map((item, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: personalityType
                        ? `${personalityType.color}${Math.round((item.count / keywordData[0].count) * 70 + 30)}`
                        : `rgba(69, 69, 69, ${0.3 + (0.7 * item.count) / keywordData[0].count})`,
                      color: "white",
                      fontSize: `${Math.max(0.8, 0.8 + (0.4 * item.count) / keywordData[0].count)}rem`,
                    }}
                  >
                    {item.word}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* おすすめタブ */}
        <TabsContent value="recommendations" className="space-y-6">
          {personalityType && recommendations.length > 0 && <RecommendationsCard recommendations={recommendations} />}

          <Card>
            <CardHeader>
              <CardTitle>シェアする</CardTitle>
              <CardDescription>あなたの性格タイプ診断結果をシェアしましょう</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  className="flex items-center gap-2"
                  style={{ backgroundColor: personalityType?.color }}
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${user?.name || "私"}の性格タイプは「${personalityType?.emoji} ${personalityType?.title}」です！`,
                        text: `${user?.name || "私"}の性格タイプは「${personalityType?.emoji} ${personalityType?.title}」です！\n${personalityType?.description}\n#MyProject #性格診断 #好み分析`,
                        url: window.location.href,
                      })
                    } else {
                      navigator.clipboard.writeText(
                        `${user?.name || "私"}の性格タイプは「${personalityType?.emoji} ${personalityType?.title}」です！\n${personalityType?.description}\n#MyProject #性格診断 #好み分析\n${window.location.href}`,
                      )
                      alert("クリップボードにコピーしました！")
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  診断結果をシェアする
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


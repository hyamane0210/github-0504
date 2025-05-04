"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Share2, Download, Copy, Twitter, Facebook, Instagram, Check, ChevronRight, Sparkles } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import html2canvas from "html2canvas"

interface PersonalityResultCardProps {
  personalityType: {
    id: string
    title: string
    emoji: string
    description: string
    longDescription: string
    traits: string[]
    compatibleTypes: string[]
    color: string
    imageUrl: string
  }
  categoryData: {
    name: string
    value: number
    color: string
  }[]
  userName?: string
  keywords: {
    word: string
    count: number
  }[]
}

export function PersonalityResultCard({
  personalityType,
  categoryData,
  userName = "あなた",
  keywords,
}: PersonalityResultCardProps) {
  const { toast } = useToast()
  const [isCopied, setIsCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // 画像としてダウンロード
  const handleDownload = async () => {
    const element = document.getElementById("personality-card")
    if (!element) return

    setIsDownloading(true)
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      })

      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = `${userName}の性格タイプ-${personalityType.title}.png`
      link.click()

      toast({
        title: "画像を保存しました",
        description: "分析結果を画像として保存しました。",
        duration: 3000,
      })
    } catch (error) {
      console.error("画像の生成に失敗しました", error)
      toast({
        title: "エラーが発生しました",
        description: "画像の生成に失敗しました。もう一度お試しください。",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsDownloading(false)
    }
  }

  // クリップボードにコピー
  const handleCopy = async () => {
    const element = document.getElementById("personality-card")
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      })

      canvas.toBlob(async (blob) => {
        if (!blob) return

        try {
          // 新しいClipboard APIを使用
          const data = [new ClipboardItem({ "image/png": blob })]
          await navigator.clipboard.write(data)

          setIsCopied(true)
          setTimeout(() => setIsCopied(false), 2000)

          toast({
            title: "クリップボードにコピーしました",
            description: "分析結果をクリップボードにコピーしました。",
            duration: 3000,
          })
        } catch (error) {
          console.error("クリップボードへのコピーに失敗しました", error)
          toast({
            title: "エラーが発生しました",
            description: "クリップボードへのコピーに失敗しました。",
            variant: "destructive",
            duration: 3000,
          })
        }
      })
    } catch (error) {
      console.error("画像の生成に失敗しました", error)
    }
  }

  // SNSでシェア
  const handleShare = async (platform: string) => {
    const element = document.getElementById("personality-card")
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
        logging: false,
      })

      const image = canvas.toDataURL("image/png")
      const text = `${userName}の性格タイプは「${personalityType.emoji} ${personalityType.title}」です！\n#MyProject #性格診断 #好み分析`

      let shareUrl = ""

      switch (platform) {
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
          break
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`
          break
        case "line":
          shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`
          break
        default:
          // Web Share APIを使用（モバイルデバイス向け）
          if (navigator.share) {
            try {
              // 画像をBlobに変換
              const blobData = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, "image/png")
              })

              if (blobData) {
                const file = new File([blobData], "personality.png", { type: "image/png" })

                await navigator.share({
                  title: `${userName}の性格タイプ: ${personalityType.title}`,
                  text: text,
                  url: window.location.href,
                  files: [file],
                })

                toast({
                  title: "共有しました",
                  description: "分析結果を共有しました。",
                  duration: 3000,
                })
                return
              }
            } catch (error) {
              console.error("Web Share APIでの共有に失敗しました", error)
            }
          }

          // フォールバック: URLをクリップボードにコピー
          navigator.clipboard.writeText(`${text}\n${window.location.href}`)
          toast({
            title: "URLをコピーしました",
            description: "分析結果のURLをクリップボードにコピーしました。",
            duration: 3000,
          })
          return
      }

      // 新しいウィンドウでシェアURLを開く
      window.open(shareUrl, "_blank", "noopener,noreferrer")

      toast({
        title: "共有ページを開きました",
        description: `${platform}での共有ページを開きました。`,
        duration: 3000,
      })
    } catch (error) {
      console.error("共有用画像の生成に失敗しました", error)
      toast({
        title: "エラーが発生しました",
        description: "共有の準備中にエラーが発生しました。",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card
        id="personality-card"
        className={`overflow-hidden border-2 shadow-lg transition-all duration-300`}
        style={{ borderColor: personalityType.color }}
      >
        <div className="relative">
          <div className="h-32 w-full relative overflow-hidden" style={{ backgroundColor: personalityType.color }}>
            <div className="absolute inset-0 opacity-20 bg-[url('/placeholder.svg?height=200&width=600')] bg-cover bg-center"></div>
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent"></div>

            <div className="absolute top-4 left-4 bg-white/90 rounded-full px-3 py-1 text-sm font-medium shadow-md">
              My Project 性格診断
            </div>

            <div className="absolute top-4 right-4 bg-white/90 rounded-full w-10 h-10 flex items-center justify-center shadow-md">
              {personalityType.emoji}
            </div>
          </div>

          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl shadow-lg"
              style={{ backgroundColor: personalityType.color }}
            >
              {personalityType.emoji}
            </div>
          </div>
        </div>

        <CardContent className="pt-16 pb-6 px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-1">{personalityType.title}</h2>
            <p className="text-sm text-muted-foreground">{userName}の性格タイプ</p>
          </div>

          <p className="text-center mb-6">{personalityType.description}</p>

          {showDetails ? (
            <>
              <div className="mb-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1" style={{ color: personalityType.color }} />
                  詳細な特徴
                </h3>
                <p className="text-sm">{personalityType.longDescription}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">特性</h3>
                <div className="flex flex-wrap gap-2">
                  {personalityType.traits.map((trait, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-50">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">相性の良いタイプ</h3>
                <div className="flex flex-wrap gap-2">
                  {personalityType.compatibleTypes.map((type, index) => (
                    <Badge key={index} style={{ backgroundColor: personalityType.color, color: "white" }}>
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">カテゴリー分布</h3>
                <div className="space-y-3">
                  {categoryData.map((category, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{category.name}</span>
                        <span className="font-medium">{category.value}%</span>
                      </div>
                      <Progress value={category.value} className={category.color} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">キーワード</h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.slice(0, 5).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-50">
                      {keyword.word}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => setShowDetails(false)}>
                概要を表示
              </Button>
            </>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setShowDetails(true)}>
              詳細を表示 <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* シェアボタン */}
      <div className="flex flex-wrap gap-2 justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare("twitter")}
                className="bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90 border-none"
              >
                <Twitter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Twitterでシェア</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare("facebook")}
                className="bg-[#1877F2] text-white hover:bg-[#1877F2]/90 border-none"
              >
                <Facebook className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Facebookでシェア</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleShare("instagram")}
                className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white hover:opacity-90 border-none"
              >
                <Instagram className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Instagramでシェア</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => handleShare("other")}>
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>その他の方法でシェア</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>クリップボードにコピー</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleDownload} disabled={isDownloading}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>画像として保存</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}


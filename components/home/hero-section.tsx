"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"

// 人気の検索キーワード（具体的な例）
const popularSearches = [
  "Kendrick Lamar",
  "千と千尋の神隠し",
  "進撃の巨人",
  "Nike",
  "Beyoncé",
  "ストレンジャー・シングス",
]

export default function HeroSection() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <section className="relative bg-gradient-to-r from-[#454545] to-[#828282] py-16 md:py-24">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-10"></div>
      <div className="absolute right-0 top-0 w-full md:w-1/2 h-full">
        <div className="relative h-full w-full">
          <ImageWithFallback
            src="/placeholder.svg?height=500&width=600"
            alt="Hero image"
            fill
            className="object-cover opacity-80"
            fallbackText="MP"
            identifier="hero-image"
            showLoadingEffect={false}
            containerClassName="hidden md:block"
          />
        </div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Badge className="bg-white/20 text-white hover:bg-white/30 transition-colors">
            パーソナライズドコンテンツ
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            あなたの次の
            <br className="hidden sm:inline" />
            お気に入りを発見しよう
          </h1>
          <p className="text-white/90 mb-8 text-lg max-w-xl">
            アーティスト、映画、アニメ、ファッションなど、あなたの興味に合わせたおすすめを見つけましょう
          </p>

          {/* 検索フォーム */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mt-8 flex">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="search"
                placeholder="例: ドレイク、インセプション、ワンピース、アディダス..."
                className="pl-10 py-6 text-base md:text-lg rounded-l-full rounded-r-none border-r-0 bg-background/95"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="rounded-r-full rounded-l-none px-6 bg-[#454545] hover:bg-[#454545]/90"
            >
              検索
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* 人気の検索キーワード */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="text-white/60 text-sm">人気:</span>
            {popularSearches.map((term) => (
              <Button
                key={term}
                variant="link"
                className="text-white hover:text-white/80 p-0 h-auto text-sm"
                onClick={() => {
                  setSearchQuery(term)
                  router.push(`/search?q=${encodeURIComponent(term)}`)
                }}
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


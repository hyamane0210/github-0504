"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image, { type ImageProps } from "next/image"
import { cn } from "@/lib/utils"

const placeholderColors = [
  "bg-gray-100",
  "bg-blue-50",
  "bg-green-50",
  "bg-yellow-50",
  "bg-red-50",
  "bg-purple-50",
  "bg-pink-50",
  "bg-indigo-50",
]

const getPlaceholderColor = (id: string | number) => {
  const numericId = typeof id === "string" ? 
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 
    id
  return placeholderColors[numericId % placeholderColors.length]
}

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackText?: string
  identifier?: string | number
  containerClassName?: string
  showLoadingEffect?: boolean
}

export function ImageWithFallback({
  src,
  alt,
  fallbackText,
  identifier,
  containerClassName,
  showLoadingEffect = true,
  className,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const id = identifier || alt || Math.floor(Math.random() * 100)
  const placeholderColor = getPlaceholderColor(id)
  const displayText = fallbackText || (alt ? alt.substring(0, 2).toUpperCase() : "")

  useEffect(() => {
    setError(false)
    setLoading(true)
  }, [src])

  return (
    <div className={cn("relative w-full h-full", containerClassName)}>
      {/* ローディング中またはエラー時のプレースホルダー */}
      {(loading || error) && (
        <div className={cn(
          "absolute inset-0 flex flex-col items-center justify-center",
          placeholderColor,
          showLoadingEffect && loading && !error && "animate-pulse"
        )}>
          <div className="text-2xl font-semibold text-gray-400 mb-2">{displayText}</div>
          <div className="text-sm text-gray-400">No Image</div>
        </div>
      )}

      {/* 実際の画像 */}
      {!error && (
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          className={cn(
            loading ? "opacity-0" : "opacity-100",
            "transition-opacity duration-300",
            className
          )}
          onLoadingComplete={() => setLoading(false)}
          onError={() => {
            setError(true)
            setLoading(false)
          }}
          {...props}
        />
      )}
    </div>
  )
}
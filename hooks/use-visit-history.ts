"use client"

import { useState, useEffect, useCallback } from "react"

type VisitHistory = {
  firstVisit: boolean
  lastVisitDate: string
}

export function useVisitHistory() {
  const [visitHistory, setVisitHistory] = useState<VisitHistory>({
    firstVisit: true,
    lastVisitDate: new Date().toISOString(),
  })
  const [isLoaded, setIsLoaded] = useState(false)

  // ローカルストレージからデータを読み込む
  useEffect(() => {
    try {
      // クライアントサイドでのみ実行
      if (typeof window !== "undefined") {
        const storedHistory = localStorage.getItem("visit-history")
        if (storedHistory) {
          setVisitHistory(JSON.parse(storedHistory))
        } else {
          // 初回訪問の場合、訪問履歴を記録
          const initialHistory: VisitHistory = {
            firstVisit: true,
            lastVisitDate: new Date().toISOString(),
          }
          localStorage.setItem("visit-history", JSON.stringify(initialHistory))
          setVisitHistory(initialHistory)
        }
        setIsLoaded(true)
      }
    } catch (error) {
      console.error("Failed to load visit history:", error)
      // エラーが発生した場合でもロード完了とする
      setIsLoaded(true)
    }
  }, [])

  // 訪問履歴を更新する関数
  const markAsReturningVisitor = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        // 初回訪問でない場合は更新しない
        if (!visitHistory.firstVisit) return

        const updatedHistory = {
          ...visitHistory,
          firstVisit: false,
          lastVisitDate: new Date().toISOString(),
        }

        localStorage.setItem("visit-history", JSON.stringify(updatedHistory))
        setVisitHistory(updatedHistory)
      }
    } catch (error) {
      console.error("Failed to update visit history:", error)
    }
  }, [visitHistory])

  return {
    isFirstVisit: visitHistory.firstVisit,
    lastVisitDate: visitHistory.lastVisitDate,
    isLoaded,
    markAsReturningVisitor,
  }
}


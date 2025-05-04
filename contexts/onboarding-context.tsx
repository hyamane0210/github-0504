"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  hasVisitedInSession,
  markVisitedInSession,
  hasInitialRedirectDone,
  markInitialRedirectDone,
} from "@/utils/session-utils"

type OnboardingContextType = {
  isOnboarding: boolean
  currentStep: number
  startOnboarding: () => void
  skipOnboarding: () => void
  completeOnboarding: () => void
  startQuickSelection: () => void
  goToGuidedSearch: (items: any[]) => void
  allowNavigation: (path: string) => boolean
  isFirstVisit: boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [bypassRedirect, setBypassRedirect] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [isClientReady, setIsClientReady] = useState(false)
  const initialRedirectAttempted = useRef(false)
  const router = useRouter()
  const pathname = usePathname()

  // クライアントサイドでのみ実行される処理を確認
  useEffect(() => {
    setIsClientReady(true)
  }, [])

  // ローカルストレージとセッションストレージからオンボーディング状態を読み込む
  useEffect(() => {
    if (!isClientReady || typeof window === "undefined") return

    try {
      const hasCompletedOnboarding = localStorage.getItem("onboarding-completed") === "true"
      const visitedInSession = hasVisitedInSession()

      setIsFirstVisit(!hasCompletedOnboarding)

      // 現在のページがウェルカムページの場合、セッション訪問済みとしてマーク
      if (pathname === "/welcome") {
        markVisitedInSession()
        markInitialRedirectDone()
      }
    } catch (error) {
      console.error("ストレージアクセスエラー:", error)
    }
  }, [isClientReady, pathname])

  // 初回訪問時のリダイレクト処理
  useEffect(() => {
    if (!isClientReady || typeof window === "undefined" || bypassRedirect) return
    if (initialRedirectAttempted.current) return

    try {
      const hasCompletedOnboarding = localStorage.getItem("onboarding-completed") === "true"
      const initialRedirectDone = hasInitialRedirectDone()

      // 初回訪問時の処理
      if (!hasCompletedOnboarding && !initialRedirectDone) {
        // オンボーディング関連のパスでなければウェルカムページにリダイレクト
        const onboardingPaths = ["/welcome", "/quick-selection", "/guided-search"]
        const allowedPaths = ["/search", "/favorites", "/analysis", "/signin", "/signup", "/profile"]

        if (
          pathname &&
          !onboardingPaths.includes(pathname) &&
          !allowedPaths.includes(pathname) &&
          !pathname.startsWith("/guided-search") &&
          !pathname.startsWith("/category")
        ) {
          console.log("初回訪問: ウェルカムページにリダイレクト", pathname)
          initialRedirectAttempted.current = true
          markInitialRedirectDone()
          router.push("/welcome")
        }
      }
    } catch (error) {
      console.error("リダイレクト処理エラー:", error)
    }
  }, [isClientReady, router, pathname, bypassRedirect])

  // 特定のパスへのナビゲーションを許可するかどうかを判断する関数
  const allowNavigation = (path: string): boolean => {
    // 一時的にリダイレクトをバイパスする
    setBypassRedirect(true)

    // セッション訪問済みとしてマーク
    markVisitedInSession()

    // 少し遅延してバイパスをリセット
    setTimeout(() => {
      setBypassRedirect(false)
    }, 1000)

    return true
  }

  const startOnboarding = () => {
    setIsOnboarding(true)
    setCurrentStep(1)
    router.push("/welcome")
  }

  const skipOnboarding = () => {
    setIsOnboarding(false)
    localStorage.setItem("onboarding-completed", "true")
    markVisitedInSession()
    router.push("/")
  }

  const completeOnboarding = () => {
    setIsOnboarding(false)
    localStorage.setItem("onboarding-completed", "true")
    markVisitedInSession()
    router.push("/")
  }

  const startQuickSelection = () => {
    setIsOnboarding(true)
    setCurrentStep(2)
    markVisitedInSession()
    router.push("/quick-selection")
  }

  const goToGuidedSearch = (items: any[]) => {
    setIsOnboarding(true)
    setCurrentStep(3)
    markVisitedInSession()

    try {
      // アイテムをURLパラメータとして渡す
      const encodedItems = encodeURIComponent(JSON.stringify(items))
      router.push(`/guided-search?items=${encodedItems}`)
    } catch (error) {
      console.error("ナビゲーションエラー:", error)
      // エラーが発生した場合でもガイド付き検索ページに遷移
      router.push("/guided-search")
    }
  }

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        currentStep,
        startOnboarding,
        skipOnboarding,
        completeOnboarding,
        startQuickSelection,
        goToGuidedSearch,
        allowNavigation,
        isFirstVisit,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}


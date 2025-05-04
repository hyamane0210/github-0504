import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import dynamic from 'next/dynamic'

const ThemeProvider = dynamic(() => import("@/components/theme-provider").then(mod => mod.ThemeProvider), { ssr: false })
const Toaster = dynamic(() => import("@/components/ui/toaster").then(mod => mod.Toaster))
const FavoritesProvider = dynamic(() => import("@/contexts/favorites-context").then(mod => mod.FavoritesProvider))
const OnboardingProvider = dynamic(() => import("@/contexts/onboarding-context").then(mod => mod.OnboardingProvider))
const AuthProvider = dynamic(() => import("@/contexts/auth-context").then(mod => mod.AuthProvider))
const Header = dynamic(() => import("@/components/header"))

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "My Project - あなた専用のコンテンツ体験",
  description: "アーティスト、映画、アニメ、ファッションなど、あなたの興味に合わせたおすすめを発見しましょう",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <FavoritesProvider>
              <OnboardingProvider>
                <div className="min-h-screen bg-background flex flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                </div>
                <Toaster />
              </OnboardingProvider>
            </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
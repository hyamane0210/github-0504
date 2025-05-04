"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)

  // クライアントサイドでのみレンダリング
  useEffect(() => {
    setMounted(true)
  }, [])

  // 認証されていない場合はログインページにリダイレクト
  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.push("/signin?redirect=" + encodeURIComponent(window.location.pathname))
    }
  }, [mounted, isLoading, user, router])

  // ローディング中またはサーバーサイドレンダリング
  if (!mounted || isLoading || !user) {
    return (
      <div className="container max-w-md mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>読み込み中...</span>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">プロフィール</CardTitle>
          <CardDescription>アカウント情報の確認と管理</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl bg-primary/10">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">名前</h3>
              <p className="text-lg">{user.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">メールアドレス</h3>
              <p className="text-lg">{user.email}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            戻る
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              signOut()
              router.push("/")
            }}
          >
            ログアウト
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}


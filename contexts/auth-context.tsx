"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  email: string
  name: string
  avatar?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // セッション管理を統合
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        const storedSession = sessionStorage.getItem("session")

        if (storedUser && storedSession) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser = {
        id: Date.now().toString(),
        email,
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      }

      localStorage.setItem("user", JSON.stringify(newUser))
      sessionStorage.setItem("session", "active")
      setUser(newUser)
    } catch (error) {
      console.error("Sign up failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const storedUserData = localStorage.getItem(`user_${email}`)
      if (!storedUserData) {
        throw new Error("User not found")
      }

      const userData = JSON.parse(storedUserData)
      if (userData.password !== password) {
        throw new Error("Invalid password")
      }

      const loggedInUser = {
        id: Date.now().toString(),
        email,
        name: userData.name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
      }

      localStorage.setItem("user", JSON.stringify(loggedInUser))
      sessionStorage.setItem("session", "active")
      setUser(loggedInUser)
    } catch (error) {
      console.error("Sign in failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem("user")
    sessionStorage.removeItem("session")
    setUser(null)
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { checkAuthStatus, logout, validateLogin } from '@/lib/auth'
import type { User } from '@/lib/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authResult = checkAuthStatus()
    if (authResult.success && authResult.user) {
      setUser(authResult.user)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = async (username: string, password: string) => {
    const result = validateLogin(username, password)
    if (result.success && result.user) {
      setUser(result.user)
      return { success: true }
    }
    return { success: false, message: result.message }
  }

  const handleLogout = () => {
    logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login: handleLogin,
      logout: handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
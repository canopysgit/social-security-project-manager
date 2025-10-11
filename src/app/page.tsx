'use client'

import { useAuth } from '@/hooks/useAuth'
import LoginForm from '@/components/auth/LoginForm'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user?.isAuthenticated) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (user?.isAuthenticated) {
    return null // 重定向中
  }

  return <LoginForm />
}

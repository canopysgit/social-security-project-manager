'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface PolicyEditLayoutProps {
  children: React.ReactNode
  params: { id: string }
}

export default function PolicyEditLayout({ children, params }: PolicyEditLayoutProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user?.isAuthenticated) {
      router.push('/')
      return
    }
  }, [user, router])

  if (!user?.isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                社保补缴计算系统
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                欢迎，{user.username}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* 导航标签页 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              项目管理
            </button>
            <button
              onClick={() => router.push('/policies')}
              className="py-4 px-1 border-b-2 border-indigo-500 font-medium text-sm text-indigo-600"
            >
              政策管理
            </button>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      {children}
    </div>
  )
}
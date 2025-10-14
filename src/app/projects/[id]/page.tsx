'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ProjectHomePage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  useEffect(() => {
    // 重定向到项目概览页面
    if (projectId) {
      router.replace(`/projects/${projectId}/overview`)
    }
  }, [projectId, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">正在跳转到项目概览...</p>
      </div>
    </div>
  )
}
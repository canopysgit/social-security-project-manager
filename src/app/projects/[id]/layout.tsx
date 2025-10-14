'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Project } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home, Settings, Upload, Calculator, Search, Shield, Building2 } from 'lucide-react'
import Link from 'next/link'

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [projectId, setProjectId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // 获取项目ID
  useEffect(() => {
    const getProjectId = async () => {
      const { id } = await params
      setProjectId(id)
    }
    getProjectId()
  }, [params])

  // 加载项目信息
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/projects/${projectId}`)
        const result = await response.json()
        
        if (result.success) {
          setProject(result.data)
        } else {
          console.error('加载项目失败:', result.error)
        }
      } catch (error) {
        console.error('加载项目失败:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.isAuthenticated && projectId) {
      loadProject()
    }
  }, [projectId, user])

  useEffect(() => {
    if (!user?.isAuthenticated) {
      router.push('/')
      return
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user?.isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">项目不存在</div>
          <Link href="/dashboard">
            <Button>返回项目管理</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mr-4">
                  <Home className="h-4 w-4 mr-2" />
                  首页
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-500">{project.id} • {project.company_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                欢迎，{user.username}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 项目导航标签页 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {projectId && (
              <>
                <Link href={`/projects/${projectId}/overview`}>
                  <div className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer flex items-center">
                    <Home className="h-4 w-4 mr-2" />
                    项目概览
                  </div>
                </Link>
                <Link href={`/projects/${projectId}/companies`}>
                  <div className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    子公司管理
                  </div>
                </Link>
                <Link href={`/projects/${projectId}/companies`}>
                  <div className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    政策配置
                  </div>
                </Link>
                <Link href={`/projects/${projectId}/calc-config`}>
                  <div className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer flex items-center">
                    <Calculator className="h-4 w-4 mr-2" />
                    计算配置
                  </div>
                </Link>
                <Link href={`/projects/${projectId}/upload-config`}>
                  <div className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    上传配置
                  </div>
                </Link>
                <Link href={`/projects/${projectId}/upload`}>
                  <div className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    数据上传
                  </div>
                </Link>
                <Link href={`/projects/${projectId}/calculate`}>
                  <div className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer flex items-center">
                    <Calculator className="h-4 w-4 mr-2" />
                    执行计算
                  </div>
                </Link>
                <Link href={`/projects/${projectId}/results`}>
                  <div className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer flex items-center">
                    <Search className="h-4 w-4 mr-2" />
                    结果查询
                  </div>
                </Link>
                <Link href={`/projects/${projectId}/compliance`}>
                  <div className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    合规分析
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      {children}
    </div>
  )
}
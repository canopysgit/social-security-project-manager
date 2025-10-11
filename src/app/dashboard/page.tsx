'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { testConnection } from '@/lib/supabase'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState([]) // 后续从数据库获取

  useEffect(() => {
    if (!user?.isAuthenticated) {
      router.push('/')
      return
    }

    // 测试 Supabase 连接
    testConnection()
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleCreateProject = () => {
    // TODO: 实现创建项目功能
    alert('创建项目功能开发中...')
  }

  const handleProjectClick = (projectId: string) => {
    // TODO: 进入项目详情页
    router.push(`/projects/${projectId}`)
  }

  if (!user?.isAuthenticated) {
    return null // 重定向中
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
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* 页面标题和新建按钮 */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">项目管理</h2>
              <p className="text-gray-600 mt-1">创建和管理您的社保补缴计算项目</p>
            </div>
            <button
              onClick={handleCreateProject}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-sm font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              新建项目
            </button>
          </div>

          {/* 系统统计概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="text-indigo-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">0</h3>
                  <p className="text-gray-600">总项目数</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="text-green-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">0</h3>
                  <p className="text-gray-600">已完成</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="text-yellow-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">0</h3>
                  <p className="text-gray-600">进行中</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center">
                <div className="text-blue-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">0</h3>
                  <p className="text-gray-600">总员工数</p>
                </div>
              </div>
            </div>
          </div>

          {/* 项目列表 */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">项目列表</h3>
            </div>
            
            {/* 暂无项目时的空状态 */}
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无项目</h3>
              <p className="text-gray-500 mb-6">
                创建您的第一个社保补缴计算项目，开始数据分析
              </p>
              <button
                onClick={handleCreateProject}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium"
              >
                立即创建
              </button>
            </div>
          </div>

          {/* 使用说明 */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex">
              <div className="text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">使用流程</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>创建新项目</li>
                    <li>上传 Excel 工资数据</li>
                    <li>配置计算参数</li>
                    <li>查看计算结果并导出</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
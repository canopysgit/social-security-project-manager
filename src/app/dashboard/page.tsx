'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Project } from '@/lib/types'
import ProjectCreateModal from '@/components/projects/ProjectCreateModal'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dbStatus, setDbStatus] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/projects', {
        headers: {
          'Accept': 'application/json; charset=utf-8'
        }
      })
      const result = await response.json()
      
      if (result.success) {
        console.log('获取到的项目数据:', result.data)
        setProjects(result.data || [])
      } else {
        console.error('获取项目列表失败:', result.error)
      }
    } catch (error) {
      console.error('获取项目列表出错:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.isAuthenticated) {
      router.push('/')
      return
    }

    // 获取项目列表
    fetchProjects()
    
    // 检查数据库表结构
    fetch('/api/database/inspect')
      .then(res => res.json())
      .then(data => {
        console.log('📊 数据库检查结果:', data)
        setDbStatus(data)
      })
      .catch(err => {
        console.error('检查数据库失败:', err)
      })
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleCreateProject = () => {
    setShowCreateModal(true)
  }

  const handleCreateSuccess = () => {
    fetchProjects() // 重新获取项目列表
  }

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  if (!user?.isAuthenticated) {
    return null
  }

  // 计算统计数据
  const totalProjects = projects.length
  const completedProjects = projects.filter(p => p.stats.calculation_status === 'completed').length
  const inProgressProjects = projects.filter(p => p.stats.calculation_status === 'in_progress').length
  const totalEmployees = projects.reduce((sum, p) => sum + p.stats.total_employees, 0)

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

      {/* 导航标签页 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="py-4 px-1 border-b-2 border-indigo-500 font-medium text-sm text-indigo-600"
            >
              项目管理
            </button>
            <button
              onClick={() => router.push('/policies')}
              className="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              政策管理
            </button>
          </div>
        </div>
      </div>

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
                  <h3 className="text-2xl font-bold text-gray-900">{totalProjects}</h3>
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
                  <h3 className="text-2xl font-bold text-gray-900">{completedProjects}</h3>
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
                  <h3 className="text-2xl font-bold text-gray-900">{inProgressProjects}</h3>
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
                  <h3 className="text-2xl font-bold text-gray-900">{totalEmployees}</h3>
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
            
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="text-gray-400">加载中...</div>
              </div>
            ) : projects.length === 0 ? (
              /* 暂无项目时的空状态 */
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
            ) : (
              /* 项目列表 */
              <div className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-6 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">{project.name}</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {project.id}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <span>{project.company_name}</span>
                          <span className="mx-2">•</span>
                          <span>{project.project_period.substring(0,4)}年{project.project_period.substring(4,6)}月</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                        {project.description && (
                          <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">{project.stats.total_employees}</div>
                          <div className="text-xs text-gray-500">员工数</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-medium text-gray-900">{project.stats.salary_records_count}</div>
                          <div className="text-xs text-gray-500">工资记录</div>
                        </div>
                        <div className="text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            project.stats.calculation_status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.stats.calculation_status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            project.stats.calculation_status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.stats.calculation_status === 'completed' ? '已完成' :
                             project.stats.calculation_status === 'in_progress' ? '计算中' :
                             project.stats.calculation_status === 'failed' ? '失败' : '待处理'}
                          </span>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 数据库状态 */}
          {dbStatus && (
            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">数据库状态检查</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(dbStatus.tables).map(([tableName, tableInfo]: [string, any]) => (
                  <div key={tableName} className={`p-4 rounded-lg border ${
                    tableInfo.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{tableName}</h4>
                      <div className={`w-3 h-3 rounded-full ${
                        tableInfo.exists ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {tableInfo.exists ? `${tableInfo.count} 条记录` : '表不存在'}
                    </p>
                    {tableInfo.exists && (
                      <p className="text-xs text-gray-500 mt-1">
                        {tableInfo.fields.length} 个字段
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-500">
                检查时间: {new Date(dbStatus.timestamp).toLocaleString()}
              </div>
            </div>
          )}

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

      {/* 项目创建弹窗 */}
      <ProjectCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
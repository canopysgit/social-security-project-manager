'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Upload, 
  Calculator, 
  Search, 
  Shield, 
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ProjectOverviewPage({ params }: { params: { id: string } }) {
  const pathname = usePathname()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 项目信息已经从layout中传入，这里可以从URL参数获取
    const loadProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`)
        const result = await response.json()
        
        if (result.success) {
          setProject(result.data)
        }
      } catch (error) {
        console.error('加载项目失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <div className="text-gray-500">加载中...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <div className="text-red-500">项目不存在</div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成'
      case 'in_progress':
        return '计算中'
      case 'failed':
        return '失败'
      default:
        return '待处理'
    }
  }

  const getStatusBadge = (status: string) => {
    const variant = status === 'completed' ? 'default' : 
                   status === 'in_progress' ? 'secondary' : 
                   status === 'failed' ? 'destructive' : 'outline'
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {getStatusText(status)}
      </Badge>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">项目概览</h1>
          <p className="text-gray-600 mt-2">查看项目整体状态和快速访问各功能模块</p>
        </div>

        {/* 项目基本信息 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>项目信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">项目名称</label>
                <p className="text-lg font-semibold text-gray-900">{project.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">项目ID</label>
                <p className="text-lg font-semibold text-gray-900">{project.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">公司名称</label>
                <p className="text-lg font-semibold text-gray-900">{project.company_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">项目周期</label>
                <p className="text-lg font-semibold text-gray-900">
                  {project.project_period.substring(0,4)}年{project.project_period.substring(4,6)}月
                </p>
              </div>
            </div>
            
            {project.description && (
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-500">项目描述</label>
                <p className="text-gray-700 mt-1">{project.description}</p>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="text-gray-500">创建时间</label>
                  <p className="text-gray-900">{new Date(project.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-gray-500">最后更新</label>
                  <p className="text-gray-900">{new Date(project.updated_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-gray-500">项目状态</label>
                  <div className="mt-1">
                    {getStatusBadge(project.stats.calculation_status)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数据统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{project.stats.total_employees}</h3>
                  <p className="text-gray-600">员工总数</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">{project.stats.salary_records_count}</h3>
                  <p className="text-gray-600">工资记录</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calculator className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">0</h3>
                  <p className="text-gray-600">计算结果</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                {getStatusIcon(project.stats.calculation_status)}
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-gray-900">{getStatusText(project.stats.calculation_status)}</h3>
                  <p className="text-gray-600">计算状态</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作入口 */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href={`/projects/${params.id}/policy-config`}>
                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <Settings className="h-8 w-8 text-indigo-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">政策配置</h3>
                  <p className="text-sm text-gray-600">选择或创建适用的社保政策规则</p>
                </div>
              </Link>

              <Link href={`/projects/${params.id}/upload-config`}>
                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <Upload className="h-8 w-8 text-blue-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">上传配置</h3>
                  <p className="text-sm text-gray-600">配置工资数据模式和字段映射</p>
                </div>
              </Link>

              <Link href={`/projects/${params.id}/upload`}>
                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <Upload className="h-8 w-8 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">数据上传</h3>
                  <p className="text-sm text-gray-600">上传Excel工资数据文件</p>
                </div>
              </Link>

              <Link href={`/projects/${params.id}/calculate`}>
                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <Calculator className="h-8 w-8 text-purple-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">执行计算</h3>
                  <p className="text-sm text-gray-600">运行社保补缴计算</p>
                </div>
              </Link>

              <Link href={`/projects/${params.id}/results`}>
                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <Search className="h-8 w-8 text-yellow-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">结果查询</h3>
                  <p className="text-sm text-gray-600">查询和导出计算结果</p>
                </div>
              </Link>

              <Link href={`/projects/${params.id}/compliance`}>
                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <Shield className="h-8 w-8 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">合规分析</h3>
                  <p className="text-sm text-gray-600">检查数据合规性</p>
                </div>
              </Link>

              <Link href={`/projects/${params.id}/calc-config`}>
                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <Calculator className="h-8 w-8 text-orange-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">计算配置</h3>
                  <p className="text-sm text-gray-600">配置计算参数和规则</p>
                </div>
              </Link>

              <div className="p-6 border border-gray-200 rounded-lg opacity-50">
                <FileText className="h-8 w-8 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">更多功能</h3>
                <p className="text-sm text-gray-600">敬请期待...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { Project, Company, PolicyRule } from '@/lib/types'

export default function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const [project, setProject] = useState<Project | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [policies, setPolicies] = useState<PolicyRule[]>([])
  const [projectId, setProjectId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProjectId = async () => {
      const { id } = await params
      setProjectId(id)
    }
    getProjectId()
  }, [params])

  useEffect(() => {
    const loadData = async () => {
      if (!projectId) return
      
      try {
        
        // 加载项目信息
        const projectResponse = await fetch(`/api/projects/${projectId}`)
        const projectResult = await projectResponse.json()
        
        if (projectResult.success) {
          setProject(projectResult.data)
        }
        
        // 加载公司信息
        const companiesResponse = await fetch(`/api/companies?project_id=${projectId}`)
        const companiesResult = await companiesResponse.json()
        
        if (companiesResult.success) {
          setCompanies(companiesResult.data || [])
        }
        
        // 加载政策信息
        const policiesResponse = await fetch('/api/policies')
        const policiesResult = await policiesResponse.json()
        
        if (policiesResult.success) {
          setPolicies(policiesResult.data || [])
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      loadData()
    }
  }, [projectId])

  // 辅助函数：获取政策名称
  const getPolicyName = (policyId: string) => {
    const policy = policies.find(p => p.id === policyId)
    return policy ? `${policy.city} ${policy.year}年${policy.period}` : policyId
  }

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

  // 获取步骤的动态状态
  const getStepsWithStatus = () => {
    const steps = getProjectSteps()
    
    return steps.map(step => {
      let status = 'pending'
      let description = step.description
      
      // 根据实际数据判断状态
      if (step.id === 'companies') {
        if (companies.length > 0) {
          status = 'completed'
          description = `已配置 ${companies.length} 个公司`
        }
      } else if (step.id === 'policy-config') {
        // 检查是否所有公司都配置了政策
        if (companies.length > 0) {
          const companiesWithPolicy = companies.filter(company => company.selected_policy_id)
          if (companiesWithPolicy.length === companies.length) {
            status = 'completed'
            description = `所有公司已配置政策`
          } else if (companiesWithPolicy.length > 0) {
            status = 'in_progress'
            description = `${companiesWithPolicy.length}/${companies.length} 个公司已配置政策`
          }
        }
      }
      // 后续步骤状态判断可以根据实际数据添加
      
      return {
        ...step,
        status,
        description,
        href: step.id === 'companies' ? 'companies' : step.href
      }
    })
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">项目概览</h1>
          <p className="text-gray-600 mt-2">查看项目整体状态和项目流程进度</p>
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
                <label className="text-sm font-medium text-gray-500">子公司数量</label>
                <p className="text-lg font-semibold text-gray-900">{companies.length} 个</p>
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

    
        {/* 子公司管理 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>子公司管理</CardTitle>
              {projectId && (
                <Link href={`/projects/${projectId}/companies`}>
                  <Button variant="outline" size="sm">
                    管理子公司
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {companies.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无子公司</h3>
                <p className="text-gray-600 mb-4">开始添加子公司以管理不同主体的社保政策</p>
                {projectId && (
                  <Link href={`/projects/${projectId}/companies`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      添加子公司
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {companies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Building2 className="h-6 w-6 text-blue-500" />
                      <div>
                        <h4 className="font-medium text-gray-900">{company.name}</h4>
                        <p className="text-sm text-gray-600">
                          {company.city}
                          {company.selected_policy_ids && company.selected_policy_ids.length > 0 && (
                            <> • 已配置政策: {company.selected_policy_ids.length}个</>
                          )}
                        </p>
                        {company.selected_policy_ids && company.selected_policy_ids.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {company.selected_policy_ids.map(policyId => getPolicyName(policyId)).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {company.selected_policy_id ? (
                        <Badge variant="default">已配置政策</Badge>
                      ) : (
                        <Badge variant="outline">未配置政策</Badge>
                      )}
                      {projectId && (
                        <Link href={`/projects/${projectId}/companies`}>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      {/* 项目步骤流程 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">项目流程</h2>
          
          {/* 步骤列表 */}
          <div className="space-y-3">
            {getStepsWithStatus().map((step, index) => (
              <Card key={step.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                          {getStepStatusIcon(step.status)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                    <Link href={step.href && projectId ? `/projects/${projectId}/${step.href}` : (projectId ? `/projects/${projectId}/companies` : '#')}>
                      <Button variant="outline" size="sm">
                        {step.status === 'completed' ? '查看' : 
                         step.status === 'in_progress' ? '继续' : '开始'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 步骤配置
const getProjectSteps = () => {
  return [
    {
      id: 'companies',
      title: '子公司管理',
      description: '管理项目下的子公司信息',
      href: '',
      status: 'pending' // 将根据实际数据动态判断
    },
    {
      id: 'policy-config',
      title: '政策配置',
      description: '为每个子公司选择对应城市的社保规则',
      href: 'companies', // 修改为跳转到子公司管理页面
      status: 'pending'
    },
    {
      id: 'upload-config',
      title: '上传配置',
      description: '配置工资字段映射和数据格式',
      href: 'upload-config',
      status: 'pending'
    },
    {
      id: 'data-upload',
      title: '数据上传',
      description: '上传工资数据文件（完整月工资或平均工资还原）',
      href: 'upload',
      status: 'pending'
    },
    {
      id: 'calc-config',
      title: '计算配置',
      description: '配置工资计算规则和参数',
      href: 'calc-config',
      status: 'pending'
    },
    {
      id: 'calculate',
      title: '执行计算',
      description: '运行社保补缴计算',
      href: 'calculate',
      status: 'pending'
    },
    {
      id: 'results',
      title: '结果查询',
      description: '查询和导出计算结果',
      href: 'results',
      status: 'pending'
    },
    {
      id: 'actual-upload',
      title: '实缴数据上传',
      description: '上传实际缴费数据用于对比分析',
      href: 'actual-upload',
      status: 'pending'
    },
    {
      id: 'compliance',
      title: '合规分析',
      description: '应缴vs实缴对比分析',
      href: 'compliance',
      status: 'pending'
    }
  ]
}

// 获取步骤状态图标
const getStepStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'in_progress':
      return <Clock className="h-4 w-4 text-blue-500" />
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    default:
      return <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
  }
}
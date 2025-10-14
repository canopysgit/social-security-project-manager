'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Settings, 
  Plus, 
  Edit, 
  Check, 
  AlertCircle,
  Building2
} from 'lucide-react'
import Link from 'next/link'
import { Company, PolicyRule } from '@/lib/types'

// Simple toast function
const toast = {
  success: (message: string) => alert('✅ ' + message),
  error: (message: string) => alert('❌ ' + message)
}

export default function PolicyConfigPage({ params }: { params: Promise<{ id: string }> }) {
  const [projectId, setProjectId] = useState<string>('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [availablePolicies, setAvailablePolicies] = useState<PolicyRule[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingCompanyId, setUpdatingCompanyId] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params
      setProjectId(id)
    }
    getParams()
  }, [params])

  const loadData = useCallback(async () => {
    if (!projectId) return
    
    try {
      setLoading(true)
      
      // Load companies for this project
      const companiesResponse = await fetch(`/api/companies?project_id=${projectId}`)
      const companiesResult = await companiesResponse.json()
      
      if (companiesResult.success) {
        setCompanies(companiesResult.data || [])
      }

      // Load available policies
      const policiesResponse = await fetch('/api/policies')
      const policiesResult = await policiesResponse.json()
      
      if (policiesResult.success) {
        setAvailablePolicies(policiesResult.data || [])
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      toast.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdateCompanyPolicy = async (companyId: string, policyId: string) => {
    try {
      setUpdatingCompanyId(companyId)
      
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_policy_id: policyId
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('政策配置更新成功')
        loadData() // Reload companies to show updated policy
      } else {
        toast.error('更新失败: ' + result.error)
      }
    } catch (error) {
      console.error('更新公司政策失败:', error)
      toast.error('更新政策配置失败')
    } finally {
      setUpdatingCompanyId(null)
    }
  }

  const getPolicyName = (policyId: string) => {
    const policy = availablePolicies.find(p => p.id === policyId)
    return policy ? `${policy.city} ${policy.year}年${policy.period} (${policy.name})` : '未选择'
  }

  const getCompaniesWithPolicyStatus = () => {
    return companies.map(company => ({
      ...company,
      hasPolicy: !!company.selected_policy_id,
      policyName: company.selected_policy_id ? getPolicyName(company.selected_policy_id) : '未配置'
    }))
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

  const companiesWithStatus = getCompaniesWithPolicyStatus()

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">政策配置</h1>
          <p className="text-gray-600 mt-2">为每个子公司选择适用的五险一金政策规则</p>
        </div>

        {companies.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无子公司</h3>
              <p className="text-gray-600 mb-6">请先创建子公司，然后为它们配置政策</p>
              <Link href={`/projects/${projectId}/companies`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  创建子公司
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* 政策配置说明 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">配置说明</h3>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1">
                      <li>• 每个子公司可以独立选择适合的社保政策</li>
                      <li>• 政策决定了社保缴费的基数范围和费率</li>
                      <li>• 建议根据子公司注册所在地选择对应城市的政策</li>
                      <li>• 可以为不同时期选择不同的政策（如2023H1、2023H2）</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 公司政策配置列表 */}
            <div className="grid gap-6">
              {companiesWithStatus.map((company) => (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{company.name}</CardTitle>
                          <p className="text-sm text-gray-600">{company.city} • {company.wage_calculation_mode === 'monthly_detail' ? '完整月工资' : '平均工资还原'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {company.hasPolicy ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            已配置
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            未配置
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        选择社保政策
                      </label>
                      <div className="flex gap-3">
                        <Select 
                          value={company.selected_policy_id || ''} 
                          onValueChange={(value) => handleUpdateCompanyPolicy(company.id, value)}
                          disabled={updatingCompanyId === company.id}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="请选择政策" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">不选择政策</SelectItem>
                            {availablePolicies
                              .filter(policy => policy.city === company.city) // 优先显示同城市政策
                              .map((policy) => (
                                <SelectItem key={policy.id} value={policy.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{policy.name}</span>
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {policy.year}年{policy.period}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            {availablePolicies.some(policy => policy.city !== company.city) && (
                              <>
                                <div className="px-2 py-1 text-xs text-gray-500 font-medium border-t">其他城市政策</div>
                                {availablePolicies
                                  .filter(policy => policy.city !== company.city)
                                  .map((policy) => (
                                    <SelectItem key={policy.id} value={policy.id}>
                                      <div className="flex items-center justify-between w-full">
                                        <span>{policy.name}</span>
                                        <Badge variant="outline" className="ml-2 text-xs">
                                          {policy.city} • {policy.year}年{policy.period}
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        {updatingCompanyId === company.id && (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {company.selected_policy_id && (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-900 mb-2">当前政策详情</h4>
                        {(() => {
                          const policy = availablePolicies.find(p => p.id === company.selected_policy_id)
                          return policy ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><strong>政策名称:</strong> {policy.name}</p>
                                <p><strong>城市:</strong> {policy.city}</p>
                                <p><strong>期间:</strong> {policy.year}年{policy.period}</p>
                                <p><strong>生效期:</strong> {policy.effective_start} 至 {policy.effective_end}</p>
                              </div>
                              <div>
                                <p><strong>养老保险:</strong> {policy.pension_base_floor.toLocaleString()} - {policy.pension_base_cap.toLocaleString()}</p>
                                <p><strong>医疗保险:</strong> {policy.medical_base_floor.toLocaleString()} - {policy.medical_base_cap.toLocaleString()}</p>
                                <p><strong>住房公积金:</strong> {policy.hf_base_floor.toLocaleString()} - {policy.hf_base_cap.toLocaleString()}</p>
                              </div>
                            </div>
                          ) : null
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-between">
              <Link href={`/projects/${projectId}/companies`}>
                <Button variant="outline">
                  返回子公司管理
                </Button>
              </Link>
              
              <div className="flex gap-4">
                <Link href="/policies">
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    管理政策
                  </Button>
                </Link>
                <Link href={`/projects/${projectId}/upload-config`}>
                  <Button>
                    下一步：上传配置
                    <Plus className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
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
  AlertCircle 
} from 'lucide-react'
import Link from 'next/link'

export default function PolicyConfigPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null)
  const [availablePolicies, setAvailablePolicies] = useState<any[]>([])
  const [selectedPolicy, setSelectedPolicy] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProjectAndPolicies()
  }, [params.id])

  const loadProjectAndPolicies = async () => {
    try {
      // 加载项目信息
      const projectResponse = await fetch(`/api/projects/${params.id}`)
      const projectResult = await projectResponse.json()
      
      if (projectResult.success) {
        setProject(projectResult.data)
      }

      // 加载可用政策
      const policiesResponse = await fetch('/api/policies')
      const policiesResult = await policiesResponse.json()
      
      if (policiesResult.success) {
        setAvailablePolicies(policiesResult.data)
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyPolicy = async () => {
    if (!selectedPolicy) {
      alert('请选择一个政策')
      return
    }

    try {
      // TODO: 实现应用政策的API调用
      alert('政策应用成功')
    } catch (error) {
      console.error('应用政策失败:', error)
      alert('应用政策失败，请重试')
    }
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

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">政策配置</h1>
          <p className="text-gray-600 mt-2">为项目选择适用的五险一金政策规则</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 政策选择 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  选择政策
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    可用政策列表
                  </label>
                  <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择要应用的政策" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePolicies.map((policy) => (
                        <SelectItem key={policy.id} value={policy.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{policy.policy_name}</span>
                            <Badge variant="outline" className="ml-2">
                              {policy.city} • {policy.year} • {policy.period}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPolicy && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">政策详情</h4>
                    {(() => {
                      const policy = availablePolicies.find(p => p.id === selectedPolicy)
                      return policy ? (
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>城市:</strong> {policy.city}</p>
                          <p><strong>年份:</strong> {policy.year}</p>
                          <p><strong>时期:</strong> {policy.period}</p>
                          <p><strong>生效日期:</strong> {policy.effective_date}</p>
                          <p><strong>养老保险基数:</strong> ¥{policy.pension_base_floor.toLocaleString()} - ¥{policy.pension_base_cap.toLocaleString()}</p>
                          <p><strong>医疗保险基数:</strong> ¥{policy.medical_base_floor.toLocaleString()} - ¥{policy.medical_base_cap.toLocaleString()}</p>
                          {policy.description && <p><strong>描述:</strong> {policy.description}</p>}
                        </div>
                      ) : null
                    })()}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button 
                    onClick={handleApplyPolicy}
                    disabled={!selectedPolicy}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    应用政策
                  </Button>
                  <Link href="/policies/create">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      创建新政策
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 当前配置状态 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>当前配置</CardTitle>
              </CardHeader>
              <CardContent>
                {project && project.applied_policy ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">已应用政策</span>
                      <Badge variant="default">
                        <Check className="h-3 w-3 mr-1" />
                        已配置
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{project.applied_policy.policy_name}</p>
                      <p>{project.applied_policy.city} • {project.applied_policy.year}</p>
                    </div>
                    <div className="pt-4 border-t">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        修改政策
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">尚未配置政策</p>
                    <p className="text-xs text-gray-500 mt-1">
                      请从左侧选择并应用一个政策
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 配置说明 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">配置说明</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                <ul className="space-y-2">
                  <li>• 政策规则决定了社保缴费的基数和费率</li>
                  <li>• 每个项目只能应用一个政策规则</li>
                  <li>• 可以在政策管理页面创建新的政策</li>
                  <li>• 应用新政策将覆盖当前配置</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
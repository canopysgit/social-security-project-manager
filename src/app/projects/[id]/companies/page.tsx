'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
// 简单的toast函数实现
const toast = {
  success: (message: string) => alert('✅ ' + message),
  error: (message: string) => alert('❌ ' + message)
}
import { Company, CompanyCreateForm, PolicyRule } from '@/lib/types'
import { Building2, Plus, Edit, Trash2, Settings, FileText } from 'lucide-react'

export default function CompaniesPage() {
  const params = useParams()
  const router = useRouter()
  const [projectId, setProjectId] = useState<string>('')

  useEffect(() => {
    const getProjectId = async () => {
      if (params.id) {
        setProjectId(params.id as string)
      }
    }
    getProjectId()
  }, [params.id])

  const [companies, setCompanies] = useState<Company[]>([])
  const [policies, setPolicies] = useState<PolicyRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState<CompanyCreateForm>({
    name: '',
    city: '',
    selected_policy_ids: []
  })

  // 加载公司列表
  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/companies?project_id=${projectId}`)
      const result = await response.json()
      
      if (result.success) {
        setCompanies(result.data || [])
      } else {
        toast.error('加载子公司列表失败: ' + result.error)
      }
    } catch (error) {
      toast.error('加载子公司列表失败')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // 加载政策列表
  const loadPolicies = useCallback(async () => {
    try {
      const response = await fetch('/api/policies')
      const result = await response.json()
      
      if (result.success) {
        setPolicies(result.data || [])
      }
    } catch (error) {
      console.error('加载政策列表失败:', error)
    }
  }, [])

  // 创建公司
  const handleCreateCompany = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入子公司名称')
      return
    }
    
    if (!formData.city.trim()) {
      toast.error('请选择城市')
      return
    }

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          project_id: projectId
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('子公司创建成功')
        setShowCreateModal(false)
        setFormData({
          name: '',
          city: '',
          selected_policy_ids: []
        })
        loadCompanies()
      } else {
        toast.error('创建失败: ' + result.error)
      }
    } catch (error) {
      toast.error('创建子公司失败')
    }
  }

  // 更新公司
  const handleUpdateCompany = async () => {
    if (!editingCompany) return
    
    if (!formData.name.trim()) {
      toast.error('请输入子公司名称')
      return
    }
    
    if (!formData.city.trim()) {
      toast.error('请选择城市')
      return
    }

    try {
      const response = await fetch(`/api/companies/${editingCompany.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          project_id: projectId
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('子公司信息更新成功')
        setShowEditModal(false)
        setEditingCompany(null)
        setFormData({
          name: '',
          city: '',
          selected_policy_ids: []
        })
        loadCompanies()
      } else {
        toast.error('更新失败: ' + result.error)
      }
    } catch (error) {
      toast.error('更新子公司信息失败')
    }
  }

  // 删除公司
  const handleDeleteCompany = async (company: Company) => {
    if (!confirm(`确定要删除子公司"${company.name}"吗？`)) {
      return
    }

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('子公司删除成功')
        loadCompanies()
      } else {
        toast.error('删除失败: ' + result.error)
      }
    } catch (error) {
      toast.error('删除子公司失败')
    }
  }

  // 打开编辑弹窗
  const openEditModal = (company: Company) => {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      city: company.city,
      selected_policy_ids: company.selected_policy_ids || []
    })
    setShowEditModal(true)
  }

  // 获取政策名称（支持多政策）
  const getPolicyNames = (policyIds: string[]) => {
    if (policyIds.length === 0) return '未选择'
    return policyIds.map(id => {
      const policy = policies.find(p => p.id === id)
      return policy ? `${policy.city} ${policy.year}年${policy.period}` : '未知政策'
    }).join(', ')
  }

  // 获取工资模式名称
  const getWageModeName = (mode: string) => {
    return mode === 'monthly_detail' ? '完整月工资' : '平均工资还原'
  }

  useEffect(() => {
    if (projectId) {
      loadCompanies()
      loadPolicies()
    }
  }, [projectId, loadCompanies, loadPolicies])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载子公司列表中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">子公司管理</h1>
          <p className="text-gray-600 mt-2">管理项目下的子公司信息和配置</p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => projectId && router.push(`/projects/${projectId}`)}
          >
            返回项目
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            添加子公司
          </Button>
        </div>
      </div>

      {/* 子公司列表 */}
      {companies.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无子公司</h3>
            <p className="text-gray-600 mb-6">点击&ldquo;添加子公司&rdquo;开始创建第一个子公司</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              添加子公司
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {company.name}
                      </h3>
                      <Badge variant="secondary">
                        {company.city}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-sm text-gray-600">选择政策</Label>
                        <p className="font-medium text-sm">{getPolicyNames(company.selected_policy_ids || [])}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">创建时间</Label>
                        <p className="font-medium">
                          {new Date(company.created_at).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(company)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCompany(company)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 创建公司弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">添加子公司</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">子公司名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入子公司名称"
                />
              </div>
              
              <div>
                <Label htmlFor="city">所在城市 *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="请输入所在城市"
                />
              </div>
              
              <div>
                <Label>选择政策（可选）</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {policies.length === 0 ? (
                    <p className="text-sm text-gray-500">暂无可用政策</p>
                  ) : (
                    policies.map((policy) => (
                      <div key={policy.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`policy-${policy.id}`}
                          checked={formData.selected_policy_ids.includes(policy.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                selected_policy_ids: [...prev.selected_policy_ids, policy.id]
                              }))
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                selected_policy_ids: prev.selected_policy_ids.filter(id => id !== policy.id)
                              }))
                            }
                          }}
                        />
                        <Label
                          htmlFor={`policy-${policy.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {policy.city} {policy.year}年{policy.period}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                {formData.selected_policy_ids.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">已选择 {formData.selected_policy_ids.length} 个政策：</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.selected_policy_ids.map(policyId => {
                        const policy = policies.find(p => p.id === policyId)
                        return policy ? (
                          <Badge key={policyId} variant="secondary" className="text-xs">
                            {policy.city} {policy.year}年{policy.period}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                取消
              </Button>
              <Button onClick={handleCreateCompany}>
                创建
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑公司弹窗 */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">编辑子公司</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
          <div>
            <Label htmlFor="edit_name">子公司名称 *</Label>
            <Input
              id="edit_name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="请输入子公司名称"
            />
          </div>
          
          <div>
            <Label htmlFor="edit_city">所在城市 *</Label>
            <Select
              value={formData.city}
              onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择城市" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="佛山市">佛山市</SelectItem>
                <SelectItem value="广州市">广州市</SelectItem>
                <SelectItem value="深圳市">深圳市</SelectItem>
                <SelectItem value="东莞市">东莞市</SelectItem>
                <SelectItem value="中山市">中山市</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="edit_selected_policy_id">选择政策（可选）</Label>
            <Select
              value={formData.selected_policy_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, selected_policy_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择政策" />
              </SelectTrigger>
              <SelectContent>
                {policies.map((policy) => (
                  <SelectItem key={policy.id} value={policy.id}>
                    {policy.city} {policy.year}年{policy.period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                取消
              </Button>
              <Button onClick={handleUpdateCompany}>
                更新
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
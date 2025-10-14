'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreatePolicyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    policy_name: '',
    city: '',
    year: new Date().getFullYear(),
    period: 'H1',
    effective_date: '',
    description: '',
    
    // 养老保险
    pension_base_floor: 1900,
    pension_base_cap: 24330,
    pension_rate_individual: 0.08,
    pension_rate_company: 0.14,
    
    // 医疗保险
    medical_base_floor: 1900,
    medical_base_cap: 24330,
    medical_rate_individual: 0.02,
    medical_rate_company: 0.055,
    
    // 失业保险
    unemployment_base_floor: 1900,
    unemployment_base_cap: 24330,
    unemployment_rate_individual: 0.0032,
    unemployment_rate_company: 0.008,
    
    // 工伤保险
    injury_base_floor: 1900,
    injury_base_cap: 24330,
    injury_rate_company: 0.001,
    
    // 住房公积金
    hf_base_floor: 1900,
    hf_base_cap: 34860,
    hf_rate_individual: 0.05,
    hf_rate_company: 0.05,
    
    is_active: true,
    created_by: 'system'
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 基本验证
    if (!formData.policy_name || !formData.city || !formData.effective_date) {
      alert('请填写必填字段')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('政策创建成功')
        router.push('/policies')
      } else {
        alert(`创建失败: ${result.error}`)
      }
    } catch (error) {
      console.error('创建政策失败:', error)
      alert('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* 页面标题和操作栏 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/policies">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">创建新政策</h1>
              <p className="text-gray-600 mt-2">创建五险一金政策规则</p>
            </div>
          </div>
        </div>

      <form onSubmit={handleSubmit}>
        {/* 基本信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="policy_name">政策名称 *</Label>
                <Input
                  id="policy_name"
                  value={formData.policy_name}
                  onChange={(e) => handleInputChange('policy_name', e.target.value)}
                  placeholder="如：佛山2024年上半年五险一金政策"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="city">城市 *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="如：佛山"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="year">年份 *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  min="2020"
                  max="2030"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="period">时期 *</Label>
                <Select 
                  value={formData.period} 
                  onValueChange={(value) => handleInputChange('period', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择时期" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="H1">上半年 (H1)</SelectItem>
                    <SelectItem value="H2">下半年 (H2)</SelectItem>
                    <SelectItem value="Q1">第一季度 (Q1)</SelectItem>
                    <SelectItem value="Q2">第二季度 (Q2)</SelectItem>
                    <SelectItem value="Q3">第三季度 (Q3)</SelectItem>
                    <SelectItem value="Q4">第四季度 (Q4)</SelectItem>
                    <SelectItem value="全年">全年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="effective_date">生效日期 *</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => handleInputChange('effective_date', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">政策描述</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="可选的政策描述"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 养老保险 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>养老保险</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="pension_base_floor">缴费基数下限</Label>
                <Input
                  id="pension_base_floor"
                  type="number"
                  value={formData.pension_base_floor}
                  onChange={(e) => handleInputChange('pension_base_floor', parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="pension_base_cap">缴费基数上限</Label>
                <Input
                  id="pension_base_cap"
                  type="number"
                  value={formData.pension_base_cap}
                  onChange={(e) => handleInputChange('pension_base_cap', parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="pension_rate_individual">个人缴费比例</Label>
                <Input
                  id="pension_rate_individual"
                  type="number"
                  step="0.0001"
                  value={formData.pension_rate_individual}
                  onChange={(e) => handleInputChange('pension_rate_individual', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="1"
                />
              </div>
              
              <div>
                <Label htmlFor="pension_rate_company">单位缴费比例</Label>
                <Input
                  id="pension_rate_company"
                  type="number"
                  step="0.0001"
                  value={formData.pension_rate_company}
                  onChange={(e) => handleInputChange('pension_rate_company', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 医疗保险 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>医疗保险</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="medical_base_floor">缴费基数下限</Label>
                <Input
                  id="medical_base_floor"
                  type="number"
                  value={formData.medical_base_floor}
                  onChange={(e) => handleInputChange('medical_base_floor', parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="medical_base_cap">缴费基数上限</Label>
                <Input
                  id="medical_base_cap"
                  type="number"
                  value={formData.medical_base_cap}
                  onChange={(e) => handleInputChange('medical_base_cap', parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="medical_rate_individual">个人缴费比例</Label>
                <Input
                  id="medical_rate_individual"
                  type="number"
                  step="0.0001"
                  value={formData.medical_rate_individual}
                  onChange={(e) => handleInputChange('medical_rate_individual', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="1"
                />
              </div>
              
              <div>
                <Label htmlFor="medical_rate_company">单位缴费比例</Label>
                <Input
                  id="medical_rate_company"
                  type="number"
                  step="0.0001"
                  value={formData.medical_rate_company}
                  onChange={(e) => handleInputChange('medical_rate_company', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 失业保险 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>失业保险</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="unemployment_base_floor">缴费基数下限</Label>
                <Input
                  id="unemployment_base_floor"
                  type="number"
                  value={formData.unemployment_base_floor}
                  onChange={(e) => handleInputChange('unemployment_base_floor', parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="unemployment_base_cap">缴费基数上限</Label>
                <Input
                  id="unemployment_base_cap"
                  type="number"
                  value={formData.unemployment_base_cap}
                  onChange={(e) => handleInputChange('unemployment_base_cap', parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>
              
              <div>
                <Label htmlFor="unemployment_rate_individual">个人缴费比例</Label>
                <Input
                  id="unemployment_rate_individual"
                  type="number"
                  step="0.0001"
                  value={formData.unemployment_rate_individual}
                  onChange={(e) => handleInputChange('unemployment_rate_individual', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="1"
                />
              </div>
              
              <div>
                <Label htmlFor="unemployment_rate_company">单位缴费比例</Label>
                <Input
                  id="unemployment_rate_company"
                  type="number"
                  step="0.0001"
                  value={formData.unemployment_rate_company}
                  onChange={(e) => handleInputChange('unemployment_rate_company', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 工伤保险和住房公积金 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>工伤保险</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="injury_base_floor">缴费基数下限</Label>
                  <Input
                    id="injury_base_floor"
                    type="number"
                    value={formData.injury_base_floor}
                    onChange={(e) => handleInputChange('injury_base_floor', parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="injury_base_cap">缴费基数上限</Label>
                  <Input
                    id="injury_base_cap"
                    type="number"
                    value={formData.injury_base_cap}
                    onChange={(e) => handleInputChange('injury_base_cap', parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="injury_rate_company">单位缴费比例</Label>
                  <Input
                    id="injury_rate_company"
                    type="number"
                    step="0.0001"
                    value={formData.injury_rate_company}
                    onChange={(e) => handleInputChange('injury_rate_company', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>住房公积金</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="hf_base_floor">缴费基数下限</Label>
                  <Input
                    id="hf_base_floor"
                    type="number"
                    value={formData.hf_base_floor}
                    onChange={(e) => handleInputChange('hf_base_floor', parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="hf_base_cap">缴费基数上限</Label>
                  <Input
                    id="hf_base_cap"
                    type="number"
                    value={formData.hf_base_cap}
                    onChange={(e) => handleInputChange('hf_base_cap', parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="hf_rate_individual">个人缴费比例</Label>
                  <Input
                    id="hf_rate_individual"
                    type="number"
                    step="0.0001"
                    value={formData.hf_rate_individual}
                    onChange={(e) => handleInputChange('hf_rate_individual', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="hf_rate_company">单位缴费比例</Label>
                  <Input
                    id="hf_rate_company"
                    type="number"
                    step="0.0001"
                    value={formData.hf_rate_company}
                    onChange={(e) => handleInputChange('hf_rate_company', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end gap-4">
          <Link href="/policies">
            <Button variant="outline" disabled={loading}>
              取消
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? '创建中...' : '创建政策'}
          </Button>
        </div>
      </form>
      </div>
    </div>
  )
}
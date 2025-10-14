'use client'

import { useState, useEffect } from 'react'
import { PolicyRule } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PlusCircle, Edit, Trash2, Search, Filter, Upload, FileText } from 'lucide-react'
import Link from 'next/link'
import { formatRateDisplay, formatBaseDisplay } from '@/lib/excel-parser'

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyRule[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCity, setFilterCity] = useState<string>('all')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [cities, setCities] = useState<string[]>([])
  const [years, setYears] = useState<string[]>([])

  // 加载政策数据
  const loadPolicies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/policies')
      const result = await response.json()
      
      if (result.success) {
        setPolicies(result.data || [])
        
        // 提取城市和年份选项
        const uniqueCities = Array.from(new Set((result.data || []).map((p: PolicyRule) => p.city)))
        const uniqueYears = Array.from(new Set((result.data || []).map((p: PolicyRule) => p.year.toString())))
        
        setCities(uniqueCities)
        setYears(uniqueYears.sort((a, b) => parseInt(b) - parseInt(a)))
      } else {
        console.error('加载政策失败:', result.error)
      }
    } catch (error) {
      console.error('加载政策失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 删除政策
  const deletePolicy = async (id: string, policyName: string) => {
    if (!confirm(`确定要删除政策"${policyName}"吗？`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/policies/${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('政策删除成功')
        loadPolicies() // 重新加载数据
      } else {
        alert(`删除失败: ${result.error}`)
      }
    } catch (error) {
      console.error('删除政策失败:', error)
      alert('删除失败，请重试')
    }
  }

  // 筛选政策
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = filterCity === 'all' || policy.city === filterCity
    const matchesYear = filterYear === 'all' || policy.year.toString() === filterYear
    
    return matchesSearch && matchesCity && matchesYear
  })

  useEffect(() => {
    loadPolicies()
  }, [])

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* 页面标题和操作栏 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">政策管理</h1>
            <p className="text-gray-600 mt-2">管理五险一金政策规则，支持Excel批量导入</p>
          </div>
          <div className="flex gap-2">
            <Link href="/policies/import">
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Excel导入
              </Button>
            </Link>
            <Link href="/policies/create">
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                手动创建
              </Button>
            </Link>
          </div>
        </div>

      {/* 搜索和筛选栏 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索政策名称或城市..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* 城市筛选 */}
            <div className="w-40">
              <Select value={filterCity} onValueChange={setFilterCity}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="筛选城市" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有城市</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* 年份筛选 */}
            <div className="w-32">
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger>
                  <SelectValue placeholder="筛选年份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有年份</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 政策列表 */}
      <Card>
        <CardHeader>
          <CardTitle>政策列表 ({filteredPolicies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">
                {searchTerm || filterCity !== 'all' || filterYear !== 'all' 
                  ? '没有找到符合条件的政策' 
                  : '暂无政策数据'
                }
              </div>
              <div className="mt-4 flex gap-2 justify-center">
                <Link href="/policies/import">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    导入政策
                  </Button>
                </Link>
                <Link href="/policies/create">
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    创建政策
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>政策名称</TableHead>
                    <TableHead>城市</TableHead>
                    <TableHead>时期</TableHead>
                    <TableHead>有效期</TableHead>
                    <TableHead>养老保险</TableHead>
                    <TableHead>医疗保险</TableHead>
                    <TableHead>失业保险</TableHead>
                    <TableHead>工伤保险</TableHead>
                    <TableHead>住房公积金</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{policy.name}</div>
                          <div className="text-sm text-gray-500">ID: {policy.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>{policy.city}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {policy.year}{policy.period}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{policy.effective_start}</div>
                          <div className="text-gray-500">至 {policy.effective_end}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-600">基数范围</div>
                          <div>{formatBaseDisplay(policy.pension_base_floor)}-{formatBaseDisplay(policy.pension_base_cap)}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            费率: {formatRateDisplay(policy.pension_rate_staff)}/{formatRateDisplay(policy.pension_rate_enterprise)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-600">基数范围</div>
                          <div>{formatBaseDisplay(policy.medical_base_floor)}-{formatBaseDisplay(policy.medical_base_cap)}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            费率: {formatRateDisplay(policy.medical_rate_staff)}/{formatRateDisplay(policy.medical_rate_enterprise)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-600">基数范围</div>
                          <div>{formatBaseDisplay(policy.unemployment_base_floor)}-{formatBaseDisplay(policy.unemployment_base_cap)}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            费率: {formatRateDisplay(policy.unemployment_rate_staff)}/{formatRateDisplay(policy.unemployment_rate_enterprise)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-600">基数范围</div>
                          <div>{formatBaseDisplay(policy.injury_base_floor)}-{formatBaseDisplay(policy.injury_base_cap)}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            费率: {formatRateDisplay(policy.injury_rate_staff)}/{formatRateDisplay(policy.injury_rate_enterprise)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-600">基数范围</div>
                          <div>{formatBaseDisplay(policy.hf_base_floor)}-{formatBaseDisplay(policy.hf_base_cap)}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            费率: {formatRateDisplay(policy.hf_rate_staff)}/{formatRateDisplay(policy.hf_rate_enterprise)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/policies/${policy.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deletePolicy(policy.id, policy.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
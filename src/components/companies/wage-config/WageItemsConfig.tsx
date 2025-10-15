'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Settings, DollarSign } from 'lucide-react'

interface WageItemsConfigProps {
  dataMode: 'monthly_detail' | 'average_restore'
  wageItemsConfig?: any
  averageRestoreConfig?: any
  onChange: (config: any) => void
  onNext: () => void
  onPrevious: () => void
}

export function WageItemsConfig({ 
  dataMode, 
  wageItemsConfig, 
  averageRestoreConfig, 
  onChange, 
  onNext, 
  onPrevious 
}: WageItemsConfigProps) {
  const [config, setConfig] = useState({
    basic_salary: false,  // 改为可选，默认不选中
    total_salary: false,  // 改为可选，默认不选中
    bonus_items: [] as string[],
    allowance_items: [] as string[]
  })

  const [averageConfig, setAverageConfig] = useState({
    months_paid: 12
  })

  const [newBonusItem, setNewBonusItem] = useState('')
  const [newAllowanceItem, setNewAllowanceItem] = useState('')

  const handleWageItemChange = (key: keyof typeof config, value: any) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    onChange({
      wage_items_config: newConfig,
      average_restore_config: averageConfig
    })
  }

  const handleAverageConfigChange = (key: keyof typeof averageConfig, value: any) => {
    const newConfig = { ...averageConfig, [key]: value }
    setAverageConfig(newConfig)
    onChange({
      wage_items_config: config,
      average_restore_config: newConfig
    })
  }

  const addBonusItem = () => {
    if (newBonusItem.trim()) {
      const items = [...config.bonus_items, newBonusItem.trim()]
      handleWageItemChange('bonus_items', items)
      setNewBonusItem('')
    }
  }

  const removeBonusItem = (item: string) => {
    const items = config.bonus_items.filter(i => i !== item)
    handleWageItemChange('bonus_items', items)
  }

  const addAllowanceItem = () => {
    if (newAllowanceItem.trim()) {
      const items = [...config.allowance_items, newAllowanceItem.trim()]
      handleWageItemChange('allowance_items', items)
      setNewAllowanceItem('')
    }
  }

  const removeAllowanceItem = (item: string) => {
    const items = config.allowance_items.filter(i => i !== item)
    handleWageItemChange('allowance_items', items)
  }

  return (
    <div className="space-y-6">
      {/* 说明信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>工资项配置</span>
          </CardTitle>
          <CardDescription>
            选择需要包含在工资计算中的项目，这将决定Excel文件中需要哪些字段
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 基本工资项 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>基础工资项（可选）</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="basic_salary" 
              checked={config.basic_salary}
              onCheckedChange={(checked) => handleWageItemChange('basic_salary', checked as boolean)}
            />
            <Label htmlFor="basic_salary" className="font-medium">
              基本工资 (basic_salary)
            </Label>
            <Badge variant="outline">可选</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="total_salary" 
              checked={config.total_salary}
              onCheckedChange={(checked) => handleWageItemChange('total_salary', checked as boolean)}
            />
            <Label htmlFor="total_salary" className="font-medium">
              工资合计 (total_salary)
            </Label>
            <Badge variant="outline">可选</Badge>
          </div>
        </CardContent>
      </Card>

      {/* 奖金项 */}
      <Card>
        <CardHeader>
          <CardTitle>奖金项（可选）</CardTitle>
          <CardDescription>
            添加各种类型的奖金，如13薪、绩效奖金等
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.bonus_items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <span>{item}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => removeBonusItem(item)}
              >
                删除
              </Button>
            </div>
          ))}
          
          <div className="flex space-x-2">
            <Input
              placeholder="输入奖金项名称，如：13薪"
              value={newBonusItem}
              onChange={(e) => setNewBonusItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBonusItem()}
            />
            <Button onClick={addBonusItem}>添加</Button>
          </div>
        </CardContent>
      </Card>

      {/* 补贴项 */}
      <Card>
        <CardHeader>
          <CardTitle>补贴项（可选）</CardTitle>
          <CardDescription>
            添加各种类型的补贴，如餐补、交通补贴等
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.allowance_items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <span>{item}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => removeAllowanceItem(item)}
              >
                删除
              </Button>
            </div>
          ))}
          
          <div className="flex space-x-2">
            <Input
              placeholder="输入补贴项名称，如：餐补"
              value={newAllowanceItem}
              onChange={(e) => setNewAllowanceItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAllowanceItem()}
            />
            <Button onClick={addAllowanceItem}>添加</Button>
          </div>
        </CardContent>
      </Card>

      {/* 平均工资还原特有配置 */}
      {dataMode === 'average_restore' && (
        <Card>
          <CardHeader>
            <CardTitle>平均工资还原配置</CardTitle>
            <CardDescription>
              设置工资发放月数，用于支持13薪等情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="months_paid">工资发放月数</Label>
              <Input
                id="months_paid"
                type="number"
                min="1"
                max="15"
                value={averageConfig.months_paid}
                onChange={(e) => handleAverageConfigChange('months_paid', parseInt(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                例如：12表示标准12个月，13表示包含13薪
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>上一步</span>
        </Button>
        <Button onClick={onNext} className="flex items-center space-x-2">
          <span>下一步：字段映射</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, ArrowRight, ArrowRightLeft } from 'lucide-react'

interface FieldMappingManagerProps {
  dataMode: 'monthly_detail' | 'average_restore'
  wageItemsConfig?: any
  fieldMapping: any
  onChange: (mapping: any) => void
  onNext: () => void
  onPrevious: () => void
}

export function FieldMappingManager({ 
  dataMode, 
  wageItemsConfig, 
  fieldMapping, 
  onChange, 
  onNext, 
  onPrevious 
}: FieldMappingManagerProps) {
  const [mapping, setMapping] = useState(fieldMapping || {})

  // 系统字段列表
  const systemFields = [
    { value: 'basic', label: '基本工资 (basic)', required: false },
    { value: 'total', label: '工资合计 (total)', required: false },
    { value: 'bonus1', label: '奖金项1 (bonus1)', required: false },
    { value: 'bonus2', label: '奖金项2 (bonus2)', required: false },
    { value: 'bonus3', label: '奖金项3 (bonus3)', required: false },
    { value: 'bonus4', label: '奖金项4 (bonus4)', required: false },
    { value: 'bonus5', label: '奖金项5 (bonus5)', required: false },
    { value: 'allowance1', label: '补贴项1 (allowance1)', required: false },
    { value: 'allowance2', label: '补贴项2 (allowance2)', required: false },
    { value: 'allowance3', label: '补贴项3 (allowance3)', required: false },
    { value: 'allowance4', label: '补贴项4 (allowance4)', required: false },
    { value: 'allowance5', label: '补贴项5 (allowance5)', required: false },
  ]

  const handleMappingChange = (systemField: string, excelField: string) => {
    const newMapping = { ...mapping, [systemField]: excelField }
    setMapping(newMapping)
    onChange(newMapping)
  }

  return (
    <div className="space-y-6">
      {/* 说明信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRightLeft className="h-5 w-5" />
            <span>字段映射配置</span>
          </CardTitle>
          <CardDescription>
            手动输入Excel文件中的字段名，将其映射到系统中的标准字段名
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 字段映射配置 */}
      <Card>
        <CardHeader>
          <CardTitle>字段映射关系</CardTitle>
          <CardDescription>
            请在右侧输入框中填写Excel文件中对应的字段名
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemFields.map((field) => (
              <div key={field.value} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <Label className="font-medium">{field.label}</Label>
                </div>
                <div className="text-center text-muted-foreground">→</div>
                <div>
                  <Input
                    placeholder="输入Excel中的字段名"
                    value={mapping[field.value] || ''}
                    onChange={(e) => handleMappingChange(field.value, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* 提示信息 */}
          <Alert>
            <ArrowRightLeft className="h-4 w-4" />
            <AlertDescription>
              提示：请根据您的Excel文件中的表头，手动输入对应的字段名。例如：如果Excel中"基本工资"字段对应系统中的"basic"字段，则在此输入"基本工资"。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>上一步</span>
        </Button>
        <Button onClick={onNext} className="flex items-center space-x-2">
          <span>下一步：确认配置</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
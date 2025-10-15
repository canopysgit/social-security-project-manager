'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { 
  FileSpreadsheet, 
  Calculator, 
  Calendar, 
  Users,
  ArrowRight,
  Info
} from 'lucide-react'

interface DataModeSelectorProps {
  dataMode: 'monthly_detail' | 'average_restore'
  onChange: (dataMode: 'monthly_detail' | 'average_restore') => void
  onNext: () => void
}

export function DataModeSelector({ dataMode, onChange, onNext }: DataModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'monthly_detail' | 'average_restore'>(dataMode)

  const modes = [
    {
      id: 'monthly_detail' as const,
      title: '明细工资数据',
      description: '每个月的详细工资记录',
      icon: FileSpreadsheet,
      features: [
        '12个月份，每月一个sheet',
        '完整的员工月度工资明细',
        '包含基本工资、奖金、补贴等',
        '数据准确，无需额外计算',
        '适用于：有完整月度工资记录的企业'
      ],
      pros: [
        '数据准确性高',
        '处理逻辑简单',
        '支持复杂的工资结构',
        '便于后续审计和追溯'
      ],
      cons: [
        '文件体积较大',
        '数据准备工作量多',
        '需要维护12个月的工资记录'
      ],
      example: 'gongzi1.xlsx'
    },
    {
      id: 'average_restore' as const,
      title: '平均工资还原',
      description: '基于平均工资还原月度明细',
      icon: Calculator,
      features: [
        '单一sheet，员工平均工资数据',
        '自动还原成12个月明细',
        '1-11月：平均工资',
        '12月：平均工资 + 奖金 + 补贴 + 13薪',
        '适用于：只有年度平均工资数据的企业'
      ],
      pros: [
        '文件体积小',
        '数据准备工作量少',
        '上传处理快速',
        '适合小型企业或简化场景'
      ],
      cons: [
        '数据为估算值',
        '无法反映真实的月度变化',
        '12月数据可能失真',
        '不适用于复杂的工资变化场景'
      ],
      example: 'gongzi2.xlsx'
    }
  ]

  const handleModeChange = (mode: 'monthly_detail' | 'average_restore') => {
    setSelectedMode(mode)
    onChange(mode)
  }

  const handleNext = () => {
    onChange(selectedMode)
    onNext()
  }

  return (
    <div className="space-y-6">
      {/* 说明信息 */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          请根据您现有的工资数据格式选择合适的处理模式。这个选择将影响后续的字段配置和数据处理逻辑。
        </AlertDescription>
      </Alert>

      {/* 模式选择 */}
      <RadioGroup value={selectedMode} onValueChange={handleModeChange}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {modes.map((mode) => {
            const Icon = mode.icon
            const isSelected = selectedMode === mode.id
            
            return (
              <Card 
                key={mode.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-blue-600 bg-blue-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleModeChange(mode.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{mode.title}</CardTitle>
                        <CardDescription>{mode.description}</CardDescription>
                      </div>
                    </div>
                    <RadioGroupItem value={mode.id} id={mode.id} className="sr-only" />
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-600' 
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* 特性列表 */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      主要特性
                    </h4>
                    <ul className="space-y-1">
                      {mode.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 优缺点 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-1">优点</h4>
                      <ul className="space-y-1">
                        {mode.pros.map((pro, index) => (
                          <li key={index} className="text-xs text-green-600 flex items-start">
                            <span className="mr-1">+</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-orange-700 mb-1">缺点</h4>
                      <ul className="space-y-1">
                        {mode.cons.map((con, index) => (
                          <li key={index} className="text-xs text-orange-600 flex items-start">
                            <span className="mr-1">-</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 示例文件 */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-gray-500">示例文件：</span>
                    <Badge variant="outline">{mode.example}</Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </RadioGroup>

      {/* 数据处理逻辑说明 */}
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          <strong>数据处理逻辑：</strong>
          {selectedMode === 'monthly_detail' 
            ? ' 系统将直接读取Excel中12个sheet的数据，每个月的数据单独存储，保持原始数据的完整性。'
            : ' 系统将基于平均工资自动生成12个月的明细数据：1-11月存储平均工资，12月存储平均工资+所有奖金+补贴+13薪。'
          }
        </AlertDescription>
      </Alert>

      {/* 操作按钮 */}
      <div className="flex justify-end">
        <Button onClick={handleNext} className="flex items-center space-x-2">
          <span>下一步：配置工资项</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
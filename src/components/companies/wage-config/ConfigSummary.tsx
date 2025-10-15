'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Edit, CheckCircle } from 'lucide-react'

import { WageUploadConfig, Company } from '@/lib/types'

interface ConfigSummaryProps {
  config: Partial<WageUploadConfig>
  company?: Company | null
  onEdit: (step: number) => void
  onSave: () => void
  onPrevious: () => void
}

export function ConfigSummary({ config, company, onEdit, onSave, onPrevious }: ConfigSummaryProps) {
  const getModeLabel = (mode?: string) => {
    return mode === 'monthly_detail' ? '明细工资' : '平均工资还原'
  }

  const getModeVariant = (mode?: string) => {
    return mode === 'monthly_detail' ? 'default' : 'secondary'
  }

  return (
    <div className="space-y-6">
      {/* 说明信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>配置确认</span>
          </CardTitle>
          <CardDescription>
            请检查以下配置信息，确认无误后保存配置
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>基本信息</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit(0)}
              className="flex items-center space-x-1"
            >
              <Edit className="h-4 w-4" />
              <span>编辑</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">配置名称</label>
              <p className="text-base">{config.config_name || '未设置'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">数据模式</label>
              <div className="mt-1">
                <Badge variant={getModeVariant(config.data_mode)}>
                  {getModeLabel(config.data_mode)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">所属公司</label>
              <p className="text-base">{company?.name || '未知公司'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">项目</label>
              <p className="text-base">{company?.project_id || '未知项目'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 工资项配置 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>工资项配置</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit(1)}
              className="flex items-center space-x-1"
            >
              <Edit className="h-4 w-4" />
              <span>编辑</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">基本工资</label>
              <div className="mt-1">
                <Badge variant={config.wage_items_config?.basic_salary ? "outline" : "secondary"}>
                  {config.wage_items_config?.basic_salary ? "已启用" : "未启用"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">工资合计</label>
              <div className="mt-1">
                <Badge variant={config.wage_items_config?.total_salary ? "outline" : "secondary"}>
                  {config.wage_items_config?.total_salary ? "已启用" : "未启用"}
                </Badge>
              </div>
            </div>
          </div>
          
          {config.wage_items_config?.bonus_items && config.wage_items_config.bonus_items.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">奖金项</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {config.wage_items_config.bonus_items.map((item, index) => (
                  <Badge key={index} variant="secondary">{item}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {config.field_mapping && Object.keys(config.field_mapping).some(key => key.startsWith('allowance')) && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">补贴项</label>
              <div className="mt-1">
                {config.wage_items_config?.allowance_items && config.wage_items_config.allowance_items.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {config.wage_items_config.allowance_items.map((item, index) => (
                      <Badge key={index} variant="secondary">{item}</Badge>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(config.field_mapping)
                      .filter(([key, value]) => key.startsWith('allowance') && value)
                      .map(([key, value], index) => (
                        <Badge key={index} variant="secondary">{value as string}</Badge>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {config.data_mode === 'average_restore' && config.average_restore_config && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">工资发放月数</label>
              <p className="text-base">{config.average_restore_config.months_paid} 个月</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 字段映射 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>字段映射</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit(2)}
              className="flex items-center space-x-1"
            >
              <Edit className="h-4 w-4" />
              <span>编辑</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {config.field_mapping && Object.keys(config.field_mapping).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(config.field_mapping).map(([systemField, excelField]) => {
                if (!excelField || excelField === '') return null
                
                const fieldLabels: Record<string, string> = {
                  'basic': '基本工资',
                  'total': '工资合计',
                  'bonus1': '奖金项1',
                  'bonus2': '奖金项2',
                  'bonus3': '奖金项3',
                  'allowance1': '补贴项1',
                  'allowance2': '补贴项2',
                  'allowance3': '补贴项3'
                }
                
                const fieldLabel = fieldLabels[systemField] || systemField
                
                return (
                  <div key={systemField} className="flex justify-between items-center p-2 border rounded">
                    <span className="font-medium">{fieldLabel}</span>
                    <span className="text-muted-foreground">→ {excelField as string}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">暂无字段映射配置</p>
          )}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>上一步</span>
        </Button>
        <Button onClick={onSave} className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>{config.id ? '更新配置' : '保存配置'}</span>
        </Button>
      </div>
    </div>
  )
}
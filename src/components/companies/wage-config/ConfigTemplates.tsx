'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Star } from 'lucide-react'

import { WageConfigTemplate } from '@/lib/types'

interface ConfigTemplatesProps {
  templates: WageConfigTemplate[]
  onSelectTemplate: (template: WageConfigTemplate) => void
}

export function ConfigTemplates({ templates, onSelectTemplate }: ConfigTemplatesProps) {
  const getModeLabel = (mode: string) => {
    return mode === 'monthly_detail' ? '明细工资' : '平均工资还原'
  }

  const getModeVariant = (mode: string) => {
    return mode === 'monthly_detail' ? 'default' : 'secondary'
  }

  if (templates.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="h-5 w-5" />
          <span>配置模板</span>
        </CardTitle>
        <CardDescription>
          使用项目中的现有模板快速创建配置
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{template.template_name}</span>
                  <Badge variant={getModeVariant(template.data_mode)}>
                    {getModeLabel(template.data_mode)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  使用 {template.usage_count} 次 • 创建于 {new Date(template.created_at).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  包含 {template.wage_items_config.bonus_items?.length || 0} 个奖金项，{' '}
                  {template.wage_items_config.allowance_items?.length || 0} 个补贴项
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSelectTemplate(template)}
                className="flex items-center space-x-1"
              >
                <Copy className="h-4 w-4" />
                <span>使用模板</span>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
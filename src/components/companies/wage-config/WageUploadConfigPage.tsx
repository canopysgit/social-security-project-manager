'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Settings, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Copy,
  Edit,
  Trash2
} from 'lucide-react'

import { Company, WageUploadConfig, WageConfigTemplate } from '@/lib/types'
import { DataModeSelector } from './DataModeSelector'
import { WageItemsConfig } from './WageItemsConfig'
import { FieldMappingManager } from './FieldMappingManager'
import { ConfigTemplates } from './ConfigTemplates'
import { ConfigSummary } from './ConfigSummary'

export function WageUploadConfigPage({ companyId }: { companyId: string }) {
  const router = useRouter()
  const params = useParams()
  
  const [company, setCompany] = useState<Company | null>(null)
  const [existingConfigs, setExistingConfigs] = useState<WageUploadConfig[]>([])
  const [templates, setTemplates] = useState<WageConfigTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [configData, setConfigData] = useState<Partial<WageUploadConfig>>({
    config_name: '',
    data_mode: 'monthly_detail',
    wage_items_config: {
      basic_salary: true,
      total_salary: true,
      bonus_items: [],
      allowance_items: []
    },
    field_mapping: {},
    average_restore_config: {
      months_paid: 12
    },
    is_template: false
  })

  // 加载公司信息和现有配置
  useEffect(() => {
    loadCompanyData()
    loadExistingConfigs()
    loadTemplates()
  }, [companyId])

  const loadCompanyData = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}`)
      if (response.ok) {
        const data = await response.json()
        setCompany(data.company)
      }
    } catch (error) {
      console.error('加载公司信息失败:', error)
    }
  }

  const loadExistingConfigs = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/wage-configs`)
      if (response.ok) {
        const data = await response.json()
        setExistingConfigs(data.configs || [])
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }

  const loadTemplates = async () => {
    try {
      if (company?.project_id) {
        const response = await fetch(`/api/projects/${company.project_id}/wage-config-templates`)
        if (response.ok) {
          const data = await response.json()
          setTemplates(data.templates || [])
        }
      }
    } catch (error) {
      console.error('加载模板失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    {
      id: 'mode',
      title: '选择数据模式',
      description: '选择工资数据的类型和处理方式',
      icon: FileSpreadsheet
    },
    {
      id: 'items',
      title: '配置工资项',
      description: '选择要包含的工资项目',
      icon: Settings
    },
    {
      id: 'mapping',
      title: '字段映射',
      description: '将Excel字段映射到系统字段',
      icon: Upload
    },
    {
      id: 'summary',
      title: '确认配置',
      description: '检查并保存配置',
      icon: CheckCircle
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleConfigChange = (newConfig: Partial<WageUploadConfig>) => {
    setConfigData(prev => ({ ...prev, ...newConfig }))
  }

  const handleSaveConfig = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/wage-configs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
      })

      if (response.ok) {
        // 保存成功，跳转回公司详情页
        router.push(`/companies/${companyId}`)
      } else {
        throw new Error('保存配置失败')
      }
    } catch (error) {
      console.error('保存配置失败:', error)
      // 这里可以显示错误提示
    }
  }

  const handleUseTemplate = (template: WageConfigTemplate) => {
    setConfigData({
      config_name: `${template.template_name} - ${new Date().toLocaleDateString()}`,
      data_mode: template.data_mode,
      wage_items_config: template.wage_items_config,
      field_mapping: template.field_mapping,
      average_restore_config: template.average_restore_config,
      is_template: false
    })
    setCurrentStep(1) // 跳转到工资项配置步骤
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <DataModeSelector
            dataMode={configData.data_mode || 'monthly_detail'}
            onChange={(dataMode) => handleConfigChange({ data_mode: dataMode })}
            onNext={handleNext}
          />
        )
      
      case 1:
        return (
          <WageItemsConfig
            dataMode={configData.data_mode || 'monthly_detail'}
            wageItemsConfig={configData.wage_items_config}
            averageRestoreConfig={configData.average_restore_config}
            onChange={(newConfig) => handleConfigChange(newConfig)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      
      case 2:
        return (
          <FieldMappingManager
            dataMode={configData.data_mode || 'monthly_detail'}
            wageItemsConfig={configData.wage_items_config}
            fieldMapping={configData.field_mapping || {}}
            onChange={(fieldMapping) => handleConfigChange({ field_mapping: fieldMapping })}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      
      case 3:
        return (
          <ConfigSummary
            config={configData}
            company={company}
            onEdit={(step) => setCurrentStep(step)}
            onSave={handleSaveConfig}
            onPrevious={handlePrevious}
          />
        )
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/companies/${companyId}`)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回公司详情</span>
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">工资上传配置</h1>
            <p className="text-muted-foreground">
              {company?.name} - 配置工资数据上传模式和字段映射
            </p>
          </div>
        </div>
      </div>

      {/* 现有配置和模板 */}
      {(existingConfigs.length > 0 || templates.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 现有配置 */}
          {existingConfigs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>现有配置</span>
                </CardTitle>
                <CardDescription>
                  该公司已有 {existingConfigs.length} 个配置
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {existingConfigs.map((config) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{config.config_name}</span>
                          <Badge variant={config.data_mode === 'monthly_detail' ? 'default' : 'secondary'}>
                            {config.data_mode === 'monthly_detail' ? '明细工资' : '平均工资还原'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          创建于 {new Date(config.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 配置模板 */}
          {templates.length > 0 && (
            <ConfigTemplates
              templates={templates}
              onSelectTemplate={handleUseTemplate}
            />
          )}
        </div>
      )}

      {/* 配置步骤 */}
      <Card>
        <CardHeader>
          <CardTitle>创建新配置</CardTitle>
          <CardDescription>
            按照以下步骤完成工资上传配置
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 步骤指示器 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive 
                        ? 'border-blue-600 bg-blue-600 text-white' 
                        : isCompleted 
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-gray-300 bg-white text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {step.description}
                      </div>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${
                        index < currentStep ? 'bg-green-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* 步骤内容 */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
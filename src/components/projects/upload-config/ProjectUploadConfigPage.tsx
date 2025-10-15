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
  Trash2,
  Building
} from 'lucide-react'

import { Project, Company, WageUploadConfig, WageConfigTemplate } from '@/lib/types'
import { DataModeSelector } from '@/components/companies/wage-config/DataModeSelector'
import { WageItemsConfig } from '@/components/companies/wage-config/WageItemsConfig'
import { FieldMappingManager } from '@/components/companies/wage-config/FieldMappingManager'
import { ConfigTemplates } from '@/components/companies/wage-config/ConfigTemplates'
import { ConfigSummary } from '@/components/companies/wage-config/ConfigSummary'

export function ProjectUploadConfigPage({ projectId }: { projectId: string }) {
  const router = useRouter()
  
  const [project, setProject] = useState<Project | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [existingConfigs, setExistingConfigs] = useState<WageUploadConfig[]>([])
  const [templates, setTemplates] = useState<WageConfigTemplate[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [editingConfig, setEditingConfig] = useState<WageUploadConfig | null>(null)
  const [configData, setConfigData] = useState<Partial<WageUploadConfig>>({
    config_name: '',
    data_mode: 'monthly_detail',
    wage_items_config: {
      basic_salary: false,  // 改为可选
      total_salary: false,  // 改为可选
      bonus_items: [],
      allowance_items: []
    },
    field_mapping: {},
    average_restore_config: {
      months_paid: 12
    },
    is_template: false
  })

  // 加载项目信息和子公司列表
  useEffect(() => {
    loadProjectData()
    loadCompanies()
    loadTemplates()
  }, [projectId])

  const loadProjectData = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
      }
    } catch (error) {
      console.error('加载项目信息失败:', error)
    }
  }

  const loadCompanies = async () => {
    try {
      const response = await fetch(`/api/companies?project_id=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.data || [])
        if (data.data && data.data.length > 0) {
          setSelectedCompanyId(data.data[0].id)
        }
      }
    } catch (error) {
      console.error('加载子公司列表失败:', error)
    }
  }

  const loadExistingConfigs = async () => {
    if (!selectedCompanyId) return
    
    try {
      const response = await fetch(`/api/companies/${selectedCompanyId}/wage-configs`)
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
      const response = await fetch(`/api/projects/${projectId}/wage-config-templates`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('加载模板失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 当选择的子公司改变时，重新加载配置
  useEffect(() => {
    if (selectedCompanyId) {
      loadExistingConfigs()
      // 自动生成配置名称
      const selectedCompany = companies.find(c => c.id === selectedCompanyId)
      if (selectedCompany) {
        const today = new Date().toISOString().split('T')[0]
        const modeLabel = configData.data_mode === 'monthly_detail' ? '明细工资' : '平均工资还原'
        const autoName = `${selectedCompany.name} - ${modeLabel}配置 - ${today}`
        setConfigData(prev => ({ ...prev, config_name: autoName }))
      }
    }
  }, [selectedCompanyId, configData.data_mode, companies])

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
    if (!selectedCompanyId) {
      alert('请先选择一个子公司')
      return
    }

    try {
      const isEditing = !!editingConfig
      const url = `/api/companies/${selectedCompanyId}/wage-configs`
      const method = isEditing ? 'PUT' : 'POST'
      
      const payload = {
        ...configData,
        project_id: projectId,
        company_id: selectedCompanyId,
        ...(isEditing && { id: editingConfig.id })
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        // 保存成功
        loadExistingConfigs()
        setEditingConfig(null) // 清除编辑状态
        setCurrentStep(0) // 重置到第一步
        setConfigData({
          config_name: '',
          data_mode: 'monthly_detail',
          wage_items_config: {
            basic_salary: false,  // 改为可选
            total_salary: false,  // 改为可选
            bonus_items: [],
            allowance_items: []
          },
          field_mapping: {},
          average_restore_config: {
            months_paid: 12
          },
          is_template: false
        })
        alert(isEditing ? '配置更新成功' : '配置创建成功')
      } else {
        throw new Error(isEditing ? '更新配置失败' : '保存配置失败')
      }
    } catch (error) {
      console.error('保存配置失败:', error)
      alert('保存配置失败，请重试')
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
    setEditingConfig(null) // 清除编辑状态
    setCurrentStep(1) // 跳转到工资项配置步骤
  }

  const handleEditConfig = (config: WageUploadConfig) => {
    setEditingConfig(config)
    setConfigData({
      config_name: config.config_name,
      data_mode: config.data_mode,
      wage_items_config: config.wage_items_config,
      field_mapping: config.field_mapping,
      average_restore_config: config.average_restore_config,
      is_template: config.is_template,
      template_name: config.template_name
    })
    setCurrentStep(0) // 从第一步开始编辑
  }

  const handleDeleteConfig = async (config: WageUploadConfig) => {
    if (!confirm(`确定要删除配置"${config.config_name}"吗？`)) {
      return
    }

    try {
      const response = await fetch(`/api/companies/${selectedCompanyId}/wage-configs?config_id=${config.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // 删除成功，刷新配置列表
        loadExistingConfigs()
        alert('配置删除成功')
      } else {
        throw new Error('删除配置失败')
      }
    } catch (error) {
      console.error('删除配置失败:', error)
      alert('删除配置失败，请重试')
    }
  }

  const handleCopyConfig = (config: WageUploadConfig) => {
    setConfigData({
      config_name: `${config.config_name} - 副本`,
      data_mode: config.data_mode,
      wage_items_config: config.wage_items_config,
      field_mapping: config.field_mapping,
      average_restore_config: config.average_restore_config,
      is_template: false
    })
    setEditingConfig(null) // 清除编辑状态，作为新配置创建
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
            company={companies.find(c => c.id === selectedCompanyId)}
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
            onClick={() => router.push(`/projects/${projectId}`)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回项目概览</span>
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">工资上传配置</h1>
            <p className="text-muted-foreground">
              {project?.name} - 配置工资数据上传模式和字段映射
            </p>
          </div>
        </div>
      </div>

      {/* 子公司选择 */}
      {companies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>选择子公司</span>
            </CardTitle>
            <CardDescription>
              选择要配置工资上传的子公司
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCompanyId === company.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCompanyId(company.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">{company.city}</p>
                    </div>
                    {selectedCompanyId === company.id && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                  该子公司已有 {existingConfigs.length} 个配置
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {existingConfigs.map((config) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{config.config_name}</span>
                          <Badge variant={config.data_mode === 'monthly_detail' ? 'default' : 'secondary'}>
                            {config.data_mode === 'monthly_detail' ? '明细工资' : '平均工资还原'}
                          </Badge>
                        </div>
                        
                        {/* 工资项配置信息 */}
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {config.wage_items_config?.basic_salary && (
                              <Badge variant="outline" className="text-xs">基本工资</Badge>
                            )}
                            {config.wage_items_config?.total_salary && (
                              <Badge variant="outline" className="text-xs">工资合计</Badge>
                            )}
                            {config.wage_items_config?.bonus_items?.map((item, index) => (
                              <Badge key={`bonus-${index}`} variant="secondary" className="text-xs">{item}</Badge>
                            ))}
                            {config.wage_items_config?.allowance_items?.map((item, index) => (
                              <Badge key={`allowance-${index}`} variant="secondary" className="text-xs">{item}</Badge>
                            ))}
                            {/* 显示字段映射中的补贴项（如果没有在allowance_items中） */}
                            {config.field_mapping && Object.entries(config.field_mapping)
                              .filter(([key, value]) => key.startsWith('allowance') && value && 
                                       !(config.wage_items_config?.allowance_items || []).includes(value as string))
                              .map(([key, value], index) => (
                                <Badge key={`field-allowance-${index}`} variant="secondary" className="text-xs">{value}</Badge>
                              ))
                            }
                          </div>
                        </div>
                        
                        {/* 字段映射信息 */}
                        {config.field_mapping && Object.keys(config.field_mapping).length > 0 && (
                          <div className="text-xs text-gray-500">
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(config.field_mapping)
                                .filter(([key, value]) => value)
                                .map(([key, value]) => {
                                  const fieldLabels: Record<string, string> = {
                                    'basic': '基本工资',
                                    'total': '工资合计',
                                    'bonus1': '奖金1',
                                    'bonus2': '奖金2',
                                    'bonus3': '奖金3',
                                    'allowance1': '补贴1',
                                    'allowance2': '补贴2',
                                    'allowance3': '补贴3'
                                  }
                                  return (
                                    <span key={key} className="whitespace-nowrap">
                                      {fieldLabels[key] || key}: "{value}"
                                    </span>
                                  )
                                })}
                            </div>
                          </div>
                        )}
                        
                        <div className="text-sm text-muted-foreground">
                          创建于 {new Date(config.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditConfig(config)}
                          title="编辑配置"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCopyConfig(config)}
                          title="复制配置"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteConfig(config)}
                          title="删除配置"
                        >
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
      {selectedCompanyId && (
        <Card>
          <CardHeader>
            <CardTitle>{editingConfig ? '编辑配置' : '创建新配置'}</CardTitle>
            <CardDescription>
              {editingConfig 
                ? `正在编辑配置: ${editingConfig.config_name}`
                : '按照以下步骤完成工资上传配置'
              }
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
      )}

      {/* 无子公司提示 */}
      {!selectedCompanyId && companies.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无子公司</h3>
            <p className="text-gray-500 mb-4">请先创建子公司，然后进行工资配置</p>
            <Button onClick={() => router.push(`/projects/${projectId}/companies`)}>
              创建子公司
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
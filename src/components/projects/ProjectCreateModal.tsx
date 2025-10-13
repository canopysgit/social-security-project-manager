import { useState } from 'react'
import { ProjectCreateForm, validateCompanyCode, formatProjectPeriod } from '@/lib/types'

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProjectCreateModal({ isOpen, onClose, onSuccess }: ProjectCreateModalProps) {
  const [formData, setFormData] = useState<ProjectCreateForm>({
    name: '',
    company_name: '',
    company_code: '',
    project_period: '',
    description: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewId, setPreviewId] = useState('')

  // 生成预览ID
  const generatePreviewId = (companyCode: string, period: string) => {
    if (companyCode && period) {
      return `${companyCode.toUpperCase()}-${period}-XXX`
    }
    return ''
  }

  // 处理表单变化
  const handleInputChange = (field: keyof ProjectCreateForm, value: string) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    
    // 清除相关错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // 实时更新预览ID
    if (field === 'company_code' || field === 'project_period') {
      const code = field === 'company_code' ? value.toUpperCase() : newFormData.company_code
      const period = field === 'project_period' ? value : newFormData.project_period
      setPreviewId(generatePreviewId(code, period))
    }
  }

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = '项目名称不能为空'
    }
    
    if (!formData.company_name.trim()) {
      newErrors.company_name = '公司全名不能为空'
    }
    
    if (!formData.company_code.trim()) {
      newErrors.company_code = '公司简称不能为空'
    } else if (!validateCompanyCode(formData.company_code.toUpperCase())) {
      newErrors.company_code = '公司简称格式不正确（2-10位大写字母或数字）'
    }
    
    if (!formData.project_period) {
      newErrors.project_period = '项目周期不能为空'
    } else if (!/^\d{6}$/.test(formData.project_period)) {
      newErrors.project_period = '项目周期格式不正确（YYYYMM）'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          ...formData,
          company_code: formData.company_code.toUpperCase()
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        onSuccess()
        handleClose()
      } else {
        setErrors({ submit: result.error || '创建项目失败' })
      }
    } catch (error) {
      setErrors({ submit: '网络错误，请重试' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 关闭弹窗
  const handleClose = () => {
    setFormData({
      name: '',
      company_name: '',
      company_code: '',
      project_period: '',
      description: ''
    })
    setErrors({})
    setPreviewId('')
    onClose()
  }

  // 生成年月选项
  const generatePeriodOptions = () => {
    const options = []
    const currentYear = new Date().getFullYear()
    
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      for (let month = 1; month <= 12; month++) {
        const period = `${year}${month.toString().padStart(2, '0')}`
        const label = `${year}年${month}月`
        options.push({ value: period, label })
      }
    }
    
    return options
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">创建新项目</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* 项目名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              项目名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例：2024年10月社保补缴计算项目"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* 公司全名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              公司全名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.company_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例：巴斯夫(中国)有限公司"
            />
            {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
          </div>

          {/* 公司简称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              公司简称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.company_code}
              onChange={(e) => handleInputChange('company_code', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.company_code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例：BASF"
              maxLength={10}
            />
            <p className="text-gray-500 text-xs mt-1">2-10位大写字母或数字，用于生成项目编号</p>
            {errors.company_code && <p className="text-red-500 text-sm mt-1">{errors.company_code}</p>}
          </div>

          {/* 项目周期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              项目周期 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.project_period}
              onChange={(e) => handleInputChange('project_period', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.project_period ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">请选择项目周期</option>
              {generatePeriodOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.project_period && <p className="text-red-500 text-sm mt-1">{errors.project_period}</p>}
          </div>

          {/* 项目描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              项目描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="项目详细描述（可选）"
            />
          </div>

          {/* 项目ID预览 */}
          {previewId && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">项目编号预览：</span>
                <span className="font-mono">{previewId}</span>
              </p>
            </div>
          )}

          {/* 错误信息 */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* 按钮组 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-md"
            >
              {isSubmitting ? '创建中...' : '创建项目'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
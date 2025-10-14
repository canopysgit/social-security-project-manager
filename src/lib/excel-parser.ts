import * as xlsx from 'xlsx'
import { PolicyRule } from '@/lib/types'

// Excel数据行接口（对应Excel列名）
interface ExcelPolicyRow {
  name: string
  city: string
  year: number
  period: 'H1' | 'H2'
  
  // 养老保险
  pension_base_floor: number
  pension_base_cap: number
  pension_rate_staff: number
  pension_rate_enterprise: number
  
  // 医疗保险
  medical_base_floor: number
  medical_base_cap: number
  medical_rate_staff: number
  medical_rate_enterprise: number
  
  // 失业保险
  unemployment_base_floor: number
  unemployment_base_cap: number
  unemployment_rate_staff: number
  unemployment_rate_enterprise: number
  
  // 工伤保险
  injury_base_floor: number
  injury_base_cap: number
  injury_rate_staff: number
  injury_rate_enterprise: number
  
  // 住房公积金
  hf_base_floor: number
  hf_base_cap: number
  hf_rate_staff: number
  hf_rate_enterprise: number
  
  // 可能的系统字段（将被过滤）
  id?: string
  effective_start?: string
  effective_end?: string
  created_at?: string
  updated_at?: string
  note?: string
}

// 解析结果接口
export interface ParseResult {
  success: boolean
  policies: PolicyRule[]
  errors: Array<{
    row: number
    field: string
    message: string
    value: any
  }>
  duplicates: Array<{
    row: number
    id: string
    message: string
  }>
  summary: {
    total_rows: number
    success_count: number
    error_count: number
    duplicate_count: number
  }
}

// 根据年份和期间计算有效期
export const calculateEffectiveDates = (year: number, period: 'H1' | 'H2') => {
  if (period === 'H1') {
    return {
      effective_start: `${year}-01-01`,
      effective_end: `${year}-06-30`
    }
  } else {
    return {
      effective_start: `${year}-07-01`,
      effective_end: `${year}-12-31`
    }
  }
}

// 生成政策ID（使用有含义的格式）
export const generatePolicyId = (city: string, year: number, period: 'H1' | 'H2'): string => {
  // 生成有含义的ID：城市拼音 + 年份 + 期间
  const cityCode = city.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${cityCode}${year}${period}`
}

// 获取政策的可读ID
export const getReadablePolicyId = (policy: { city: string, year: number, period: string }): string => {
  const cityCode = policy.city.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${cityCode}${policy.year}${policy.period}`
}

// 验证政策数据
export const validatePolicyData = (policy: Partial<PolicyRule>, row: number): Array<{field: string, message: string, value: any}> => {
  const errors: Array<{field: string, message: string, value: any}> = []
  
  // 必填字段验证
  if (!policy.name || typeof policy.name !== 'string' || policy.name.trim() === '') {
    errors.push({ field: 'name', message: '政策名称不能为空', value: policy.name })
  }
  
  if (!policy.city || typeof policy.city !== 'string' || policy.city.trim() === '') {
    errors.push({ field: 'city', message: '城市不能为空', value: policy.city })
  }
  
  if (!policy.year || policy.year < 2000 || policy.year > 2050) {
    errors.push({ field: 'year', message: '年份必须在2000-2050之间', value: policy.year })
  }
  
  if (!policy.period || !['H1', 'H2'].includes(policy.period)) {
    errors.push({ field: 'period', message: '期间必须是H1或H2', value: policy.period })
  }
  
  // 基数验证（必须为正数，且上限大于下限）
  const insuranceTypes = ['pension', 'medical', 'unemployment', 'injury', 'hf'] as const
  
  for (const type of insuranceTypes) {
    const floorField = `${type}_base_floor` as keyof PolicyRule
    const capField = `${type}_base_cap` as keyof PolicyRule
    
    const floor = policy[floorField] as number
    const cap = policy[capField] as number
    
    if (typeof floor !== 'number' || floor < 0) {
      errors.push({ field: floorField, message: `${type}基数下限必须是非负数`, value: floor })
    }
    
    if (typeof cap !== 'number' || cap <= 0) {
      errors.push({ field: capField, message: `${type}基数上限必须是正数`, value: cap })
    }
    
    if (typeof floor === 'number' && typeof cap === 'number' && floor > cap) {
      errors.push({ 
        field: capField, 
        message: `${type}基数上限必须大于下限`, 
        value: `下限: ${floor}, 上限: ${cap}` 
      })
    }
  }
  
  // 费率验证（0-1之间的小数）
  const rateTypes = [
    'pension_rate_staff', 'pension_rate_enterprise',
    'medical_rate_staff', 'medical_rate_enterprise',
    'unemployment_rate_staff', 'unemployment_rate_enterprise',
    'injury_rate_staff', 'injury_rate_enterprise',
    'hf_rate_staff', 'hf_rate_enterprise'
  ] as const
  
  for (const rateField of rateTypes) {
    const rate = policy[rateField] as number
    
    if (typeof rate !== 'number' || rate < 0 || rate > 1) {
      errors.push({ 
        field: rateField, 
        message: `${rateField}费率必须是0-1之间的小数`, 
        value: rate 
      })
    }
  }
  
  return errors
}

// 解析Excel文件 - 服务器端版本
export const parsePolicyExcel = async (file: File | ArrayBuffer): Promise<ParseResult> => {
  try {
    let data: Uint8Array
    
    // 处理不同的输入类型
    if (file instanceof ArrayBuffer) {
      data = new Uint8Array(file)
    } else if (file instanceof File) {
      // 在服务器端环境中，我们需要使用Buffer而不是FileReader
      const arrayBuffer = await file.arrayBuffer()
      data = new Uint8Array(arrayBuffer)
    } else {
      throw new Error('不支持的文件类型')
    }
    
    console.log('📊 开始解析Excel数据，数据大小:', data.length, 'bytes')
    
    const workbook = xlsx.read(data, { type: 'array' })
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    console.log('📋 工作表名称:', sheetName)
    
    // 转换为JSON数据
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 })
    
    if (jsonData.length < 2) {
      return {
        success: false,
        policies: [],
        errors: [{ row: 0, field: 'file', message: 'Excel文件必须有标题行和数据行', value: null }],
        duplicates: [],
        summary: { total_rows: 0, success_count: 0, error_count: 1, duplicate_count: 0 }
      }
    }
    
    // 第一行是标题行，获取列映射
    const headers = jsonData[0] as string[]
    const dataRows = jsonData.slice(1) as any[][]
    
    console.log('📝 标题行:', headers)
    console.log('📄 数据行数:', dataRows.length)
    
    const policies: PolicyRule[] = []
    const errors: Array<{ row: number, field: string, message: string, value: any }> = []
    const duplicates: Array<{ row: number, id: string, message: string }> = []
    const processedIds = new Set<string>()
    
    let successCount = 0
    
    // 处理每一行数据
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowNum = i + 2 // Excel行号（从1开始，标题行是第1行）
      
      // 跳过空行
      if (!row || row.every(cell => cell === undefined || cell === null || cell === '')) {
        continue
      }
      
      try {
        // 将行数据转换为对象，过滤掉系统字段
        const rowObj: Partial<ExcelPolicyRow> = {}
        const systemFields = ['id', 'effective_start', 'effective_end', 'created_at', 'updated_at', 'note']
        
        headers.forEach((header, index) => {
          if (header && !systemFields.includes(header)) {
            // 处理数字类型（Excel可能返回的是数字格式）
            let value = row[index]
            
            // 如果是字符串且包含数字，尝试转换为数字
            if (typeof value === 'string') {
              const numValue = parseFloat(value.replace(/,/g, ''))
              if (!isNaN(numValue)) {
                value = numValue
              }
            }
            
            rowObj[header as keyof ExcelPolicyRow] = value
          }
        })
        
        // 生成ID
        const id = generatePolicyId(
          rowObj.city || '',
          rowObj.year || 0,
          rowObj.period || 'H1'
        )
        
        // 检查重复
        if (processedIds.has(id)) {
          duplicates.push({
            row: rowNum,
            id,
            message: `重复的政策ID: ${id}`
          })
          continue
        }
        processedIds.add(id)
        
        // 计算有效期
        const dates = calculateEffectiveDates(rowObj.year || 0, rowObj.period || 'H1')
        
        // 构建政策对象
        const policy: PolicyRule = {
          id,
          name: rowObj.name || '',
          city: rowObj.city || '',
          year: rowObj.year || 0,
          period: rowObj.period || 'H1',
          ...dates,
          
          // 养老保险
          pension_base_floor: rowObj.pension_base_floor || 0,
          pension_base_cap: rowObj.pension_base_cap || 0,
          pension_rate_staff: rowObj.pension_rate_staff || 0,
          pension_rate_enterprise: rowObj.pension_rate_enterprise || 0,
          
          // 医疗保险
          medical_base_floor: rowObj.medical_base_floor || 0,
          medical_base_cap: rowObj.medical_base_cap || 0,
          medical_rate_staff: rowObj.medical_rate_staff || 0,
          medical_rate_enterprise: rowObj.medical_rate_enterprise || 0,
          
          // 失业保险
          unemployment_base_floor: rowObj.unemployment_base_floor || 0,
          unemployment_base_cap: rowObj.unemployment_base_cap || 0,
          unemployment_rate_staff: rowObj.unemployment_rate_staff || 0,
          unemployment_rate_enterprise: rowObj.unemployment_rate_enterprise || 0,
          
          // 工伤保险
          injury_base_floor: rowObj.injury_base_floor || 0,
          injury_base_cap: rowObj.injury_base_cap || 0,
          injury_rate_staff: rowObj.injury_rate_staff || 0,
          injury_rate_enterprise: rowObj.injury_rate_enterprise || 0,
          
          // 住房公积金
          hf_base_floor: rowObj.hf_base_floor || 0,
          hf_base_cap: rowObj.hf_base_cap || 0,
          hf_rate_staff: rowObj.hf_rate_staff || 0,
          hf_rate_enterprise: rowObj.hf_rate_enterprise || 0,
          
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // 验证数据
        const validationErrors = validatePolicyData(policy, rowNum)
        if (validationErrors.length > 0) {
          validationErrors.forEach(error => {
            errors.push({
              row: rowNum,
              field: error.field,
              message: error.message,
              value: error.value
            })
          })
          continue
        }
        
        // 添加到成功列表
        policies.push(policy)
        successCount++
        
      } catch (error) {
        errors.push({
          row: rowNum,
          field: 'row',
          message: `解析行数据失败: ${error instanceof Error ? error.message : '未知错误'}`,
          value: row
        })
      }
    }
    
    const result = {
      success: successCount > 0,
      policies,
      errors,
      duplicates,
      summary: {
        total_rows: dataRows.length,
        success_count: successCount,
        error_count: errors.length,
        duplicate_count: duplicates.length
      }
    }
    
    console.log('✅ Excel解析完成:', {
      总行数: result.summary.total_rows,
      成功数: result.summary.success_count,
      错误数: result.summary.error_count,
      重复数: result.summary.duplicate_count
    })
    
    return result
    
  } catch (error) {
    console.error('❌ Excel解析失败:', error)
    return {
      success: false,
      policies: [],
      errors: [{
        row: 0,
        field: 'file',
        message: `文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`,
        value: error instanceof Error ? error.stack : null
      }],
      duplicates: [],
      summary: { total_rows: 0, success_count: 0, error_count: 1, duplicate_count: 0 }
    }
  }
}

// 格式化费率显示（小数转百分比）
export const formatRateDisplay = (rate: number): string => {
  return `${(rate * 100).toFixed(2)}%`
}

// 格式化基数显示
export const formatBaseDisplay = (base: number): string => {
  return base.toLocaleString('zh-CN', { minimumFractionDigits: 2 })
}
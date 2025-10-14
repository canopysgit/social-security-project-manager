import * as xlsx from 'xlsx'
import { PolicyRule } from '@/lib/types'

// 创建测试Excel文件
export const createTestExcelFile = (): ArrayBuffer => {
  // 测试数据
  const testData = [
    {
      name: '佛山2023年上半年五险一金政策',
      city: '佛山',
      year: 2023,
      period: 'H1',
      pension_base_floor: 1900,
      pension_base_cap: 24330,
      pension_rate_staff: 0.08,
      pension_rate_enterprise: 0.14,
      medical_base_floor: 1900,
      medical_base_cap: 24330,
      medical_rate_staff: 0.02,
      medical_rate_enterprise: 0.055,
      unemployment_base_floor: 1900,
      unemployment_base_cap: 24330,
      unemployment_rate_staff: 0.0032,
      unemployment_rate_enterprise: 0.008,
      injury_base_floor: 1900,
      injury_base_cap: 24330,
      injury_rate_staff: 0,
      injury_rate_enterprise: 0.001,
      hf_base_floor: 1900,
      hf_base_cap: 34860,
      hf_rate_staff: 0.05,
      hf_rate_enterprise: 0.05
    },
    {
      name: '佛山2023年下半年五险一金政策',
      city: '佛山',
      year: 2023,
      period: 'H2',
      pension_base_floor: 1900,
      pension_base_cap: 26421,
      pension_rate_staff: 0.08,
      pension_rate_enterprise: 0.14,
      medical_base_floor: 1900,
      medical_base_cap: 26421,
      medical_rate_staff: 0.02,
      medical_rate_enterprise: 0.055,
      unemployment_base_floor: 1900,
      unemployment_base_cap: 26421,
      unemployment_rate_staff: 0.0032,
      unemployment_rate_enterprise: 0.008,
      injury_base_floor: 1900,
      injury_base_cap: 26421,
      injury_rate_staff: 0,
      injury_rate_enterprise: 0.001,
      hf_base_floor: 1900,
      hf_base_cap: 37860,
      hf_rate_staff: 0.05,
      hf_rate_enterprise: 0.05
    }
  ]

  // 创建工作簿
  const wb = xlsx.utils.book_new()
  
  // 创建工作表
  const ws = xlsx.utils.json_to_sheet(testData)
  
  // 添加工作表到工作簿
  xlsx.utils.book_append_sheet(wb, ws, '政策数据')
  
  // 生成Excel文件
  return xlsx.write(wb, { type: 'array', bookType: 'xlsx' })
}
// 项目数据类型定义
export interface Project {
  id: string
  name: string
  description?: string
  created_at: Date
  updated_at: Date
  wage_calculation_config: {
    selected_fields: string[]
    calculation_mode: 'monthly_detail' | 'average_restore'
    calculation_formula: string
  }
  stats: {
    total_employees: number
    salary_records_count: number
    calculation_status: 'pending' | 'processing' | 'completed' | 'error'
  }
}

// 政策规则类型
export interface PolicyRule {
  id: string
  project_id: string
  year: number
  period: 'H1' | 'H2'
  city: string
  
  // 各险种基数上下限
  pension_base_floor: number
  pension_base_cap: number
  pension_rate: number
  
  medical_base_floor: number
  medical_base_cap: number
  medical_rate: number
  
  unemployment_base_floor: number
  unemployment_base_cap: number
  unemployment_rate: number
  
  injury_base_floor: number
  injury_base_cap: number
  injury_rate: number
  
  hf_base_floor: number
  hf_base_cap: number
  hf_rate: number
  
  created_at: Date
}

// 工资记录类型
export interface SalaryRecord {
  id: string
  project_id: string
  employee_id: string
  employee_name?: string
  department?: string
  salary_month: Date
  basic_salary: number
  gross_salary: number
  additional_data: Record<string, number>
  created_at: Date
}

// 计算结果类型
export interface CalculationResult {
  id: string
  project_id: string
  employee_id: string
  calculation_month: Date
  calculation_type: 'wide' | 'narrow'
  employee_category: string
  reference_wage_base: number
  reference_wage_category: string
  
  // 各险种调整后基数
  pension_adjusted_base: number
  medical_adjusted_base: number
  unemployment_adjusted_base: number
  injury_adjusted_base: number
  hf_adjusted_base: number
  
  // 各险种缴费金额
  pension_payment: number
  medical_payment: number
  unemployment_payment: number
  injury_payment: number
  hf_payment: number
  theoretical_total: number
  
  created_at: Date
}

// 认证用户类型
export interface User {
  username: string
  isAuthenticated: boolean
}

// API 响应类型
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}
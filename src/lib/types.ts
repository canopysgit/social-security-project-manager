// 项目数据类型定义
export interface Project {
  id: string; // 新格式：BASF-202410-001
  name: string;
  company_name: string; // 公司全名
  company_code: string; // 公司简称  
  project_period: string; // 项目周期 YYYYMM
  description?: string;
  created_at: string; // 改为string类型，便于JSON序列化
  updated_at: string;
  wage_calculation_config: ProjectWageConfig;
  stats: ProjectStats;
}

// 项目工资配置
export interface ProjectWageConfig {
  selected_fields: string[]; // 勾选的工资字段
  calculation_mode: 'monthly_detail' | 'average_restore';
  calculation_formula: string; // 自动生成的求和公式
}

// 项目统计信息
export interface ProjectStats {
  total_employees: number;
  salary_records_count: number;
  calculation_status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

// 项目创建表单
export interface ProjectCreateForm {
  name: string;
  company_name: string;
  company_code: string;
  project_period: string;
  description?: string;
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
  
  created_at: string
}

// 工资记录类型
export interface SalaryRecord {
  id: string
  project_id: string
  employee_id: string
  employee_name?: string
  department?: string
  salary_month: string // 改为string类型
  basic_salary: number
  gross_salary: number
  additional_data: Record<string, number>
  created_at: string
}

// 计算结果类型
export interface CalculationResult {
  id: string
  project_id: string
  employee_id: string
  calculation_month: string
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
  
  created_at: string
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

// 项目ID生成工具函数类型
export interface ProjectIdGenerator {
  companyCode: string;
  period: string;
  sequence: number;
}

// 项目周期格式化
export const formatProjectPeriod = (period: string): string => {
  if (period.length === 6) {
    const year = period.substring(0, 4);
    const month = period.substring(4, 6);
    return `${year}年${month}月`;
  }
  return period;
}

// 公司简称验证
export const validateCompanyCode = (code: string): boolean => {
  // 2-10个字符，只允许大写字母和数字
  return /^[A-Z0-9]{2,10}$/.test(code);
}
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

// 政策规则类型（新格式 - 独立政策表）
export interface PolicyRule {
  id: string // 格式：city+year+period，如 foshan2023H1
  name: string // 政策名称
  city: string
  year: number
  period: 'H1' | 'H2'
  
  // 有效期
  effective_start: string // YYYY-MM-DD
  effective_end: string   // YYYY-MM-DD
  
  // 养老保险
  pension_base_floor: number
  pension_base_cap: number
  pension_rate_staff: number     // 个人费率
  pension_rate_enterprise: number // 企业费率
  
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
  
  created_at: string
  updated_at: string
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


// 全局政策类型
export interface GlobalPolicy {
  id: string
  policy_name: string
  city: string
  year: number
  period: string // 'H1', 'H2', 'Q1', 'Q2', 'Q3', 'Q4', '全年'
  
  // 政策基本信息
  effective_date: string
  description?: string
  
  // 养老保险
  pension_base_floor: number
  pension_base_cap: number
  pension_rate_individual: number
  pension_rate_company: number
  
  // 医疗保险
  medical_base_floor: number
  medical_base_cap: number
  medical_rate_individual: number
  medical_rate_company: number
  
  // 失业保险
  unemployment_base_floor: number
  unemployment_base_cap: number
  unemployment_rate_individual: number
  unemployment_rate_company: number
  
  // 工伤保险
  injury_base_floor: number
  injury_base_cap: number
  injury_rate_company: number
  
  // 住房公积金
  hf_base_floor: number
  hf_base_cap: number
  hf_rate_individual: number
  hf_rate_company: number
  
  // 状态和元数据
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

// 项目政策关联类型
export interface ProjectPolicy {
  id: string
  project_id: string
  policy_id: string
  is_active: boolean
  applied_at: string
  applied_by?: string
}

// 数据上传配置类型
export interface UploadConfig {
  id: string
  project_id: string
  
  // 数据模式配置
  data_mode: 'monthly_detail' | 'average_restore'
  
  // 字段映射配置
  field_mappings: Record<string, string> // Excel列名到系统字段的映射
  
  // 校验规则配置
  validation_rules: Record<string, any> // 数据校验规则
  
  // 还原配置（仅用于average_restore模式）
  restoration_config: Record<string, any> // 月度还原的配置参数
  
  created_at: string
  updated_at: string
}

// 计算配置类型
export interface CalculationConfig {
  id: string
  project_id: string
  
  // 工资基数配置
  wage_base_config: {
    selected_fields: string[]
    calculation_mode: 'monthly_detail' | 'average_restore'
    calculation_formula: string
  }
  
  // 员工分类配置
  employee_categories: Array<{
    name: string
    conditions: Record<string, any>
    wage_calculation_rules: Record<string, any>
  }>
  
  // 计算参数配置
  calculation_params: Record<string, any>
  
  // 特殊规则配置
  special_rules: Array<{
    name: string
    condition: Record<string, any>
    action: Record<string, any>
  }>
  
  created_at: string
  updated_at: string
}

// 政策创建/编辑表单类型
export interface PolicyForm {
  policy_name: string
  city: string
  year: number
  period: string
  effective_date: string
  description?: string
  
  // 养老保险
  pension_base_floor: number
  pension_base_cap: number
  pension_rate_individual: number
  pension_rate_company: number
  
  // 医疗保险
  medical_base_floor: number
  medical_base_cap: number
  medical_rate_individual: number
  medical_rate_company: number
  
  // 失业保险
  unemployment_base_floor: number
  unemployment_base_cap: number
  unemployment_rate_individual: number
  unemployment_rate_company: number
  
  // 工伤保险
  injury_base_floor: number
  injury_base_cap: number
  injury_rate_company: number
  
  // 住房公积金
  hf_base_floor: number
  hf_base_cap: number
  hf_rate_individual: number
  hf_rate_company: number
  
  is_active: boolean
  created_by?: string
}

// 公司类型定义
export interface Company {
  id: string
  project_id: string
  name: string
  city: string
  
  // 政策关联（改为多选）
  selected_policy_ids: string[]
  
  // 工资模式配置
  wage_calculation_mode: 'monthly_detail' | 'average_restore'
  
  // 工资结构配置（每个公司独立配置）
  wage_structure_config: {
    basic_field: string // 例如：basic_salary
    gross_field: string // 例如：gross_salary
    additional_fields: string[] // 例如：['bonus1', 'allowance1', 'allowance2']
  }
  
  created_at: string
}

// 工资记录类型（更新）
export interface SalaryRecord {
  id: string
  project_id: string
  company_id: string // 新增公司关联
  employee_id: string
  employee_name?: string
  department?: string
  salary_month: string
  basic_salary: number
  gross_salary: number
  additional_data: Record<string, number> // 存储bonus1, allowance1等
  
  // 数据来源标记
  data_source: 'monthly_detail' | 'average_restore'
  original_record_id?: string // 用于还原模式关联原始记录
  
  created_at: string
}

// 公司创建表单
export interface CompanyCreateForm {
  name: string
  city: string
  selected_policy_ids: string[]
}

// 工资结构配置表单
export interface WageStructureForm {
  basic_field: string
  gross_field: string
  additional_fields: string[]
}

// 公司简称验证
export const validateCompanyCode = (code: string): boolean => {
  // 2-10个字符，只允许大写字母和数字
  return /^[A-Z0-9]{2,10}$/.test(code);
}
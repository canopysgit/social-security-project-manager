-- ========================================
-- 快速建表脚本 - 基础版本
-- 创建日期：2025-10-15
-- 描述：快速创建必需的基础表结构，跳过外键约束
-- ========================================

-- 创建工资上传配置表（简化版）
CREATE TABLE IF NOT EXISTS wage_upload_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(36) NOT NULL,
  project_id VARCHAR(36) NOT NULL,
  
  -- 配置基本信息
  config_name VARCHAR(100) NOT NULL,
  data_mode VARCHAR(20) NOT NULL CHECK (data_mode IN ('monthly_detail', 'average_restore')),
  
  -- 工资项配置
  wage_items_config JSONB NOT NULL DEFAULT '{
    "basic_salary": true,
    "total_salary": true,
    "bonus_items": [],
    "allowance_items": []
  }'::jsonb,
  
  -- 字段映射关系
  field_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- 模式二特有配置
  average_restore_config JSONB DEFAULT '{
    "months_paid": 12
  }'::jsonb,
  
  -- 配置元数据
  is_template BOOLEAN DEFAULT false,
  template_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建基本索引
CREATE INDEX IF NOT EXISTS idx_wage_upload_configs_company_id ON wage_upload_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_wage_upload_configs_project_id ON wage_upload_configs(project_id);

-- 创建工资记录模板表（简化版）
CREATE TABLE IF NOT EXISTS salary_records_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(100),
  department VARCHAR(100),
  
  -- 工资月份
  salary_month DATE NOT NULL,
  
  -- 标准工资字段
  basic_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- 奖金字段
  bonus1 DECIMAL(10,2) NOT NULL DEFAULT 0,
  bonus2 DECIMAL(10,2) NOT NULL DEFAULT 0,
  bonus3 DECIMAL(10,2) NOT NULL DEFAULT 0,
  bonus4 DECIMAL(10,2) NOT NULL DEFAULT 0,
  bonus5 DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- 补贴字段
  allowance1 DECIMAL(10,2) NOT NULL DEFAULT 0,
  allowance2 DECIMAL(10,2) NOT NULL DEFAULT 0,
  allowance3 DECIMAL(10,2) NOT NULL DEFAULT 0,
  allowance4 DECIMAL(10,2) NOT NULL DEFAULT 0,
  allowance5 DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- 数据来源和元信息
  data_source VARCHAR(20) NOT NULL DEFAULT 'upload',
  original_filename VARCHAR(255),
  upload_batch_id UUID,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束
  UNIQUE(company_id, employee_id, salary_month)
);

-- 创建基本索引
CREATE INDEX IF NOT EXISTS idx_salary_records_template_company_id ON salary_records_template(company_id);
CREATE INDEX IF NOT EXISTS idx_salary_records_template_employee_id ON salary_records_template(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_records_template_salary_month ON salary_records_template(salary_month);

-- 添加基本约束（先检查约束是否存在，再添加）
DO $$
BEGIN
    -- 检查约束是否存在，不存在则添加
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_salary_positive' 
        AND conrelid = 'salary_records_template'::regclass
    ) THEN
        ALTER TABLE salary_records_template 
        ADD CONSTRAINT chk_salary_positive 
        CHECK (basic_salary >= 0 AND total_salary >= 0);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_total_vs_basic' 
        AND conrelid = 'salary_records_template'::regclass
    ) THEN
        ALTER TABLE salary_records_template 
        ADD CONSTRAINT chk_total_vs_basic 
        CHECK (total_salary >= basic_salary);
    END IF;
END $$;

-- 验证表创建成功
SELECT 'wage_upload_configs 表创建成功' as result, COUNT(*) as count FROM wage_upload_configs
UNION ALL
SELECT 'salary_records_template 表创建成功' as result, COUNT(*) as count FROM salary_records_template;
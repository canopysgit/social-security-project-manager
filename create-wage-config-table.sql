-- 工资上传配置表
CREATE TABLE wage_upload_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
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
  is_template BOOLEAN DEFAULT false,  -- 是否作为模板供其他子公司使用
  template_name VARCHAR(100),         -- 模板名称
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(company_id, config_name)
);

-- 创建索引
CREATE INDEX idx_wage_upload_configs_company_id ON wage_upload_configs(company_id);
CREATE INDEX idx_wage_upload_configs_project_id ON wage_upload_configs(project_id);
CREATE INDEX idx_wage_upload_configs_is_template ON wage_upload_configs(is_template) WHERE is_template = true;

-- 工资记录表模板（为每个子公司创建对应的表）
CREATE TABLE salary_records_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(100),
  department VARCHAR(100),
  
  -- 工资月份
  salary_month DATE NOT NULL,
  
  -- 标准工资字段
  basic_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- 奖金字段（动态）
  bonus1 DECIMAL(10,2) NOT NULL DEFAULT 0,  -- 可以是13薪
  bonus2 DECIMAL(10,2) NOT NULL DEFAULT 0,
  bonus3 DECIMAL(10,2) NOT NULL DEFAULT 0,
  bonus4 DECIMAL(10,2) NOT NULL DEFAULT 0,
  bonus5 DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- 补贴字段（动态）
  allowance1 DECIMAL(10,2) NOT NULL DEFAULT 0,
  allowance2 DECIMAL(10,2) NOT NULL DEFAULT 0,
  allowance3 DECIMAL(10,2) NOT NULL DEFAULT 0,
  allowance4 DECIMAL(10,2) NOT NULL DEFAULT 0,
  allowance5 DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- 数据来源和元信息
  data_source VARCHAR(20) NOT NULL DEFAULT 'upload',  -- 'upload', 'calculated'
  original_filename VARCHAR(255),
  upload_batch_id UUID,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束
  UNIQUE(company_id, employee_id, salary_month)
);

-- 创建索引
CREATE INDEX idx_salary_records_template_company_id ON salary_records_template(company_id);
CREATE INDEX idx_salary_records_template_employee_id ON salary_records_template(employee_id);
CREATE INDEX idx_salary_records_template_salary_month ON salary_records_template(salary_month);
CREATE INDEX idx_salary_records_template_upload_batch ON salary_records_template(upload_batch_id);

-- 添加约束确保工资数据合理性
ALTER TABLE salary_records_template ADD CONSTRAINT chk_salary_positive 
  CHECK (basic_salary >= 0 AND total_salary >= 0);

ALTER TABLE salary_records_template ADD CONSTRAINT chk_total_vs_basic 
  CHECK (total_salary >= basic_salary);

-- 示例：为子公司ID为 'xxx' 创建具体的工资记录表
-- CREATE TABLE salary_records_xxx (LIKE salary_records_template INCLUDING ALL);

-- 注释说明
COMMENT ON TABLE wage_upload_configs IS '工资上传配置表，存储每个子公司的工资数据处理配置';
COMMENT ON COLUMN wage_upload_configs.data_mode IS '数据模式：monthly_detail(明细工资) 或 average_restore(平均工资还原)';
COMMENT ON COLUMN wage_upload_configs.wage_items_config IS '工资项配置JSON，包含基本工资、总工资及各项奖金补贴';
COMMENT ON COLUMN wage_upload_configs.field_mapping IS 'Excel字段到系统字段的映射关系';
COMMENT ON COLUMN wage_upload_configs.is_template IS '是否作为配置模板，供同项目下其他子公司使用';

COMMENT ON TABLE salary_records_template IS '工资记录表模板，每个子公司将创建对应的独立表';
COMMENT ON COLUMN salary_records_template.data_source IS '数据来源：upload(上传) 或 calculated(计算得出)';
COMMENT ON COLUMN salary_records_template.upload_batch_id IS '上传批次ID，用于追踪同一批次上传的数据';
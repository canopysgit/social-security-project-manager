-- 创建公司表
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  city VARCHAR(50) NOT NULL,
  
  -- 政策关联
  selected_policy_id UUID REFERENCES policy_rules(id) ON DELETE SET NULL,
  
  -- 工资模式配置
  wage_calculation_mode VARCHAR(20) NOT NULL DEFAULT 'monthly_detail' CHECK (wage_calculation_mode IN ('monthly_detail', 'average_restore')),
  
  -- 工资结构配置（每个公司独立配置）
  wage_structure_config JSONB DEFAULT '{
    "basic_field": "basic_salary",
    "gross_field": "gross_salary", 
    "additional_fields": []
  }'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保同一项目下公司名称唯一
  UNIQUE(project_id, name)
);

-- 创建索引
CREATE INDEX idx_companies_project_id ON companies(project_id);
CREATE INDEX idx_companies_city ON companies(city);
CREATE INDEX idx_companies_selected_policy_id ON companies(selected_policy_id);

-- 添加更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
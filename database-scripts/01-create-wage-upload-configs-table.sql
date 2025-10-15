-- ========================================
-- 工资上传配置表创建脚本
-- 创建日期：2025-10-15
-- 描述：存储各子公司的工资数据上传配置
-- ========================================

-- 创建工资上传配置表
CREATE TABLE IF NOT EXISTS wage_upload_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(36) NOT NULL,  -- 修改为VARCHAR，兼容UUID和其他ID格式
  project_id VARCHAR(36) NOT NULL,  -- 修改为VARCHAR，兼容项目ID如"FOSHAN-202501-004"
  
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_wage_upload_configs_company_id ON wage_upload_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_wage_upload_configs_project_id ON wage_upload_configs(project_id);
CREATE INDEX IF NOT EXISTS idx_wage_upload_configs_is_template ON wage_upload_configs(is_template) WHERE is_template = true;

-- 添加外键约束（如果相关表存在）
DO $$
BEGIN
    -- 检查companies表是否存在，然后添加外键约束
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
        -- 先检查字段类型是否匹配
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'companies' AND column_name = 'id' 
            AND table_schema = 'public' AND data_type = 'uuid'
        ) THEN
            ALTER TABLE wage_upload_configs 
            ADD CONSTRAINT IF NOT EXISTS fk_wage_upload_configs_company 
            FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
        ELSIF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'companies' AND column_name = 'id' 
            AND table_schema = 'public' AND data_type IN ('character varying', 'varchar')
        ) THEN
            -- 如果是VARCHAR类型，暂时不添加外键约束
            RAISE NOTICE 'companies表id字段为VARCHAR类型，跳过外键约束创建';
        END IF;
    END IF;
    
    -- 检查projects表是否存在，然后添加外键约束
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') THEN
        -- 先检查字段类型是否匹配
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'id' 
            AND table_schema = 'public' AND data_type = 'uuid'
        ) THEN
            ALTER TABLE wage_upload_configs 
            ADD CONSTRAINT IF NOT EXISTS fk_wage_upload_configs_project 
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
        ELSIF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'id' 
            AND table_schema = 'public' AND data_type IN ('character varying', 'varchar')
        ) THEN
            -- 如果是VARCHAR类型，暂时不添加外键约束
            RAISE NOTICE 'projects表id字段为VARCHAR类型，跳过外键约束创建';
        END IF;
    END IF;
END $$;

-- 插入一条测试数据（可选）
INSERT INTO wage_upload_configs (
  id,
  company_id,
  project_id,
  config_name,
  data_mode,
  wage_items_config,
  field_mapping,
  average_restore_config,
  is_template,
  template_name
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '测试配置 - 明细工资',
  'monthly_detail',
  '{
    "basic_salary": true,
    "total_salary": true,
    "bonus_items": ["13薪"],
    "allowance_items": ["餐补", "交通补贴"]
  }'::jsonb,
  '{
    "basic": "基本工资",
    "total": "应发工资",
    "bonus1": "13薪",
    "allowance1": "餐补",
    "allowance2": "交通补贴"
  }'::jsonb,
  '{
    "months_paid": 12
  }'::jsonb,
  true,
  '明细工资标准模板'
) ON CONFLICT DO NOTHING;

-- 验证表是否创建成功
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'wage_upload_configs' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
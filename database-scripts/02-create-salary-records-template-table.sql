-- ========================================
-- 工资记录模板表创建脚本
-- 创建日期：2025-10-15
-- 描述：存储工资记录的表结构模板，用于为每个子公司创建独立的工资记录表
-- ========================================

-- 创建工资记录表模板
CREATE TABLE IF NOT EXISTS salary_records_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(36) NOT NULL,  -- 修改为VARCHAR，兼容不同ID格式
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(100),
  department VARCHAR(100),
  
  -- 工资月份
  salary_month DATE NOT NULL,
  
  -- 标准工资字段
  basic_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- 奖金字段（动态，支持5个奖金项）
  bonus1 DECIMAL(10,2) NOT NULL DEFAULT 0,  -- 可以是13薪
  bonus2 DECIMAL(10,2) NOT NULL DEFAULT 0,  -- 绩效奖金
  bonus3 DECIMAL(10,2) NOT NULL DEFAULT 0,  -- 年终奖金
  bonus4 DECIMAL(10,2) NOT NULL DEFAULT 0,  -- 其他奖金1
  bonus5 DECIMAL(10,2) NOT NULL DEFAULT 0,  -- 其他奖金2
  
  -- 补贴字段（动态，支持5个补贴项）
  allowance1 DECIMAL(10,2) NOT NULL DEFAULT 0,  -- 餐补
  allowance2 DECIMAL(10,2) NOT NULL DEFAULT 0,  -- 交通补贴
  allowance3 DECIMAL(10,2) NOT NULL DEFAULT 0,  -- 通讯补贴
  allowance4 DECIMAL(10,2) NOT NULL DEFAULT 0,  -- 住房补贴
  allowance5 DECIMAL(10,2) NOT NULL DEFAULT 0,  -- 其他补贴
  
  -- 数据来源和元信息
  data_source VARCHAR(20) NOT NULL DEFAULT 'upload',  -- 'upload' | 'calculated'
  original_filename VARCHAR(255),  -- 原始Excel文件名
  upload_batch_id UUID,  -- 上传批次ID，用于批量追踪
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束：同一公司同一员工同一月份只能有一条记录
  UNIQUE(company_id, employee_id, salary_month)
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_salary_records_template_company_id ON salary_records_template(company_id);
CREATE INDEX IF NOT EXISTS idx_salary_records_template_employee_id ON salary_records_template(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_records_template_salary_month ON salary_records_template(salary_month);
CREATE INDEX IF NOT EXISTS idx_salary_records_template_upload_batch ON salary_records_template(upload_batch_id);
CREATE INDEX IF NOT EXISTS idx_salary_records_template_data_source ON salary_records_template(data_source);

-- 创建复合索引优化常用查询
CREATE INDEX IF NOT EXISTS idx_salary_records_template_company_employee_month 
  ON salary_records_template(company_id, employee_id, salary_month);

-- 添加数据完整性约束
ALTER TABLE salary_records_template 
  ADD CONSTRAINT IF NOT EXISTS chk_salary_positive 
  CHECK (basic_salary >= 0 AND total_salary >= 0);

ALTER TABLE salary_records_template 
  ADD CONSTRAINT IF NOT EXISTS chk_total_vs_basic 
  CHECK (total_salary >= basic_salary);

-- 添加奖金补贴金额约束
ALTER TABLE salary_records_template 
  ADD CONSTRAINT IF NOT EXISTS chk_bonus_positive 
  CHECK (
    bonus1 >= 0 AND bonus2 >= 0 AND bonus3 >= 0 AND 
    bonus4 >= 0 AND bonus5 >= 0
  );

ALTER TABLE salary_records_template 
  ADD CONSTRAINT IF NOT EXISTS chk_allowance_positive 
  CHECK (
    allowance1 >= 0 AND allowance2 >= 0 AND allowance3 >= 0 AND 
    allowance4 >= 0 AND allowance5 >= 0
  );

-- 添加数据来源约束
ALTER TABLE salary_records_template 
  ADD CONSTRAINT IF NOT EXISTS chk_data_source 
  CHECK (data_source IN ('upload', 'calculated'));

-- 创建触发器函数，自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为表创建触发器
DROP TRIGGER IF EXISTS update_salary_records_template_updated_at ON salary_records_template;
CREATE TRIGGER update_salary_records_template_updated_at 
    BEFORE UPDATE ON salary_records_template 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入一些测试数据（可选）
INSERT INTO salary_records_template (
  id,
  company_id,
  employee_id,
  employee_name,
  department,
  salary_month,
  basic_salary,
  total_salary,
  bonus1,
  allowance1,
  allowance2,
  data_source,
  original_filename
) VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'EMP001',
    '张三',
    '技术部',
    '2024-01-01',
    8000.00,
    10000.00,
    2000.00,  -- 13薪
    500.00,   -- 餐补
    300.00,   -- 交通补贴
    'upload',
    'test_salary_data.xlsx'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'EMP002',
    '李四',
    '销售部',
    '2024-01-01',
    7000.00,
    8500.00,
    1500.00,  -- 13薪
    500.00,   -- 餐补
    200.00,   -- 交通补贴
    'upload',
    'test_salary_data.xlsx'
  ) ON CONFLICT (company_id, employee_id, salary_month) DO NOTHING;

-- 验证表是否创建成功
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'salary_records_template' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 显示创建的索引
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'salary_records_template' 
  AND schemaname = 'public'
ORDER BY indexname;

-- 显示创建的约束
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'salary_records_template'::regclass
ORDER BY conname;
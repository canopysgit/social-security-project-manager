import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🏗️ API: 开始创建工资配置相关表...');
    
    
    // 读取SQL文件内容
    const sqlContent = `
-- 工资上传配置表
CREATE TABLE IF NOT EXISTS wage_upload_configs (
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
  is_template BOOLEAN DEFAULT false,
  template_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(company_id, config_name)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_wage_upload_configs_company_id ON wage_upload_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_wage_upload_configs_project_id ON wage_upload_configs(project_id);
CREATE INDEX IF NOT EXISTS idx_wage_upload_configs_is_template ON wage_upload_configs(is_template) WHERE is_template = true;

-- 工资记录表模板
CREATE TABLE IF NOT EXISTS salary_records_template (
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
  bonus1 DECIMAL(10,2) NOT NULL DEFAULT 0,
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
  data_source VARCHAR(20) NOT NULL DEFAULT 'upload',
  original_filename VARCHAR(255),
  upload_batch_id UUID,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束
  UNIQUE(company_id, employee_id, salary_month)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_salary_records_template_company_id ON salary_records_template(company_id);
CREATE INDEX IF NOT EXISTS idx_salary_records_template_employee_id ON salary_records_template(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_records_template_salary_month ON salary_records_template(salary_month);
CREATE INDEX IF NOT EXISTS idx_salary_records_template_upload_batch ON salary_records_template(upload_batch_id);

-- 添加约束（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_salary_positive'
    ) THEN
        ALTER TABLE salary_records_template ADD CONSTRAINT chk_salary_positive 
          CHECK (basic_salary >= 0 AND total_salary >= 0);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_total_vs_basic'
    ) THEN
        ALTER TABLE salary_records_template ADD CONSTRAINT chk_total_vs_basic 
          CHECK (total_salary >= basic_salary);
    END IF;
END $$;
    `;
    
    // 使用 RPC 执行SQL
    const { data, error } = await supabase.rpc('execute_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ 创建表失败:', error);
      throw error;
    }
    
    console.log('✅ 工资配置相关表创建成功');
    
    // 验证表是否创建成功
    const { data: tables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['wage_upload_configs', 'salary_records_template']);
    
    if (checkError) {
      console.warn('⚠️ 无法验证表创建状态:', checkError);
    } else {
      console.log('📋 创建的表:', tables?.map(t => t.table_name));
    }
    
    return NextResponse.json({
      success: true,
      message: '工资配置相关表创建成功',
      tables_created: ['wage_upload_configs', 'salary_records_template'],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 创建工资配置表失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET 方法用于检查表是否已存在
export async function GET() {
  try {
    
    console.log('🔍 检查工资配置相关表...');
    
    // 检查表是否存在
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['wage_upload_configs', 'salary_records_template']);
    
    if (error) {
      throw error;
    }
    
    const existingTables = tables?.map(t => t.table_name) || [];
    const allTablesExist = ['wage_upload_configs', 'salary_records_template'].every(
      table => existingTables.includes(table)
    );
    
    console.log('📊 表检查结果:', { existingTables, allTablesExist });
    
    return NextResponse.json({
      success: true,
      tables_exist: allTablesExist,
      existing_tables: existingTables,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 检查表失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
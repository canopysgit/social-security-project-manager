import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 创建政策管理相关的数据库表
export async function POST() {
  try {
    console.log('🚀 开始创建政策管理数据库表...')
    
    // 1. 创建全局政策库表 (global_policies)
    const createGlobalPoliciesTable = `
      CREATE TABLE IF NOT EXISTS global_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        policy_name VARCHAR(200) NOT NULL,
        city VARCHAR(50) NOT NULL,
        year INTEGER NOT NULL,
        period VARCHAR(10) NOT NULL, -- 'H1', 'H2', 'Q1', 'Q2', 'Q3', 'Q4', '全年'
        
        -- 政策基本信息
        effective_date DATE NOT NULL,
        description TEXT,
        
        -- 养老保险
        pension_base_floor DECIMAL(10,2) NOT NULL DEFAULT 0,
        pension_base_cap DECIMAL(10,2) NOT NULL DEFAULT 999999,
        pension_rate_individual DECIMAL(5,4) NOT NULL DEFAULT 0.08,
        pension_rate_company DECIMAL(5,4) NOT NULL DEFAULT 0.14,
        
        -- 医疗保险
        medical_base_floor DECIMAL(10,2) NOT NULL DEFAULT 0,
        medical_base_cap DECIMAL(10,2) NOT NULL DEFAULT 999999,
        medical_rate_individual DECIMAL(5,4) NOT NULL DEFAULT 0.02,
        medical_rate_company DECIMAL(5,4) NOT NULL DEFAULT 0.055,
        
        -- 失业保险
        unemployment_base_floor DECIMAL(10,2) NOT NULL DEFAULT 0,
        unemployment_base_cap DECIMAL(10,2) NOT NULL DEFAULT 999999,
        unemployment_rate_individual DECIMAL(5,4) NOT NULL DEFAULT 0.0032,
        unemployment_rate_company DECIMAL(5,4) NOT NULL DEFAULT 0.008,
        
        -- 工伤保险
        injury_base_floor DECIMAL(10,2) NOT NULL DEFAULT 0,
        injury_base_cap DECIMAL(10,2) NOT NULL DEFAULT 999999,
        injury_rate_company DECIMAL(5,4) NOT NULL DEFAULT 0.001,
        
        -- 住房公积金
        hf_base_floor DECIMAL(10,2) NOT NULL DEFAULT 0,
        hf_base_cap DECIMAL(10,2) NOT NULL DEFAULT 999999,
        hf_rate_individual DECIMAL(5,4) NOT NULL DEFAULT 0.05,
        hf_rate_company DECIMAL(5,4) NOT NULL DEFAULT 0.05,
        
        -- 状态和元数据
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_by VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- 唯一约束
        UNIQUE(city, year, period)
      );
    `
    
    // 2. 创建项目政策关联表 (project_policies)
    const createProjectPoliciesTable = `
      CREATE TABLE IF NOT EXISTS project_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        policy_id UUID NOT NULL REFERENCES global_policies(id) ON DELETE CASCADE,
        
        -- 应用配置
        is_active BOOLEAN NOT NULL DEFAULT true,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        applied_by VARCHAR(100),
        
        -- 唯一约束：一个项目只能应用一次相同的政策
        UNIQUE(project_id, policy_id)
      );
    `
    
    // 3. 创建数据上传配置表 (upload_configs)
    const createUploadConfigsTable = `
      CREATE TABLE IF NOT EXISTS upload_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        
        -- 数据模式配置
        data_mode VARCHAR(20) NOT NULL DEFAULT 'monthly_detail', -- 'monthly_detail', 'average_restore'
        
        -- 字段映射配置
        field_mappings JSONB DEFAULT '{}'::jsonb, -- 存储Excel列名到系统字段的映射
        
        -- 校验规则配置
        validation_rules JSONB DEFAULT '{}'::jsonb, -- 存储数据校验规则
        
        -- 还原配置（仅用于average_restore模式）
        restoration_config JSONB DEFAULT '{}'::jsonb, -- 存储月度还原的配置参数
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- 一个项目只能有一个上传配置
        UNIQUE(project_id)
      );
    `
    
    // 4. 创建计算配置表 (calculation_configs)
    const createCalculationConfigsTable = `
      CREATE TABLE IF NOT EXISTS calculation_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        
        -- 工资基数配置
        wage_base_config JSONB DEFAULT '{}'::jsonb, -- 存储工资基数计算配置
        
        -- 员工分类配置
        employee_categories JSONB DEFAULT '[]'::jsonb, -- 存储员工分类规则
        
        -- 计算参数配置
        calculation_params JSONB DEFAULT '{}'::jsonb, -- 存储其他计算参数
        
        -- 特殊规则配置
        special_rules JSONB DEFAULT '[]'::jsonb, -- 存储特殊处理规则
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- 一个项目只能有一个计算配置
        UNIQUE(project_id)
      );
    `
    
    // 创建索引
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_global_policies_city_year ON global_policies(city, year);',
      'CREATE INDEX IF NOT EXISTS idx_global_policies_active ON global_policies(is_active);',
      'CREATE INDEX IF NOT EXISTS idx_project_policies_project ON project_policies(project_id);',
      'CREATE INDEX IF NOT EXISTS idx_project_policies_policy ON project_policies(policy_id);',
      'CREATE INDEX IF NOT EXISTS idx_upload_configs_project ON upload_configs(project_id);',
      'CREATE INDEX IF NOT EXISTS idx_calculation_configs_project ON calculation_configs(project_id);'
    ]
    
    // 执行建表语句
    const tables = [
      { name: 'global_policies', sql: createGlobalPoliciesTable },
      { name: 'project_policies', sql: createProjectPoliciesTable },
      { name: 'upload_configs', sql: createUploadConfigsTable },
      { name: 'calculation_configs', sql: createCalculationConfigsTable }
    ]
    
    const results = []
    
    for (const table of tables) {
      console.log(`📋 创建表: ${table.name}`)
      const { data, error } = await supabase.rpc('execute_sql', { sql_query: table.sql })
      
      if (error) {
        console.error(`❌ 创建表 ${table.name} 失败:`, error)
        return NextResponse.json({ 
          success: false, 
          error: `创建表 ${table.name} 失败: ${error.message}` 
        }, { status: 500 })
      }
      
      results.push({ table: table.name, status: 'success' })
    }
    
    // 创建索引
    for (const indexSql of createIndexes) {
      const { data, error } = await supabase.rpc('execute_sql', { sql_query: indexSql })
      if (error) {
        console.warn('⚠️ 创建索引失败:', error.message)
      }
    }
    
    // 插入一些示例政策数据
    const insertSamplePolicies = `
      INSERT INTO global_policies (
        policy_name, city, year, period, effective_date,
        pension_base_floor, pension_base_cap, pension_rate_individual, pension_rate_company,
        medical_base_floor, medical_base_cap, medical_rate_individual, medical_rate_company,
        unemployment_base_floor, unemployment_base_cap, unemployment_rate_individual, unemployment_rate_company,
        injury_base_floor, injury_base_cap, injury_rate_company,
        hf_base_floor, hf_base_cap, hf_rate_individual, hf_rate_company,
        description, created_by
      ) VALUES 
      (
        '佛山2023年上半年五险一金政策',
        '佛山',
        2023,
        'H1',
        '2023-01-01',
        1900, 24330, 0.08, 0.14,
        1900, 24330, 0.02, 0.055,
        1900, 24330, 0.0032, 0.008,
        1900, 24330, 0.001,
        1900, 34860, 0.05, 0.05,
        '佛山2023年上半年社会保险和住房公积金政策标准',
        'system'
      ),
      (
        '佛山2023年下半年五险一金政策',
        '佛山',
        2023,
        'H2',
        '2023-07-01',
        1900, 26421, 0.08, 0.14,
        1900, 26421, 0.02, 0.055,
        1900, 26421, 0.0032, 0.008,
        1900, 26421, 0.001,
        1900, 37860, 0.05, 0.05,
        '佛山2023年下半年社会保险和住房公积金政策标准',
        'system'
      ),
      (
        '佛山2024年上半年五险一金政策',
        '佛山',
        2024,
        'H1',
        '2024-01-01',
        1900, 27681, 0.08, 0.14,
        1900, 27681, 0.02, 0.055,
        1900, 27681, 0.0032, 0.008,
        1900, 27681, 0.001,
        1900, 39570, 0.05, 0.05,
        '佛山2024年上半年社会保险和住房公积金政策标准',
        'system'
      )
      ON CONFLICT (city, year, period) DO NOTHING;
    `
    
    console.log('📝 插入示例政策数据...')
    const { data: insertData, error: insertError } = await supabase.rpc('execute_sql', { 
      sql_query: insertSamplePolicies 
    })
    
    if (insertError) {
      console.warn('⚠️ 插入示例数据失败:', insertError.message)
    } else {
      console.log('✅ 示例政策数据插入成功')
    }
    
    const result = {
      success: true,
      message: '政策管理数据库表创建成功',
      timestamp: new Date().toISOString(),
      tables_created: results,
      sample_data_inserted: !insertError
    }
    
    console.log('✅ 政策管理数据库表创建完成:', result)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ 创建政策管理数据库表失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// 获取表结构信息
export async function GET() {
  try {
    const tables = ['global_policies', 'project_policies', 'upload_configs', 'calculation_configs']
    const results = []
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      results.push({
        table,
        exists: !error,
        error: error?.message,
        sample_data: data?.[0] || null
      })
    }
    
    return NextResponse.json({
      success: true,
      tables: results,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 检查政策管理表结构失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
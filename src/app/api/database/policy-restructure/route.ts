import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 改造policy_rules表结构
export async function POST() {
  try {
    console.log('🚀 开始改造policy_rules表结构...')
    
    // 1. 首先备份现有数据
    const backupData = await supabase.from('policy_rules').select('*')
    if (backupData.error) {
      console.warn('⚠️ 无法备份数据，表可能为空:', backupData.error.message)
    } else {
      console.log(`📦 备份了 ${backupData.data?.length || 0} 条现有数据`)
    }
    
    // 2. 删除现有数据（因为id格式要改变）
    const { error: deleteError } = await supabase.from('policy_rules').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (deleteError) {
      console.warn('⚠️ 清空现有数据失败:', deleteError.message)
    }
    
    // 3. 删除project_id列（如果存在）
    const dropProjectId = `
      ALTER TABLE policy_rules 
      DROP COLUMN IF EXISTS project_id;
    `
    
    // 4. 修改id列为VARCHAR类型
    const modifyIdColumn = `
      ALTER TABLE policy_rules 
      ALTER COLUMN id TYPE VARCHAR(50) USING id::VARCHAR(50);
    `
    
    // 5. 添加name字段（如果不存在）
    const addNameColumn = `
      ALTER TABLE policy_rules 
      ADD COLUMN IF NOT EXISTS name VARCHAR(200);
    `
    
    // 6. 添加effective_start和effective_end字段（如果不存在）
    const addEffectiveDateColumns = `
      ALTER TABLE policy_rules 
      ADD COLUMN IF NOT EXISTS effective_start DATE,
      ADD COLUMN IF NOT EXISTS effective_end DATE;
    `
    
    // 7. 添加所有费率字段（如果不存在）
    const addRateColumns = `
      ALTER TABLE policy_rules 
      ADD COLUMN IF NOT EXISTS pension_rate_staff DECIMAL(5,4) DEFAULT 0.08,
      ADD COLUMN IF NOT EXISTS pension_rate_enterprise DECIMAL(5,4) DEFAULT 0.14,
      ADD COLUMN IF NOT EXISTS medical_rate_staff DECIMAL(5,4) DEFAULT 0.02,
      ADD COLUMN IF NOT EXISTS medical_rate_enterprise DECIMAL(5,4) DEFAULT 0.055,
      ADD COLUMN IF NOT EXISTS unemployment_rate_staff DECIMAL(5,4) DEFAULT 0.0032,
      ADD COLUMN IF NOT EXISTS unemployment_rate_enterprise DECIMAL(5,4) DEFAULT 0.008,
      ADD COLUMN IF NOT EXISTS injury_rate_staff DECIMAL(5,4) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS injury_rate_enterprise DECIMAL(5,4) DEFAULT 0.001,
      ADD COLUMN IF NOT EXISTS hf_rate_staff DECIMAL(5,4) DEFAULT 0.05,
      ADD COLUMN IF NOT EXISTS hf_rate_enterprise DECIMAL(5,4) DEFAULT 0.05,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    `
    
    // 8. 删除旧的唯一约束
    const dropOldConstraints = `
      ALTER TABLE policy_rules 
      DROP CONSTRAINT IF EXISTS policy_rules_project_id_year_period_key,
      DROP CONSTRAINT IF EXISTS policy_rules_pkey;
    `
    
    // 9. 创建新的主键和唯一约束
    const createNewConstraints = `
      ALTER TABLE policy_rules 
      ADD CONSTRAINT policy_rules_pkey PRIMARY KEY (id),
      ADD CONSTRAINT policy_rules_unique_policy 
        UNIQUE (city, year, period);
    `
    
    // 10. 创建索引
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_policy_rules_city_year ON policy_rules(city, year);',
      'CREATE INDEX IF NOT EXISTS idx_policy_rules_effective ON policy_rules(effective_start, effective_end);'
    ]
    
    // 11. 创建更新触发器
    const createTrigger = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS update_policy_rules_updated_at ON policy_rules;
      CREATE TRIGGER update_policy_rules_updated_at 
          BEFORE UPDATE ON policy_rules 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `
    
    // 执行SQL语句
    const sqlStatements = [
      { name: '删除project_id列', sql: dropProjectId },
      { name: '修改id列类型', sql: modifyIdColumn },
      { name: '添加name字段', sql: addNameColumn },
      { name: '添加有效期字段', sql: addEffectiveDateColumns },
      { name: '添加费率字段', sql: addRateColumns },
      { name: '删除旧约束', sql: dropOldConstraints },
      { name: '创建新约束', sql: createNewConstraints },
      { name: '创建触发器', sql: createTrigger }
    ]
    
    const results = []
    
    for (const statement of sqlStatements) {
      console.log(`🔧 执行: ${statement.name}`)
      const { data, error } = await supabase.rpc('execute_sql', { sql_query: statement.sql })
      
      if (error) {
        console.error(`❌ ${statement.name}失败:`, error)
        // 继续执行其他语句，不中断整个过程
        results.push({ statement: statement.name, status: 'failed', error: error.message })
      } else {
        results.push({ statement: statement.name, status: 'success' })
      }
    }
    
    // 创建索引
    for (const indexSql of createIndexes) {
      console.log('📊 创建索引...')
      const { data, error } = await supabase.rpc('execute_sql', { sql_query: indexSql })
      if (error) {
        console.warn('⚠️ 创建索引失败:', error.message)
      }
    }
    
    // 12. 插入一些示例数据（使用新的id格式）
    const insertSampleData = `
      INSERT INTO policy_rules (
        id, name, city, year, period,
        effective_start, effective_end,
        pension_base_floor, pension_base_cap, pension_rate_staff, pension_rate_enterprise,
        medical_base_floor, medical_base_cap, medical_rate_staff, medical_rate_enterprise,
        unemployment_base_floor, unemployment_base_cap, unemployment_rate_staff, unemployment_rate_enterprise,
        injury_base_floor, injury_base_cap, injury_rate_staff, injury_rate_enterprise,
        hf_base_floor, hf_base_cap, hf_rate_staff, hf_rate_enterprise
      ) VALUES 
      (
        'foshan2023H1',
        '佛山2023年上半年五险一金政策',
        '佛山',
        2023,
        'H1',
        '2023-01-01',
        '2023-06-30',
        1900, 24330, 0.08, 0.14,
        1900, 24330, 0.02, 0.055,
        1900, 24330, 0.0032, 0.008,
        1900, 24330, 0, 0.001,
        1900, 34860, 0.05, 0.05
      ),
      (
        'foshan2023H2',
        '佛山2023年下半年五险一金政策',
        '佛山',
        2023,
        'H2',
        '2023-07-01',
        '2023-12-31',
        1900, 26421, 0.08, 0.14,
        1900, 26421, 0.02, 0.055,
        1900, 26421, 0.0032, 0.008,
        1900, 26421, 0, 0.001,
        1900, 37860, 0.05, 0.05
      )
      ON CONFLICT (id) DO NOTHING;
    `
    
    console.log('📝 插入示例数据...')
    const { data: insertData, error: insertError } = await supabase.rpc('execute_sql', { 
      sql_query: insertSampleData 
    })
    
    if (insertError) {
      console.warn('⚠️ 插入示例数据失败:', insertError.message)
    } else {
      console.log('✅ 示例数据插入成功')
    }
    
    const result = {
      success: true,
      message: 'policy_rules表结构改造完成',
      timestamp: new Date().toISOString(),
      statements_executed: results,
      sample_data_inserted: !insertError
    }
    
    console.log('✅ policy_rules表结构改造完成:', result)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ 改造policy_rules表结构失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// 检查表结构
export async function GET() {
  try {
    // 获取policy_rules表的前几条记录来查看结构
    const { data, error } = await supabase
      .from('policy_rules')
      .select('*')
      .limit(5)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data,
      fields: data && data.length > 0 ? Object.keys(data[0]) : [],
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 检查policy_rules表结构失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
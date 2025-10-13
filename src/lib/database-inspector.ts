import { supabase } from './supabase'

// 检查数据库表结构
export async function inspectDatabaseTables() {
  console.log('🔍 开始检查数据库表结构...')
  
  const tables = ['projects', 'policy_rules', 'salary_records', 'calculation_results']
  
  for (const tableName of tables) {
    try {
      console.log(`\n📋 检查表: ${tableName}`)
      
      // 获取表的前几条记录来了解结构
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`❌ 表 ${tableName} 错误:`, error.message)
        continue
      }
      
      console.log(`✅ 表 ${tableName} 存在`)
      if (data && data.length > 0) {
        console.log('字段结构:', Object.keys(data[0]))
      } else {
        // 如果没有数据，尝试插入一条测试记录来了解字段结构
        console.log('表为空，检查字段结构...')
      }
      
    } catch (err) {
      console.error(`❌ 检查表 ${tableName} 时出错:`, err)
    }
  }
}

// 检查项目表结构
export async function inspectProjectsTable() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .limit(5)
  
  console.log('Projects table:', { data, error })
  return { data, error }
}

// 检查政策规则表结构  
export async function inspectPolicyRulesTable() {
  const { data, error } = await supabase
    .from('policy_rules') 
    .select('*')
    .limit(5)
    
  console.log('Policy rules table:', { data, error })
  return { data, error }
}

// 检查工资记录表结构
export async function inspectSalaryRecordsTable() {
  const { data, error } = await supabase
    .from('salary_records')
    .select('*') 
    .limit(5)
    
  console.log('Salary records table:', { data, error })
  return { data, error }
}

// 检查计算结果表结构
export async function inspectCalculationResultsTable() {
  const { data, error } = await supabase
    .from('calculation_results')
    .select('*')
    .limit(5)
    
  console.log('Calculation results table:', { data, error })
  return { data, error }
}
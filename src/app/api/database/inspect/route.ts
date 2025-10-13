import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  console.log('🔍 API: 开始检查数据库表结构...')
  
  const result = {
    success: true,
    timestamp: new Date().toISOString(),
    tables: {}
  }
  
  const tables = ['projects', 'policy_rules', 'salary_records', 'calculation_results']
  
  for (const tableName of tables) {
    try {
      console.log(`📋 检查表: ${tableName}`)
      
      // 获取表的前几条记录来了解结构
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(1)
      
      if (error) {
        console.error(`❌ 表 ${tableName} 错误:`, error.message)
        result.tables[tableName] = {
          exists: false,
          error: error.message,
          count: 0,
          fields: []
        }
        continue
      }
      
      console.log(`✅ 表 ${tableName} 存在，记录数: ${count}`)
      
      const fields = data && data.length > 0 ? Object.keys(data[0]) : []
      
      result.tables[tableName] = {
        exists: true,
        count: count || 0,
        fields: fields,
        sampleData: data
      }
      
    } catch (err) {
      console.error(`❌ 检查表 ${tableName} 时出错:`, err)
      result.tables[tableName] = {
        exists: false,
        error: err.message,
        count: 0,
        fields: []
      }
    }
  }
  
  console.log('📊 数据库检查结果:', result)
  
  return NextResponse.json(result)
}
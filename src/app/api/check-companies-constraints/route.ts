import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 检查companies表结构...')
    
    // 查询companies表的结构信息
    const { data: columns, error: columnsError } = await supabase
      .from('companies')
      .select('*')
      .limit(1)
    
    if (columnsError) {
      console.error('查询companies表失败:', columnsError)
      return NextResponse.json({
        success: false,
        error: columnsError.message
      })
    }
    
    // 查询information_schema获取表字段详细信息
    const { data: tableInfo, error: infoError } = await supabase
      .rpc('get_table_columns', { table_name: 'companies' })
    
    if (infoError) {
      // 如果RPC不存在，使用另一种方式查询
      console.log('RPC不可用，使用基础查询...')
      
      // 尝试插入一条测试记录来检查约束
      const testRecord = {
        project_id: '00000000-0000-0000-0000-000000000000',
        name: 'TEST_COMPANY',
        city: 'TEST_CITY',
        wage_calculation_mode: null,
        wage_structure_config: null
      }
      
      return NextResponse.json({
        success: true,
        message: '请手动检查companies表的NOT NULL约束',
        test_record: testRecord,
        current_columns: columns ? Object.keys(columns) : []
      })
    }
    
    return NextResponse.json({
      success: true,
      table_info: tableInfo,
      sample_columns: columns ? Object.keys(columns) : [],
      message: '请检查wage_calculation_mode和wage_structure_config字段的is_nullable属性'
    })
    
  } catch (error) {
    console.error('检查表结构失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
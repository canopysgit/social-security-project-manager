import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 获取projects表的详细信息
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(3)
      
    // 获取policy_rules表结构（通过INFORMATION_SCHEMA查询）
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_table_schema', { table_name: 'projects' })
      .select()
      
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      projects: {
        data: projectsData,
        error: projectsError,
        fields: projectsData && projectsData.length > 0 ? Object.keys(projectsData[0]) : []
      },
      schema: {
        data: schemaData,
        error: schemaError
      }
    }
    
    console.log('📊 详细数据库信息:', JSON.stringify(result, null, 2))
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('检查数据库详细信息失败:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 检查companies表是否存在
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'companies')
      .single()

    if (tablesError) {
      // 如果information_schema不可访问，尝试直接查询companies表
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .limit(1)

      if (error) {
        return NextResponse.json({
          success: false,
          exists: false,
          error: error.message,
          details: 'companies表不存在或无访问权限'
        })
      }

      return NextResponse.json({
        success: true,
        exists: true,
        message: 'companies表存在且可访问',
        sampleData: data
      })
    }

    return NextResponse.json({
      success: true,
      exists: true,
      message: 'companies表存在'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      exists: false,
      error: error.message
    }, { status: 500 })
  }
}
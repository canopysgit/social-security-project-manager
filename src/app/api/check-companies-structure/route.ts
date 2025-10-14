import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 检查companies表结构
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: '无法查询companies表'
      })
    }

    // 获取表中的一条记录来查看字段
    const sampleRecord = data[0]
    
    return NextResponse.json({
      success: true,
      message: 'companies表结构检查成功',
      fields: sampleRecord ? Object.keys(sampleRecord) : [],
      sampleData: sampleRecord
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
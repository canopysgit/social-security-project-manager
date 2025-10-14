import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 查看companies表的列信息
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      })
    }

    // 获取表结构信息
    const sampleRecord = data[0]
    
    return NextResponse.json({
      success: true,
      message: '表结构信息',
      fields: sampleRecord ? Object.keys(sampleRecord).map(key => ({
        name: key,
        type: typeof sampleRecord[key],
        value: sampleRecord[key],
        is_json: typeof sampleRecord[key] === 'object'
      })) : []
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
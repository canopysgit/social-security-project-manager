import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 检查policy_rules表是否存在
    const { data, error } = await supabase
      .from('policy_rules')
      .select('*')
      .limit(5)

    if (error) {
      return NextResponse.json({
        success: false,
        exists: false,
        error: error.message,
        details: 'policy_rules表不存在或无访问权限'
      })
    }

    return NextResponse.json({
      success: true,
      exists: true,
      message: 'policy_rules表存在',
      count: data.length,
      sampleData: data
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      exists: false,
      error: error.message
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取单个项目详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log(`📋 获取项目详情: ${id}`)
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          success: false, 
          error: '项目不存在' 
        }, { status: 404 })
      }
      
      console.error('❌ 获取项目详情失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }
    
    console.log(`✅ 获取项目详情成功: ${data.name}`)
    
    return NextResponse.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 获取项目详情失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
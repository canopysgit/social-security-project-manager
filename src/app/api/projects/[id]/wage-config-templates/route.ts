import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - 获取项目的工资配置模板列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    
    const { data: templates, error } = await supabase
      .from('wage_upload_configs')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_template', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取配置模板列表失败:', error)
      return NextResponse.json({
        success: false,
        error: '获取模板列表失败: ' + error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      templates: templates || []
    })
    
  } catch (error) {
    console.error('获取配置模板列表失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// POST - 创建新的配置模板
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const templateData = await request.json()
    
    if (!templateData.template_name || !templateData.data_mode) {
      return NextResponse.json({
        success: false,
        error: '缺少必填字段：template_name, data_mode'
      }, { status: 400 })
    }
    
    const { data: template, error } = await supabase
      .from('wage_upload_configs')
      .insert({
        project_id: projectId,
        company_id: null, // 模板不属于特定公司
        config_name: templateData.template_name,
        data_mode: templateData.data_mode,
        wage_items_config: templateData.wage_items_config,
        field_mapping: templateData.field_mapping,
        average_restore_config: templateData.average_restore_config,
        is_template: true,
        template_name: templateData.template_name
      })
      .select()
      .single()
    
    if (error) {
      console.error('创建配置模板失败:', error)
      return NextResponse.json({
        success: false,
        error: '创建模板失败: ' + error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      data: template,
      message: '配置模板创建成功'
    })
    
  } catch (error) {
    console.error('创建配置模板失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
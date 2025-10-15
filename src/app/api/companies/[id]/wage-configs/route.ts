import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { WageUploadConfig } from '@/lib/types'

// GET - 获取公司的工资配置列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params
    
    const { data: configs, error } = await supabase
      .from('wage_upload_configs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取工资配置列表失败:', error)
      return NextResponse.json({
        success: false,
        error: '获取配置列表失败: ' + error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      configs: configs || []
    })
    
  } catch (error) {
    console.error('获取工资配置列表失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// POST - 创建新的工资配置
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params
    const configData = await request.json()
    
    console.log('🔧 API: 开始创建工资配置...', { companyId, configData })
    
    // 验证必填字段
    if (!configData.config_name || !configData.data_mode) {
      return NextResponse.json({
        success: false,
        error: '缺少必填字段：config_name, data_mode'
      }, { status: 400 })
    }
    
    // 检查同一公司下是否已存在同名配置
    const { data: existingConfig } = await supabase
      .from('wage_upload_configs')
      .select('id')
      .eq('company_id', companyId)
      .eq('config_name', configData.config_name)
      .single()
    
    if (existingConfig) {
      return NextResponse.json({
        success: false,
        error: '该公司下已存在同名配置'
      }, { status: 400 })
    }
    
    // 准备插入数据
    const insertData = {
      company_id: companyId,
      project_id: configData.project_id,
      config_name: configData.config_name,
      data_mode: configData.data_mode,
      wage_items_config: configData.wage_items_config || {
        basic_salary: true,
        total_salary: true,
        bonus_items: [],
        allowance_items: []
      },
      field_mapping: configData.field_mapping || {},
      average_restore_config: configData.average_restore_config || {
        months_paid: 12
      },
      is_template: configData.is_template || false,
      template_name: configData.template_name || null
    }
    
    console.log('📝 插入配置数据:', insertData)
    
    const { data: config, error } = await supabase
      .from('wage_upload_configs')
      .insert(insertData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ 创建工资配置失败:', error)
      return NextResponse.json({
        success: false,
        error: '创建配置失败: ' + error.message,
        details: error
      }, { status: 500 })
    }
    
    console.log('✅ 工资配置创建成功:', config)
    
    return NextResponse.json({
      success: true,
      data: config,
      message: '工资配置创建成功'
    })
    
  } catch (error) {
    console.error('❌ 创建工资配置失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      details: error
    }, { status: 500 })
  }
}

// PUT - 更新工资配置
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params
    const configData = await request.json()
    
    if (!configData.id) {
      return NextResponse.json({
        success: false,
        error: '缺少配置ID'
      }, { status: 400 })
    }
    
    const { data: config, error } = await supabase
      .from('wage_upload_configs')
      .update({
        config_name: configData.config_name,
        data_mode: configData.data_mode,
        wage_items_config: configData.wage_items_config,
        field_mapping: configData.field_mapping,
        average_restore_config: configData.average_restore_config,
        is_template: configData.is_template,
        template_name: configData.template_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', configData.id)
      .eq('company_id', companyId)
      .select()
      .single()
    
    if (error) {
      console.error('更新工资配置失败:', error)
      return NextResponse.json({
        success: false,
        error: '更新配置失败: ' + error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      data: config,
      message: '工资配置更新成功'
    })
    
  } catch (error) {
    console.error('更新工资配置失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// DELETE - 删除工资配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params
    const { searchParams } = new URL(request.url)
    const configId = searchParams.get('config_id')
    
    if (!configId) {
      return NextResponse.json({
        success: false,
        error: '缺少配置ID参数'
      }, { status: 400 })
    }
    
    const { error } = await supabase
      .from('wage_upload_configs')
      .delete()
      .eq('id', configId)
      .eq('company_id', companyId)
    
    if (error) {
      console.error('删除工资配置失败:', error)
      return NextResponse.json({
        success: false,
        error: '删除配置失败: ' + error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: '工资配置删除成功'
    })
    
  } catch (error) {
    console.error('删除工资配置失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
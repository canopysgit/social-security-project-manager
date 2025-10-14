import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Company, ApiResponse } from '@/lib/types'

// GET - 获取单个子公司详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params
    
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    // 处理政策数据：解析JSON格式的政策数组
    if (!error && company) {
      if (company.selected_policy_id) {
        try {
          // 尝试解析JSON数组
          const parsed = JSON.parse(company.selected_policy_id)
          company.selected_policy_ids = Array.isArray(parsed) ? parsed : [company.selected_policy_id]
        } catch (e) {
          // 如果不是JSON格式，则转换为单元素数组
          company.selected_policy_ids = [company.selected_policy_id]
        }
      } else {
        company.selected_policy_ids = []
      }
    }
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: '子公司不存在'
        }, { status: 404 })
      }
      console.error('获取子公司详情失败:', error)
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '获取子公司详情失败: ' + error.message
      }, { status: 500 })
    }
    
    return NextResponse.json<ApiResponse<Company>>({
      success: true,
      data: company
    })
    
  } catch (error) {
    console.error('获取子公司详情失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// PUT - 更新子公司信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params
    const updateData = await request.json()
    
    // 如果更新名称，检查是否重复
    if (updateData.name) {
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id, project_id')
        .eq('name', updateData.name)
        .neq('id', companyId)
        .single()
      
      if (existingCompany && existingCompany.project_id === updateData.project_id) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: '该项目下已存在同名子公司'
        }, { status: 400 })
      }
    }
    
    // 处理政策数据 - 将多个政策ID存储为JSON数组
    const policyData = updateData.selected_policy_ids && updateData.selected_policy_ids.length > 0 
      ? JSON.stringify(updateData.selected_policy_ids)
      : null

    // 更新子公司信息
    const { data: company, error } = await supabase
      .from('companies')
      .update({
        name: updateData.name,
        city: updateData.city,
        selected_policy_id: policyData,
        wage_calculation_mode: updateData.wage_calculation_mode,
        wage_structure_config: updateData.wage_structure_config
      })
      .eq('id', companyId)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: '子公司不存在'
        }, { status: 404 })
      }
      console.error('更新子公司失败:', error)
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '更新子公司失败: ' + error.message
      }, { status: 500 })
    }
    
    return NextResponse.json<ApiResponse<Company>>({
      success: true,
      data: company,
      message: '子公司信息更新成功'
    })
    
  } catch (error) {
    console.error('更新子公司失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// DELETE - 删除子公司
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params
    
    // 检查子公司是否存在
    const { data: company } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', companyId)
      .single()
    
    if (!company) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '子公司不存在'
      }, { status: 404 })
    }
    
    // 检查是否有关联的工资记录
    const { count: salaryRecordsCount } = await supabase
      .from('salary_records')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
    
    if (salaryRecordsCount && salaryRecordsCount > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `该子公司还有 ${salaryRecordsCount} 条工资记录，无法删除`
      }, { status: 400 })
    }
    
    // 删除子公司
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId)
    
    if (error) {
      console.error('删除子公司失败:', error)
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '删除子公司失败: ' + error.message
      }, { status: 500 })
    }
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: '子公司删除成功'
    })
    
  } catch (error) {
    console.error('删除子公司失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
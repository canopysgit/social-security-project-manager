import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Company, ApiResponse } from '@/lib/types'

// GET - 获取项目的子公司列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    
    if (!projectId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '缺少项目ID'
      }, { status: 400 })
    }
    
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    // 处理政策数据：解析JSON格式的政策数组
    if (!error && companies) {
      companies.forEach(company => {
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
      })
    }
    
    if (error) {
      console.error('获取子公司列表失败:', error)
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '获取子公司列表失败: ' + error.message
      }, { status: 500 })
    }
    
    return NextResponse.json<ApiResponse<Company[]>>({
      success: true,
      data: companies || []
    })
    
  } catch (error) {
    console.error('获取子公司列表失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// POST - 创建新公司
export async function POST(request: NextRequest) {
  try {
    const companyData = await request.json()
    
    // 验证必填字段
    if (!companyData.project_id || !companyData.name || !companyData.city) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '缺少必填字段：project_id, name, city'
      }, { status: 400 })
    }
    
    // 检查项目下是否已存在同名子公司
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('project_id', companyData.project_id)
      .eq('name', companyData.name)
      .single()
    
    if (existingCompany) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '该项目下已存在同名子公司'
      }, { status: 400 })
    }
    
    // 创建子公司 - 将多个政策ID存储为JSON数组
    const policyData = companyData.selected_policy_ids && companyData.selected_policy_ids.length > 0 
      ? JSON.stringify(companyData.selected_policy_ids)
      : null

    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        project_id: companyData.project_id,
        name: companyData.name,
        city: companyData.city,
        selected_policy_id: policyData,  // 存储JSON数组
        wage_calculation_mode: null,     // 明确设置为NULL
        wage_structure_config: null      // 明确设置为NULL
      })
      .select()
      .single()
    
    if (error) {
      console.error('创建子公司失败:', error)
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '创建子公司失败: ' + error.message
      }, { status: 500 })
    }
    
    // 在返回的数据中添加完整的政策数组信息
    if (company) {
      company.selected_policy_ids = companyData.selected_policy_ids || []
    }

    return NextResponse.json<ApiResponse<Company>>({
      success: true,
      data: company,
      message: '子公司创建成功'
    })
    
  } catch (error) {
    console.error('创建子公司失败:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ProjectCreateForm, Project } from '@/lib/types'

// 生成项目ID
async function generateProjectId(companyCode: string, period: string): Promise<string> {
  // 查询数据库中的项目总数来生成序号
  const { count, error } = await supabase
    .from('projects')
    .select('*', { count: 'exact' })
  
  if (error) {
    console.error('查询项目数量失败:', error)
    throw new Error('生成项目ID失败')
  }
  
  const sequence = String((count || 0) + 1).padStart(3, '0')
  return `${companyCode}-${period}-${sequence}`
}

// 创建项目
export async function POST(request: NextRequest) {
  try {
    const formData: ProjectCreateForm = await request.json()
    
    console.log('📝 创建新项目:', formData)
    
    // 验证必填字段
    if (!formData.name || !formData.company_name || !formData.company_code || !formData.project_period) {
      return NextResponse.json({
        success: false,
        error: '缺少必填字段'
      }, { status: 400 })
    }
    
    // 生成项目ID
    const projectId = await generateProjectId(formData.company_code.toUpperCase(), formData.project_period)
    
    // 检查项目ID是否已存在
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single()
    
    if (existingProject) {
      return NextResponse.json({
        success: false,
        error: '项目编号已存在，请稍后重试'
      }, { status: 409 })
    }
    
    // 创建项目数据
    const projectData: Omit<Project, 'created_at' | 'updated_at'> = {
      id: projectId,
      name: formData.name,
      company_name: formData.company_name,
      company_code: formData.company_code.toUpperCase(),
      project_period: formData.project_period,
      description: formData.description || null,
      wage_calculation_config: {
        selected_fields: ['basic_salary'],
        calculation_mode: 'monthly_detail',
        calculation_formula: '基本工资'
      },
      stats: {
        total_employees: 0,
        salary_records_count: 0,
        calculation_status: 'pending'
      }
    }
    
    // 插入数据库
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()
    
    if (error) {
      console.error('创建项目失败:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }
    
    console.log('✅ 项目创建成功:', data)
    
    return NextResponse.json({
      success: true,
      message: '项目创建成功',
      data: data
    }, { 
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
    
  } catch (error) {
    console.error('❌ 创建项目时出错:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '创建项目失败'
    }, { status: 500 })
  }
}

// 获取项目列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    console.log('📋 获取项目列表, limit:', limit, 'offset:', offset)
    
    const { data, error, count } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('获取项目列表失败:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      data: data,
      total: count,
      limit: limit,
      offset: offset
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
    
  } catch (error) {
    console.error('❌ 获取项目列表时出错:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '获取项目列表失败'
    }, { status: 500 })
  }
}
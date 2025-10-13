import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 直接从数据库获取数据，不经过JSON序列化
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, company_name, company_code')
      .limit(3)
    
    if (error) {
      console.error('数据库查询错误:', error)
      return NextResponse.json({ success: false, error: error.message })
    }
    
    // 记录原始数据
    console.log('原始数据库数据:')
    data?.forEach(project => {
      console.log(`ID: ${project.id}`)
      console.log(`Name: ${project.name}`)  
      console.log(`Company: ${project.company_name}`)
      console.log('---')
    })
    
    // 创建一个新的测试项目来验证编码
    const testProject = {
      id: 'TEST-202410-999',
      name: '测试中文项目',
      company_name: '测试公司(北京)有限公司',
      company_code: 'TEST999',
      project_period: '202410',
      description: '这是编码测试项目',
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
    
    const { data: insertedData, error: insertError } = await supabase
      .from('projects')
      .insert([testProject])
      .select()
      .single()
    
    if (insertError) {
      console.error('插入测试数据失败:', insertError)
    } else {
      console.log('插入的测试数据:', insertedData)
    }
    
    return NextResponse.json({
      success: true,
      originalData: data,
      testProject: insertedData,
      message: '检查控制台日志查看原始数据'
    })
    
  } catch (error) {
    console.error('编码测试出错:', error)
    return NextResponse.json({ success: false, error: error.message })
  }
}
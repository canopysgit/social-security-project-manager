import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔄 开始数据库结构调整...')
    
    // 1. 清空现有数据（删除关联数据）
    console.log('🗑️ 清空现有项目数据...')
    
    await supabase.from('calculation_results').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('salary_records').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('policy_rules').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    console.log('✅ 现有数据已清空')
    
    // 2. 检查是否需要添加新字段
    console.log('📊 检查projects表结构...')
    
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(1)
    
    if (projectsError) {
      console.log('❌ 检查表结构失败:', projectsError.message)
    }
    
    // 注意：Supabase不支持直接ALTER TABLE，需要在Supabase控制台手动调整
    // 这里我们创建一个API来验证新的数据结构
    
    const result = {
      success: true,
      message: '数据库结构调整准备完成',
      actions: [
        '✅ 清空现有项目数据',
        '⚠️ 需要在Supabase控制台手动调整表结构：',
        '1. 修改projects表id字段类型为text',
        '2. 添加company_name字段 (text)',
        '3. 添加company_code字段 (text)', 
        '4. 添加project_period字段 (text)',
        '5. 更新关联表的project_id字段类型为text'
      ],
      timestamp: new Date().toISOString()
    }
    
    console.log('📋 数据库调整结果:', result)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ 数据库结构调整失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// 测试新的项目创建
export async function GET() {
  try {
    // 测试插入一个新格式的项目
    const testProject = {
      id: 'BASF-202410-001',
      name: '巴斯夫2024年10月社保补缴项目',
      company_name: '巴斯夫(中国)有限公司',
      company_code: 'BASF',
      project_period: '202410',
      description: '测试项目数据',
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
    
    const { data, error } = await supabase
      .from('projects')
      .insert([testProject])
      .select()
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        note: '可能需要先在Supabase控制台调整表结构'
      })
    }
    
    return NextResponse.json({
      success: true,
      message: '测试项目创建成功',
      data: data
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
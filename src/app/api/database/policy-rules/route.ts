import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 政策规则测试数据
const policyRulesData = [
  // 2023年上半年 (H1)
  {
    year: 2023,
    period: 'H1',
    city: '佛山',
    // 养老保险基数
    pension_base_floor: 3958.00,
    pension_base_cap: 19790.00,
    pension_rate: 0.14,
    // 医疗保险基数  
    medical_base_floor: 3958.00,
    medical_base_cap: 19790.00,
    medical_rate: 0.055,
    // 失业保险基数
    unemployment_base_floor: 1900.00,
    unemployment_base_cap: 19790.00,
    unemployment_rate: 0.0032,
    // 工伤保险基数
    injury_base_floor: 0.00,
    injury_base_cap: 999999.00,
    injury_rate: 0.001,
    // 住房公积金基数
    hf_base_floor: 1900.00,
    hf_base_cap: 33473.00,
    hf_rate: 0.05
  },
  // 2023年下半年 (H2)
  {
    year: 2023,
    period: 'H2',
    city: '佛山',
    pension_base_floor: 4588.00,
    pension_base_cap: 22940.00,
    pension_rate: 0.14,
    medical_base_floor: 4588.00,
    medical_base_cap: 22940.00,
    medical_rate: 0.055,
    unemployment_base_floor: 1900.00,
    unemployment_base_cap: 22940.00,
    unemployment_rate: 0.0032,
    injury_base_floor: 0.00,
    injury_base_cap: 999999.00,
    injury_rate: 0.001,
    hf_base_floor: 1900.00,
    hf_base_cap: 33473.00,
    hf_rate: 0.05
  },
  // 2024年上半年 (H1)
  {
    year: 2024,
    period: 'H1',
    city: '佛山',
    pension_base_floor: 4588.00,
    pension_base_cap: 22940.00,
    pension_rate: 0.14,
    medical_base_floor: 4588.00,
    medical_base_cap: 22940.00,
    medical_rate: 0.055,
    unemployment_base_floor: 2300.00,
    unemployment_base_cap: 22940.00,
    unemployment_rate: 0.0032,
    injury_base_floor: 0.00,
    injury_base_cap: 999999.00,
    injury_rate: 0.001,
    hf_base_floor: 2300.00,
    hf_base_cap: 35179.00,
    hf_rate: 0.05
  },
  // 2024年下半年 (H2)
  {
    year: 2024,
    period: 'H2',
    city: '佛山',
    pension_base_floor: 4873.00,
    pension_base_cap: 24365.00,
    pension_rate: 0.14,
    medical_base_floor: 4873.00,
    medical_base_cap: 24365.00,
    medical_rate: 0.055,
    unemployment_base_floor: 2300.00,
    unemployment_base_cap: 24365.00,
    unemployment_rate: 0.0032,
    injury_base_floor: 0.00,
    injury_base_cap: 999999.00,
    injury_rate: 0.001,
    hf_base_floor: 2300.00,
    hf_base_cap: 35179.00,
    hf_rate: 0.05
  }
]

export async function POST() {
  try {
    console.log('📝 开始插入政策规则测试数据...')
    
    // 获取第一个项目ID用于关联
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .limit(1)
    
    if (projectError || !projects || projects.length === 0) {
      throw new Error('未找到项目，请先创建项目')
    }
    
    const projectId = projects[0].id
    console.log('🔗 关联到项目ID:', projectId)
    
    // 为每条规则添加project_id
    const rulesWithProjectId = policyRulesData.map(rule => ({
      ...rule,
      project_id: projectId
    }))
    
    // 插入政策规则数据
    const { data, error } = await supabase
      .from('policy_rules')
      .insert(rulesWithProjectId)
      .select()
    
    if (error) {
      throw error
    }
    
    console.log('✅ 政策规则插入成功:', data?.length || 0, '条记录')
    
    return NextResponse.json({
      success: true,
      message: `成功插入 ${data?.length || 0} 条政策规则`,
      data: data,
      projectId: projectId
    })
    
  } catch (error) {
    console.error('❌ 插入政策规则失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // 查询已有的政策规则
    const { data, error } = await supabase
      .from('policy_rules')
      .select('*')
      .order('year', { ascending: true })
      .order('period', { ascending: true })
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data
    })
    
  } catch (error) {
    console.error('❌ 查询政策规则失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
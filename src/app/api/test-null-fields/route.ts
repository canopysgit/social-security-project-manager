import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🧪 测试：创建子公司时工资字段为NULL')
    
    // 获取第一个项目ID用于测试
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .limit(1)
    
    if (projectError || !projects || projects.length === 0) {
      return NextResponse.json({
        success: false,
        error: '没有找到测试项目'
      })
    }
    
    const projectId = projects[0].id
    
    // 尝试创建一个测试子公司，工资字段明确设为NULL
    const { data: testCompany, error: createError } = await supabase
      .from('companies')
      .insert({
        project_id: projectId,
        name: 'TEST_SALARY_FIELDS',
        city: 'TEST_CITY',
        selected_policy_id: JSON.stringify(['test-policy-1']),
        wage_calculation_mode: null,
        wage_structure_config: null
      })
      .select()
      .single()
    
    if (createError) {
      console.error('❌ 创建测试子公司失败:', createError)
      return NextResponse.json({
        success: false,
        error: '创建子公司失败，可能存在NOT NULL约束',
        details: createError
      })
    }
    
    // 查询刚创建的子公司，验证字段是否为NULL
    const { data: verifyCompany, error: verifyError } = await supabase
      .from('companies')
      .select('id, name, wage_calculation_mode, wage_structure_config')
      .eq('id', testCompany.id)
      .single()
    
    if (verifyError) {
      console.error('❌ 验证子公司失败:', verifyError)
      return NextResponse.json({
        success: false,
        error: '验证子公司数据失败',
        details: verifyError
      })
    }
    
    // 删除测试数据
    await supabase
      .from('companies')
      .delete()
      .eq('id', testCompany.id)
    
    console.log('✅ 测试成功：工资字段可以为NULL')
    
    return NextResponse.json({
      success: true,
      message: '测试成功：工资字段可以为NULL',
      test_data: {
        id: verifyCompany.id,
        name: verifyCompany.name,
        wage_calculation_mode: verifyCompany.wage_calculation_mode,
        wage_structure_config: verifyCompany.wage_structure_config
      }
    })
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
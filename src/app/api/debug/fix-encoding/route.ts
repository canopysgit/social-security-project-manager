import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🗑️ 清理乱码数据...')
    
    // 删除乱码的项目数据
    await supabase
      .from('projects')  
      .delete()
      .in('id', ['BASF-202410-001', 'HUAWEI-202411-002', 'TENCENT-202412-003'])
    
    console.log('✅ 乱码数据已清理')
    
    // 重新创建正确的项目数据
    const correctProjects = [
      {
        id: 'BASF-202410-001',
        name: '巴斯夫2024年10月社保补缴项目',
        company_name: '巴斯夫(中国)有限公司', 
        company_code: 'BASF',
        project_period: '202410',
        description: '巴斯夫公司社保补缴计算项目',
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
      },
      {
        id: 'HUAWEI-202411-002',
        name: '华为2024年11月社保补缴项目',
        company_name: '华为技术有限公司',
        company_code: 'HUAWEI', 
        project_period: '202411',
        description: '华为公司社保补缴计算项目',
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
    ]
    
    const { data, error } = await supabase
      .from('projects')
      .insert(correctProjects)
      .select()
    
    if (error) {
      console.error('重新创建项目失败:', error)
      return NextResponse.json({ success: false, error: error.message })
    }
    
    console.log('✅ 项目数据重新创建成功:', data.length, '个项目')
    
    return NextResponse.json({
      success: true,
      message: '数据清理和重建完成',
      data: data
    })
    
  } catch (error) {
    console.error('❌ 数据清理失败:', error)
    return NextResponse.json({ success: false, error: error.message })
  }
}
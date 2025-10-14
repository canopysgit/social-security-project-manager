import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取单个政策
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    console.log(`📋 获取政策详情: ${id}`)
    
    const { data, error } = await supabase
      .from('policy_rules')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          success: false, 
          error: '政策不存在' 
        }, { status: 404 })
      }
      
      console.error('❌ 获取政策详情失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }
    
    console.log(`✅ 获取政策详情成功: ${data.name}`)
    
    return NextResponse.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 获取政策详情失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// 更新政策
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const policyData = await request.json()
    
    console.log(`📝 更新政策: ${id}`)
    
    // 验证必填字段
    const requiredFields = ['name', 'city', 'year', 'period']
    const missingFields = requiredFields.filter(field => !policyData[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `缺少必填字段: ${missingFields.join(', ')}` 
      }, { status: 400 })
    }
    
    // 构造更新数据
    const updateData = {
      name: policyData.name,
      city: policyData.city,
      year: policyData.year,
      period: policyData.period,
      
      // 养老保险
      pension_base_floor: policyData.pension_base_floor || 0,
      pension_base_cap: policyData.pension_base_cap || 999999,
      pension_rate_staff: policyData.pension_rate_staff || 0,
      pension_rate_enterprise: policyData.pension_rate_enterprise || 0,
      
      // 医疗保险
      medical_base_floor: policyData.medical_base_floor || 0,
      medical_base_cap: policyData.medical_base_cap || 999999,
      medical_rate_staff: policyData.medical_rate_staff || 0,
      medical_rate_enterprise: policyData.medical_rate_enterprise || 0,
      
      // 失业保险
      unemployment_base_floor: policyData.unemployment_base_floor || 0,
      unemployment_base_cap: policyData.unemployment_base_cap || 999999,
      unemployment_rate_staff: policyData.unemployment_rate_staff || 0,
      unemployment_rate_enterprise: policyData.unemployment_rate_enterprise || 0,
      
      // 工伤保险
      injury_base_floor: policyData.injury_base_floor || 0,
      injury_base_cap: policyData.injury_base_cap || 999999,
      injury_rate_staff: policyData.injury_rate_staff || 0,
      injury_rate_enterprise: policyData.injury_rate_enterprise || 0,
      
      // 住房公积金
      hf_base_floor: policyData.hf_base_floor || 0,
      hf_base_cap: policyData.hf_base_cap || 999999,
      hf_rate_staff: policyData.hf_rate_staff || 0,
      hf_rate_enterprise: policyData.hf_rate_enterprise || 0,
      
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('policy_rules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          success: false, 
          error: '政策不存在' 
        }, { status: 404 })
      }
      
      console.error('❌ 更新政策失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }
    
    console.log(`✅ 更新政策成功: ${data.name}`)
    
    return NextResponse.json({
      success: true,
      data: data,
      message: '政策更新成功',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 更新政策失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// 删除政策
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    console.log(`🗑️ 删除政策: ${id}`)
    
    // 对于直接删除，我们不再检查关联关系，简化操作
    // 因为这是项目化架构，政策管理相对独立
    
    const { data, error } = await supabase
      .from('policy_rules')
      .delete()
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          success: false, 
          error: '政策不存在' 
        }, { status: 404 })
      }
      
      console.error('❌ 删除政策失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }
    
    console.log(`✅ 删除政策成功: ${data.name}`)
    
    return NextResponse.json({
      success: true,
      data: data,
      message: '政策删除成功',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 删除政策失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
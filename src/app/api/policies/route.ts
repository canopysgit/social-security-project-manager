import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generatePolicyId, calculateEffectiveDates } from '@/lib/excel-parser'

// 获取所有政策
export async function GET() {
  try {
    console.log('📋 获取政策列表...')
    
    const { data, error } = await supabase
      .from('policy_rules')
      .select('*')
      .order('year', { ascending: false })
      .order('period', { ascending: false })
      .order('city', { ascending: true })
    
    if (error) {
      console.error('❌ 获取政策列表失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }
    
    console.log(`✅ 获取政策列表成功，共 ${data?.length || 0} 条记录`)
    
    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 获取政策列表失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// 创建新政策
export async function POST(request: NextRequest) {
  try {
    const policyData = await request.json()
    
    console.log('📝 创建新政策:', policyData.name)
    
    // 验证必填字段
    const requiredFields = ['name', 'city', 'year', 'period']
    const missingFields = requiredFields.filter(field => !policyData[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `缺少必填字段: ${missingFields.join(', ')}` 
      }, { status: 400 })
    }
    
    // 生成真正的UUID
    const id = crypto.randomUUID()
    
    // 计算有效期
    const dates = calculateEffectiveDates(policyData.year, policyData.period)
    
    // 构造插入数据
    const insertData = {
      id,
      name: policyData.name,
      city: policyData.city,
      year: policyData.year,
      period: policyData.period,
      ...dates,
      
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
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('policy_rules')
      .insert(insertData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ 创建政策失败:', error)
      
      // 检查是否是唯一约束冲突
      if (error.code === '23505') {
        return NextResponse.json({ 
          success: false, 
          error: '该城市和时期的政策已存在' 
        }, { status: 409 })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }
    
    console.log('✅ 创建政策成功:', data.name)
    
    return NextResponse.json({
      success: true,
      data: data,
      message: '政策创建成功',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 创建政策失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// 删除政策
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少政策ID'
      }, { status: 400 })
    }
    
    console.log('🗑️ 删除政策:', id)
    
    const { data, error } = await supabase
      .from('policy_rules')
      .delete()
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('❌ 删除政策失败:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }
    
    console.log('✅ 删除政策成功:', id)
    
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
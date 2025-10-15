import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 创建工资配置表的数据结构
const createWageConfigTable = async () => {
  try {
    // 使用 Supabase 的 .from() 方法自动创建表结构
    // 插入一条测试数据来触发表创建
    const { data, error } = await supabase
      .from('wage_upload_configs')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        company_id: '00000000-0000-0000-0000-000000000000',
        project_id: '00000000-0000-0000-0000-000000000000',
        config_name: 'template',
        data_mode: 'monthly_detail',
        wage_items_config: {
          basic_salary: true,
          total_salary: true,
          bonus_items: [],
          allowance_items: []
        },
        field_mapping: {},
        average_restore_config: {
          months_paid: 12
        },
        is_template: true,
        template_name: '默认模板'
      })
      .select();
    
    if (error) {
      // 如果表不存在，会返回错误
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('📋 表不存在，需要手动创建');
        return { success: false, needs_manual_creation: true, error: error.message };
      }
      throw error;
    }
    
    // 删除测试数据
    await supabase
      .from('wage_upload_configs')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000000');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
};

const createSalaryRecordsTemplate = async () => {
  try {
    // 测试 salary_records_template 表
    const { data, error } = await supabase
      .from('salary_records_template')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        company_id: 'test_company',
        employee_id: 'test_employee',
        salary_month: new Date().toISOString().split('T')[0],
        basic_salary: 0,
        total_salary: 0
      })
      .select();
    
    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('📋 salary_records_template 表不存在，需要手动创建');
        return { success: false, needs_manual_creation: true, error: error.message };
      }
      throw error;
    }
    
    // 删除测试数据
    await supabase
      .from('salary_records_template')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000000');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
};

export async function POST() {
  try {
    console.log('🏗️ API: 开始创建工资配置相关表...');
    
    const results = {
      wage_upload_configs: await createWageConfigTable(),
      salary_records_template: await createSalaryRecordsTemplate()
    };
    
    const allSuccess = Object.values(results).every(r => r.success);
    
    if (allSuccess) {
      console.log('✅ 所有表已存在或创建成功');
      return NextResponse.json({
        success: true,
        message: '工资配置相关表检查完成',
        results,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('⚠️ 部分表需要手动创建');
      return NextResponse.json({
        success: false,
        message: '部分表需要手动创建',
        results,
        manual_sql_file: '/create-wage-config-table.sql',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ 创建表检查失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('🔍 检查工资配置相关表...');
    
    // 检查 wage_upload_configs 表
    const { data: configTable, error: configError } = await supabase
      .from('wage_upload_configs')
      .select('count')
      .limit(1);
    
    // 检查 salary_records_template 表  
    const { data: salaryTable, error: salaryError } = await supabase
      .from('salary_records_template')
      .select('count')
      .limit(1);
    
    const results = {
      wage_upload_configs: {
        exists: !configError,
        error: configError?.message
      },
      salary_records_template: {
        exists: !salaryError,
        error: salaryError?.message
      }
    };
    
    console.log('📊 表检查结果:', results);
    
    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 检查表失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
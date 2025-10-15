import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface CreateCompanySalaryTableRequest {
  company_id: string;
  company_name?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { company_id, company_name }: CreateCompanySalaryTableRequest = await request.json();
    
    if (!company_id) {
      return NextResponse.json({
        success: false,
        error: '缺少公司ID'
      }, { status: 400 });
    }
    
    console.log(`🏗️ 为公司 ${company_name || company_id} 创建工资记录表...`);
    
    const tableName = `salary_records_${company_id.replace(/-/g, '_')}`;
    
    // 创建子公司工资记录表的SQL
    const createTableSQL = `
-- 创建公司工资记录表
CREATE TABLE IF NOT EXISTS ${tableName} (
  LIKE salary_records_template INCLUDING ALL
);

-- 添加表注释
COMMENT ON TABLE ${tableName} IS '公司 ${company_name || company_id} 的工资记录表';

-- 创建触发器自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column_${tableName}()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_${tableName}_updated_at 
    BEFORE UPDATE ON ${tableName} 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_${tableName}();
    `;
    
    // 执行SQL
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql: createTableSQL 
    });
    
    if (error) {
      console.error('❌ 创建公司工资表失败:', error);
      throw error;
    }
    
    console.log(`✅ 公司工资表 ${tableName} 创建成功`);
    
    // 验证表是否创建成功
    const { data: tableCheck, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .single();
    
    if (checkError || !tableCheck) {
      throw new Error(`表 ${tableName} 创建验证失败`);
    }
    
    return NextResponse.json({
      success: true,
      message: '公司工资记录表创建成功',
      table_name: tableName,
      company_id,
      company_name,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 创建公司工资表失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET 方法用于查询某个公司的工资表是否存在
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const company_id = searchParams.get('company_id');
    
    if (!company_id) {
      return NextResponse.json({
        success: false,
        error: '缺少公司ID参数'
      }, { status: 400 });
    }
    
    const tableName = `salary_records_${company_id.replace(/-/g, '_')}`;
    
    console.log(`🔍 检查公司工资表: ${tableName}`);
    
    // 检查表是否存在
    const { data: tableExists, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }
    
    const exists = !!tableExists;
    
    // 如果表存在，获取记录数
    let recordCount = 0;
    if (exists) {
      const { count, error: countError } = await supabase
        .from(tableName as any)
        .select('*', { count: 'exact', head: true });
      
      if (!countError) {
        recordCount = count || 0;
      }
    }
    
    console.log(`📊 表 ${tableName} 检查结果:`, { exists, recordCount });
    
    return NextResponse.json({
      success: true,
      company_id,
      table_name: tableName,
      exists,
      record_count: recordCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ 检查公司工资表失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
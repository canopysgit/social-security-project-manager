import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json();
    
    if (!sql) {
      return NextResponse.json({
        success: false,
        error: '缺少SQL语句'
      }, { status: 400 });
    }
    
    console.log('🔧 执行SQL:', sql.substring(0, 100) + '...');
    
    // 直接使用 Supabase 客户端的 SQL 函数
    const { data, error } = await supabase
      .rpc('exec_sql', { query: sql });
    
    if (error) {
      console.error('❌ SQL执行失败:', error);
      throw error;
    }
    
    console.log('✅ SQL执行成功');
    
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ SQL执行失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
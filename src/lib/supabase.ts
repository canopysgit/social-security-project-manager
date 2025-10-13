import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  }
})

// 测试连接
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1)
    
    if (error) {
      console.warn('Supabase 连接测试 - 表不存在 (正常，尚未创建):', error.message)
      return true
    }
    
    console.log('Supabase 连接成功')
    return true
  } catch (error) {
    console.error('Supabase 连接失败:', error)
    return false
  }
}
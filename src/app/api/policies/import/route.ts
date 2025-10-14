import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { parsePolicyExcel, ParseResult } from '@/lib/excel-parser'
import { PolicyRule } from '@/lib/types'

// 导入结果接口
export interface ImportResult extends ParseResult {
  database_errors: Array<{
    policy_id: string
    message: string
  }>
  final_summary: {
    total_parsed: number
    total_imported: number
    total_failed: number
  }
}

// 检查政策是否已存在
const checkPolicyExists = async (city: string, year: number, period: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('policy_rules')
    .select('id')
    .eq('city', city)
    .eq('year', year)
    .eq('period', period)
    .single()
  
  return !error && !!data
}

// 批量导入政策到数据库
const importPoliciesToDatabase = async (policies: PolicyRule[]): Promise<{
  imported: PolicyRule[]
  errors: Array<{ policy_id: string, message: string }>
}> => {
  const imported: PolicyRule[] = []
  const errors: Array<{ policy_id: string, message: string }> = []
  
  for (const policy of policies) {
    try {
      // 检查是否已存在
      const exists = await checkPolicyExists(policy.city, policy.year, policy.period)
      if (exists) {
        errors.push({
          policy_id: policy.id,
          message: `政策已存在：${policy.city}-${policy.year}-${policy.period}`
        })
        continue
      }
      
      // 插入政策
      const { data, error } = await supabase
        .from('policy_rules')
        .insert(policy)
        .select()
        .single()
      
      if (error) {
        errors.push({
          policy_id: policy.id,
          message: `数据库插入失败：${error.message}`
        })
      } else {
        imported.push(data)
      }
      
    } catch (error) {
      errors.push({
        policy_id: policy.id,
        message: `处理失败：${error instanceof Error ? error.message : '未知错误'}`
      })
    }
  }
  
  return { imported, errors }
}

// POST - 处理Excel文件导入
export async function POST(request: NextRequest) {
  try {
    console.log('📤 开始处理政策Excel导入...')
    
    // 检查请求类型
    const contentType = request.headers.get('content-type') || ''
    console.log('📋 Content-Type:', contentType)
    
    // 获取表单数据 - 使用更稳健的方法
    let formData
    let file
    
    // 首先检查是否是multipart/form-data
    if (contentType.includes('multipart/form-data')) {
      try {
        formData = await request.formData()
        file = formData.get('file') as File
        console.log('📄 文件信息:', file ? {
          name: file.name,
          size: file.size,
          type: file.type
        } : 'null')
      } catch (formError) {
        console.error('❌ FormData解析失败:', formError)
        
        // 尝试使用buffer方式处理
        try {
          const arrayBuffer = await request.arrayBuffer()
          console.log('📦 请求body大小:', arrayBuffer.byteLength)
          
          // 由于无法直接解析，返回错误信息要求使用正确的格式
          return NextResponse.json({
            success: false,
            message: 'FormData解析失败，请确保使用正确的multipart/form-data格式上传',
            debug_info: {
              content_type: contentType,
              body_size: arrayBuffer.byteLength,
              error: formError instanceof Error ? formError.message : 'Unknown error'
            },
            policies: [],
            errors: [{ 
              row: 0, 
              field: 'file', 
              message: 'FormData解析失败，请检查上传方式', 
              value: 'FormData parsing failed'
            }],
            duplicates: [],
            database_errors: [],
            summary: { total_rows: 0, success_count: 0, error_count: 1, duplicate_count: 0 },
            final_summary: { total_parsed: 0, total_imported: 0, total_failed: 1 }
          } as ImportResult, { status: 400 })
          
        } catch (bodyError) {
          console.error('❌ Body解析也失败:', bodyError)
          return NextResponse.json({
            success: false,
            message: '请求体解析完全失败',
            debug_info: {
              content_type: contentType,
              errors: [
                formError instanceof Error ? formError.message : 'FormData error',
                bodyError instanceof Error ? bodyError.message : 'Body error'
              ]
            },
            policies: [],
            errors: [{ row: 0, field: 'file', message: '请求解析失败', value: 'Complete parsing failure' }],
            duplicates: [],
            database_errors: [],
            summary: { total_rows: 0, success_count: 0, error_count: 1, duplicate_count: 0 },
            final_summary: { total_parsed: 0, total_imported: 0, total_failed: 1 }
          } as ImportResult, { status: 500 })
        }
      }
    } else {
      return NextResponse.json({
        success: false,
        message: `不支持的Content-Type: ${contentType}，请使用multipart/form-data格式`,
        policies: [],
        errors: [{ row: 0, field: 'content-type', message: 'Content-Type不正确', value: contentType }],
        duplicates: [],
        database_errors: [],
        summary: { total_rows: 0, success_count: 0, error_count: 1, duplicate_count: 0 },
        final_summary: { total_parsed: 0, total_imported: 0, total_failed: 1 }
      } as ImportResult, { status: 400 })
    }
    
    if (!file) {
      return NextResponse.json({
        success: false,
        message: '请选择要导入的Excel文件',
        policies: [],
        errors: [{ row: 0, field: 'file', message: '未选择文件', value: null }],
        duplicates: [],
        database_errors: [],
        summary: { total_rows: 0, success_count: 0, error_count: 1, duplicate_count: 0 },
        final_summary: { total_parsed: 0, total_imported: 0, total_failed: 1 }
      } as ImportResult, { status: 400 })
    }
    
    // 验证文件类型 - 更宽松的检查
    const fileName = file.name.toLowerCase();
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/octet-stream' // 某些系统可能使用这个类型
    ];
    
    const isExcelFile = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    const isValidType = allowedTypes.includes(file.type);
    
    console.log('📋 文件类型检查:', {
      fileName,
      fileType: file.type,
      isExcelFile,
      isValidType
    });
    
    if (!isExcelFile || !isValidType) {
      return NextResponse.json({
        success: false,
        message: `文件类型不正确。文件名: ${fileName}, 检测到类型: ${file.type}`,
        debug_info: {
          fileName,
          fileType: file.type,
          isExcelFile,
          isValidType,
          allowedTypes
        },
        policies: [],
        errors: [{ row: 0, field: 'file', message: `请上传Excel文件（.xlsx或.xls格式），当前文件: ${fileName}`, value: file.type }],
        duplicates: [],
        database_errors: [],
        summary: { total_rows: 0, success_count: 0, error_count: 1, duplicate_count: 0 },
        final_summary: { total_parsed: 0, total_imported: 0, total_failed: 1 }
      } as ImportResult, { status: 400 })
    }
    
    // 验证文件大小（限制10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        message: '文件大小不能超过10MB',
        policies: [],
        errors: [{ row: 0, field: 'file', message: '文件过大', value: file.size }],
        duplicates: [],
        database_errors: [],
        summary: { total_rows: 0, success_count: 0, error_count: 1, duplicate_count: 0 },
        final_summary: { total_parsed: 0, total_imported: 0, total_failed: 1 }
      } as ImportResult, { status: 400 })
    }
    
    console.log(`📄 解析Excel文件: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
    
    // 解析Excel文件
    const parseResult = await parsePolicyExcel(file)
    
    if (!parseResult.success && parseResult.policies.length === 0) {
      return NextResponse.json({
        ...parseResult,
        database_errors: [],
        final_summary: {
          total_parsed: parseResult.summary.total_rows,
          total_imported: 0,
          total_failed: parseResult.summary.error_count + parseResult.summary.duplicate_count
        }
      } as ImportResult, { status: 400 })
    }
    
    console.log(`📊 解析结果: 成功${parseResult.summary.success_count}条，错误${parseResult.summary.error_count}条，重复${parseResult.summary.duplicate_count}条`)
    
    // 如果有有效的政策数据，尝试导入数据库
    let databaseErrors: Array<{ policy_id: string, message: string }> = []
    let importedPolicies: PolicyRule[] = []
    
    if (parseResult.policies.length > 0) {
      console.log(`💾 开始导入${parseResult.policies.length}条政策到数据库...`)
      
      const importResult = await importPoliciesToDatabase(parseResult.policies)
      importedPolicies = importResult.imported
      databaseErrors = importResult.errors
      
      console.log(`✅ 导入完成: 成功${importedPolicies.length}条，失败${databaseErrors.length}条`)
    }
    
    // 构建最终结果
    const result: ImportResult = {
      ...parseResult,
      database_errors: databaseErrors,
      final_summary: {
        total_parsed: parseResult.summary.total_rows,
        total_imported: importedPolicies.length,
        total_failed: parseResult.summary.error_count + parseResult.summary.duplicate_count + databaseErrors.length
      }
    }
    
    console.log('🎉 政策导入完成:', {
      总行数: result.final_summary.total_parsed,
      导入成功: result.final_summary.total_imported,
      导入失败: result.final_summary.total_failed,
      数据错误: parseResult.summary.error_count,
      重复数据: parseResult.summary.duplicate_count,
      数据库错误: databaseErrors.length
    })
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ 政策导入处理失败:', error)
    return NextResponse.json({
      success: false,
      message: `导入处理失败: ${error instanceof Error ? error.message : '未知错误'}`,
      policies: [],
      errors: [{
        row: 0,
        field: 'system',
        message: `系统错误: ${error instanceof Error ? error.message : '未知错误'}`,
        value: null
      }],
      duplicates: [],
      database_errors: [],
      summary: { total_rows: 0, success_count: 0, error_count: 1, duplicate_count: 0 },
      final_summary: { total_parsed: 0, total_imported: 0, total_failed: 1 }
    } as ImportResult, { status: 500 })
  }
}

// GET - 获取导入模板信息
export async function GET() {
  try {
    // 返回Excel模板的字段说明
    const templateInfo = {
      required_fields: [
        { name: 'name', description: '政策名称', example: '佛山2023年上半年五险一金政策' },
        { name: 'city', description: '城市', example: '佛山' },
        { name: 'year', description: '年份', example: 2023 },
        { name: 'period', description: '期间', example: 'H1', options: ['H1', 'H2'] }
      ],
      insurance_fields: [
        {
          type: 'pension',
          name: '养老保险',
          fields: [
            { name: 'pension_base_floor', description: '基数下限', example: 1900 },
            { name: 'pension_base_cap', description: '基数上限', example: 24330 },
            { name: 'pension_rate_staff', description: '个人费率', example: 0.08 },
            { name: 'pension_rate_enterprise', description: '企业费率', example: 0.14 }
          ]
        },
        {
          type: 'medical',
          name: '医疗保险',
          fields: [
            { name: 'medical_base_floor', description: '基数下限', example: 1900 },
            { name: 'medical_base_cap', description: '基数上限', example: 24330 },
            { name: 'medical_rate_staff', description: '个人费率', example: 0.02 },
            { name: 'medical_rate_enterprise', description: '企业费率', example: 0.055 }
          ]
        },
        {
          type: 'unemployment',
          name: '失业保险',
          fields: [
            { name: 'unemployment_base_floor', description: '基数下限', example: 1900 },
            { name: 'unemployment_base_cap', description: '基数上限', example: 24330 },
            { name: 'unemployment_rate_staff', description: '个人费率', example: 0.0032 },
            { name: 'unemployment_rate_enterprise', description: '企业费率', example: 0.008 }
          ]
        },
        {
          type: 'injury',
          name: '工伤保险',
          fields: [
            { name: 'injury_base_floor', description: '基数下限', example: 1900 },
            { name: 'injury_base_cap', description: '基数上限', example: 24330 },
            { name: 'injury_rate_staff', description: '个人费率', example: 0 },
            { name: 'injury_rate_enterprise', description: '企业费率', example: 0.001 }
          ]
        },
        {
          type: 'hf',
          name: '住房公积金',
          fields: [
            { name: 'hf_base_floor', description: '基数下限', example: 1900 },
            { name: 'hf_base_cap', description: '基数上限', example: 34860 },
            { name: 'hf_rate_staff', description: '个人费率', example: 0.05 },
            { name: 'hf_rate_enterprise', description: '企业费率', example: 0.05 }
          ]
        }
      ],
      notes: [
        'Excel文件第一行必须是字段名称行',
        '费率字段请使用小数形式（如0.08表示8%）',
        '基数字段请使用数字格式（不需要千分位分隔符）',
        '期间字段只能填写H1或H2',
        '系统会自动计算effective_start和effective_end日期',
        '政策ID会自动生成为：城市+年份+期间（如foshan2023H1）'
      ]
    }
    
    return NextResponse.json({
      success: true,
      template: templateInfo,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ 获取导入模板信息失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
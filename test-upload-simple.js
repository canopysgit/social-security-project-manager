import FormData from 'form-data'
import * as xlsx from 'xlsx'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'

// 创建测试Excel文件
function createTestExcelFile() {
  const testData = [
    {
      name: '佛山2023年上半年五险一金政策',
      city: '佛山',
      year: 2023,
      period: 'H1',
      pension_base_floor: 1900,
      pension_base_cap: 24330,
      pension_rate_staff: 0.08,
      pension_rate_enterprise: 0.14,
      medical_base_floor: 1900,
      medical_base_cap: 24330,
      medical_rate_staff: 0.02,
      medical_rate_enterprise: 0.055,
      unemployment_base_floor: 1900,
      unemployment_base_cap: 24330,
      unemployment_rate_staff: 0.0032,
      unemployment_rate_enterprise: 0.008,
      injury_base_floor: 1900,
      injury_base_cap: 24330,
      injury_rate_staff: 0,
      injury_rate_enterprise: 0.001,
      hf_base_floor: 1900,
      hf_base_cap: 34860,
      hf_rate_staff: 0.05,
      hf_rate_enterprise: 0.05
    },
    {
      name: '佛山2023年下半年五险一金政策',
      city: '佛山',
      year: 2023,
      period: 'H2',
      pension_base_floor: 1900,
      pension_base_cap: 26421,
      pension_rate_staff: 0.08,
      pension_rate_enterprise: 0.14,
      medical_base_floor: 1900,
      medical_base_cap: 26421,
      medical_rate_staff: 0.02,
      medical_rate_enterprise: 0.055,
      unemployment_base_floor: 1900,
      unemployment_base_cap: 26421,
      unemployment_rate_staff: 0.0032,
      unemployment_rate_enterprise: 0.008,
      injury_base_floor: 1900,
      injury_base_cap: 26421,
      injury_rate_staff: 0,
      injury_rate_enterprise: 0.001,
      hf_base_floor: 1900,
      hf_base_cap: 37860,
      hf_rate_staff: 0.05,
      hf_rate_enterprise: 0.05
    }
  ]

  // 创建工作簿
  const wb = xlsx.utils.book_new()
  const ws = xlsx.utils.json_to_sheet(testData)
  xlsx.utils.book_append_sheet(wb, ws, '政策数据')
  
  // 生成Excel文件Buffer
  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' })
}

// 测试文件上传
async function testFileUpload() {
  try {
    console.log('🧪 开始测试文件上传...')
    
    // 创建测试Excel文件
    const excelBuffer = createTestExcelFile()
    const testFilePath = path.join(process.cwd(), 'test-policy-upload.xlsx')
    
    // 保存Excel文件到磁盘
    fs.writeFileSync(testFilePath, excelBuffer)
    console.log('✅ 测试Excel文件已创建:', testFilePath)
    
    // 创建FormData
    const formData = new FormData()
    formData.append('file', fs.createReadStream(testFilePath), {
      filename: 'test-policy-upload.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    
    console.log('📤 开始上传到API...')
    
    // 使用Node.js内置fetch发送请求
    const response = await fetch('http://localhost:3002/api/policies/import', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    })
    
    console.log('📥 服务器响应状态:', response.status)
    
    const result = await response.json()
    console.log('📊 上传结果:', JSON.stringify(result, null, 2))
    
    // 清理测试文件
    fs.unlinkSync(testFilePath)
    console.log('🧹 测试文件已清理')
    
    return result
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    return { success: false, error: error.message }
  }
}

// 执行测试
testFileUpload().then(result => {
  console.log('\n🎯 测试完成')
  if (result.success) {
    console.log('✅ 文件上传功能正常工作')
    console.log(`📈 导入统计: 成功 ${result.final_summary.total_imported}, 失败 ${result.final_summary.total_failed}`)
  } else {
    console.log('❌ 文件上传功能存在问题')
  }
}).catch(error => {
  console.error('💥 测试执行失败:', error)
})
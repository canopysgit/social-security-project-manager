const XLSX = require('xlsx');
const fs = require('fs');

// 创建测试Excel文件
function createTestExcel() {
  // 创建工作簿
  const wb = XLSX.utils.book_new();
  
  // 标准政策数据模板（不包含系统字段）
  const templateData = [
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
      medical_rate_enterprise: 0.045,
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
      medical_rate_enterprise: 0.045,
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
    },
    {
      name: '广州2023年上半年五险一金政策',
      city: '广州',
      year: 2023,
      period: 'H1',
      pension_base_floor: 2100,
      pension_base_cap: 28020,
      pension_rate_staff: 0.08,
      pension_rate_enterprise: 0.14,
      medical_base_floor: 2100,
      medical_base_cap: 28020,
      medical_rate_staff: 0.02,
      medical_rate_enterprise: 0.055,
      unemployment_base_floor: 2100,
      unemployment_base_cap: 28020,
      unemployment_rate_staff: 0.002,
      unemployment_rate_enterprise: 0.008,
      injury_base_floor: 2100,
      injury_base_cap: 28020,
      injury_rate_staff: 0,
      injury_rate_enterprise: 0.002,
      hf_base_floor: 2100,
      hf_base_cap: 37620,
      hf_rate_staff: 0.05,
      hf_rate_enterprise: 0.05
    }
  ];
  
  // 创建工作表
  const ws = XLSX.utils.json_to_sheet(templateData);
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '政策数据');
  
  // 生成文件
  const fileName = 'policy-template-standard.xlsx';
  XLSX.writeFile(wb, fileName);
  
  console.log(`✅ 标准政策Excel模板已创建: ${fileName}`);
  console.log(`📊 包含 ${templateData.length} 条测试数据`);
  console.log(`📝 注意：此模板不包含系统字段（id, effective_start, effective_end, created_at, updated_at, note）`);
  console.log(`💡 医疗保险企业费率已修正为0.045（之前错误的0.05）`);
  
  return fileName;
}

try {
  createTestExcel();
} catch (error) {
  console.error('❌ 创建测试Excel文件失败:', error);
}
'use client'

import PolicyImport from '@/components/policy-import'
import { ImportResult } from '@/app/api/policies/import/route'

export default function PolicyImportPage() {
  const handleImportComplete = (result: ImportResult) => {
    console.log('导入完成:', result)
    // 可以在这里添加导入完成后的处理逻辑
    // 比如刷新政策列表，显示通知等
  }

  return <PolicyImport onImportComplete={handleImportComplete} />
}
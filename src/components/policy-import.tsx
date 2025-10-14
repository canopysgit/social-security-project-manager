'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, XCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { formatRateDisplay, formatBaseDisplay } from '@/lib/excel-parser'
import { ImportResult } from '@/app/api/policies/import/route'

interface PolicyImportProps {
  onImportComplete?: (result: ImportResult) => void
}

export default function PolicyImport({ onImportComplete }: PolicyImportProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFileSelect = (file: File) => {
    // 验证文件类型
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      alert('请选择Excel文件（.xlsx或.xls格式）')
      return
    }
    
    // 验证文件大小
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB')
      return
    }
    
    setSelectedFile(file)
    setImportResult(null)
  }

  // 处理文件拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const excelFile = files.find(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'
    )
    
    if (excelFile) {
      handleFileSelect(excelFile)
    } else {
      alert('请拖拽Excel文件到此处')
    }
  }

  // 上传文件
  const handleUpload = async () => {
    if (!selectedFile) return
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)
      
      const response = await fetch('/api/policies/import', {
        method: 'POST',
        body: formData
      })
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (!response.ok) {
        throw new Error('上传失败')
      }
      
      const result: ImportResult = await response.json()
      setImportResult(result)
      onImportComplete?.(result)
      
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  // 下载模板
  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/policies/import')
      const data = await response.json()
      
      if (data.success) {
        // 创建模板数据
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
          }
        ]
        
        // 创建CSV内容（简化版本）
        const headers = Object.keys(templateData[0]).join(',')
        const rows = templateData.map(row => Object.values(row).join(','))
        const csvContent = [headers, ...rows].join('\n')
        
        // 下载文件
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = '政策导入模板.csv'
        link.click()
      }
    } catch (error) {
      console.error('下载模板失败:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">政策导入</h1>
          <p className="text-gray-600 mt-2">通过Excel文件批量导入政策数据</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          下载模板
        </Button>
      </div>

      {/* 文件上传区域 */}
      <Card>
        <CardHeader>
          <CardTitle>选择Excel文件</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                <FileText className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex justify-center space-x-2">
                  <Button onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? '上传中...' : '开始导入'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedFile(null)
                      setImportResult(null)
                    }}
                  >
                    重新选择
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="font-medium">拖拽Excel文件到此处</p>
                  <p className="text-sm text-gray-500">或者</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  选择文件
                </Button>
                <p className="text-xs text-gray-400">
                  支持 .xlsx 和 .xls 格式，最大 10MB
                </p>
              </div>
            )}
          </div>
          
          {/* 上传进度 */}
          {isUploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-500 mt-2 text-center">
                正在处理文件... {uploadProgress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 导入结果 */}
      {importResult && (
        <div className="space-y-4">
          {/* 总体概览 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {importResult.final_summary.total_imported > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                导入完成
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{importResult.final_summary.total_parsed}</p>
                  <p className="text-sm text-gray-500">总行数</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {importResult.final_summary.total_imported}
                  </p>
                  <p className="text-sm text-gray-500">导入成功</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {importResult.final_summary.total_failed}
                  </p>
                  <p className="text-sm text-gray-500">导入失败</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {importResult.policies.length > 0 ? '100%' : '0%'}
                  </p>
                  <p className="text-sm text-gray-500">成功率</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 成功导入的政策 */}
          {importResult.policies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  成功导入的政策 ({importResult.policies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">政策名称</th>
                        <th className="text-left py-2">城市</th>
                        <th className="text-left py-2">期间</th>
                        <th className="text-left py-2">养老保险</th>
                        <th className="text-left py-2">医疗保险</th>
                        <th className="text-left py-2">住房公积金</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.policies.map((policy, index) => (
                        <tr key={policy.id} className="border-b">
                          <td className="py-2">{policy.name}</td>
                          <td className="py-2">{policy.city}</td>
                          <td className="py-2">{policy.year}{policy.period}</td>
                          <td className="py-2">
                            <div className="text-xs">
                              <div>基数: {formatBaseDisplay(policy.pension_base_floor)}-{formatBaseDisplay(policy.pension_base_cap)}</div>
                              <div>费率: {formatRateDisplay(policy.pension_rate_staff)}/{formatRateDisplay(policy.pension_rate_enterprise)}</div>
                            </div>
                          </td>
                          <td className="py-2">
                            <div className="text-xs">
                              <div>基数: {formatBaseDisplay(policy.medical_base_floor)}-{formatBaseDisplay(policy.medical_base_cap)}</div>
                              <div>费率: {formatRateDisplay(policy.medical_rate_staff)}/{formatRateDisplay(policy.medical_rate_enterprise)}</div>
                            </div>
                          </td>
                          <td className="py-2">
                            <div className="text-xs">
                              <div>基数: {formatBaseDisplay(policy.hf_base_floor)}-{formatBaseDisplay(policy.hf_base_cap)}</div>
                              <div>费率: {formatRateDisplay(policy.hf_rate_staff)}/{formatRateDisplay(policy.hf_rate_enterprise)}</div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 错误信息 */}
          {(importResult.errors.length > 0 || importResult.database_errors.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  错误信息 ({importResult.errors.length + importResult.database_errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 数据验证错误 */}
                  {importResult.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">数据验证错误</h4>
                      <div className="space-y-2">
                        {importResult.errors.map((error, index) => (
                          <Alert key={index} className="border-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <span className="font-medium">第{error.row}行 - {error.field}:</span> {error.message}
                              {error.value !== null && (
                                <span className="text-sm text-gray-600 ml-2">
                                  (值: {JSON.stringify(error.value)})
                                </span>
                              )}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 数据库错误 */}
                  {importResult.database_errors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">数据库错误</h4>
                      <div className="space-y-2">
                        {importResult.database_errors.map((error, index) => (
                          <Alert key={index} className="border-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <span className="font-medium">{error.policy_id}:</span> {error.message}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 重复数据 */}
          {importResult.duplicates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-600">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  重复数据 ({importResult.duplicates.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {importResult.duplicates.map((duplicate, index) => (
                    <Alert key={index} className="border-yellow-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <span className="font-medium">第{duplicate.row}行:</span> {duplicate.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
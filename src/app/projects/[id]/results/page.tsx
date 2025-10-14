'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search } from 'lucide-react'

export default function ResultsPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">结果查询</h1>
          <p className="text-gray-600 mt-2">查询和导出计算结果</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              计算结果查询
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">功能开发中</h3>
              <p className="text-gray-500">结果查询功能即将上线，敬请期待</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
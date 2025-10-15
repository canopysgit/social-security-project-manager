import { WageUploadConfigPage } from '@/components/companies/wage-config/WageUploadConfigPage'

interface WageConfigPageProps {
  params: {
    id: string
  }
}

export default function WageConfigPage({ params }: WageConfigPageProps) {
  return <WageUploadConfigPage companyId={params.id} />
}

export const metadata = {
  title: '工资上传配置',
  description: '配置工资数据上传模式和字段映射'
}
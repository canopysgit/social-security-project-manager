import { ProjectUploadConfigPage } from '@/components/projects/upload-config/ProjectUploadConfigPage'

interface UploadConfigPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UploadConfigPage({ params }: UploadConfigPageProps) {
  const { id } = await params
  return <ProjectUploadConfigPage projectId={id} />
}

export const metadata = {
  title: '工资上传配置',
  description: '配置工资数据上传模式和字段映射'
}
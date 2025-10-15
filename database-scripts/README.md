# 社保补缴系统 - 数据库建表脚本

## 📁 文件说明

本目录包含社保补缴系统所需的数据库建表脚本。

## 🗂️ 脚本列表

### 1. `01-create-wage-upload-configs-table.sql`
**功能**: 创建工资上传配置表
- **表名**: `wage_upload_configs`
- **用途**: 存储各子公司的工资数据上传配置信息
- **主要字段**:
  - `config_name`: 配置名称
  - `data_mode`: 数据模式（明细工资/平均工资还原）
  - `wage_items_config`: 工资项配置（JSON格式）
  - `field_mapping`: 字段映射关系（JSON格式）
  - `average_restore_config`: 平均工资还原配置（JSON格式）

### 2. `02-create-salary-records-template-table.sql`
**功能**: 创建工资记录模板表
- **表名**: `salary_records_template`
- **用途**: 存储工资记录的表结构模板，用于为每个子公司创建独立的工资记录表
- **主要字段**:
  - 标准工资字段：`basic_salary`, `total_salary`
  - 奖金字段：`bonus1` 到 `bonus5`（支持5种奖金）
  - 补贴字段：`allowance1` 到 `allowance5`（支持5种补贴）
  - 元数据字段：`data_source`, `original_filename`, `upload_batch_id`

## 🚀 执行步骤

### 第一步：登录 Supabase Dashboard
1. 打开浏览器，访问 [https://supabase.com](https://supabase.com)
2. 登录您的账户
3. 选择对应的项目

### 第二步：进入 SQL Editor
1. 在左侧菜单中找到 **Database**
2. 点击 **SQL Editor**
3. 点击 **"New query"** 创建新的查询

### 第三步：执行脚本
1. **先执行第一个脚本**：
   - 复制 `01-create-wage-upload-configs-table.sql` 的全部内容
   - 粘贴到 SQL Editor 中
   - 点击 **"Run"** 执行
   - 等待执行完成，确认没有错误

2. **再执行第二个脚本**：
   - 复制 `02-create-salary-records-template-table.sql` 的全部内容
   - 粘贴到 SQL Editor 中
   - 点击 **"Run"** 执行
   - 等待执行完成，确认没有错误

### 第四步：验证表创建
执行完脚本后，您应该能看到：
- 两个表成功创建
- 相应的索引、约束和触发器已添加
- 测试数据已插入（可选）

## 📋 表结构说明

### wage_upload_configs 表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| company_id | UUID | 子公司ID |
| project_id | UUID | 项目ID |
| config_name | VARCHAR(100) | 配置名称 |
| data_mode | VARCHAR(20) | 数据模式 |
| wage_items_config | JSONB | 工资项配置 |
| field_mapping | JSONB | 字段映射 |
| average_restore_config | JSONB | 还原配置 |
| is_template | BOOLEAN | 是否为模板 |
| template_name | VARCHAR(100) | 模板名称 |

### salary_records_template 表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | UUID | 主键 |
| company_id | UUID | 子公司ID |
| employee_id | VARCHAR(50) | 员工ID |
| employee_name | VARCHAR(100) | 员工姓名 |
| department | VARCHAR(100) | 部门 |
| salary_month | DATE | 工资月份 |
| basic_salary | DECIMAL(10,2) | 基本工资 |
| total_salary | DECIMAL(10,2) | 工资合计 |
| bonus1-5 | DECIMAL(10,2) | 奖金1-5 |
| allowance1-5 | DECIMAL(10,2) | 补贴1-5 |
| data_source | VARCHAR(20) | 数据来源 |
| original_filename | VARCHAR(255) | 原始文件名 |
| upload_batch_id | UUID | 上传批次ID |

## ✅ 执行完成后

表创建完成后，您的工资配置功能将可以正常使用：

1. **配置保存功能**: 工资配置可以正常保存到数据库
2. **自动命名**: 配置名称会根据选中的子公司自动生成
3. **配置管理**: 支持查看、编辑、删除配置
4. **模板功能**: 支持创建和使用配置模板

## 🔧 故障排除

如果遇到问题：

1. **权限问题**: 确保您有足够的数据库操作权限
2. **外键约束**: 如果companies或projects表不存在，外键约束会自动跳过
3. **表已存在**: 脚本使用 `IF NOT EXISTS`，不会重复创建表
4. **检查错误**: 查看SQL Editor的错误信息，根据提示进行调整

执行完成后请告诉我，我们将测试配置保存功能！
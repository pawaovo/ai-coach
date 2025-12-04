# 数据库迁移操作指南

## 环境信息
- 数据库：PostgreSQL 18.0
- 数据库名：ai_coach_db
- 默认用户：postgres

## 迁移脚本列表

| 脚本文件 | 说明 | 状态 |
|---------|------|------|
| `001_init.sql` | 初始化数据库表结构 | ✅ 已执行 |
| `002_add_purchased_quota.sql` | 添加购买次数字段 | ⏳ 待执行 |
| `003_add_phone_field.sql` | 添加手机号字段 | ⏳ 待执行 |

---

## 方式一：使用 psql 命令行工具（推荐）

### 步骤 1：打开命令行

按 `Win + R`，输入 `cmd`，回车打开命令提示符。

### 步骤 2：进入迁移脚本目录

```bash
cd D:\ai\ai-coach\database\migrations
```

### 步骤 3：执行迁移脚本

**方式 A：逐个执行（推荐）**

```bash
# 执行第一个迁移：添加购买次数字段
psql -U postgres -d ai_coach_db -f 002_add_purchased_quota.sql

# 执行第二个迁移：添加手机号字段
psql -U postgres -d ai_coach_db -f 003_add_phone_field.sql
```

**方式 B：一次性执行所有迁移**

```bash
psql -U postgres -d ai_coach_db -f 002_add_purchased_quota.sql -f 003_add_phone_field.sql
```

### 步骤 4：输入密码

执行命令后会提示输入密码，输入你的 PostgreSQL 密码（默认是安装时设置的密码）。

### 步骤 5：验证结果

如果看到以下输出，说明执行成功：

```
ALTER TABLE
COMMENT
ALTER TABLE
COMMENT
```

---

## 方式二：使用 pgAdmin 图形界面

### 步骤 1：打开 pgAdmin

启动 pgAdmin 4 应用程序。

### 步骤 2：连接到数据库

1. 展开左侧树形菜单：`Servers` → `PostgreSQL 18` → `Databases` → `ai_coach_db`
2. 右键点击 `ai_coach_db`，选择 `Query Tool`

### 步骤 3：执行迁移脚本

**执行第一个迁移：**

1. 打开文件 `D:\ai\ai-coach\database\migrations\002_add_purchased_quota.sql`
2. 复制全部内容
3. 粘贴到 Query Tool 中
4. 点击 ▶️ 按钮（或按 F5）执行
5. 查看底部输出，确认 `ALTER TABLE` 和 `COMMENT` 成功

**执行第二个迁移：**

1. 清空 Query Tool
2. 打开文件 `D:\ai\ai-coach\database\migrations\003_add_phone_field.sql`
3. 复制全部内容
4. 粘贴到 Query Tool 中
5. 点击 ▶️ 按钮执行
6. 确认执行成功

---

## 方式三：使用一键迁移脚本（Windows）

我已经为你创建了一个批处理脚本，可以一键执行所有迁移。

### 步骤 1：运行���处理脚本

双击运行 `D:\ai\ai-coach\database\migrations\migrate.bat`

### 步骤 2：输入密码

按提示输入 PostgreSQL 密码。

### 步骤 3：查看结果

脚本会自动执行所有迁移并显示结果。

---

## 验证迁移是否成功

### 方法 1：使用 psql 查询

```bash
psql -U postgres -d ai_coach_db -c "\d users"
```

应该看到以下字段：

```
Column            | Type                     | Nullable | Default
------------------+--------------------------+----------+-------------------
id                | uuid                     | not null | gen_random_uuid()
openid            | character varying(100)   | not null |
phone             | character varying(20)    |          |
nickname          | character varying(100)   |          |
avatar_url        | text                     |          |
daily_quota       | integer                  |          | 10
purchased_quota   | integer                  |          | 0
is_premium        | boolean                  |          | false
created_at        | timestamp                |          | now()
```

### 方法 2：使用 SQL 查询

在 psql 或 pgAdmin 中执行：

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('purchased_quota', 'phone');
```

应该返回两行数据：

```
column_name      | data_type         | column_default
-----------------+-------------------+----------------
purchased_quota  | integer           | 0
phone            | character varying | NULL
```

---

## 常见问题

### Q1: 提示 "psql: command not found"

**原因**：PostgreSQL 的 bin 目录未添加到系统环境变量。

**解决方法**：

1. 找到 PostgreSQL 安装目录，通常是 `C:\Program Files\PostgreSQL\18\bin`
2. 使用完整路径执行命令：

```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d ai_coach_db -f 002_add_purchased_quota.sql
```

### Q2: 提示 "database 'ai_coach_db' does not exist"

**原因**：数据库尚未创建。

**解决方法**：

```bash
# 先创建数据库
psql -U postgres -c "CREATE DATABASE ai_coach_db;"

# 然后执行初始化脚本
psql -U postgres -d ai_coach_db -f 001_init.sql

# 最后执行迁移脚本
psql -U postgres -d ai_coach_db -f 002_add_purchased_quota.sql
psql -U postgres -d ai_coach_db -f 003_add_phone_field.sql
```

### Q3: 提示 "column already exists"

**原因**：字段已经存在（可能之前执行过）。

**解决方法**：这是正常的，脚本使用了 `IF NOT EXISTS`，不会重复添加字段。可以忽略此提示。

### Q4: 提示 "password authentication failed"

**原因**：密码错误。

**解决方法**：

1. 确认 PostgreSQL 密码
2. 如果忘记密码，需要重置 PostgreSQL 密码

---

## 回滚操作（如果需要）

如果迁移出现问题，可以执行回滚：

```sql
-- 回滚购买次数字段
ALTER TABLE users DROP COLUMN IF EXISTS purchased_quota;

-- 回滚手机号字段
ALTER TABLE users DROP COLUMN IF EXISTS phone;
```

---

## 迁移完成后的操作

1. ✅ 重启后端服务（如果正在运行）
2. ✅ 测试管理后台用户列表功能
3. ✅ 测试小程序配额显示功能
4. ✅ 测试购买次数扣减逻辑

---

**最后更新时间**：2025-12-04

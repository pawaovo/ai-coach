# 数据库迁移 - 快速开始

## 🚀 最简单的方式（推荐）

### 方法 1：双击运行批处理脚本

1. 双击 `migrate.bat` 文件
2. 输入 PostgreSQL 密码
3. 等待执行完成
4. 看到 "所有迁移执行完成！" 即成功

---

## 📝 手动执行（如果批处理失败）

### 步骤 1：打开命令行

按 `Win + R`，输入 `cmd`，回车

### 步骤 2：进入目录

```bash
cd D:\ai\ai-coach\database\migrations
```

### 步骤 3：执行迁移

```bash
psql -U postgres -d ai_coach_db -f 002_add_purchased_quota.sql
psql -U postgres -d ai_coach_db -f 003_add_phone_field.sql
```

### 步骤 4：输入密码

根据提示输入 PostgreSQL 密码

---

## ✅ 验证迁移结果

### 方法 1：使用验证脚本

```bash
psql -U postgres -d ai_coach_db -f verify.sql
```

### 方法 2：手动查询

```bash
psql -U postgres -d ai_coach_db -c "\d users"
```

应该看到 `purchased_quota` 和 `phone` 两个新字段。

---

## ❌ 如果遇到问题

### 问题 1：找不到 psql 命令

**解决方法**：使用完整路径

```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d ai_coach_db -f 002_add_purchased_quota.sql
```

### 问题 2：数据库不存在

**解决方法**：先创建数据库

```bash
psql -U postgres -c "CREATE DATABASE ai_coach_db;"
psql -U postgres -d ai_coach_db -f 001_init.sql
```

### 问题 3：密码错误

**解决方法**：确认 PostgreSQL 安装时设置的密码

---

## 📋 迁移内容说明

### 迁移 002：添加购买次数字段
- 字段名：`purchased_quota`
- 类型：整数
- 默认值：0
- 用途：存储用户购买的额外使用次数

### 迁移 003：添加手机号字段
- 字段名：`phone`
- 类型：字符串（最长 20 位）
- 默认值：NULL
- 用途：存储用户手机号，用于管理后台搜索

---

## 🔄 迁移后需要做什么

1. ✅ 重启后端服务（如果正在运行）
   ```bash
   cd D:\ai\ai-coach\server
   # 按 Ctrl+C 停止服务
   uvicorn app:app --reload
   ```

2. ✅ 测试管理后台
   - 访问 http://localhost:5175/
   - 登录：admin / 123456
   - 查看用户列表是否正常显示

3. ✅ 测试小程序
   - 查看配额显示是否正确
   - 测试发送消息扣减次数

---

**需要帮助？** 查看完整文档：`README.md`

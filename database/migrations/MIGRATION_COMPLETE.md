# ✅ 数据库迁移已完成

## 执行时间
2025-12-04

## 迁移内容

### ✅ 迁移 002：添加购买次数字段
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS purchased_quota INT DEFAULT 0;
```
- **字段名**：`purchased_quota`
- **类型**：整数 (integer)
- **默认值**：0
- **状态**：✅ 已成功添加

### ✅ 迁移 003：添加手机号字段
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
```
- **字段名**：`phone`
- **类型**：字符串 (character varying)
- **最大长度**：20
- **默认值**：NULL
- **状态**：✅ 已成功添加

---

## 验证结果

执行 Python 迁移脚本后的输出：

```
Connecting to database...
[OK] Connected successfully

Running migration: 002_add_purchased_quota
[OK] 002_add_purchased_quota completed

Running migration: 003_add_phone_field
[OK] 003_add_phone_field completed

Verifying migrations...
[OK] Migration verification:
  - phone: character varying (default: None)
  - purchased_quota: integer (default: 0)

[OK] All migrations completed successfully!
```

---

## 当前 users 表结构

| 字段名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| id | uuid | gen_random_uuid() | 主键 |
| openid | varchar(100) | - | 微信 openid |
| **phone** | **varchar(20)** | **NULL** | **手机号（新增）** |
| nickname | varchar(100) | - | 用户昵称 |
| avatar_url | text | - | 头像 URL |
| daily_quota | integer | 10 | 每日免费配额 |
| **purchased_quota** | **integer** | **0** | **购买次数（新增）** |
| is_premium | boolean | false | 是否高级用户 |
| created_at | timestamp | now() | 创建时间 |

---

## 下一步操作

### 1. 启动后端服务
```bash
cd D:\ai\ai-coach\server
uvicorn app:app --reload
```

后端服务地址：http://localhost:8000

### 2. 访问管理后台
- 地址：http://localhost:5175/
- 用户名：`admin`
- 密码：`123456`

### 3. 测试功能
- ✅ 登录管理后台
- ✅ 查看用户列表（应显示 phone 和 purchased_quota 字段）
- ✅ 搜索用户（按手机号）
- ✅ 修改购买次数
- ✅ 验证小程序配额显示

---

## 故障排查

### 如果需要重新执行迁移

使用 Python 脚本（推荐）：
```bash
cd D:\ai\ai-coach\database\migrations
python migrate.py
```

### 如果需要回滚

```sql
ALTER TABLE users DROP COLUMN IF EXISTS purchased_quota;
ALTER TABLE users DROP COLUMN IF EXISTS phone;
```

---

## 相关文件

- `002_add_purchased_quota.sql` - 购买次数字段迁移脚本
- `003_add_phone_field.sql` - 手机号字段迁移脚本
- `migrate.py` - Python 自动迁移脚本（推荐使用）
- `README.md` - 完整迁移文档
- `QUICKSTART.md` - 快速开始指南

---

**迁移状态**：✅ 全部完成
**数据库版本**：003
**最后更新**：2025-12-04

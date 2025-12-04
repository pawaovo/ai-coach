# 本地数据库创建指南

## 数据库信息

- **数据库名**: `ai_coach_db`
- **用户**: 使用你的 PostgreSQL 默认用户（通常是 `postgres`）
- **端口**: 5432（默认）

---

## 方法 1：使用 Navicat 创建（推荐）

### 步骤 1：创建数据库
1. 打开 Navicat
2. 连接到本地 PostgreSQL
3. 右键点击连接 → **新建数据库**
4. 填写信息：
   - **数据库名**: `ai_coach_db`
   - **字符集**: `UTF8`
   - **排序规则**: `zh_CN.UTF-8` 或 `en_US.UTF-8`
5. 点击**确定**

### 步骤 2：执行 SQL 脚本
1. 双击打开 `ai_coach_db` 数据库
2. 点击顶部菜单 **查询** → **新建查询**
3. 复制 `database/migrations/001_init.sql` 的内容
4. 粘贴到查询窗口
5. 点击**运行**（或按 F5）

### 步骤 3：验证表创建
1. 刷新数据库
2. 展开 **表** 节点
3. 应该看到 4 个表：
   - `users`
   - `usage_logs`
   - `chat_sessions`
   - `chat_messages`

---

## 方法 2：使用 SQL 命令行

### 步骤 1：连接到 PostgreSQL
```bash
psql -U postgres
```

### 步骤 2：创建数据库
```sql
CREATE DATABASE ai_coach_db
    WITH
    ENCODING = 'UTF8'
    LC_COLLATE = 'zh_CN.UTF-8'
    LC_CTYPE = 'zh_CN.UTF-8';
```

### 步骤 3：连接到新数据库
```bash
\c ai_coach_db
```

### 步骤 4：执行迁移脚本
```bash
\i D:/ai/ai-coach/database/migrations/001_init.sql
```

### 步骤 5：验证表
```sql
\dt
```

---

## 方法 3：使用 Python 脚本自动创建

### 创建并运行脚本
```bash
cd D:/ai/ai-coach/server
python -c "
from sqlalchemy import create_engine
import os

# 读取 SQL 文件
with open('../database/migrations/001_init.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

# 连接数据库
engine = create_engine('postgresql://postgres:your_password@localhost:5432/ai_coach_db')

# 执行 SQL
with engine.connect() as conn:
    conn.execute(sql)
    conn.commit()

print('✅ 数据库表创建成功！')
"
```

---

## 配置连接信息

### 更新 .env 文件
```env
DATABASE_URL=postgresql://postgres:你的密码@localhost:5432/ai_coach_db
```

### 更新小程序 API 配置
编辑 `miniapp/src/constants/index.ts`：
```typescript
export const API_CONFIG = {
  baseURL: 'http://localhost:8000/api',
  wsURL: 'ws://localhost:8000/ws',
  timeout: 30000
};
```

---

## 验证连接

### 测试后端连接
```bash
cd server
python -c "
from services.database import engine
try:
    with engine.connect() as conn:
        result = conn.execute('SELECT version()')
        print('✅ 数据库连接成功！')
        print(result.fetchone()[0])
except Exception as e:
    print('❌ 连接失败:', e)
"
```

---

## 表结构说明

### users（用户表）
- `id`: UUID 主键
- `openid`: 微信 openid（唯一）
- `nickname`: 昵称
- `avatar_url`: 头像
- `daily_quota`: 每日免费次数（默认 10）
- `is_premium`: 是否付费用户
- `created_at`: 创建时间

### usage_logs（使用记录表）
- `id`: UUID 主键
- `user_id`: 用户 ID（外键）
- `date`: 日期
- `count`: 当日使用次数
- 唯一约束：(user_id, date)

### chat_sessions（会话表）
- `id`: UUID 主键
- `user_id`: 用户 ID（外键）
- `tool_type`: 工具类型（free_chat/swot/smart 等）
- `created_at`: 创建时间

### chat_messages（消息表）
- `id`: UUID 主键
- `session_id`: 会话 ID（外键）
- `role`: 角色（user/assistant）
- `content`: 消息内容
- `created_at`: 创建时间

---

## 常见问题

### Q: 数据库已存在怎么办？
```sql
-- 删除旧数据库（谨慎！）
DROP DATABASE IF EXISTS ai_coach_db;

-- 重新创建
CREATE DATABASE ai_coach_db WITH ENCODING = 'UTF8';
```

### Q: 表已存在怎么办？
```sql
-- 删除所有表（谨慎！）
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS usage_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 重新执行 001_init.sql
```

### Q: 如何查看表结构？
在 Navicat 中：
1. 右键点击表
2. 选择 **设计表**

或使用 SQL：
```sql
\d users
```

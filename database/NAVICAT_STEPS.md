# Navicat 创建数据库步骤（图文指南）

## 📋 数据库信息
- **数据库名**: `ai_coach_db`
- **用户**: `nfc_bracelet_fortune`
- **密码**: `123456`
- **连接字符串**: `postgresql://nfc_bracelet_fortune:123456@localhost:5432/ai_coach_db`

---

## 🔧 步骤 1：创建数据库

1. 打开 **Navicat**
2. 找到你的 PostgreSQL 连接（用户 `nfc_bracelet_fortune`）
3. 右键点击连接 → 选择 **新建数据库**
4. 填写信息：
   ```
   数据库名: ai_coach_db
   字符集: UTF8
   排序规则: zh_CN.UTF-8 或 en_US.UTF-8
   所有者: nfc_bracelet_fortune
   ```
5. 点击 **确定**

---

## 📝 步骤 2：执行 SQL 脚本

1. 在 Navicat 左侧，双击打开 `ai_coach_db` 数据库
2. 点击顶部菜单 **查询** → **新建查询**
3. 复制下面的 SQL 内容并粘贴到查询窗口：

```sql
-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    openid VARCHAR(100) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    avatar_url TEXT,
    daily_quota INT DEFAULT 10,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 使用记录表
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 会话表
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tool_type VARCHAR(50) DEFAULT 'free_chat',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 消息表
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(10) CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_usage_logs_user_date ON usage_logs(user_id, date);
CREATE INDEX idx_sessions_user_created ON chat_sessions(user_id, created_at DESC);
CREATE INDEX idx_messages_session_created ON chat_messages(session_id, created_at ASC);
```

4. 点击 **运行**（或按 F5）
5. 等待执行完成

---

## ✅ 步骤 3：验证表创建

1. 在 Navicat 左侧，右键 `ai_coach_db` → **刷新**
2. 展开 **表** 节点
3. 应该看到 4 个表：
   - ✅ `users`
   - ✅ `usage_logs`
   - ✅ `chat_sessions`
   - ✅ `chat_messages`

---

## 🧪 步骤 4：测试连接（可选）

在 Navicat 查询窗口执行：

```sql
-- 测试插入用户
INSERT INTO users (openid, nickname)
VALUES ('test_openid_001', '测试用户');

-- 查询用户
SELECT * FROM users;

-- 删除测试数据
DELETE FROM users WHERE openid = 'test_openid_001';
```

---

## 📌 完成后告诉我

创建完成后，告诉我一声，我会帮你：
1. 测试后端连接
2. 启动 FastAPI 服务
3. 测试完整的 API 流程

---

## ❓ 如果遇到问题

### 问题 1：数据库已存在
```sql
DROP DATABASE IF EXISTS ai_coach_db;
CREATE DATABASE ai_coach_db WITH ENCODING = 'UTF8';
```

### 问题 2：表已存在
```sql
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS usage_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
-- 然后重新执行上面的创建表 SQL
```

### 问题 3：权限不足
确保用户 `nfc_bracelet_fortune` 有创建表的权限。

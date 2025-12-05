# 上下文管理修复说明

## 问题描述

小程序第一次发送消息 AI 回复正常，但第二次发送消息 AI 不会回复。

## 根本原因

在 `server/websocket/chat_handler.py` 中，上下文管理逻辑存在问题：

1. **消息顺序错误**：先保存用户消息到数据库，再查询历史消息，导致当前消息被重复包含
2. **历史消息过多**：使用 `limit(20)` 查询 20 条消息，没有限制为最近 5 轮对话
3. **消息重复**：历史消息中已包含当前用户消息，又在构建 messages 时添加，导致重复

## 修复方案

### 1. 调整消息处理顺序

**修复前**：
```python
# 保存用户消息
user_msg = ChatMessage(...)
db.add(user_msg)
db.commit()

# 查询历史消息（包含刚保存的消息）
history = db.query(ChatMessage).filter(...).limit(20).all()

# 构建消息列表
messages = [system_prompt]
for h in history:
    messages.append({"role": h.role, "content": h.content})
```

**修复后**：
```python
# 先查询历史消息（不包含当前消息）
history = db.query(ChatMessage).filter(...).limit(10).all()
history.reverse()

# 构建消息列表
messages = [system_prompt]
for h in history:
    messages.append({"role": h.role, "content": h.content})
messages.append({"role": "user", "content": user_message})

# 最后保存用户消息
user_msg = ChatMessage(...)
db.add(user_msg)
db.commit()
```

### 2. 限制历史消息数量

- **修复前**：`limit(20)` - 查询最近 20 条消息
- **修复后**：`limit(10)` - 查询最近 10 条消息（5 轮对话）

### 3. 修复消息顺序

- **修复前**：`order_by(ChatMessage.created_at.asc())` - 升序排列
- **修复后**：`order_by(ChatMessage.created_at.desc()).limit(10)` + `reverse()` - 先降序取最近 10 条，再反转为升序

## 修复后的逻辑流程

```
1. 接收用户消息
2. 查询历史消息（最近 10 条，不包含当前消息）
3. 反转历史消息顺序（从旧到新）
4. 构建 API 请求消息列表：
   - 系统提示词
   - 历史消息（最多 10 条）
   - 当前用户消息
5. 调用 AI API 获取回复
6. 保存用户消息到数据库
7. 保存 AI 回复到数据库
8. 发送完成信号
```

## 上下文管理策略

### 消息数量限制
- **最近 5 轮对话** = 10 条消息（5 条用户消息 + 5 条 AI 回复）
- 防止上下文过长，控制 API 成本
- 保持对话连贯性

### 消息结构
```json
[
  {
    "role": "system",
    "content": "系统提示词"
  },
  {
    "role": "user",
    "content": "历史用户消息 1"
  },
  {
    "role": "assistant",
    "content": "历史 AI 回复 1"
  },
  // ... 最多 5 轮历史对话
  {
    "role": "user",
    "content": "当前用户消息"
  }
]
```

## 测试方法

### 方法 1：使用测试脚本

```bash
# 安装依赖
pip install websockets

# 运行测试
python test_websocket.py
```

### 方法 2：使用小程序

1. 重启后端服务
2. 清除小程序缓存
3. 发送第一条消息，等待 AI 回复
4. 发送第二条消息，验证 AI 是否正常回复
5. 继续发送多条消息，验证上下文连贯性

### 方法 3：检查数据库

```sql
-- 查看某个会话的所有消息
SELECT
    id,
    role,
    LEFT(content, 50) as content_preview,
    created_at
FROM chat_messages
WHERE session_id = 'your_session_id'
ORDER BY created_at ASC;

-- 验证消息数量
SELECT
    session_id,
    COUNT(*) as message_count
FROM chat_messages
GROUP BY session_id;
```

## 预期结果

- ✅ 第一条消息：AI 正常回复
- ✅ 第二条消息：AI 正常回复，且能理解上下文
- ✅ 第三条消息：AI 正常回复，且能理解前两轮对话
- ✅ 第 6 轮对话：只保留最近 5 轮历史，最早的对话被丢弃

## 相关文件

- `server/websocket/chat_handler.py` - WebSocket 聊天处理器（已修复）
- `test_websocket.py` - WebSocket 测试脚本（新增）
- `CONTEXT_MANAGEMENT_FIX.md` - 本文档

## 注意事项

1. **数据库持久化**：所有消息仍然保存在数据库中，只是 API 请求时只发送最近 5 轮
2. **会话管理**：每个会话独立管理上下文，不同会话之间不共享历史
3. **性能优化**：限制历史消息数量可以减少数据库查询和 API 请求大小
4. **成本控制**：减少发送给 AI 的 token 数量，降低 API 调用成本

---

**修复时间**：2025-12-05
**修复人员**：Claude Code

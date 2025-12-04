# 服务层集成总结

## ✅ 已完成的集成

### 1. app.tsx - 应用入口
- [x] 集成 NFC 唤起处理（`handleNFCLaunch`）
- [x] 集成自动登录（`login`）
- [x] 应用启动时自动执行

### 2. pages/index/index.tsx - AI 对话页
- [x] 集成 WebSocket 服务
  - 连接管理
  - 流式消息接收
  - 自动重连
  - 错误处理
- [x] 集成 API 服务
  - 获取会话列表
  - 加载历史消息
- [x] 集成使用次数管理
  - 发送前检查次数
  - 自动增加计数
  - 超出限制弹窗引导
- [x] 集成本地存储
  - 保存最近会话 ID
  - 恢复上次会话

### 3. pages/tools/index.tsx - 商业工具页
- [x] 集成 API 服务
  - 创建新会话
  - 传递工具类型
- [x] 集成本地存储
  - 保存会话 ID
- [x] 跳转到对话页

---

## 🔄 数据流程

### 用户发送消息流程
```
用户输入 → 检查使用次数 → WebSocket 发送 → 流式接收 → 显示消息 → 增加计数
```

### 工具启动流程
```
点击工具卡片 → API 创建会话 → 保存会话 ID → 跳转对话页 → 加载会话
```

### 应用启动流程
```
App 启动 → NFC 检测 → 自动登录 → 对话页初始化 → WebSocket 连接 → 加载历史
```

---

## 📝 关键功能说明

### WebSocket 流式响应
- **连接**: 应用启动时自动连接
- **发送**: `websocket.sendMessage(message, toolType, sessionId)`
- **接收**: 通过回调函数实时更新 UI
  - `onChunk`: 接收文本片段
  - `onDone`: 消息完成
  - `onSession`: 接收会话 ID
  - `onError`: 错误处理
- **重连**: 断线后 3 秒自动重连
- **心跳**: 每 30 秒发送心跳保持连接

### 使用次数限制
- **检查**: `checkDailyQuota()` - 发送前检查
- **增加**: `incrementUsage()` - 发送后增加
- **限制**: 每日 10 次免费
- **引导**: 超出后弹窗引导到"连接我们"页

### 会话管理
- **创建**: 工具页点击 → API 创建会话
- **保存**: 会话 ID 存储到 localStorage
- **恢复**: 应用启动时恢复最近会话
- **切换**: 会话菜单切换不同会话

---

## 🎯 待后端实现的 API

### 认证相关
- `POST /api/auth/login` - 微信登录
  - 入参: `{ code: string }`
  - 返回: `{ token: string, userId: string }`

### 会话相关
- `POST /api/sessions` - 创建会话
  - 入参: `{ tool_type: string }`
  - 返回: `{ id: string, userId: string, toolType: string, createdAt: string }`

- `GET /api/sessions` - 获取会话列表
  - 返回: `ChatSession[]`

- `GET /api/sessions/:id/messages` - 获取会话消息
  - 返回: `ChatMessage[]`

### 使用次数相关
- `GET /api/usage/check` - 检查使用次数
  - 返回: `{ remaining: number, total: number }`

- `POST /api/usage/increment` - 增加使用次数
  - 返回: `void`

### WebSocket
- `WS /ws/chat?user_id=xxx` - WebSocket 连接
- 消息格式:
  ```json
  // 客户端 → 服务器
  {
    "message": "用户消息",
    "tool_type": "free_chat",
    "session_id": "xxx"
  }

  // 服务器 → 客户端
  { "type": "chunk", "content": "文本片段" }
  { "type": "session", "sessionId": "xxx" }
  { "type": "done", "sessionId": "xxx" }
  { "type": "error", "error": "错误信息" }
  ```

---

## 🚀 下一步工作

### 前端（可选优化）
- [ ] 添加历史会话列表展示
- [ ] 实现 SWOT/SMART 工具模态框
- [ ] 添加消息重发功能
- [ ] 优化加载状态显示

### 后端（必须）
- [ ] 部署 PostgreSQL 数据库
- [ ] 搭建 FastAPI 后端
- [ ] 实现所有 API 接口
- [ ] 实现 WebSocket 服务
- [ ] 集成火山引擎 API

### 测试
- [ ] 测试 WebSocket 连接
- [ ] 测试使用次数限制
- [ ] 测试会话管理
- [ ] 测试 NFC 唤起

---

## 📌 注意事项

1. **环境变量配置**
   - 需要在项目中配置 API 地址和 WebSocket 地址
   - 修改 `src/constants/index.ts` 中的 `API_CONFIG`

2. **错误处理**
   - 所有 API 调用都有 try-catch 包裹
   - WebSocket 断线会自动重连
   - 使用次数检查失败时允许继续使用（降级策略）

3. **用户体验**
   - 流式响应实时显示
   - 加载状态清晰
   - 错误提示友好
   - 超出限制引导明确

4. **性能优化**
   - WebSocket 心跳保持连接
   - 本地存储减少 API 调用
   - 会话 ID 缓存避免重复创建

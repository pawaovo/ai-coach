# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**AI 高管教练**是一款面向企业高管的微信小程序，通过引导式对话帮助高管理清思路、做出更好的决策。基于 Taro 3 + React 18 框架开发，后端使用 FastAPI + PostgreSQL，集成火山引擎豆包 AI 模型。

## Tech Stack

### 前端（微信小程序）
- **框架**: Taro 3.6.0 + React 18.2.0
- **语言**: TypeScript
- **样式**: SCSS + Tweakcn 主题
- **构建**: Webpack 5

### 后端
- **框架**: FastAPI (Python)
- **数据库**: PostgreSQL 18.0
- **ORM**: SQLAlchemy
- **认证**: JWT + 微信小程序登录
- **AI**: 火山引擎豆包 (doubao-seed-1-6-lite-251015)

## Development Commands

### 前端

```bash
# 安装依赖
cd miniapp
npm install --legacy-peer-deps

# 开发模式
npm run dev:weapp

# 生产构建
npm run build:weapp
```

### 后端

```bash
# 安装依赖
cd server
pip install fastapi uvicorn sqlalchemy psycopg2-binary httpx pyjwt python-dotenv

# 启动服务
uvicorn app:app --reload

# 测试
curl http://localhost:8000/health
```

## Environment Configuration

创建 `.env` 文件：

```env
# 数据库
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ai_coach_db

# 火山引擎 API
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
OPENAI_MODEL=doubao-seed-1-6-lite-251015

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# 微信小程序
WECHAT_APP_ID=your_appid
WECHAT_APP_SECRET=your_secret
```

## Architecture

### Project Structure

```
ai-coach/
├── miniapp/                    # 小程序前端
│   ├── src/
│   │   ├── app.tsx            # 应用入口
│   │   ├── app.config.ts      # 小程序配置（custom tabBar）
│   │   ├── app.scss           # 全局样式
│   │   ├── constants/
│   │   │   └── index.ts       # 常量配置（API、工具、人格）
│   │   ├── components/
│   │   │   └── CustomTabBar/  # 自定义底部导航栏
│   │   │       ├── index.tsx  # TabBar 组件（点击放大动画）
│   │   │       └── index.scss # TabBar 样式
│   │   ├── pages/
│   │   │   ├── index/         # AI 教练对话页
│   │   │   ├── tools/         # 商业工具页
│   │   │   ├── connect/       # 连接我们页
│   │   │   └── authorize/     # 用户授权页
│   │   ├── services/
│   │   │   ├── api.ts         # HTTP API 封装
│   │   │   └── websocket.ts   # WebSocket 服务
│   │   ├── utils/
│   │   │   ├── auth.ts        # 认证工具
│   │   │   ├── storage.ts     # 本地存储
│   │   │   ├── usage.ts       # 使用次数管理
│   │   │   └── nfc.ts         # NFC 唤醒
│   │   ├── types/
│   │   │   └── index.ts       # TypeScript 类型定义
│   │   └── styles/
│   │       └── theme.scss     # Tweakcn 主题配置
│   └── dist/                  # 编译输出（微信开发者工具导入此目录）
├── server/                     # 后端服务
│   ├── app.py                 # FastAPI 主应用
│   ├── routes/
│   │   ├── auth.py            # 微信登录 API
│   │   ├── chat.py            # 会话管理 API
│   │   └── usage.py           # 使用次数 API
│   ├── models/
│   │   ├── user.py            # 用户模型
│   │   ├── chat_session.py    # 会话模型
│   │   ├── chat_message.py    # 消息模型
│   │   └── usage_log.py       # 使用记录模型
│   ├── services/
│   │   └── database.py        # 数据库连接
│   └── websocket/
│       └── chat_handler.py    # WebSocket 聊天处理器
├── database/
│   └── migrations/
│       └── 001_init.sql       # 数据库初始化脚本
└── .env                       # 环境变量
```

### Database Schema

```sql
-- 用户表
users (id, openid, phone, nickname, avatar_url, daily_quota, purchased_quota, is_premium, created_at)

-- 会话表
chat_sessions (id, user_id, tool_type, created_at)

-- 消息表
chat_messages (id, session_id, role, content, created_at)

-- 使用记录表
usage_logs (id, user_id, date, count, created_at)
```

### Key Files & Responsibilities

| 文件 | 职责 |
|------|------|
| `miniapp/src/components/CustomTabBar/index.tsx` | 自定义 TabBar 组件（点击放大动画、文字标签） |
| `miniapp/src/app.tsx` | 小程序入口，处理 NFC 唤醒、自动登录和授权跳转 |
| `miniapp/src/pages/authorize/index.tsx` | 用户授权页面，获取昵称、头像、手机号 |
| `miniapp/src/constants/index.ts` | 配置 API 地址、商业工具、AI 人格 |
| `miniapp/src/services/websocket.ts` | WebSocket 连接管理、自动重连、心跳 |
| `miniapp/src/services/api.ts` | HTTP API 封装、Token 注入 |
| `miniapp/src/pages/index/index.tsx` | AI 对话页面、流式响应、会话管理 |
| `miniapp/src/styles/theme.scss` | Tweakcn 主题变量（rpx 单位） |
| `server/app.py` | FastAPI 应用、路由注册、CORS 配置 |
| `server/routes/auth.py` | 微信登录、用户信息更新、JWT Token 生成 |
| `server/routes/chat.py` | 会话 CRUD、Token 验证 |
| `server/routes/usage.py` | 使用次数检查和增加 |
| `server/routes/admin.py` | 管理后台 API（用户列表、配额管理） |
| `server/websocket/chat_handler.py` | WebSocket 处理、流式 AI 响应、消息持久化 |

## Code Patterns

### 前端

#### 组件结构
- 函数式组件 + Hooks（useState, useEffect, useRef）
- Props 接口定义在 `types/index.ts`
- 使用 Taro API（Taro.request, Taro.connectSocket, Taro.login）

#### 样式规范
- 使用 `rpx` 单位（小程序响应式单位，750rpx = 屏幕宽度）
- 从 `theme.scss` 导入主题变量
- 避免使用通配符选择器 `*`（WXSS 不支持）

#### 数据流
```
用户操作 → 组件状态更新 → API/WebSocket 调用 → 后端处理 → 数据库持久化
                ↓
         UI 更新 → 用户反馈
```

### 后端

#### API 响应格式
```python
{
    "code": 0,           # 0 表示成功，非 0 表示错误
    "message": "success",
    "data": {...}        # 实际数据
}
```

#### WebSocket 消息格式
```python
# 会话 ID
{"type": "session", "sessionId": "uuid"}

# 流式文本块
{"type": "chunk", "content": "文本"}

# 智能选项（AI 回复后自动生成）
{"type": "options", "options": [{"id": "uuid", "label": "显示文字", "value": "实际值"}]}

# 完成信号
{"type": "done", "sessionId": "uuid"}

# 错误
{"type": "error", "error": "错误信息"}
```

## Important Notes

### 前端注意事项

1. **React 版本**: 必须使用 React 18.2.0（Taro 4.1.9 不兼容 React 19）
2. **环境变量**: 小程序不支持 `process.env`，直接硬编码配置
3. **API 地址**: 开发环境使用 `http://localhost:8000`，生产环境需配置域名白名单
4. **rpx 单位**: 所有尺寸使用 rpx，1rpx ≈ 0.5px（iPhone 6 基准）
5. **WXSS 限制**: 不支持通配符选择器、某些 CSS3 特性

### 后端注意事项

1. **环境变量**: 必须通过 `.env` 文件加载（使用 `python-dotenv`）
2. **数据库连接**: 使用 SQLAlchemy，连接字符串从环境变量读取
3. **JWT 认证**: 所有需要认证的 API 使用 `get_user_id_from_token` 依赖
4. **WebSocket**: 使用 FastAPI 原生 WebSocket 支持
5. **流式响应**: 火山引擎 API 返回 SSE 格式，需逐行解析

### AI 对话特性

1. **系统提示词**: 高管教练人格，强调引导式对话
2. **历史上下文**: 查询最近 20 条消息，保持对话连贯
3. **错误重试**: 最多重试 2 次，失败后向用户显示错误
4. **消息持久化**: 所有对话自动存入数据库
5. **智能选项生成**: AI 回复后自动生成 3-5 个引导式选项

### 商业工具引导式对话

商业工具（SWOT、SMART、决策矩阵、5Why）支持引导式对话功能：

1. **预设选项**：每个工具配置 `initialOptions` 数组，点击工具卡片时显示初始选项
2. **智能选项**：AI 回复后，后端调用第二次 AI API 生成 3-5 个引导式选项
3. **多选支持**：用户可以选择多个选项，支持选项 + 输入文字一起发送
4. **消息格式**：选中的选项会以 `我选择了：\n选项1\n选项2` 格式拼接到用户消息中

#### 选项数据结构
```typescript
interface SuggestedOption {
  id: string;      // 唯一标识
  label: string;   // 显示文字（简短）
  value: string;   // 实际值（发送给 AI）
}
```

#### 工具配置示例
```typescript
{
  id: 'swot',
  name: 'SWOT 分析',
  initialMessage: '你好，我是SWOT战略分析助手...',
  initialOptions: [
    { label: '分析企业整体战略', value: '我想分析我的企业整体战略定位和竞争优势' },
    { label: '评估新产品机会', value: '我想评估一个新产品或新项目的可行性' },
    // ...
  ]
}
```

## Completed Tasks

### ✅ 已完成

- 小程序前端框架搭建（Taro 4 + React 18）
- 后端 API 实现（FastAPI + PostgreSQL）
- 微信登录集成（JWT Token）
- 用户信息授权（昵称、头像、手机号）
- 流式 AI 对话（WebSocket + 火山引擎）
- 会话管理（创建、查询、切换）
- 使用次数管理（每日免费配额 + 购买次数）
- 管理后台（用户管理、配额管理、手机号搜索）
- 历史对话上下文（最近 20 条）
- 错误重试机制（最多 2 次）
- 数据库持久化（用户、会话、消息、使用记录）
- 数据库迁移工具（Python 脚本）
- Tweakcn 主题配置（SCSS + rpx）
- 商业工具 2/3 屏对话窗口（高斯模糊背景）
- WebSocket 流式对话修复（Taro 4 全局 API）
- 商业工具引导式对话功能：
  - ✅ 预设选项配置（initialOptions）
  - ✅ AI 智能选项生成（后端第二次 API 调用）
  - ✅ 多选功能支持
  - ✅ 选项卡片 UI（圆形复选框 + 选中高亮）
  - ✅ 选项 + 输入文字混合发送
- 代码质量优化：
  - ✅ 合并重复的 CSS 动画定义（减少 30 行代码）
  - ✅ 标准化日志记录（logger.error 替代 print）
  - ✅ 提取重复的 TypeScript 类型定义
  - ✅ 删除未使用的导入、状态、函数
  - ✅ 清理调试代码（console.log/print）
  - ✅ 删除无用的类型字段（Message.suggestedOptions）
  - ✅ 修复发送按钮激活条件（支持只选择选项发送）
- 文档更新（README.md + CLAUDE.md）

### 🚧 待完成

- 微信小程序账号申请
- 服务器部署（Gunicorn + Nginx）
- 域名配置和 SSL 证书
- 生产环境测试

## Development Tips

### 调试小程序

1. 在微信开发者工具中导入 `miniapp/dist` 目录
2. 勾选"不校验合法域名"（开发阶段）
3. 使用 Console 查看日志
4. 使用 Network 查看请求

### 调试后端

1. 访问 http://localhost:8000/docs 查看 API 文档
2. 使用 curl 或 Postman 测试 API
3. 查看终端日志
4. 使用 PostgreSQL 客户端查看数据库

### 常见问题

**Q: 小程序白屏？**
A: 检查 Console 错误，通常是 API 地址配置错误或 WXSS 语法错误

**Q: WebSocket 连接失败？**
A: 确保后端服务运行，检查 API 地址配置

**Q: 数据库连接失败？**
A: 检查 `.env` 中的 `DATABASE_URL`，确保 PostgreSQL 服务运行

**Q: React 版本冲突？**
A: 使用 `npm install --legacy-peer-deps` 安装依赖

## Code Quality Notes

### ✅ 已完成优化（2025-12-05）

1. **合并重复的 CSS 动画定义**
   - 从 `miniapp/src/pages/index/index.scss` 和 `miniapp/src/pages/tools/index.scss` 中删除重复的动画
   - 将 `@keyframes thinking`、`@keyframes blink`、`@keyframes slideUp` 合并到全局主题文件 `miniapp/src/styles/theme.scss`
   - 减少了约 30 行重复代码

2. **标准化日志记录**
   - 将 `server/websocket/chat_handler.py` 的 `print()` 改为标准的 `logger.error()`
   - 添加了 `exc_info=True` 参数以获取完整的异常堆栈信息
   - 使代码更符合生产环境的日志最佳实践

3. **提取重复的类型定义**
   - 从两个页面组件中删除重复的 `Message` 接口定义
   - 将其集中到 `miniapp/src/types/index.ts` 作为共享类型
   - 确保类型定义的单一来源（Single Source of Truth）

### 🎯 代码质量状态

- ✅ 无多余的调试语句（console.log/print）
- ✅ 无空的异常处理块
- ✅ API URL 统一配置在常量文件
- ✅ 无重复的样式和动画定义
- ✅ 类型定义集中管理
- ✅ 标准化的日志记录

### 📋 待优化建议

#### 中优先级
- 提取重复的 Base64 转换逻辑
- 替换 `any` 类型为具体类型

#### 低优先级
- 优化性能（使用 useCallback, useMemo）
- 提取魔法数字为常量

---

## UI/UX 优化记录

### 2025-12-08 更新
- ✅ 商业工具引导式对话功能
  - 预设选项：点击工具卡片后立即显示 4 个预设选项
  - 智能选项：AI 回复后自动生成 3-5 个引导式选项
  - 多选支持：用户可同时选择多个选项
  - 选项卡片 UI：圆形复选框 + 白色卡片 + 选中高亮（主题色边框和背景）
  - 无分隔线设计：选项区域与消息区域视觉融合
  - 发送按钮优化：选择选项后按钮自动激活
- ✅ 代码质量优化
  - 删除无用的 `Message.suggestedOptions` 类型字段
  - 修复发送按钮激活条件逻辑

### 2025-12-07 更新
- ✅ 自定义 TabBar 组件（CustomTabBar）
  - 使用统一的 active 图标（不区分活跃/非活跃状态）
  - 点击放大动画效果（scale 1.2，150ms）
  - 仅当前页面显示对应文字标签（工具/对话/联系）
  - TabBar 高度 140rpx，图标尺寸 52rpx
- ✅ AI 对话页输入栏位置调整（bottom: 140rpx）
- ✅ 商业工具弹窗输入栏位置修复（padding-bottom: 160rpx）
- ✅ 代码优化：合并重复的 padding 定义

### 2025-12-05 更新
- ✅ 全局背景色改为 `#F0EEE6`（温暖米色）
- ✅ 工具卡片背景色改为 `#E3DACC`
- ✅ 工具卡片删除图标，标题加粗放大
- ✅ 自定义导航栏与微信胶囊按钮对齐（padding-top: 88rpx, min-height: 176rpx）
- ✅ 输入栏悬浮效果（position: fixed, bottom: 0, background: transparent）
- ✅ 联系我们页面底部按钮固定在与输入栏相同位置
- ✅ 联系我们页面按钮颜色改为 `#c96442`
- ✅ 联系卡片背景色改为 `#E3DACC`

### 2025-12-04 更新
- ✅ 删除 AI 对话页面顶部"AI 高管教练"标题
- ✅ 重新设计输入栏，发送按钮移到输入框内部
- ✅ 发送按钮改为圆形图标，内部箭头颜色为白色
- ✅ 工具页面标题居中，删除描述文字
- ✅ 工具卡片改为长方形列表布局（每行1个）
- ✅ 工具标签移到标题后方展示
- ✅ 删除工具页面底部提示卡片
- ✅ 联系我们页面删除顶部描述区域
- ✅ 顶部导航改为左右图标按钮 + 中间配额显示
- ✅ 左上角历史对话图标（#c96442色）
- ✅ 右上角新对话按钮（CSS绘制的加号，#c96442色）
- ✅ 用户消息右侧留白，避免超出屏幕
- ✅ 删除输入框上方的工具快速选择栏（简化界面）
- ✅ WebSocket 流式对话修复（Taro 4 API）
- ✅ 代码清理：删除未使用的导入、状态、函数、重复逻辑
- ✅ 配额显示优化（免费次数 + 购买次数）
- ✅ 用户授权页面（首次使用获取昵称、头像、手机号）
- ✅ 管理后台手机号搜索功能修复（空值保护）

---

## Technical Implementation Notes

### WebSocket 实现（Taro 4）
- 使用全局 API：`Taro.connectSocket()`, `Taro.onSocketOpen()`, `Taro.sendSocketMessage()`
- 避免使用 SocketTask 实例方法（Taro 4 返回 Promise）
- 流式文本通过 `setStreamingText` 回调获取最新值

### 用户授权流程
1. 用户首次打开小程序，调用 `wx.login()` 获取 code
2. 后端用 code 换取 openid，创建用户记录，返回 JWT token 和 `needProfile` 标志
3. 如果 `needProfile` 为 true，跳转到授权页面 `/pages/authorize/index`
4. 授权页面使用 `<button open-type="chooseAvatar">` 获取头像
5. 使用 `<input type="nickname">` 获取昵称
6. 使用 `<button open-type="getPhoneNumber">` 获取手机号 code
7. 调用后端 `/auth/update-profile` 接口，后端用 code 换取手机号并更新用户信息
8. 授权成功后跳转到首页

---

## 管理后台 (Admin Dashboard)

### 技术栈
- **框架**: React 18 + Vite
- **UI 库**: shadcn/ui + TailwindCSS
- **主题**: Claude Theme (from theme.md)
- **语言**: TypeScript

### 功能特性
1. **用户管理**
   - 用户列表展示（手机号、昵称、配额信息）
   - 手机号模糊搜索
   - 实时数据刷新

2. **购买次数管理**
   - 快速选择：+20次、+50次、+100次、无限次数
   - 自定义增减（支持正负数）
   - 实时同步到数据库

3. **认证系统**
   - 简单密码认证（admin/123456）
   - Basic Auth Token
   - 自动登录状态保持

### 开发命令

```bash
cd admin
npm install          # 安装依赖
npm run dev          # 开发服务器 (http://localhost:5175)
npm run build        # 生产构建
```

### API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/login` | POST | 管理员登录 |
| `/api/admin/users` | GET | 获取用户列表 |
| `/api/admin/users/{id}/quota` | POST | 修改购买次数 |

### 数据库字段

**users 表新增字段**：
- `phone` (VARCHAR(20)) - 用户手机号
- `purchased_quota` (INT, DEFAULT 0) - 购买次数

### 配额扣减逻辑

```python
# 优先扣每日免费次数
if daily_used < user.daily_quota:
    usage.count += 1
else:
    # 扣购买次数
    if user.purchased_quota > 0:
        user.purchased_quota -= 1
    else:
        return {"code": 1, "message": "次数不足"}
```

### 小程序配额显示

```typescript
// 显示：剩余次数 / 总次数
const totalRemaining = daily_remaining + purchased_remaining
const totalQuota = daily_quota + purchased_quota
// 例如：15/20 (每日10次 + 购买10次)
```

---

## 数据库迁移

### 迁移工具

使用 Python 脚本执行迁移（推荐）：

```bash
cd database/migrations
python migrate.py
```

### 迁移历史

| 版本 | 文件 | 说明 | 状态 |
|------|------|------|------|
| 001 | `001_init.sql` | 初始化数据库表结构 | ✅ 已执行 |
| 002 | `002_add_purchased_quota.sql` | 添加购买次数字段 | ✅ 已执行 |
| 003 | `003_add_phone_field.sql` | 添加手机号字段 | ✅ 已执行 |

### 迁移文档

- `database/migrations/README.md` - 完整迁移文档
- `database/migrations/QUICKSTART.md` - 快速开始指南
- `database/migrations/MIGRATION_COMPLETE.md` - 迁移完成报告

---

**项目状态**: 引导式对话功能完成，生产就绪，待部署
**最后更新**: 2025-12-08

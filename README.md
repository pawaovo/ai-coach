# AI 高管教练 - 微信小程序

**企业高管的 AI 教练助手**

[![Taro](https://img.shields.io/badge/Taro-4.1.9-blue)](https://taro.jd.com/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.0-336791?logo=postgresql)](https://www.postgresql.org/)

---

## 📖 项目简介

**AI 高管教练**是一款面向企业高管的微信小程序，通过引导式对话帮助高管理清思路、做出更好的决策。基于 Taro 3 + React 框架开发，集成火山引擎豆包 AI 模型，提供专业的高管教练服务。

> 🎯 **目标用户**: 企业高管、创业者、管理者
> 🏆 **核心价值**: 引导式对话，而非直接给出答案

---

## ✨ 核心特色

### 🤖 AI 高管教练

- **引导式对话**: 通过苏格拉底式提问引导思考
- **专业方法**: 基于高管教练理论和商业实践
- **历史上下文**: 保持对话连贯性（最近 20 条消息）
- **流式响应**: WebSocket 实时流式输出，自然流畅

### 📊 使用配额管理

- **每日免费**: 10 次对话（每天重置）
- **购买次数**: 支持购买额外使用次数
- **智能扣减**: 优先使用免费次数，再扣购买次数
- **实时显示**: 小程序顶部显示剩余次数

### 🛠️ 商业工具

| 工具 | 说明 | 适用场景 |
|------|------|----------|
| **SWOT 分析** | 优势劣势分析 | 战略规划 |
| **SMART 目标** | 设定可衡量目标 | 目标管理 |
| **决策矩阵** | 理性权衡选项 | 决策支持 |
| **5Why 分析** | 深挖问题根因 | 问题分析 |

### 💡 引导式对话

商业工具支持引导式对话功能，帮助用户更高效地使用工具：

- **预设选项**：点击工具卡片后显示 4 个预设选项，快速开始对话
- **智能选项**：AI 回复后自动生成 3-5 个引导式选项，帮助深入思考
- **多选支持**：可同时选择多个选项，支持选项 + 文字混合发送
- **优雅 UI**：选项卡片设计，圆形复选框，选中高亮反馈

### 🔐 微信登录

- 微信小程序原生登录
- JWT Token 认证
- 用户数据隔离

### 🎛️ 管理后台

- **用户管理**: 查看所有用户信息
- **手机号搜索**: 快速查找用户
- **购买次数管理**: 为用户增减购买次数
- **实时数据**: 连接真实数据库

---

## 🛠️ 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                    微信小程序前端                              │
│         Taro 3 + React 18 + TypeScript + SCSS                │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│      HTTP API            │  │      WebSocket           │
│  - 微信登录              │  │  - 流式 AI 对话          │
│  - 会话管理              │  │  - 实时消息推送          │
│  - 使用次数              │  │  - 自动重连              │
└──────────────────────────┘  └──────────────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI 后端服务                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   PostgreSQL    │  │  WebSocket      │  │   JWT Auth  │ │
│  │  - users        │  │  - chat_handler │  │  - 微信登录 │ │
│  │  - chat_sessions│  │  - 流式响应     │  │  - Token    │ │
│  │  - chat_messages│  │  - 错误重试     │  │             │ │
│  │  - usage_logs   │  └─────────────────┘  └─────────────┘ │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    火山引擎 API                               │
│                 doubao-seed-1-6-lite-251015                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Web 管理后台                               │
│         React + Vite + shadcn/ui + TailwindCSS               │
│  - 用户列表  - 手机号搜索  - 购买次数管理                     │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **小程序前端** | Taro 3 + React 18 | 跨平台小程序框架 |
| **管理后台** | React + Vite + shadcn/ui | 现代化 Web 应用 |
| **类型系统** | TypeScript | 强类型保障 |
| **样式方案** | SCSS + TailwindCSS | 主题化设计 |
| **后端框架** | FastAPI (Python) | 高性能异步框架 |
| **数据库** | PostgreSQL 18.0 | 关系型数据库 |
| **AI 模型** | 火山引擎豆包 | 流式对话模型 |
| **认证** | JWT + 微信登录 | 安全认证 |

---

## 📱 功能模块

### 1. AI 教练对话 ✅
- 流式文字对话
- 会话管理（新建、切换、历史）
- 消息持久化
- 历史上下文（20 条）
- 错误重试（最多 2 次）
- 实时配额显示

### 2. 商业工具 ✅
- SWOT 分析
- SMART 目标
- 决策矩阵
- 5Why 分析

### 3. 连接我们 ✅
- 联系方式
- 关于我们

### 4. 管理后台 ✅
- 用户列表展示
- 手机号模糊搜索
- 购买次数管理（+20/+50/+100/无限/自定义）
- 实时数据同步

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Python 3.9+
- PostgreSQL 18.0+
- 微信开发者工具

### 1. 数据库设置

```bash
# 创建数据库
createdb ai_coach_db

# 运行迁移脚本
cd database/migrations
python migrate.py
```

### 2. 后端安装

```bash
# 进入后端目录
cd server

# 安装 Python 依赖
pip install fastapi uvicorn sqlalchemy psycopg2-binary httpx pyjwt python-dotenv

# 配置环境变量（编辑 ../.env 文件）

# 启动后端服务
uvicorn app:app --reload
```

### 3. 小程序前端

```bash
# 进入小程序目录
cd miniapp

# 安装依赖
npm install --legacy-peer-deps

# 开发模式
npm run dev:weapp

# 生产构建
npm run build:weapp
```

### 4. 管理后台

```bash
# 进入管理后台目录
cd admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5175/
登录：admin / 123456

### 环境变量配置

创建 `.env` 文件：

```env
# 数据库配置
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ai_coach_db

# 火山引擎 API
OPENAI_API_KEY=your_volcengine_api_key
OPENAI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
OPENAI_MODEL=doubao-seed-1-6-lite-251015

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 微信小程序
WECHAT_APP_ID=your_wechat_appid
WECHAT_APP_SECRET=your_wechat_secret
```

---

## 📂 项目结构

```
ai-coach/
├── miniapp/                    # 小程序前端
│   ├── src/
│   │   ├── app.tsx            # 应用入口
│   │   ├── app.config.ts      # 小程序配置
│   │   ├── constants/         # 常量配置
│   │   ├── components/        # 公共组件
│   │   │   └── CustomTabBar/  # 自定义底部导航栏
│   │   ├── pages/             # 页面
│   │   │   ├── index/         # AI 教练对话
│   │   │   ├── tools/         # 商业工具
│   │   │   ├── connect/       # 连接我们
│   │   │   └── authorize/     # 用户授权
│   │   ├── services/          # 服务层
│   │   │   ├── api.ts         # HTTP API
│   │   │   └── websocket.ts   # WebSocket
│   │   ├── utils/             # 工具函数
│   │   └── styles/            # 样式
│   │       └── theme.scss     # Tweakcn 主题
│   └── dist/                  # 编译输出
├── admin/                      # Web 管理后台
│   ├── src/
│   │   ├── components/        # React 组件
│   │   │   ├── ui/            # shadcn/ui 组件
│   │   │   ├── LoginForm.tsx  # 登录表单
│   │   │   ├── UserTable.tsx  # 用户列表
│   │   │   └── QuotaDialog.tsx # 配额对话框
│   │   ├── lib/
│   │   │   └── api.ts         # API 封装
│   │   └── App.tsx            # 应用入口
│   └── TESTING.md             # 测试指南
├── server/                     # 后端服务
│   ├── app.py                 # FastAPI 主应用
│   ├── routes/                # 路由
│   │   ├── auth.py            # 微信登录
│   │   ├── chat.py            # 会话管理
│   │   ├── usage.py           # 使用次数
│   │   └── admin.py           # 管理员 API
│   ├── models/                # 数据模型
│   │   ├── user.py            # 用户模型
│   │   ├── chat_session.py
│   │   ├── chat_message.py
│   │   └── usage_log.py
│   ├── services/              # 服务层
│   │   └── database.py        # 数据库连接
│   └── websocket/             # WebSocket
│       └── chat_handler.py    # 聊天处理器
├── database/                   # 数据库
│   └── migrations/
│       ├── 001_init.sql       # 初始化脚本
│       ├── 002_add_purchased_quota.sql  # 购买次数字段
│       ├── 003_add_phone_field.sql      # 手机号字段
│       ├── migrate.py         # Python 迁移工具
│       └── README.md          # 迁移文档
├── .env                       # 环境变量
├── README.md                  # 项目文档
└── CLAUDE.md                  # 开发指南
```

---

## 🔧 开发命令

### 小程序前端

```bash
npm run dev:weapp      # 开发模式
npm run build:weapp    # 生产构建
```

### 管理后台

```bash
npm run dev            # 开发服务器
npm run build          # 生产构建
```

### 后端

```bash
uvicorn app:app --reload    # 启动服务
curl http://localhost:8000/health  # 测试 API
```

### 数据库

```bash
cd database/migrations
python migrate.py      # 执行迁移
```

---

## 📋 开发进度

### ✅ 已完成

#### 核心功能
- [x] 小程序前端框架搭建
- [x] 后端 API 实现
- [x] 微信登录集成
- [x] 流式 AI 对话
- [x] 会话管理
- [x] 历史对话上下文
- [x] 错误重试机制
- [x] 数据库持久化

#### 商业工具
- [x] SWOT 分析
- [x] SMART 目标
- [x] 决策矩阵
- [x] 5Why 分析
- [x] 2/3 屏对话窗口（高斯模糊背景）
- [x] 引导式对话功能（预设选项 + 智能选项 + 多选）

#### 配额管理
- [x] 每日免费次数（10次）
- [x] 购买次数支持
- [x] 智能扣减逻辑（免费优先）
- [x] 实时配额显示

#### 管理后台
- [x] React + Vite + shadcn/ui 搭建
- [x] 用户列表展示
- [x] 手机号搜索功能
- [x] 购买次数管理
- [x] 真实数据库连接

#### UI/UX
- [x] Tweakcn 主题配置
- [x] UI/UX 优化（简洁化设计）
- [x] WebSocket 流式对话修复
- [x] 全局背景色优化（#F0EEE6）
- [x] 自定义导航栏（与胶囊按钮对齐）
- [x] 悬浮输入栏设计
- [x] 用户授权页面（昵称、头像、手机号）
- [x] 自定义 TabBar（点击放大动画、当前页显示文字标签）

#### 代码质量
- [x] 合并重复的 CSS 动画定义（-30 行）
- [x] 标准化日志记录（logger 替代 print）
- [x] 提取重复的 TypeScript 类型定义
- [x] 清理未使用的代码和调试语句
- [x] 代码审查和优化

### 🚧 待完成
- [ ] 微信小程序账号申请
- [ ] 服务器部署
- [ ] 域名配置
- [ ] SSL 证书
- [ ] 生产环境测试

---

## 🌐 部署

### 后端部署

1. 准备服务器（推荐 Ubuntu 20.04+）
2. 安装 Python 3.9+ 和 PostgreSQL
3. 配置环境变量
4. 使用 Gunicorn + Nginx 部署
5. 配置 SSL 证书

### 小程序发布

1. 申请微信小程序账号
2. 配置服务器域名白名单
3. 上传代码到微信后台
4. 提交审核

### 管理后台部署

1. 构建生产版本：`npm run build`
2. 部署到静态服务器（Nginx/Vercel/Netlify）
3. 配置后端 API 地址

---

## 📚 文档

- [CLAUDE.md](./CLAUDE.md) - 开发指南和架构说明
- [admin/TESTING.md](./admin/TESTING.md) - 管理后台测试指南
- [database/migrations/README.md](./database/migrations/README.md) - 数据库迁移文档

---

## 📄 License

MIT License

---

**Made with ❤️ for Executives**

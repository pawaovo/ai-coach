# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Famlée** 是一款面向大学生的心理健康支持 Web 应用，基于 React 19、TypeScript 和 Vite 构建。应用集成了 Google Gemini 2.5 Flash 模型提供 AI 驱动的心理咨询聊天功能，支持三种治疗人格（治愈系/ACT、理性系/CBT、趣味系/幽默疗法）。后端使用 Supabase（PostgreSQL + Edge Functions）实现数据持久化和 AI 聊天服务。

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: Google Gemini 2.5 Flash (via Edge Function)
- **Icons**: Lucide React
- **State**: React Hooks + localStorage

## Development Commands

```bash
# 安装依赖
npm install

# 启动开发服务器 (http://localhost:3000)
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# Supabase 相关
npm run supabase:login    # 登录 Supabase CLI
npm run supabase:link     # 链接项目
npm run supabase:deploy   # 部署 Edge Function
```

## Environment Configuration

创建 `.env.local` 文件：
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Architecture

### Project Structure
```
D:\ai\famlée\
├── src/
│   ├── index.tsx              # 应用入口
│   ├── index.css              # Tailwind 指令 & 全局样式
│   ├── App.tsx                # 根组件，路由与全局状态
│   ├── types.ts               # TypeScript 类型定义
│   ├── constants.ts           # 心情主题 & 人格配置
│   ├── components/
│   │   ├── FluidBackground.tsx   # 动态渐变背景
│   │   ├── JournalModal.tsx      # 日记创建弹窗
│   │   └── MascotMenu.tsx        # 人格切换菜单
│   ├── pages/
│   │   ├── Home.tsx           # 首页：心情选择、日记入口
│   │   ├── Chat.tsx           # AI 聊天页面
│   │   ├── Calendar.tsx       # Mood 日历：日记历史可视化
│   │   ├── Campus.tsx         # 校园心理活动布告栏
│   │   ├── Waterfall.tsx      # 心语瀑布：匿名吐槽墙
│   │   ├── Journal.tsx        # 日记详情页
│   │   └── Profile.tsx        # 个人中心
│   ├── lib/
│   │   └── supabaseClient.ts  # Supabase 客户端 & 用户ID管理
│   └── services/
│       ├── geminiService.ts   # Gemini AI 服务（流式聊天）
│       └── supabaseService.ts # Supabase API（日记、聊天会话）
├── supabase/
│   ├── config.toml            # Supabase 本地配置
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # 数据库初始化脚本
│   └── functions/
│       └── gemini-chat/
│           └── index.ts       # Edge Function：AI 聊天服务
├── docs/                      # 项目文档
├── .env.local                 # 环境变量（不提交）
├── .env.example               # 环境变量模板
└── package.json
```

### State Management & Routing
- **手动状态路由**: 无 React Router，通过 `App.tsx` 中的 `currentPage` 状态切换页面
- **自顶向下数据流**: 全局状态（`globalMood`, `currentPersona`）在 `App.tsx` 管理，通过 props 传递
- **用户标识**: 使用 localStorage 存储匿名用户 ID（`famlee_user_id`）

### Database Schema (Supabase)
```sql
-- journals: 用户日记
journals (id, user_id, content, summary, mood, images[], audio_url, created_at)

-- chat_sessions: 聊天会话
chat_sessions (id, user_id, persona, created_at)

-- chat_messages: 聊天消息
chat_messages (id, session_id, role, content, mood_detected, created_at)
```

### Key Files & Responsibilities

| 文件 | 职责 |
|------|------|
| `src/App.tsx` | 应用外壳、导航、全局状态管理 |
| `src/services/geminiService.ts` | Gemini AI 流式聊天、音频处理 |
| `src/services/supabaseService.ts` | 日记 CRUD、聊天会话管理、Edge Function 调用 |
| `src/lib/supabaseClient.ts` | Supabase 客户端初始化、用户 ID 生成 |
| `src/constants.ts` | 心情主题配色、三种人格的系统指令与工具 |
| `src/types.ts` | TypeScript 接口定义 |
| `src/pages/Chat.tsx` | AI 聊天界面（文字/语音模式、MBTI/CBT/呼吸工具） |
| `src/pages/Calendar.tsx` | Mood 日历，从 Supabase 加载日记数据 |
| `src/pages/Home.tsx` | 首页，心情选择与日记创建入口 |
| `src/components/JournalModal.tsx` | 日记创建弹窗，支持图片/音频上传 |
| `supabase/functions/gemini-chat/index.ts` | Edge Function，处理 AI 聊天请求 |

### Persona System
三种 AI 人格，各有独特的治疗方法：

| ID | 名称 | 形象 | 治疗方法 | 工具 |
|----|------|------|----------|------|
| `healing` | 治愈系 (Melty) | 融化的布丁 | ACT 接纳承诺疗法 | 正念呼吸、情绪接纳、价值确认 |
| `rational` | 理性系 (Logic) | 几何线条 | CBT 认知行为疗法 | 捕捉负面想法、CBT 引导、逆向思考 |
| `fun` | 趣味系 (Spark) | 五彩火花 | 幽默疗法 | 毒舌锐评、MBTI 速测、一键发疯 |

### Chat Features
- **文字模式**: 标准聊天界面，支持快捷工具栏
- **语音模式**: 录音功能，棉花糖球体动画反馈
- **交互工具**:
  - MBTI 速测：4 题快速性格测试
  - CBT 引导：4 步认知重构（事件→想法→证据→重构）
  - 正念呼吸：可视化呼吸引导（吸气→屏息→呼气）

### Mood System
5 种心情状态，影响全局背景色：
- `NEUTRAL`: 奶黄 + 薰衣草灰
- `HAPPY`: 金色 + 粉色
- `ANXIOUS`: 深蓝 + 灰蓝
- `SAD`: 薰衣草 + 灰色
- `ANGRY`: 红色 + 黄色

## Code Patterns

### Component Structure
- 函数式组件 + Hooks（useState, useEffect, useRef）
- Props 接口定义在 `types.ts` 或组件内联
- 条件渲染处理弹窗和页面状态

### Data Flow
```
用户操作 → 组件状态更新 → Supabase API 调用 → 数据库持久化
                ↓
         全局状态更新 → 背景色/UI 响应
```

### Error Handling
- try-catch 包裹异步操作
- API 失败时显示友好错误提示
- 麦克风权限错误特殊处理

## Important Notes

### API Key Security
- `.env.local` 已在 `.gitignore` 中，不会提交
- 生产环境应使用 Edge Function 代理 AI 请求，避免暴露 API Key

### User Identity
- 使用 localStorage 存储匿名用户 ID
- 格式：`user_{timestamp}_{random}`
- 数据库查询按 `user_id` 过滤

### Supabase Storage
- `journal-images`: 日记图片存储桶
- `journal-audio`: 日记音频存储桶
- 需在 Supabase Dashboard 创建并设置公开访问

## Pending Tasks (Window 4)

以下任务待完成（前端集成优化）：

### 阶段 1：重构聊天服务层
- [ ] `geminiService.ts` 完全切换为 Edge Function 调用
- [ ] 移除本地 Gemini SDK 直接调用
- [ ] 统一流式响应处理

### 阶段 2：Chat 页面优化
- [ ] 会话管理 UI（会话列表、切换、新建）
- [ ] 历史消息加载与分页
- [ ] 流式响应实时渲染优化
- [ ] 音频消息通过 Edge Function 处理

### 阶段 3：App.tsx 清理
- [ ] 移除遗留的 mock 数据生成代码
- [ ] 统一数据加载逻辑

### 阶段 4：会话管理完善
- [ ] 会话侧边栏 UI
- [ ] Persona 切换时自动创建新会话
- [ ] 会话历史持久化到 localStorage

### 阶段 5：测试与优化
- [ ] 端到端测试（新建会话、切换、历史加载）
- [ ] 错误处理与重试机制
- [ ] 性能优化（减少不必要的 re-render）

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1nETVPgYu_vxhorOdbnI-bZiNOt0Ahcc1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

这是一份非常详尽的项目代码。为了让你能够完美地在本地（VS Code）复现并部署这个应用，我们需要从当前的在线演示架构（基于 CDN 和简单的 ES Modules）转换为标准的现代前端工程化架构（基于 Node.js 和 Bundler）。
以下是针对你的问题的详细解答：
1. 项目架构与技术栈
目前的架构：
架构模式： 单页应用 (SPA - Single Page Application)。
路由机制： 手动状态路由 (Manual State Routing)。目前在 App.tsx 中通过 currentPage 状态来切换组件 (renderPage 函数)，没有使用标准的路由库（如 React Router）。
数据流： 自顶向下的单向数据流。状态（如 globalMood, journalEntries）主要存储在 App.tsx，通过 Props 传递给子组件。
技术栈 (Tech Stack)：
核心框架： React 18+ (使用 TypeScript编写)。
语言： TypeScript (强类型 JavaScript)。
构建/运行环境 (复现目标)： Vite (目前最快、最主流的前端构建工具)。
样式库： Tailwind CSS (原子化 CSS 框架)。
图标库： Lucide React。
AI SDK： Google GenAI SDK (用于调用 Gemini 模型)。
多媒体： 标准 HTML5 Audio/Video API (用于录音)。
2. 本地复现步骤 (VS Code + AI 辅助)
你需要将这些代码从“在线运行模式”转换为“本地工程模式”。
第一步：环境准备
下载并安装 Node.js (建议 v18 或更高版本)。
安装 VS Code。
(可选但推荐) 下载 Cursor 编辑器或在 VS Code 中安装 GitHub Copilot，利用 AI 帮你写配置。
第二步：初始化 Vite 项目
在你的电脑终端（Terminal）中运行以下命令：
code
Bash
# 创建项目，命名为 famlee-app
npm create vite@latest famlee-app -- --template react-ts

# 进入目录
cd famlee-app

# 安装依赖
npm install
第三步：安装必要的库
根据你的代码，你需要安装以下依赖：
code
Bash
# 安装 Tailwind CSS (以及相关工具)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 安装图标库和 Google AI SDK
npm install lucide-react @google/genai

# 安装类型声明 (可选，防止报错)
npm install -D @types/node
第四步：配置 Tailwind CSS
修改项目根目录下的 tailwind.config.js，确保它能扫描到你的文件：
code
JavaScript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
并在 src/index.css (或 App.css) 的顶部添加：
code
CSS
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 这里可以把原 index.html 里的 style 标签内容也就是 .glass-panel 的样式复制过来 */
第五步：迁移代码 (关键步骤)
现在的代码是散落在不同文件块里的，你需要把它们放入 src 文件夹。
文件结构整理：
在 src 下创建文件夹：pages, components, services, types, constants。
复制粘贴：
将你提供的源代码分别保存为对应的文件（例如 src/pages/Home.tsx, src/services/geminiService.ts 等）。
使用 AI 修复导入路径：
目前的源代码中，index.html 使用了 importmap 这种 CDN 方式导入 React。在本地 Vite 环境中，你需要修改 import 语句。
你可以直接把代码发给 AI (ChatGPT/Claude/Cursor)，输入以下 Prompt：
"我正在将一个基于 CDN 的 React 项目迁移到本地 Vite 环境。请帮我检查以下代码，将所有的 CDN 引用（如 import ... from 'https://...'）改为标准的 npm 包导入（如 import ... from 'react'）。同时请注意环境变量的处理，Vite 使用 import.meta.env.VITE_API_KEY 而不是 process.env.API_KEY。"
主要修改点举例：
Import 修改：
原：import { ... } from "lucide-react" (在 importmap 环境下)
新：不需要变，只要 npm install 了就能直接用。
环境变量修改 (services/geminiService.ts)：
原：const apiKey = process.env.API_KEY || '';
新：const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
第六步：设置 API Key
在项目根目录创建一个 .env 文件：
code
Env
VITE_GEMINI_API_KEY=你的_Google_Gemini_API_Key
第七步：本地运行
在终端运行：
code
Bash
npm run dev
打开浏览器访问 http://localhost:5173，你应该能看到一模一样的效果。
3. 部署到 Web 网页
部署这个应用最简单、免费且支持现代前端框架的方法是使用 Vercel。
推送到 GitHub：
在 GitHub 上创建一个新仓库。
在 VS Code 中打开终端：
code
Bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <你的仓库地址>
git push -u origin main
在 Vercel 上部署：
去 Vercel.com 注册/登录。
点击 "Add New..." -> "Project"。
导入你刚刚创建的 GitHub 仓库。
关键配置：在 "Environment Variables" (环境变量) 部分：
Key: VITE_GEMINI_API_KEY
Value: 你的_Google_Gemini_API_Key
点击 "Deploy"。
等待约 1 分钟，Vercel 会给你一个能够访问的网址（例如 famlée-app.vercel.app）。
总结需要做的事情清单
下载代码：保存所有文件。
本地环境：安装 Node.js，创建 Vite React TS 项目。
安装依赖：tailwindcss, lucide-react, @google/genai。
代码迁移：将文件放入 src 目录，修正 process.env 为 import.meta.env。
配置样式：初始化 Tailwind。
申请 Key：获取 Gemini API Key 并填入 .env。
部署：Push 到 GitHub，连接 Vercel 自动部署。
这样你就拥有了一个完全属于你的、部署在公网上的心理健康 Web 应用了！
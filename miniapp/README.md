# 企业 AI 教练小程序

## 项目信息
- **项目名称**: AI 高管教练
- **技术栈**: Taro 3 + React + TypeScript + SCSS
- **目标平台**: 微信小程序
- **当前状态**: 基础架构已完成 ✅

---

## 已完成的工作

### ✅ 阶段 1：基础架构搭建
- [x] 安装 Taro CLI
- [x] 创建项目目录结构
- [x] 配置 Taro 项目（config/index.js）
- [x] 配置小程序全局设置（app.config.ts）
- [x] 配置主题样式（theme.scss）
- [x] 创建三个主要页面：
  - AI 教练对话页（pages/index）
  - 商业工具页（pages/tools）
  - 连接我们页（pages/connect）

### ✅ 阶段 2：服务层开发
- [x] 类型定义（types/index.ts）
- [x] 常量配置（constants/index.ts）
- [x] WebSocket 服务（services/websocket.ts）
- [x] HTTP API 封装（services/api.ts）
- [x] 本地存储封装（utils/storage.ts）
- [x] 微信登录（utils/auth.ts）
- [x] 使用次数管理（utils/usage.ts）
- [x] NFC 唤起处理（utils/nfc.ts）

---

## 项目结构

```
miniapp/
├── config/                  # Taro 配置
│   ├── index.js            # 基础配置
│   ├── dev.js              # 开发环境
│   └── prod.js             # 生产环境
├── src/
│   ├── app.config.ts       # 小程序全局配置
│   ├── app.tsx             # 应用入口
│   ├── app.scss            # 全局样式
│   ├── styles/
│   │   └── theme.scss      # 主题配色（从 Tweakcn 转换）
│   ├── pages/
│   │   ├── index/          # AI 教练对话页
│   │   │   ├── index.tsx
│   │   │   └── index.scss
│   │   ├── tools/          # 商业工具页
│   │   │   ├── index.tsx
│   │   │   └── index.scss
│   │   └── connect/        # 连接我们页
│   │       ├── index.tsx
│   │       └── index.scss
│   ├── components/         # 组件（待创建）
│   ├── services/           # 服务层（待创建）
│   ├── utils/              # 工具函数（待创建）
│   ├── types/              # 类型定义（待创建）
│   └── constants/          # 常量配置（待创建）
└── package.json
```

---

## 快速开始

### 1. 安装依赖
```bash
cd miniapp
npm install
```

### 2. 开发模式
```bash
# 微信小程序开发模式
npm run dev:weapp

# H5 开发模式
npm run dev:h5
```

### 3. 构建生产版本
```bash
# 构建微信小程序
npm run build:weapp

# 构建 H5
npm run build:h5
```

### 4. 在微信开发者工具中预览
1. 打开微信开发者工具
2. 导入项目，选择 `miniapp/dist` 目录
3. 填入 AppID（需先申请小程序账号）

---

## 页面功能说明

### 1. AI 教练对话页（首页）
**功能**：
- ✅ 聊天气泡布局（用户/AI 消息）
- ✅ 流式打字效果（模拟）
- ✅ 会话管理（新建、切换）
- ✅ 工具快捷按钮（SWOT、SMART 等）
- ✅ "思考中"加载动画

**待实现**：
- [ ] WebSocket 实时通信
- [ ] 使用次数检查
- [ ] 历史消息加载

### 2. 商业工具页
**功能**：
- ✅ 工具卡片网格布局
- ✅ 4 个工具：SWOT、SMART、决策矩阵、5Why
- ✅ 点击跳转到对话页

**待实现**：
- [ ] 创建会话 API 调用
- [ ] 工具模态框（SWOT/SMART）

### 3. 连接我们页
**功能**：
- ✅ Logo 和标题展示
- ✅ 公众号二维码（点击放大）
- ✅ 复制微信号
- ✅ 拨打电话
- ✅ 访问官网

**待实现**：
- [ ] 替换实际内容（Logo、二维码、联系方式）

---

## 主题配色

已从 Tweakcn 转换完整的主题配色，支持浅色和深色模式。

**主要颜色**：
- Primary: `oklch(0.6171 0.1375 39.0427)` - 主色调
- Background: `oklch(0.9818 0.0054 95.0986)` - 背景色
- Foreground: `oklch(0.3438 0.0269 95.7226)` - 文字色
- Card: `oklch(0.9818 0.0054 95.0986)` - 卡片背景

**使用方式**：
```scss
@import '../../styles/theme.scss';

.my-component {
  background: $background;
  color: $foreground;

  .button {
    @include button-primary;
  }
}
```

---

## 下一步工作

### 阶段 2：集成服务层到页面
- [ ] 更新对话页使用 WebSocket 服务
- [ ] 更新对话页使用使用次数检查
- [ ] 更新工具页使用 API 创建会话
- [ ] 在 app.tsx 中集成 NFC 唤起

### 阶段 3：后端开发
- [ ] 部署 PostgreSQL 数据库
- [ ] 搭建 FastAPI 后端
- [ ] 实现 WebSocket 流式响应
- [ ] 集成火山引擎 API

### 阶段 4：功能完善
- [ ] 实现 SWOT 分析工具
- [ ] 实现 SMART 目标工具
- [ ] 实现使用次数限制
- [ ] 实现 NFC 唤起

### 阶段 5：测试与优化
- [ ] 功能测试
- [ ] 性能优化
- [ ] UI/UX 优化
- [ ] 小程序审核提交

---

## 相关文档

- **完整迁移方案**: `../IMPLEMENTATION_PLAN.md`
- **详细实施计划**: `C:\Users\m1397\.claude\plans\enumerated-swimming-barto.md`
- **PRD 文档**: `../prd.md`

---

## 注意事项

1. **环境变量**：需要配置 API 地址、WebSocket 地址等
2. **小程序 AppID**：需要申请微信小程序账号
3. **域名白名单**：需要在小程序后台配置合法域名
4. **图标资源**：需要准备 TabBar 图标（chat.png、tools.png、connect.png）

---

## 技术支持

如有问题，请参考：
- [Taro 官方文档](https://taro-docs.jd.com/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

# 下一步：后端开发指南

## 📋 当前状态

✅ **前端已完成**：
- Taro 3 项目初始化
- 三个主要页面（对话、工具、连接我们）
- 完整的服务层（WebSocket、API、工具函数）
- 服务层已集成到页面

⏳ **待开发**：
- 后端 API 服务
- WebSocket 服务
- 数据库部署

---

## 🎯 后端开发任务清单

### 阶段 1：环境准备
- [ ] 准备服务器（云服务器或本地）
- [ ] 安装 Docker 和 Docker Compose
- [ ] 准备域名并备案（用于小程序）
- [ ] 申请火山引擎 API Key

### 阶段 2：数据库部署
- [ ] 创建 `docker-compose.yml`
- [ ] 启动 PostgreSQL 容器
- [ ] 执行数据库迁移脚本
- [ ] 验证数据库连接

### 阶段 3：FastAPI 后端开发
- [ ] 初始化 Python 项目
- [ ] 安装依赖
- [ ] 实现数据模型
- [ ] 实现 API 路由
- [ ] 实现 WebSocket 服务
- [ ] 集成火山引擎 API

### 阶段 4：部署与测试
- [ ] 配置 Nginx 反向代理
- [ ] 配置 SSL 证书
- [ ] 部署后端服务
- [ ] 测试所有 API
- [ ] 测试 WebSocket 连接

---

## 📝 详细实施步骤

### 步骤 1：创建 docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ai_coach
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/migrations:/docker-entrypoint-initdb.d
    restart: unless-stopped

  backend:
    build: ./server
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://admin:${DB_PASSWORD}@postgres:5432/ai_coach
      VOLCENGINE_API_KEY: ${VOLCENGINE_API_KEY}
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
```

### 步骤 2：创建数据库迁移脚本

文件：`database/migrations/001_init.sql`

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

### 步骤 3：FastAPI 项目结构

```
server/
├── app.py                  # 主应用
├── requirements.txt        # 依赖
├── models/
│   ├── user.py
│   ├── session.py
│   └── message.py
├── routes/
│   ├── auth.py
│   ├── chat.py
│   └── usage.py
├── services/
│   ├── database.py
│   └── volcengine.py
└── websocket/
    └── chat_handler.py
```

### 步骤 4：requirements.txt

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
httpx==0.25.1
websockets==12.0
```

### 步骤 5：主应用 (app.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, chat, usage
from websocket import chat_handler

app = FastAPI(title="AI Coach API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 路由
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(usage.router, prefix="/api/usage", tags=["usage"])

# WebSocket
app.add_websocket_route("/ws/chat", chat_handler.websocket_endpoint)

@app.get("/")
def read_root():
    return {"message": "AI Coach API"}
```

---

## 🔧 关键 API 实现示例

### 认证路由 (routes/auth.py)

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    code: str

@router.post("/login")
async def login(req: LoginRequest):
    # 1. 用 code 换取 openid（调用微信 API）
    # 2. 查询或创建用户
    # 3. 生成 JWT token
    return {
        "code": 0,
        "message": "success",
        "data": {
            "token": "jwt_token_here",
            "userId": "user_id_here"
        }
    }
```

### WebSocket 处理 (websocket/chat_handler.py)

```python
from fastapi import WebSocket
import asyncio
import json

async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    user_id = websocket.query_params.get("user_id")

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            # 调用火山引擎 API（流式）
            async for chunk in call_volcengine_api(msg["message"]):
                await websocket.send_json({
                    "type": "chunk",
                    "content": chunk
                })

            await websocket.send_json({
                "type": "done",
                "sessionId": "session_id"
            })
    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "error": str(e)
        })
```

---

## 🚀 快速启动命令

```bash
# 1. 启动数据库
docker-compose up -d postgres

# 2. 安装 Python 依赖
cd server
pip install -r requirements.txt

# 3. 启动后端
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# 4. 测试 API
curl http://localhost:8000/
```

---

## 📌 重要配置

### 环境变量 (.env)

```env
DB_PASSWORD=your_db_password
VOLCENGINE_API_KEY=your_api_key
JWT_SECRET=your_jwt_secret
WECHAT_APP_ID=your_wechat_appid
WECHAT_APP_SECRET=your_wechat_secret
```

### 小程序域名配置

需要在微信小程序后台配置：
- **request 合法域名**: `https://your-domain.com`
- **socket 合法域名**: `wss://your-domain.com`

---

## ✅ 验证清单

部署完成后，验证以下功能：

- [ ] 数据库可连接
- [ ] API 可访问（`GET /`）
- [ ] 登录接口正常（`POST /api/auth/login`）
- [ ] 创建会话正常（`POST /api/sessions`）
- [ ] WebSocket 可连接（`WS /ws/chat`）
- [ ] 流式响应正常
- [ ] 使用次数检查正常

---

## 📚 参考资料

- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [火山引擎 API 文档](https://www.volcengine.com/docs/)
- [微信小程序登录文档](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html)

# AI Coach 后端服务

## 快速启动

### 1. 启动数据库
```bash
cd D:/ai/ai-coach
docker-compose up -d
```

### 2. 安装 Python 依赖
```bash
cd server
pip install -r requirements.txt
```

### 3. 启动后端服务
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 4. 测试 API
```bash
# 健康检查
curl http://localhost:8000/health

# 测试登录
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test_code"}'
```

## API 文档

启动后访问：http://localhost:8000/docs

## WebSocket 测试

使用工具测试：`wss://localhost:8000/ws/chat?user_id=test_user`

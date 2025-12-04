# 管理后台测试指南

## 前置条件

### 1. 数据库迁移
确保已执行数据库迁移脚本：
```bash
cd D:\ai\ai-coach\database\migrations
psql -U postgres -d ai_coach_db -f 002_add_purchased_quota.sql
psql -U postgres -d ai_coach_db -f 003_add_phone_field.sql
```

### 2. 启动后端服务
```bash
cd D:\ai\ai-coach\server
uvicorn app:app --reload
```

后端服务应该运行在：http://localhost:8000

### 3. 启动前端服务
```bash
cd D:\ai\ai-coach\admin
npm run dev
```

前端服务应该运行在：http://localhost:5175/

---

## 测试步骤

### 测试 1：登录功能

1. 访问 http://localhost:5175/
2. 输入用户名：`admin`
3. 输入密码：`123456`
4. 点击"登录"按钮

**预期结果**：
- ✅ 成功登录，跳转到用户管理页面
- ❌ 如果失败，检查后端服务是否启动

---

### 测试 2：查看用户列表

登录成功后，应该看到用户列表页面。

**预期结果**：
- ✅ 显示所有用户信息（手机号、用户名、配额等）
- ✅ 如果数据库中有用户，应该显示真实数据
- ✅ 如果数据库为空，显示"未找到匹配的用户"

**检查项**：
- [ ] 手机号列显示正确
- [ ] 用户名列显示正确
- [ ] 每日配额显示（默认 10）
- [ ] 购买次数显示（默认 0）
- [ ] 总可用次数 = 每日配额 + 购买次数
- [ ] 注册时间格式正确

---

### 测试 3：搜索功能

1. 在搜索框中输入手机号（如 "138"）
2. 观察列表是否实时过滤

**预期结果**：
- ✅ 只显示包含搜索关键词的用户
- ✅ 清空搜索框后显示所有用户
- ✅ 搜索不到时显示"未找到匹配的用户"

---

### 测试 4：修改购买次数

1. 点击某个用户的"修改次数"按钮
2. 弹出对话框

**测试 4.1：快速选择**
- 点击 "+20次" 按钮
- **预期结果**：购买次数增加 20

**测试 4.2：快速选择 - 无限次数**
- 点击 "无限次数" 按钮
- **预期结果**：购买次数变为 999999，显示"无限"徽章

**测试 4.3：自定义增加**
- 在输入框输入 `50`
- 点击"确定"
- **预期结果**：购买次数增加 50

**测试 4.4：自定义减少**
- 在输入框输入 `-10`
- 点击"确定"
- **预期结果**：购买次数减少 10（不会低于 0）

---

### 测试 5：刷新功能

1. 点击右上角"刷新"按钮
2. **预期结果**：重新加载用户列表

---

### 测试 6：退出登录

1. 点击右上角"退出登录"按钮
2. **预期结果**：返回登录页面

---

## 常见问题排查

### 问题 1：登录失败

**错误信息**：`HTTP error! status: XXX` 或 `登录失败`

**排查步骤**：
1. 检查后端服务是否启动
   ```bash
   curl http://localhost:8000/health
   ```
   应该返回：`{"status":"ok"}`

2. 检查 CORS 配置
   - 后端 `app.py` 中应该有 `allow_origins=["*"]`

3. 检查浏览器控制台
   - 按 F12 打开开发者工具
   - 查看 Network 标签页的请求详情

---

### 问题 2：用户列表为空

**可能原因**：
1. 数据库中没有用户数据
2. 数据库迁移未执行

**解决方法**：
1. 检查数据库
   ```bash
   psql -U postgres -d ai_coach_db -c "SELECT * FROM users;"
   ```

2. 如果表不存在或缺少字段，执行迁移脚本

---

### 问题 3：修改次数失败

**错误信息**：`修改失败，请重试`

**排查步骤**：
1. 检查后端日志
2. 确认数据库连接正常
3. 确认 `purchased_quota` 字段已添加

---

### 问题 4：CORS 错误

**错误信息**：`Access to fetch at 'http://localhost:8000/...' from origin 'http://localhost:5175' has been blocked by CORS policy`

**解决方法**：
确保后端 `app.py` 中有正确的 CORS 配置：
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## API 端点测试

可以使用 curl 或 Postman 测试后端 API：

### 测试登录
```bash
curl -X POST http://localhost:8000/api/admin/login \
  -H "Authorization: Basic YWRtaW46MTIzNDU2"
```

### 测试获取用户列表
```bash
curl http://localhost:8000/api/admin/users \
  -H "Authorization: Basic YWRtaW46MTIzNDU2"
```

### 测试修改购买次数
```bash
curl -X POST http://localhost:8000/api/admin/users/{user_id}/quota \
  -H "Authorization: Basic YWRtaW46MTIzNDU2" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50}'
```

---

## 测试检查清单

- [ ] 后端服务已启动（http://localhost:8000）
- [ ] 前端服务已启动（http://localhost:5175）
- [ ] 数据库迁移已执行
- [ ] 登录功能正常
- [ ] 用户列表显示正常
- [ ] 搜索功能正常
- [ ] 修改购买次数功能正常（增加/减少/无限）
- [ ] 刷新功能正常
- [ ] 退出登录功能正常
- [ ] 无 CORS 错误
- [ ] 无控制台错误

---

**测试完成后，管理后台应该可以正常使用！**

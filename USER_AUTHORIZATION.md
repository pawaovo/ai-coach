# 用户授权功能说明

## 功能概述

小程序首次使用时，会引导用户授权获取以下信息：
- **昵称**：用户自定义输入
- **头像**：从微信相册选择
- **手机号**：通过微信授权获取

## 实现流程

### 1. 登录检测
```typescript
// miniapp/src/app.tsx
login().then(({ needProfile }) => {
  if (needProfile) {
    // 跳转到授权页面
    Taro.redirectTo({
      url: '/pages/authorize/index'
    })
  }
})
```

### 2. 授权页面
- **路径**：`/pages/authorize/index`
- **组件**：
  - 头像选择：`<Button openType="chooseAvatar">`
  - 昵称输入：`<input type="nickname">`
  - 手机号授权：`<Button openType="getPhoneNumber">`

### 3. 后端处理
```python
# server/routes/auth.py

@router.post("/update-profile")
async def update_profile(req: UpdateProfileRequest, ...):
    # 1. 获取 access_token
    # 2. 用 phone_code 换取手机号
    # 3. 更新用户信息到数据库
    # 4. 返回更新后的用户信息
```

## API 接口

### POST /auth/login
**请求**：
```json
{
  "code": "wx_login_code"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "jwt_token",
    "userId": "user_id",
    "needProfile": true  // 是否需要完善信息
  }
}
```

### POST /auth/update-profile
**请求头**：
```
Authorization: Bearer {token}
```

**请求体**：
```json
{
  "nickname": "用户昵称",
  "avatar_url": "https://...",
  "phone_code": "phone_code_from_wx"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "nickname": "用户昵称",
    "phone": "13800138000",
    "avatar_url": "https://..."
  }
}
```

## 数据库字段

### users 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 用户 ID |
| openid | String | 微信 openid |
| phone | String | 手机号（新增） |
| nickname | String | 昵称 |
| avatar_url | String | 头像 URL |
| daily_quota | Integer | 每日免费配额 |
| purchased_quota | Integer | 购买次数 |
| created_at | DateTime | 创建时间 |

## 测试步骤

### 前端测试
1. 清除小程序缓存（微信开发者工具 -> 清缓存 -> 全部清除）
2. 重新启动小程序
3. 应该自动跳转到授权页面
4. 点击头像区域，选择头像
5. 输入昵称
6. 点击"授权并开始使用"按钮
7. 在弹出的授权框中点击"允许"
8. 授权成功后自动跳转到首页

### 后端测试
```bash
# 1. 启动后端服务
cd server
uvicorn app:app --reload

# 2. 测试登录接口
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code": "test_code"}'

# 3. 测试更新用户信息接口（需要真实 token）
curl -X POST http://localhost:8000/auth/update-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "nickname": "测试用户",
    "avatar_url": "https://example.com/avatar.jpg",
    "phone_code": "test_phone_code"
  }'
```

### 管理后台测试
1. 访问 http://localhost:5173
2. 登录管理后台（admin/123456）
3. 在用户列表中应该能看到新注册用户的手机号和昵称
4. 使用手机号搜索功能测试模糊匹配

## 注意事项

### 微信小程序限制
1. **头像选择**：`open-type="chooseAvatar"` 仅在真机上有效，开发者工具可能无法测试
2. **手机号授权**：需要小程序已认证且开通手机号快速验证功能
3. **测试环境**：开发阶段可以使用微信开发者工具的"模拟器"功能

### 安全性
1. **Token 验证**：所有需要认证的接口都使用 JWT Token
2. **手机号加密**：微信返回的手机号已加密，需要通过 access_token 解密
3. **权限控制**：用户只能修改自己的信息

### 错误处理
1. **网络错误**：显示友好提示，允许用户重试
2. **授权拒绝**：提示用户授权的必要性
3. **Token 过期**：自动跳转到登录页面

## 相关文件

### 前端
- `miniapp/src/app.tsx` - 应用入口，登录检测
- `miniapp/src/pages/authorize/index.tsx` - 授权页面
- `miniapp/src/pages/authorize/index.scss` - 授权页面样式
- `miniapp/src/utils/auth.ts` - 认证工具函数

### 后端
- `server/routes/auth.py` - 认证路由（登录、更新用户信息）
- `server/models/user.py` - 用户模型

### 管理后台
- `admin/src/components/UserTable.tsx` - 用户列表（含手机号搜索）

## 常见问题

### Q: 授权页面不显示？
A: 检查 `app.config.ts` 中是否已添加 `pages/authorize/index` 路由

### Q: 手机号获取失败？
A: 确保小程序已认证，且在微信公众平台开通了"手机号快速验证"功能

### Q: 头像上传失败？
A: 检查微信开发者工具是否勾选了"不校验合法域名"

### Q: 管理后台搜索无结果？
A: 确保数据库中用户的 phone 字段不为空，已修复空值保护逻辑

---

**最后更新**：2025-12-04

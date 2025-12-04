# 认证路由
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from services.database import get_db
from models.user import User
import os
import httpx
import jwt
from datetime import datetime, timedelta

router = APIRouter()

WECHAT_APP_ID = os.getenv("WECHAT_APP_ID")
WECHAT_APP_SECRET = os.getenv("WECHAT_APP_SECRET")
JWT_SECRET = os.getenv("JWT_SECRET")

class LoginRequest(BaseModel):
    code: str

class UpdateProfileRequest(BaseModel):
    nickname: str
    phone_code: str
    avatar_url: str = None

@router.post("/login", response_model=dict)
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    # 调用微信 API 用 code 换取 openid
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.weixin.qq.com/sns/jscode2session",
            params={
                "appid": WECHAT_APP_ID,
                "secret": WECHAT_APP_SECRET,
                "js_code": req.code,
                "grant_type": "authorization_code"
            }
        )
        data = resp.json()

        if "errcode" in data and data["errcode"] != 0:
            raise HTTPException(status_code=400, detail=data.get("errmsg", "微信登录失败"))

        openid = data.get("openid")
        if not openid:
            raise HTTPException(status_code=400, detail="获取 openid 失败")

    # 查询或创建用户
    user = db.query(User).filter(User.openid == openid).first()
    if not user:
        user = User(openid=openid)
        db.add(user)
        db.commit()
        db.refresh(user)

    # 生成 JWT token
    payload = {
        "user_id": str(user.id),
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    return {
        "code": 0,
        "message": "success",
        "data": {
            "token": token,
            "userId": str(user.id),
            "needProfile": not user.phone  # 判断是否需要完善信息
        }
    }

def get_user_id_from_token(authorization: str = Header(None)):
    """从 JWT token 中获取用户 ID"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未授权")

    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("user_id")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token 已过期")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="无效的 Token")

@router.post("/update-profile", response_model=dict)
async def update_profile(
    req: UpdateProfileRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token)
):
    """更新用户信息（昵称、头像、手机号）"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"code": 1, "message": "用户不存在"}

    # 调用微信 API 获取手机号
    async with httpx.AsyncClient() as client:
        # 获取 access_token
        token_resp = await client.get(
            "https://api.weixin.qq.com/cgi-bin/token",
            params={
                "grant_type": "client_credential",
                "appid": WECHAT_APP_ID,
                "secret": WECHAT_APP_SECRET
            }
        )
        token_data = token_resp.json()

        if "errcode" in token_data and token_data["errcode"] != 0:
            return {"code": 1, "message": f"获取 access_token 失败: {token_data.get('errmsg')}"}

        access_token = token_data.get("access_token")

        # 获取手机号
        phone_resp = await client.post(
            f"https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token={access_token}",
            json={"code": req.phone_code}
        )
        phone_data = phone_resp.json()

        if phone_data.get("errcode") != 0:
            return {"code": 1, "message": f"获取手机号失败: {phone_data.get('errmsg')}"}

        phone_info = phone_data.get("phone_info", {})
        phone_number = phone_info.get("phoneNumber")

        if not phone_number:
            return {"code": 1, "message": "获取手机号失败"}

    # 更新用户信息
    user.nickname = req.nickname
    user.phone = phone_number
    if req.avatar_url:
        user.avatar_url = req.avatar_url

    db.commit()

    return {
        "code": 0,
        "message": "success",
        "data": {
            "nickname": user.nickname,
            "phone": user.phone,
            "avatar_url": user.avatar_url
        }
    }

# 认证路由
from fastapi import APIRouter, Depends, HTTPException
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
            "userId": str(user.id)
        }
    }

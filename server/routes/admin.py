# 管理员路由
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from services.database import get_db
from models.user import User
from pydantic import BaseModel

router = APIRouter()

def verify_admin(authorization: str = Header(None)):
    """验证管理员权限"""
    if authorization != "Basic YWRtaW46MTIzNDU2":  # admin:123456 base64
        raise HTTPException(status_code=401, detail="未授权")
    return True

class QuotaUpdate(BaseModel):
    amount: int

@router.post("/login")
async def admin_login(authorization: str = Header(None)):
    """管理员登录"""
    if authorization == "Basic YWRtaW46MTIzNDU2":
        return {
            "code": 0,
            "message": "success",
            "data": {"token": authorization}
        }
    return {"code": 1, "message": "用户名或密码错误"}

@router.get("/users")
async def get_users(
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin)
):
    """获取用户列表"""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return {
        "code": 0,
        "message": "success",
        "data": [
            {
                "id": str(user.id),
                "phone": getattr(user, 'phone', ''),
                "nickname": user.nickname,
                "avatar_url": user.avatar_url,
                "daily_quota": user.daily_quota,
                "purchased_quota": user.purchased_quota,
                "created_at": user.created_at.isoformat()
            }
            for user in users
        ]
    }

@router.post("/users/{user_id}/quota")
async def update_user_quota(
    user_id: str,
    quota_update: QuotaUpdate,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_admin)
):
    """修改用户购买次数"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"code": 1, "message": "用户不存在"}

    user.purchased_quota = max(0, user.purchased_quota + quota_update.amount)
    db.commit()

    return {
        "code": 0,
        "message": "success",
        "data": {"purchased_quota": user.purchased_quota}
    }

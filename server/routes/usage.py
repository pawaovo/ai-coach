# 使用次数路由
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.database import get_db
from models.user import User
from models.usage_log import UsageLog
from routes.chat import get_user_id_from_token
from datetime import date

router = APIRouter()

@router.get("/check")
async def check_usage(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"code": 1, "message": "用户不存在"}

    today = date.today()
    usage = db.query(UsageLog).filter(
        UsageLog.user_id == user_id,
        UsageLog.date == today
    ).first()

    used = usage.count if usage else 0
    remaining = max(0, user.daily_quota - used)

    return {
        "code": 0,
        "message": "success",
        "data": {
            "remaining": remaining,
            "total": user.daily_quota
        }
    }

@router.post("/increment")
async def increment_usage(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token)
):
    today = date.today()
    usage = db.query(UsageLog).filter(
        UsageLog.user_id == user_id,
        UsageLog.date == today
    ).first()

    if usage:
        usage.count += 1
    else:
        usage = UsageLog(user_id=user_id, date=today, count=1)
        db.add(usage)

    db.commit()

    return {
        "code": 0,
        "message": "success"
    }

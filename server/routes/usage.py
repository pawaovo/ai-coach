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

    daily_used = usage.count if usage else 0
    daily_remaining = max(0, user.daily_quota - daily_used)
    total_remaining = daily_remaining + user.purchased_quota

    return {
        "code": 0,
        "message": "success",
        "data": {
            "remaining": total_remaining,
            "total": user.daily_quota + user.purchased_quota,
            "daily_remaining": daily_remaining,
            "purchased_remaining": user.purchased_quota
        }
    }

@router.post("/increment")
async def increment_usage(
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

    daily_used = usage.count if usage else 0

    # 优先扣每日免费次数
    if daily_used < user.daily_quota:
        if usage:
            usage.count += 1
        else:
            usage = UsageLog(user_id=user_id, date=today, count=1)
            db.add(usage)
    else:
        # 扣购买次数
        if user.purchased_quota > 0:
            user.purchased_quota -= 1
        else:
            return {"code": 1, "message": "次数不足"}

    db.commit()

    return {
        "code": 0,
        "message": "success"
    }

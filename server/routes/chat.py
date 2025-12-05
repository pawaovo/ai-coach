# 聊天路由
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from services.database import get_db
from models.chat_session import ChatSession
from models.chat_message import ChatMessage
from datetime import datetime
import jwt
import os

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET")

def get_user_id_from_token(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未授权")

    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token 已过期")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="无效的 Token")

class CreateSessionRequest(BaseModel):
    tool_type: str

@router.post("/sessions")
async def create_session(
    req: CreateSessionRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token)
):
    session = ChatSession(user_id=user_id, tool_type=req.tool_type)
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "code": 0,
        "message": "success",
        "data": {
            "id": str(session.id),
            "userId": str(session.user_id),
            "toolType": session.tool_type,
            "createdAt": session.created_at.isoformat()
        }
    }

@router.get("/sessions")
async def get_sessions(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token)
):
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == user_id
    ).order_by(ChatSession.created_at.desc()).all()

    result = []
    for s in sessions:
        # 查询该会话的第一条用户消息
        first_user_msg = db.query(ChatMessage).filter(
            ChatMessage.session_id == s.id,
            ChatMessage.role == "user"
        ).order_by(ChatMessage.created_at.asc()).first()

        result.append({
            "id": str(s.id),
            "userId": str(s.user_id),
            "toolType": s.tool_type,
            "createdAt": s.created_at.isoformat(),
            "firstMessage": first_user_msg.content if first_user_msg else "新对话"
        })

    return {
        "code": 0,
        "message": "success",
        "data": result
    }

@router.get("/sessions/{session_id}/messages")
async def get_messages(
    session_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_user_id_from_token)
):
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()

    return {
        "code": 0,
        "message": "success",
        "data": [
            {
                "id": str(m.id),
                "sessionId": str(m.session_id),
                "role": m.role,
                "content": m.content,
                "createdAt": m.created_at.isoformat()
            }
            for m in messages
        ]
    }

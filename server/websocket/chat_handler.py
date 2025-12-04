# WebSocket 聊天处理
from fastapi import WebSocket
from sqlalchemy.orm import Session
from services.database import SessionLocal
from models.chat_session import ChatSession
from models.chat_message import ChatMessage
import json
import os
import httpx

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL")
OPENAI_MODEL = os.getenv("OPENAI_MODEL")

async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    user_id = websocket.query_params.get("user_id")
    db = SessionLocal()

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            user_message = msg.get("message")
            tool_type = msg.get("toolType", "free_chat")
            session_id = msg.get("sessionId")

            # 创建或获取会话
            if not session_id:
                session = ChatSession(user_id=user_id, tool_type=tool_type)
                db.add(session)
                db.commit()
                db.refresh(session)
                session_id = str(session.id)

                await websocket.send_json({
                    "type": "session",
                    "sessionId": session_id
                })

            # 保存用户消息
            user_msg = ChatMessage(
                session_id=session_id,
                role="user",
                content=user_message
            )
            db.add(user_msg)
            db.commit()

            # 查询历史消息
            history = db.query(ChatMessage).filter(
                ChatMessage.session_id == session_id
            ).order_by(ChatMessage.created_at.asc()).limit(20).all()

            # 构建消息列表（系统提示词 + 历史对话）
            messages = [
                {
                    "role": "system",
                    "content": "你是一位经验丰富的高管教练，专注于引导式对话而非直接给出答案。你的核心方法是通过提问帮助对方自己找到解决方案。你擅长倾听、提问和反思，帮助高管明确目标、识别障碍、探索可能性。保持专业、同理心和启发性。"
                }
            ]
            for h in history:
                messages.append({"role": h.role, "content": h.content})

            # 调用火山引擎 API（流式，带重试）
            max_retries = 2
            retry_count = 0
            assistant_content = ""

            while retry_count <= max_retries:
                try:
                    async with httpx.AsyncClient() as client:
                        async with client.stream(
                            "POST",
                            f"{OPENAI_BASE_URL}/chat/completions",
                            headers={
                                "Authorization": f"Bearer {OPENAI_API_KEY}",
                                "Content-Type": "application/json"
                            },
                            json={
                                "model": OPENAI_MODEL,
                                "messages": messages,
                                "stream": True
                            },
                            timeout=60.0
                        ) as response:
                            async for line in response.aiter_lines():
                                if line.startswith("data: "):
                                    chunk_data = line[6:]
                                    if chunk_data == "[DONE]":
                                        break
                                    try:
                                        chunk = json.loads(chunk_data)
                                        delta = chunk["choices"][0]["delta"].get("content", "")
                                        if delta:
                                            assistant_content += delta
                                            await websocket.send_json({
                                                "type": "chunk",
                                                "content": delta
                                            })
                                    except:
                                        pass
                    break
                except Exception as e:
                    retry_count += 1
                    if retry_count > max_retries:
                        raise e
                    await websocket.send_json({
                        "type": "error",
                        "error": f"请求失败，正在重试 ({retry_count}/{max_retries})..."
                    })

            # 保存 AI 回复
            assistant_msg = ChatMessage(
                session_id=session_id,
                role="assistant",
                content=assistant_content
            )
            db.add(assistant_msg)
            db.commit()

            # 发送完成信号
            await websocket.send_json({
                "type": "done",
                "sessionId": session_id
            })

    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "error": str(e)
        })
    finally:
        db.close()

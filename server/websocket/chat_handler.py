# WebSocket 聊天处理
from fastapi import WebSocket
from sqlalchemy.orm import Session
from services.database import SessionLocal
from models.chat_session import ChatSession
from models.chat_message import ChatMessage
import json
import os
import httpx
import logging

logger = logging.getLogger(__name__)

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

            # 忽略心跳消息
            if msg.get("type") == "ping":
                continue

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

            # 刷新数据库会话，确保获取最新数据
            db.expire_all()

            # 查询历史消息（最近5轮对话 = 10条消息）
            history = db.query(ChatMessage).filter(
                ChatMessage.session_id == session_id
            ).order_by(ChatMessage.created_at.desc()).limit(10).all()

            # 反转顺序（从旧到新）
            history.reverse()

            # 构建消息列表（系统提示词 + 历史对话 + 当前用户消息）
            messages = [
                {
                    "role": "system",
                    "content": "你是一位经验丰富的高管教练，专注于引导式对话而非直接给出答案。你的核心方法是通过提问帮助对方自己找到解决方案。你擅长倾听、提问和反思，帮助高管明确目标、识别障碍、探索可能性。保持专业、同理心和启发性。"
                }
            ]

            # 添加历史消息
            for h in history:
                messages.append({"role": h.role, "content": h.content})

            # 添加当前用户消息
            messages.append({"role": "user", "content": user_message})

            # 保存用户消息到数据库
            user_msg = ChatMessage(
                session_id=session_id,
                role="user",
                content=user_message
            )
            db.add(user_msg)
            db.commit()

            # 调用 AI API（流式，带重试）
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
                            buffer = ""
                            stream_done = False
                            async for chunk_bytes in response.aiter_bytes():
                                buffer += chunk_bytes.decode("utf-8", errors="ignore")
                                while "\n\n" in buffer:
                                    event, buffer = buffer.split("\n\n", 1)
                                    if not event.strip():
                                        continue
                                    for line in event.split("\n"):
                                        if not line.startswith("data: "):
                                            continue
                                        chunk_data = line[6:]
                                        if chunk_data == "[DONE]":
                                            stream_done = True
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
                                    if stream_done:
                                        break
                                if stream_done:
                                    break
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
        logger.error(f"[WebSocket] 异常: {e}", exc_info=True)
        try:
            await websocket.send_json({
                "type": "error",
                "error": str(e)
            })
        except:
            pass
    finally:
        db.close()

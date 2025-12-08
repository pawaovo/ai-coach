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
import uuid

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
            headers = {
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            completion_url = f"{OPENAI_BASE_URL}/chat/completions"

            async with httpx.AsyncClient() as client:
                while retry_count <= max_retries:
                    try:
                        async with client.stream(
                            "POST",
                            completion_url,
                            headers=headers,
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

                # 生成并发送智能选项
                await generate_and_send_options(
                    client=client,
                    websocket=websocket,
                    headers=headers,
                    history_messages=history,
                    user_message=user_message,
                    assistant_response=assistant_content,
                    completion_url=completion_url
                )

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


async def generate_and_send_options(client, websocket, headers, history_messages, user_message, assistant_response, completion_url):
    """生成并发送智能选项"""
    try:
        # 构建对话历史文本
        history_lines = []
        for record in history_messages:
            role_label = "用户" if record.role == "user" else "AI"
            history_lines.append(f"{role_label}: {record.content}")
        if user_message:
            history_lines.append(f"用户: {user_message}")
        if assistant_response:
            history_lines.append(f"AI: {assistant_response}")
        history_text = "\n".join(history_lines)

        # 选项生成提示词
        options_prompt = (
            "基于以下对话历史，生成 3-5 个引导式选项供用户选择。选项应该是开放性的问题或下一步建议，帮助用户深入思考。"
            "请以 JSON 数组格式返回，每个选项包含 label（显示文字）和 value（实际值）字段。示例格式：[{\"label\": \"...\", \"value\": \"...\"}]"
        )

        # 构建请求负载
        payload = {
            "model": OPENAI_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "你是一位经验丰富的高管教练，专注于引导式对话而非直接给出答案。"
                },
                {
                    "role": "user",
                    "content": f"{options_prompt}\n\n对话历史：\n{history_text}"
                }
            ],
            "stream": False
        }

        # 调用 AI API（非流式）
        response = await client.post(
            completion_url,
            headers=headers,
            json=payload,
            timeout=60.0
        )
        response.raise_for_status()
        result = response.json()

        # 提取内容
        content = (
            result.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )

        # 解析 JSON 数组
        parsed_options = json.loads(content)
        if not isinstance(parsed_options, list):
            return

        # 格式化选项（添加唯一 ID）
        formatted_options = []
        for option in parsed_options:
            label = option.get("label")
            value = option.get("value")
            if not label or not value:
                continue
            formatted_options.append({
                "id": str(uuid.uuid4()),
                "label": label,
                "value": value
            })

        # 发送选项到前端
        if formatted_options:
            await websocket.send_json({
                "type": "options",
                "options": formatted_options
            })
    except Exception as e:
        # 静默失败，不影响正常对话流程
        logger.warning(f"选项生成失败: {e}")

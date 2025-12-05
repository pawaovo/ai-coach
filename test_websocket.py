#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""测试 WebSocket 多轮对话"""

import asyncio
import websockets
import json

async def test_multi_turn_chat():
    """测试多轮对话"""
    uri = "ws://localhost:8000/ws/chat?user_id=test_user_123"

    async with websockets.connect(uri) as websocket:
        print("✅ WebSocket 已连接")

        session_id = None

        # 第一轮对话
        print("\n📤 发送第一条消息...")
        await websocket.send(json.dumps({
            "message": "你好，我是一名创业公司的CEO",
            "toolType": "free_chat"
        }))

        print("📥 接收响应...")
        async for message in websocket:
            data = json.loads(message)
            if data["type"] == "session":
                session_id = data["sessionId"]
                print(f"✅ 获取到 session_id: {session_id}")
            elif data["type"] == "chunk":
                print(data["content"], end="", flush=True)
            elif data["type"] == "done":
                print("\n✅ 第一轮对话完成")
                break
            elif data["type"] == "error":
                print(f"\n❌ 错误: {data['error']}")
                return

        # 等��� 1 秒
        await asyncio.sleep(1)

        # 第二轮对话
        print("\n📤 发送第二条消息...")
        await websocket.send(json.dumps({
            "message": "我现在面临团队管理的挑战",
            "toolType": "free_chat",
            "sessionId": session_id
        }))

        print("📥 接收响应...")
        async for message in websocket:
            data = json.loads(message)
            if data["type"] == "chunk":
                print(data["content"], end="", flush=True)
            elif data["type"] == "done":
                print("\n✅ 第二轮对话完成")
                break
            elif data["type"] == "error":
                print(f"\n❌ 错误: {data['error']}")
                return

        # 等待 1 秒
        await asyncio.sleep(1)

        # 第三轮对话
        print("\n📤 发送第三条消息...")
        await websocket.send(json.dumps({
            "message": "具体来说，团队成员之间沟通不畅",
            "toolType": "free_chat",
            "sessionId": session_id
        }))

        print("📥 接收响应...")
        async for message in websocket:
            data = json.loads(message)
            if data["type"] == "chunk":
                print(data["content"], end="", flush=True)
            elif data["type"] == "done":
                print("\n✅ 第三轮对话完成")
                break
            elif data["type"] == "error":
                print(f"\n❌ 错误: {data['error']}")
                return

        print("\n🎉 多轮对话测试完成！")

if __name__ == "__main__":
    try:
        asyncio.run(test_multi_turn_chat())
    except KeyboardInterrupt:
        print("\n\n⚠️ 测试被中断")
    except Exception as e:
        print(f"\n\n❌ 测试失败: {e}")

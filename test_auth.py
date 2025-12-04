#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""测试授权接口"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_update_profile():
    """测试更新用户信息接口"""

    # 1. 先登录获取 token（使用测试 code）
    print("1. 测试登录...")
    login_data = {"code": "test_code"}

    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"登录响应状态码: {response.status_code}")
        print(f"登录响应内容: {response.json()}")

        if response.status_code != 200:
            print("❌ 登录失败")
            return

        token = response.json()["data"]["token"]
        print(f"✅ 获取到 token: {token[:20]}...")

    except Exception as e:
        print(f"❌ 登录请求失败: {e}")
        return

    # 2. 测试更新用户信息
    print("\n2. 测试更新用户信息...")
    update_data = {
        "nickname": "测试用户",
        "phone_code": "test_phone_code"
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(
            f"{BASE_URL}/auth/update-profile",
            json=update_data,
            headers=headers
        )
        print(f"更新响应状态码: {response.status_code}")
        print(f"更新响应内容: {response.json()}")

        if response.status_code == 200:
            print("✅ 更新用户信息成功")
        else:
            print("❌ 更新用户信息失败")

    except Exception as e:
        print(f"❌ 更新请求失败: {e}")

if __name__ == "__main__":
    test_update_profile()

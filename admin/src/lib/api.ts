export interface User {
  id: string
  phone: string
  nickname: string
  avatar_url: string
  daily_quota: number
  purchased_quota: number
  created_at: string
}

interface APIResponse<T> {
  code: number
  message: string
  data: T
}

const API_BASE_URL = "http://localhost:8000/api"

// 获取存储的 token
function getToken(): string | null {
  return localStorage.getItem("admin_token")
}

// 通用请求函数
async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = token
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result: APIResponse<T> = await response.json()

  if (result.code !== 0) {
    throw new Error(result.message || "请求失败")
  }

  return result.data
}

export const api = {
  // 管理员登录
  async login(username: string, password: string): Promise<{ token: string }> {
    const token = btoa(`${username}:${password}`)
    return request<{ token: string }>("/admin/login", {
      method: "POST",
      headers: {
        Authorization: `Basic ${token}`,
      },
    })
  },

  // 获取用户列表
  async getUsers(): Promise<User[]> {
    return request<User[]>("/admin/users", {
      method: "GET",
    })
  },

  // 修改用户购买次数
  async updateUserQuota(userId: string, amount: number): Promise<void> {
    await request(`/admin/users/${userId}/quota`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    })
  },
}

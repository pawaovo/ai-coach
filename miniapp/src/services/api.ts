// HTTP API 封装
import Taro from '@tarojs/taro';
import { getToken } from '../utils/auth';
import { API_CONFIG } from '../constants';
import type { APIResponse, ChatSession, ChatMessage } from '../types';

class API {
  private baseURL = API_CONFIG.baseURL;

  private async request<T>(options: Taro.request.Option): Promise<T> {
    const token = getToken();

    const res = await Taro.request({
      ...options,
      url: `${this.baseURL}${options.url}`,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      timeout: API_CONFIG.timeout
    });

    const response = res.data as APIResponse<T>;

    if (response.code !== 0) {
      throw new Error(response.message || '请求失败');
    }

    return response.data as T;
  }

  // 创建会话
  async createSession(toolType: string): Promise<ChatSession> {
    return this.request<ChatSession>({
      url: '/sessions',
      method: 'POST',
      data: { tool_type: toolType }
    });
  }

  // 获取会话列表
  async getSessions(): Promise<ChatSession[]> {
    return this.request<ChatSession[]>({
      url: '/sessions',
      method: 'GET'
    });
  }

  // 获取会话消息
  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>({
      url: `/sessions/${sessionId}/messages`,
      method: 'GET'
    });
  }

  // 检查使用次数
  async checkUsage(): Promise<{ remaining: number; total: number }> {
    return this.request({
      url: '/usage/check',
      method: 'GET'
    });
  }

  // 增加使用次数
  async incrementUsage(): Promise<void> {
    return this.request({
      url: '/usage/increment',
      method: 'POST'
    });
  }
}

export default new API();

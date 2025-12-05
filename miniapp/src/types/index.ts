// 类型定义
export interface User {
  id: string;
  openid: string;
  nickname?: string;
  avatarUrl?: string;
  dailyQuota: number;
  isPremium: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  toolType: 'free_chat' | 'swot' | 'smart' | 'decision' | '5why';
  createdAt: string;
  firstMessage?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface UsageLog {
  userId: string;
  date: string;
  count: number;
}

export interface WSMessage {
  type: 'chunk' | 'done' | 'error' | 'session';
  content?: string;
  sessionId?: string;
  error?: string;
}

export interface APIResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

// 前端页面使用的消息类型（用于本地状态管理）
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

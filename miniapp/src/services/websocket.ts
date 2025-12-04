// WebSocket 服务
import Taro from '@tarojs/taro';
import { getUserId } from '../utils/auth';
import { API_CONFIG } from '../constants';
import type { WSMessage } from '../types';

class WebSocketService {
  private socket: Taro.SocketTask | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;

  onChunk?: (text: string) => void;
  onDone?: (sessionId: string) => void;
  onError?: (error: string) => void;
  onSession?: (sessionId: string) => void;

  async connect(): Promise<void> {
    if (this.socket || this.isConnecting) {
      return;
    }

    const userId = getUserId();
    if (!userId) {
      throw new Error('未登录');
    }

    this.isConnecting = true;

    try {
      await Taro.connectSocket({
        url: `${API_CONFIG.wsURL}/chat?user_id=${userId}`
      });

      this.socket = {} as Taro.SocketTask;

      Taro.onSocketOpen(() => {
        console.log('WebSocket 已连接');
        this.isConnecting = false;
        this.startHeartbeat();
      });

      Taro.onSocketMessage((res) => {
        try {
          const data: WSMessage = JSON.parse(res.data as string);

          if (data.type === 'chunk' && data.content) {
            this.onChunk?.(data.content);
          } else if (data.type === 'done' && data.sessionId) {
            this.onDone?.(data.sessionId);
          } else if (data.type === 'session' && data.sessionId) {
            this.onSession?.(data.sessionId);
          } else if (data.type === 'error') {
            this.onError?.(data.error || '未知错误');
          }
        } catch (error) {
          console.error('解析消息失败:', error);
        }
      });

      Taro.onSocketClose(() => {
        console.log('WebSocket 已关闭');
        this.stopHeartbeat();
        this.socket = null;
        this.scheduleReconnect();
      });

      Taro.onSocketError((err) => {
        console.error('WebSocket 错误:', err);
        this.onError?.('连接失败');
      });
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  sendMessage(message: string, toolType: string, sessionId?: string): void {
    if (!this.socket) {
      throw new Error('WebSocket 未连接');
    }

    Taro.sendSocketMessage({
      data: JSON.stringify({
        message,
        tool_type: toolType,
        session_id: sessionId
      })
    });
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.socket) {
        Taro.sendSocketMessage({ data: JSON.stringify({ type: 'ping' }) });
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      console.log('尝试重连 WebSocket...');
      this.connect().catch(console.error);
      this.reconnectTimer = null;
    }, 3000);
  }

  close(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      Taro.closeSocket({});
      this.socket = null;
    }
  }
}

export default new WebSocketService();

// AI 教练对话页（首页）
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useState, useEffect } from 'react';
import websocket from '../../services/websocket';
import api from '../../services/api';
import { checkDailyQuota, incrementUsage, getUsageInfo } from '../../utils/usage';
import { storage } from '../../utils/storage';
import { COACH_PERSONA, STORAGE_KEYS } from '../../constants';
import type { Message } from '../../types';
import './index.scss';

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [quotaRemaining, setQuotaRemaining] = useState(10);
  const [quotaTotal, setQuotaTotal] = useState(10);
  const [scrollIntoViewId, setScrollIntoViewId] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [historySessions, setHistorySessions] = useState<any[]>([]);

  // 初始化
  useEffect(() => {
    initChat();
    return () => websocket.close();
  }, []);

  // 自动滚动到最新消息
  useEffect(() => {
    const lastMsgId = `msg-${messages.length - 1}`;
    setScrollIntoViewId(lastMsgId);
  }, [messages]);

  // 流式文本更新时也触发滚动
  useEffect(() => {
    if (streamingText) {
      const streamingMsgId = `msg-streaming`;
      setScrollIntoViewId(streamingMsgId);
    }
  }, [streamingText]);


  const initChat = async () => {
    // 显示欢迎语
    setMessages([{
      id: '1',
      role: 'assistant',
      content: COACH_PERSONA.greeting,
      timestamp: new Date()
    }]);

    // 等待登录完成后再连接 WebSocket
    const maxRetries = 10;
    let retries = 0;
    while (retries < maxRetries) {
      const userId = storage.get(STORAGE_KEYS.USER_ID);
      if (userId) break;
      await new Promise(resolve => setTimeout(resolve, 300));
      retries++;
    }

    // 加载配额信息
    await loadQuotaInfo();

    // 连接 WebSocket
    try {
      await websocket.connect();
      setupWebSocketHandlers();
    } catch (error) {
      console.error('WebSocket 连接失败:', error);
    }

    // 恢复最近会话
    const lastSessionId = storage.get<string>(STORAGE_KEYS.LAST_SESSION);
    if (lastSessionId) {
      try {
        await loadSession(lastSessionId);
      } catch (error) {
        console.error('加载会话失败:', error);
      }
    }
  };

  const loadQuotaInfo = async () => {
    const usageInfo = await getUsageInfo();
    if (usageInfo) {
      setQuotaRemaining(usageInfo.remaining);
      setQuotaTotal(usageInfo.total);
    }
  };

  const setupWebSocketHandlers = () => {
    websocket.onChunk = (text: string) => {
      setStreamingText(prev => prev + text);
    };

    websocket.onDone = (sid: string) => {
      setStreamingText(current => {
        if (current) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: current,
            timestamp: new Date()
          }]);
        }
        return '';
      });
      setIsStreaming(false);
    };

    websocket.onSession = (sid: string) => {
      setSessionId(sid);
      storage.set(STORAGE_KEYS.LAST_SESSION, sid);
    };

    websocket.onError = (error: string) => {
      Taro.showToast({ title: error, icon: 'none' });
      setIsStreaming(false);
    };
  };

  const loadSession = async (sid: string) => {
    try {
      const msgs = await api.getMessages(sid);
      setMessages(msgs.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.createdAt)
      })));
      setSessionId(sid);
    } catch (error) {
      console.error('加载会话消息失败:', error);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return;

    // 检查使用次数
    const canSend = await checkDailyQuota();
    if (!canSend) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsStreaming(true);
    setStreamingText('');

    try {
      websocket.sendMessage(inputValue, 'free_chat', sessionId || undefined);
      await incrementUsage();
      // 更新配额显示
      await loadQuotaInfo();
    } catch (error) {
      console.error('发送消息失败:', error);
      Taro.showToast({ title: '发送失败', icon: 'error' });
      setIsStreaming(false);
    }
  };

  const handleNewSession = () => {
    setSessionId(null);
    setMessages([{
      id: '1',
      role: 'assistant',
      content: COACH_PERSONA.greeting,
      timestamp: new Date()
    }]);
    storage.remove(STORAGE_KEYS.LAST_SESSION);
  };

  const handleShowHistory = async () => {
    try {
      const sessions = await api.getSessions();
      setHistorySessions(sessions);
      setShowHistory(true);
    } catch (error) {
      console.error('加载历史会话失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'error' });
    }
  };

  const handleSelectSession = async (sid: string) => {
    setShowHistory(false);
    await loadSession(sid);
  };

  // 按日期分组历史会话
  const groupedSessions = historySessions.reduce((groups, session) => {
    const date = new Date(session.createdAt);
    const key = `${date.getMonth() + 1}月${date.getDate()}日`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(session);
    return groups;
  }, {} as Record<string, any[]>);

  return (
    <View className="chat-page">
      {/* 自定义导航栏 */}
      <View className="custom-nav">
        <View className="nav-left">
          <Text className="history-icon" onClick={handleShowHistory}>☰</Text>
          <View className="new-icon" onClick={handleNewSession}>
            <View className="plus-h" />
            <View className="plus-v" />
          </View>
        </View>
        <Text className="quota-text">{quotaRemaining}/{quotaTotal}</Text>
        <View className="nav-right" />
      </View>

      <ScrollView scrollY className="message-list" scrollIntoView={scrollIntoViewId} scrollWithAnimation>
        {messages.map((msg, index) => (
          <View key={msg.id} id={`msg-${index}`} className="message-wrapper">
            <View className={`message ${msg.role}`}>
              {msg.role === 'assistant' && <View className="msg-avatar" />}
              <View className="msg-bubble">
                <Text className="msg-content" userSelect>{msg.content}</Text>
              </View>
            </View>
          </View>
        ))}

        {isStreaming && streamingText && (
          <View id="msg-streaming" className="message-wrapper">
            <View className="message assistant">
              <View className="msg-avatar" />
              <View className="msg-bubble">
                <Text className="msg-content" userSelect>{streamingText}</Text>
                <Text className="cursor">|</Text>
              </View>
            </View>
          </View>
        )}

        {isStreaming && !streamingText && (
          <View id="msg-thinking" className="message-wrapper">
            <View className="message assistant">
              <View className="msg-avatar" />
              <View className="msg-bubble thinking">
                <View className="dot" />
                <View className="dot" />
                <View className="dot" />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 历史会话弹窗 */}
      {showHistory && (
        <View className="history-modal">
          <View className="modal-mask" onClick={() => setShowHistory(false)} />
          <View className="modal-content">
            <View className="modal-header">
              <Text className="modal-title">历史对话</Text>
              <Text className="modal-close" onClick={() => setShowHistory(false)}>✕</Text>
            </View>
            <ScrollView scrollY className="history-list">
              {Object.keys(groupedSessions).length === 0 ? (
                <View className="empty-hint">
                  <Text>暂无历史对话</Text>
                </View>
              ) : (
                Object.entries(groupedSessions).map(([date, sessions]) => (
                  <View key={date} className="history-group">
                    <Text className="group-date">{date}</Text>
                    {sessions.map((session) => (
                      <View
                        key={session.id}
                        className="history-item"
                        onClick={() => handleSelectSession(session.id)}
                      >
                        <Text className="item-text">{session.firstMessage || '新对话'}</Text>
                      </View>
                    ))}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}

      <View className="input-area">
        <View className="input-wrapper">
          <Input
            className="input"
            value={inputValue}
            onInput={(e) => setInputValue(e.detail.value)}
            placeholder="说说你的想法..."
            disabled={isStreaming}
          />
          <View className={`send-btn ${inputValue.trim() ? 'active' : ''}`} onClick={handleSend}>
            <View className="arrow-icon" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default ChatPage;

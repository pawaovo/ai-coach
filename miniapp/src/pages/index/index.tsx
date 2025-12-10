// AI 教练对话页（首页）- 新设计
import { View, Text, Textarea, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useState, useEffect } from 'react';
import websocket from '../../services/websocket';
import api from '../../services/api';
import { checkDailyQuota, incrementUsage, getUsageInfo } from '../../utils/usage';
import { cleanMarkdown } from '../../utils/markdown';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS, PRESETS } from '../../constants';
import type { Message } from '../../types';
import CustomTabBar from '../../components/CustomTabBar';
import './index.scss';

// AI头像图片
const aiCoachIcon = require('../../assets/Ai-coach.png');

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scrollIntoViewId, setScrollIntoViewId] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [historySessions, setHistorySessions] = useState<any[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{ remaining: number; total: number } | null>(null);

  // 初始化
  useEffect(() => {
    initChat();
    loadUsageInfo();
    return () => websocket.close();
  }, []);

  // 自动滚动到最新消息
  useEffect(() => {
    if (messages.length > 0) {
      setScrollIntoViewId(`msg-${messages.length - 1}`);
    }
  }, [messages]);

  // 流式文本更新时也触发滚动
  useEffect(() => {
    if (streamingText) {
      setScrollIntoViewId('msg-streaming');
    }
  }, [streamingText]);

  const initChat = async () => {
    // 等待登录完成后再连接 WebSocket
    const maxRetries = 10;
    let retries = 0;
    while (retries < maxRetries) {
      const userId = storage.get(STORAGE_KEYS.USER_ID);
      if (userId) break;
      await new Promise(resolve => setTimeout(resolve, 300));
      retries++;
    }

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
      // 更新使用次数显示
      await loadUsageInfo();
    } catch (error) {
      console.error('发送消息失败:', error);
      Taro.showToast({ title: '发送失败', icon: 'error' });
      setIsStreaming(false);
    }
  };

  const handleNewSession = () => {
    if (isStreaming) return;
    setShowMenu(false);
    // 保存当前会话（如果有消息）
    setSessionId(null);
    setMessages([]);
    storage.remove(STORAGE_KEYS.LAST_SESSION);
  };

  const handleShowHistory = async () => {
    setShowMenu(false);
    try {
      const sessions = await api.getSessions();
      setHistorySessions(sessions);
      setShowHistory(true);
    } catch (error) {
      console.error('加载历史会话失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'error' });
    }
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleSelectSession = async (sid: string) => {
    setShowHistory(false);
    await loadSession(sid);
  };

  const handlePresetClick = (text: string) => {
    setInputValue(text);
  };

  const loadUsageInfo = async () => {
    try {
      const info = await getUsageInfo();
      if (info) {
        setUsageInfo({
          remaining: info.remaining,
          total: info.total
        });
      }
    } catch (error) {
      console.error('加载使用次数失败:', error);
    }
  };

  return (
    <View className="chat-page">
      {/* Header */}
      <View className="header">
        <Text className="title">AI Coach</Text>
        <View className="header-actions">
          {/* 消息计数展示 */}
          <View className="usage-counter">
            {usageInfo ? (
              <Text className="counter-text">
                {usageInfo.remaining}/{usageInfo.total}
              </Text>
            ) : (
              <Text className="counter-text">--/--</Text>
            )}
          </View>
          <View className="icon-btn" onClick={handleMenuToggle}>
            <View className="menu-icon">
              <View className="dot" />
              <View className="dot" />
              <View className="dot" />
            </View>
          </View>
        </View>
      </View>

      {/* 下拉菜单 */}
      {showMenu && (
        <>
          <View className="menu-mask" onClick={() => setShowMenu(false)} />
          <View className="dropdown-menu">
            <View className="menu-item" onClick={handleNewSession}>
              <View className="menu-item-icon plus">
                <View className="plus-h" />
                <View className="plus-v" />
              </View>
              <Text className="menu-item-text">新建对话</Text>
            </View>
            <View className="menu-item" onClick={handleShowHistory}>
              <View className="menu-item-icon history" />
              <Text className="menu-item-text">历史对话</Text>
            </View>
          </View>
        </>
      )}

      {/* Messages Area */}
      <ScrollView
        scrollY
        className="message-area"
        scrollIntoView={scrollIntoViewId}
        scrollWithAnimation
      >
        {messages.length === 0 ? (
          // 空状态 - 显示预设提示
          <View className="empty-state">
            <View className="presets-grid">
              {PRESETS.map((preset, index) => (
                <View
                  key={index}
                  className="preset-btn"
                  onClick={() => handlePresetClick(preset.text)}
                >
                  <Text className="preset-label">{preset.label}</Text>
                  <View className="preset-arrow" />
                </View>
              ))}
            </View>
          </View>
        ) : (
          // 消息列表
          <View className="messages-list">
            {messages.map((msg, index) => (
              <View key={msg.id} id={`msg-${index}`} className="message-wrapper">
                <View className={`message ${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <Image src={aiCoachIcon} className="ai-avatar" mode="aspectFit" />
                  )}
                  <View className={`msg-bubble ${msg.role}`}>
                    <Text className="msg-content" userSelect>
                      {msg.role === 'assistant' ? cleanMarkdown(msg.content) : msg.content}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {/* 流式文本 */}
            {isStreaming && streamingText && (
              <View id="msg-streaming" className="message-wrapper">
                <View className="message assistant">
                  <Image src={aiCoachIcon} className="ai-avatar" mode="aspectFit" />
                  <View className="msg-bubble assistant">
                    <Text className="msg-content" userSelect>{cleanMarkdown(streamingText)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 加载动画 */}
            {isStreaming && !streamingText && (
              <View id="msg-thinking" className="message-wrapper">
                <View className="message assistant">
                  <Image src={aiCoachIcon} className="ai-avatar" mode="aspectFit" />
                  <View className="loading-dots">
                    <View className="dot" style={{ animationDelay: '0ms' }} />
                    <View className="dot" style={{ animationDelay: '150ms' }} />
                    <View className="dot" style={{ animationDelay: '300ms' }} />
                  </View>
                </View>
              </View>
            )}

            <View className="scroll-anchor" />
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
              <View className="modal-close" onClick={() => setShowHistory(false)}>
                <Text className="close-icon">×</Text>
              </View>
            </View>
            <ScrollView scrollY className="history-list">
              {historySessions.length === 0 ? (
                <View className="empty-hint">
                  <Text>暂无历史记录</Text>
                </View>
              ) : (
                <View className="history-items">
                  {historySessions.map((session) => (
                    <View
                      key={session.id}
                      className="history-item"
                      onClick={() => handleSelectSession(session.id)}
                    >
                      <Text className="item-text">{session.firstMessage || '新对话'}</Text>
                      <View className="item-arrow" />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Input Area */}
      <View className="input-area">
        <View className="input-wrapper">
          <Textarea
            className="input"
            value={inputValue}
            onInput={(e) => setInputValue(e.detail.value)}
            placeholder="说点什么..."
            placeholderClass="input-placeholder"
            disabled={isStreaming}
            autoHeight
            maxlength={2000}
          />
          <View
            className={`send-btn ${inputValue.trim() && !isStreaming ? 'active' : ''}`}
            onClick={handleSend}
          >
            {isStreaming ? (
              <View className="loading-spinner" />
            ) : (
              <View className="arrow-up" />
            )}
          </View>
        </View>
      </View>

      {/* Custom TabBar */}
      <CustomTabBar current={1} />
    </View>
  );
};

export default ChatPage;

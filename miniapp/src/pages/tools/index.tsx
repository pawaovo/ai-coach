// 商业工具页 - 新设计
import { View, Text, Textarea, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useState, useEffect } from 'react';
import websocket from '../../services/websocket';
import api from '../../services/api';
import { checkDailyQuota, incrementUsage, getUsageInfo } from '../../utils/usage';
import { BUSINESS_TOOLS } from '../../constants';
import type { Message, ChatSession } from '../../types';
import CustomTabBar from '../../components/CustomTabBar';
import './index.scss';

const aiCoachIcon = require('../../assets/Ai-coach.png');

// 工具图标映射
const ToolIcon = ({ id }: { id: string }) => {
  switch (id) {
    case 'swot':
      return (
        <View className="tool-icon-inner">
          <View className="trend-line" />
          <View className="trend-arrow" />
        </View>
      );
    case 'smart':
      return (
        <View className="tool-icon-inner">
          <View className="target-outer" />
          <View className="target-inner" />
        </View>
      );
    case 'matrix':
      return (
        <View className="tool-icon-inner grid-icon">
          <View className="grid-cell" />
          <View className="grid-cell" />
          <View className="grid-cell" />
          <View className="grid-cell" />
        </View>
      );
    case '5why':
      return (
        <View className="tool-icon-inner">
          <Text className="question-mark">?</Text>
        </View>
      );
    default:
      return null;
  }
};


const ToolsPage = () => {
  const [showChat, setShowChat] = useState(false);
  const [selectedTool, setSelectedTool] = useState<typeof BUSINESS_TOOLS[0] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scrollIntoViewId, setScrollIntoViewId] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [historySessions, setHistorySessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    if (messages.length > 0) {
      setScrollIntoViewId(`tool-msg-${messages.length - 1}`);
    }
  }, [messages]);

  useEffect(() => {
    if (streamingText) {
      setScrollIntoViewId('tool-msg-streaming');
    }
  }, [streamingText]);

  const handleToolClick = async (tool: typeof BUSINESS_TOOLS[0]) => {
    setSelectedTool(tool);
    setShowChat(true);
    setMessages([{
      id: 'init',
      role: 'assistant',
      content: tool.initialMessage || `你好！我是你的${tool.name}助手。${tool.description}`,
      timestamp: new Date()
    }]);
    setSessionId(null);
    setInputValue('');
    setStreamingText('');
    setIsStreaming(false);

    try {
      await websocket.connect();
      setupWebSocketHandlers();
    } catch (error) {
      console.error('WebSocket 连接失败:', error);
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
    };

    websocket.onError = (error: string) => {
      Taro.showToast({ title: error, icon: 'none' });
      setIsStreaming(false);
    };
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return;

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
      websocket.sendMessage(inputValue, selectedTool?.id || 'free_chat', sessionId || undefined);
      await incrementUsage();
      const usageInfo = await getUsageInfo();
      if (usageInfo) {
        Taro.eventCenter.trigger('quotaUpdated', usageInfo);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      Taro.showToast({ title: '发送失败', icon: 'error' });
      setIsStreaming(false);
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
    websocket.close();
  };

  const handleShowHistory = async () => {
    try {
      const allSessions = await api.getSessions();
      // 显示所有商业工具的会话
      const filteredSessions = allSessions.filter(s =>
        ['swot', 'smart', 'matrix', '5why'].includes(s.toolType)
      );
      setHistorySessions(filteredSessions);
      setShowHistory(true);
    } catch (error) {
      console.error('加载历史会话失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'error' });
    }
  };

  const handleSelectSession = async (sid: string, toolType: string) => {
    setShowHistory(false);

    // 找到对应的工具
    const tool = BUSINESS_TOOLS.find(t => t.id === toolType);
    if (!tool) return;

    setSelectedTool(tool);
    setShowChat(true);

    try {
      const msgs = await api.getMessages(sid);
      setMessages(msgs.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.createdAt)
      })));
      setSessionId(sid);

      // 连接 WebSocket
      await websocket.connect();
      setupWebSocketHandlers();
    } catch (error) {
      console.error('加载会话消息失败:', error);
    }
  };

  const getToolName = (toolType: string) => {
    const tool = BUSINESS_TOOLS.find(t => t.id === toolType);
    return tool ? tool.name : '未知工具';
  };

  return (
    <View className="tools-page">
      {/* Header */}
      <View className="header">
        <Text className="title">商业工具</Text>
        <View className="header-actions">
          <View className="icon-btn" onClick={handleShowHistory}>
            <View className="history-icon" />
          </View>
        </View>
      </View>

      {/* 2x2 Grid */}
      <View className="tools-grid">
        {BUSINESS_TOOLS.map((tool) => (
          <View
            key={tool.id}
            className="tool-card"
            onClick={() => handleToolClick(tool)}
          >
            {/* Top: Icon & Arrow */}
            <View className="card-top">
              <View className="tool-icon">
                <ToolIcon id={tool.id} />
              </View>
              <View className="card-arrow" />
            </View>

            {/* Bottom: Content */}
            <View className="card-bottom">
              <Text className="tool-tag">{tool.tag}</Text>
              <Text className="tool-name">{tool.name}</Text>
              <Text className="tool-desc">{tool.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Custom TabBar */}
      <CustomTabBar current={0} />

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
                      onClick={() => handleSelectSession(session.id, session.toolType)}
                    >
                      <View className="item-content">
                        <Text className="item-title">{getToolName(session.toolType)}</Text>
                        <Text className="item-text">{session.firstMessage || '新对话'}</Text>
                      </View>
                      <View className="item-arrow" />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Tool Chat Sheet */}
      {showChat && selectedTool && (
        <View className="chat-sheet">
          <View className="sheet-mask" onClick={handleCloseChat} />
          <View className="sheet-container">
            {/* Sheet Header */}
            <View className="sheet-header">
              <View className="header-left">
                <View className="header-icon">
                  <ToolIcon id={selectedTool.id} />
                </View>
                <Text className="header-title">{selectedTool.name}</Text>
              </View>
              <View className="header-close" onClick={handleCloseChat}>
                <Text className="close-icon">×</Text>
              </View>
            </View>

            {/* Messages */}
            <ScrollView
              scrollY
              className="sheet-messages"
              scrollIntoView={scrollIntoViewId}
              scrollWithAnimation
            >
              {messages.map((msg, index) => (
                <View key={msg.id} id={`tool-msg-${index}`} className="message-wrapper">
                  <View className={`message ${msg.role}`}>
                    {msg.role === 'assistant' && (
                      <Image src={aiCoachIcon} className="ai-avatar" mode="aspectFit" />
                    )}
                    <View className={`msg-bubble ${msg.role}`}>
                      <Text className="msg-content" userSelect>{msg.content}</Text>
                    </View>
                  </View>
                </View>
              ))}

              {/* Streaming */}
              {isStreaming && streamingText && (
                <View id="tool-msg-streaming" className="message-wrapper">
                  <View className="message assistant">
                    <Image src={aiCoachIcon} className="ai-avatar" mode="aspectFit" />
                    <View className="msg-bubble assistant">
                      <Text className="msg-content" userSelect>{streamingText}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Loading */}
              {isStreaming && !streamingText && (
                <View id="tool-msg-thinking" className="message-wrapper">
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
            </ScrollView>

            {/* Input */}
            <View className="sheet-input">
              <View className="input-wrapper">
                <Textarea
                  className="input"
                  value={inputValue}
                  onInput={(e) => setInputValue(e.detail.value)}
                  placeholder={`询问关于${selectedTool.name}的问题...`}
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
          </View>
        </View>
      )}
    </View>
  );
};

export default ToolsPage;

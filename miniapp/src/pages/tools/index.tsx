// 商业工具页 - 新设计
import { View, Text, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useState, useEffect } from 'react';
import websocket from '../../services/websocket';
import { checkDailyQuota, incrementUsage, getUsageInfo } from '../../utils/usage';
import { BUSINESS_TOOLS } from '../../constants';
import type { Message } from '../../types';
import CustomTabBar from '../../components/CustomTabBar';
import './index.scss';

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

// 星形 Logo 组件
const StarburstLogo = () => (
  <View className="starburst-logo">
    <View className="star-point p1" />
    <View className="star-point p2" />
    <View className="star-point p3" />
    <View className="star-point p4" />
  </View>
);

const ToolsPage = () => {
  const [showChat, setShowChat] = useState(false);
  const [selectedTool, setSelectedTool] = useState<typeof BUSINESS_TOOLS[0] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scrollIntoViewId, setScrollIntoViewId] = useState('');

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

  return (
    <View className="tools-page">
      {/* Header */}
      <View className="header">
        <Text className="title">商业工具</Text>
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
                      <View className="ai-avatar">
                        <StarburstLogo />
                      </View>
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
                    <View className="ai-avatar">
                      <StarburstLogo />
                    </View>
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
                    <View className="ai-avatar">
                      <StarburstLogo />
                    </View>
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

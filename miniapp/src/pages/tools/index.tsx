// 商业工具页
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useState, useEffect } from 'react';
import websocket from '../../services/websocket';
import { checkDailyQuota, incrementUsage, getUsageInfo } from '../../utils/usage';
import { BUSINESS_TOOLS } from '../../constants';
import type { Message } from '../../types';
import './index.scss';

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
      id: '1',
      role: 'assistant',
      content: `你好！我是你的${tool.name}助手。${tool.description}`,
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
      // 更新配额显示
      const usageInfo = await getUsageInfo();
      if (usageInfo) {
        // 触发全局配额更新事件
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
      <View className={`page-content ${showChat ? 'blurred' : ''}`}>
        <View className="header">
          <Text className="title">商业工具箱</Text>
        </View>

        <View className="tools-list">
          {BUSINESS_TOOLS.map(tool => (
            <View
              key={tool.id}
              className="tool-card"
              onClick={() => handleToolClick(tool)}
            >
              <View className="tool-info">
                <View className="tool-header">
                  <Text className="tool-name-styled">{tool.name}</Text>
                  <Text className="tool-tag">{tool.tag}</Text>
                </View>
                <Text className="tool-desc">{tool.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {showChat && (
        <View className="half-screen-chat">
          <View className="chat-mask" onClick={handleCloseChat} />
          <View className="chat-container">
            <View className="chat-header">
              <Text className="chat-title">{selectedTool?.name}</Text>
              <Text className="chat-close" onClick={handleCloseChat}>✕</Text>
            </View>

            <ScrollView scrollY className="chat-messages" scrollIntoView={scrollIntoViewId} scrollWithAnimation>
              {messages.map((msg, index) => (
                <View key={msg.id} id={`tool-msg-${index}`} className="message-wrapper">
                  <View className={`message ${msg.role}`}>
                    {msg.role === 'assistant' && <View className="msg-avatar" />}
                    <View className="msg-bubble">
                      <Text className="msg-content" userSelect>{msg.content}</Text>
                    </View>
                  </View>
                </View>
              ))}

              {isStreaming && streamingText && (
                <View id="tool-msg-streaming" className="message-wrapper">
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
                <View id="tool-msg-thinking" className="message-wrapper">
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

            <View className="chat-input-area">
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
        </View>
      )}
    </View>
  );
};

export default ToolsPage;

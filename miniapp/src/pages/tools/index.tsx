// 商业工具页
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React from 'react';
import api from '../../services/api';
import { storage } from '../../utils/storage';
import { BUSINESS_TOOLS, STORAGE_KEYS } from '../../constants';
import './index.scss';

const ToolsPage = () => {
  const handleToolClick = async (tool: typeof BUSINESS_TOOLS[0]) => {
    try {
      // 标记选中的工具
      storage.set('selected_tool', tool.id);
      storage.remove(STORAGE_KEYS.LAST_SESSION);

      // 跳转到对话页
      Taro.switchTab({
        url: '/pages/index/index'
      });
    } catch (error) {
      console.error('跳转失败:', error);
      Taro.showToast({
        title: '启动失败，请重试',
        icon: 'error'
      });
    }
  };

  return (
    <View className="tools-page">
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
            <View className="tool-icon">
              <Text className="icon-text">{tool.icon}</Text>
            </View>
            <View className="tool-info">
              <View className="tool-header">
                <Text className="tool-name">{tool.name}</Text>
                <Text className="tool-tag">{tool.tag}</Text>
              </View>
              <Text className="tool-desc">{tool.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ToolsPage;

// 自定义 TabBar 组件
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useState } from 'react';
import './index.scss';

// 图标路径
import toolsIcon from '../../assets/tab-tools-active.png';
import coachIcon from '../../assets/tab-coach-active.png';
import connectIcon from '../../assets/tab-connect-active.png';

interface TabItem {
  pagePath: string;
  text: string;
  icon: string;
}

const tabs: TabItem[] = [
  { pagePath: '/pages/tools/index', text: '工具', icon: toolsIcon },
  { pagePath: '/pages/index/index', text: '对话', icon: coachIcon },
  { pagePath: '/pages/connect/index', text: '联系', icon: connectIcon }
];

interface Props {
  current: number;
}

const CustomTabBar: React.FC<Props> = ({ current }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleTabClick = (index: number, pagePath: string) => {
    // 触发点击动画
    setActiveIndex(index);

    // 动画结束后跳转
    setTimeout(() => {
      setActiveIndex(null);
      if (index !== current) {
        Taro.switchTab({ url: pagePath });
      }
    }, 150);
  };

  return (
    <View className="custom-tabbar">
      {tabs.map((tab, index) => (
        <View
          key={tab.pagePath}
          className={`tab-item ${index === current ? 'active' : ''} ${activeIndex === index ? 'pressing' : ''}`}
          onClick={() => handleTabClick(index, tab.pagePath)}
        >
          <View className="icon-wrapper">
            <Image className="tab-icon" src={tab.icon} mode="aspectFit" />
          </View>
          {index === current && <Text className="tab-text">{tab.text}</Text>}
        </View>
      ))}
    </View>
  );
};

export default CustomTabBar;

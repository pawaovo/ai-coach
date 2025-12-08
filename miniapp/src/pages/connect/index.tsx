// 联系我们页 - 新设计
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useState } from 'react';
import CustomTabBar from '../../components/CustomTabBar';
import './index.scss';

const ConnectPage = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyWechat = () => {
    Taro.setClipboardData({
      data: 'your_wechat_id',
      success: () => {
        setCopiedId('wechat');
        setTimeout(() => setCopiedId(null), 2000);
      }
    });
  };

  const handleCopyPhone = () => {
    Taro.setClipboardData({
      data: '13800000000',
      success: () => {
        setCopiedId('phone');
        setTimeout(() => setCopiedId(null), 2000);
      }
    });
  };

  const handleCopyWebsite = () => {
    Taro.setClipboardData({
      data: 'https://www.xxx.com',
      success: () => {
        setCopiedId('website');
        setTimeout(() => setCopiedId(null), 2000);
      }
    });
  };

  return (
    <View className="connect-page">
      {/* Header */}
      <View className="header">
        <Text className="title">联系我们</Text>
      </View>

      <View className="content">
        {/* QR Code Card */}
        <View className="qr-card">
          <View className="qr-placeholder">
            <Image
              src={require('../../assets/QRcode.png')}
              className="qr-image"
              mode="aspectFit"
            />
          </View>
          <View className="qr-info">
            <Text className="qr-title">关注公众号</Text>
            <Text className="qr-desc">获取更多商业洞察</Text>
          </View>
        </View>

        {/* Contact List */}
        <View className="contact-list">
          {/* WeChat */}
          <View className="contact-item" onClick={handleCopyWechat}>
            <View className="item-header">
              <Text className="item-label">微信</Text>
              <View className={`item-icon ${copiedId === 'wechat' ? 'copied' : ''}`}>
                {copiedId === 'wechat' ? (
                  <View className="check-icon" />
                ) : (
                  <View className="copy-icon" />
                )}
              </View>
            </View>
            <Text className="item-value">your_wechat_id</Text>
          </View>

          {/* Phone */}
          <View className="contact-item" onClick={handleCopyPhone}>
            <View className="item-header">
              <Text className="item-label">电话</Text>
              <View className={`item-icon ${copiedId === 'phone' ? 'copied' : ''}`}>
                {copiedId === 'phone' ? (
                  <View className="check-icon" />
                ) : (
                  <View className="copy-icon" />
                )}
              </View>
            </View>
            <Text className="item-value">138-xxxx-xxxx</Text>
          </View>

          {/* Website */}
          <View className="contact-item" onClick={handleCopyWebsite}>
            <View className="item-header">
              <Text className="item-label">官方网站</Text>
              <View className={`item-icon ${copiedId === 'website' ? 'copied' : ''}`}>
                {copiedId === 'website' ? (
                  <View className="check-icon" />
                ) : (
                  <View className="copy-icon" />
                )}
              </View>
            </View>
            <Text className="item-value">www.xxx.com</Text>
          </View>
        </View>

        {/* Footer */}
        <View className="footer">
          <Text className="copyright">© 2025 AI Coach</Text>
        </View>
      </View>

      {/* Custom TabBar */}
      <CustomTabBar current={2} />
    </View>
  );
};

export default ConnectPage;

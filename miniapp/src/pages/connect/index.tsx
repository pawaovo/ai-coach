// src/pages/connect/index.tsx
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useState } from 'react';
import './index.scss';

const ConnectPage = () => {
  const [showQRCode, setShowQRCode] = useState(false);

  const handleCopyWechat = () => {
    Taro.setClipboardData({
      data: 'your_wechat_id',
      success: () => {
        Taro.showToast({ title: '微信号已复制', icon: 'success' });
      }
    });
  };

  const handleCall = () => {
    Taro.makePhoneCall({ phoneNumber: '13800000000' });
  };

  const handleVisitWebsite = () => {
    Taro.navigateToMiniProgram({
      appId: 'your_h5_appid', // 或使用 web-view
      path: 'pages/index/index'
    });
  };

  return (
    <View className="connect-page">
      <View className="header">
        <Text className="title">欢迎联系我们</Text>
      </View>

      <View className="section">
        <Text className="section-title">关注我们的公众号</Text>
        <Image
          src="/assets/qrcode.png"
          className="qrcode"
          mode="aspectFit"
          onClick={() => setShowQRCode(true)}
        />
        <Text className="hint">点击查看大图</Text>
      </View>

      {/* 联系方式 */}
      <View className="section">
        <Text className="section-title">获取无限次对话服务/业务合作</Text>
        <View className="contact-item" onClick={handleCopyWechat}>
          <Text className="label">微信：</Text>
          <Text className="value">your_wechat_id</Text>
          <Text className="action">复制</Text>
        </View>
        <View className="contact-item" onClick={handleCall}>
          <Text className="label">电话：</Text>
          <Text className="value">138-xxxx-xxxx</Text>
          <Text className="action">拨打</Text>
        </View>
      </View>

      {/* 官网 */}
      <View className="section">
        <Text className="section-title">访问官方网站</Text>
        <Button className="website-btn" onClick={handleVisitWebsite}>
          前往官网
        </Button>
      </View>

      {/* 二维码弹窗 */}
      {showQRCode && (
        <View className="modal" onClick={() => setShowQRCode(false)}>
          <Image src="/assets/qrcode.png" className="modal-qrcode" mode="aspectFit" />
        </View>
      )}
    </View>
  );
};

export default ConnectPage;

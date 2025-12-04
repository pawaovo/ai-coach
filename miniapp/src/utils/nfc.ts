// NFC 唤起处理
import Taro from '@tarojs/taro';

export const handleNFCLaunch = (): void => {
  const launchOptions = Taro.getLaunchOptionsSync();

  // 场景值 1047: 扫描小程序码
  if (launchOptions.scene === 1047) {
    const query = launchOptions.query || {};

    if (query.from === 'nfc') {
      console.log('通过 NFC 唤起');
      // 直接进入对话页（已经是默认页）
      Taro.showToast({
        title: '欢迎使用 AI 教练',
        icon: 'none',
        duration: 2000
      });
    }
  }
};

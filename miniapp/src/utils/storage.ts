// 本地存储封装
import Taro from '@tarojs/taro';

export const storage = {
  set: (key: string, value: any): void => {
    try {
      Taro.setStorageSync(key, value);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  get: <T = any>(key: string): T | null => {
    try {
      return Taro.getStorageSync(key);
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  remove: (key: string): void => {
    try {
      Taro.removeStorageSync(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  clear: (): void => {
    try {
      Taro.clearStorageSync();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
};

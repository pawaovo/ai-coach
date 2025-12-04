// 使用次数管理
import Taro from '@tarojs/taro';
import api from '../services/api';
import { DAILY_FREE_QUOTA } from '../constants';

export interface UsageInfo {
  remaining: number;
  total: number;
  daily_remaining: number;
  purchased_remaining: number;
}

export const checkDailyQuota = async (): Promise<boolean> => {
  try {
    const usageInfo = await api.checkUsage();

    if (usageInfo.remaining <= 0) {
      Taro.showModal({
        title: '使用次数已用尽',
        content: `您的使用次数已用完。\n\n请联系客服购买更多次数。`,
        confirmText: '联系客服',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            Taro.switchTab({ url: '/pages/connect/index' });
          }
        }
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('检查使用次数失败:', error);
    return true; // 失败时允许继续使用
  }
};

export const getUsageInfo = async (): Promise<UsageInfo | null> => {
  try {
    return await api.checkUsage();
  } catch (error) {
    console.error('获取使用次数失败:', error);
    return null;
  }
};

export const incrementUsage = async (): Promise<void> => {
  try {
    await api.incrementUsage();
  } catch (error) {
    console.error('增加使用次数失败:', error);
  }
};

// 使用次数管理
import Taro from '@tarojs/taro';
import api from '../services/api';
import { DAILY_FREE_QUOTA } from '../constants';

export const checkDailyQuota = async (): Promise<boolean> => {
  try {
    const { remaining } = await api.checkUsage();

    if (remaining <= 0) {
      Taro.showModal({
        title: '今日体验次数已用尽',
        content: `每日免费 ${DAILY_FREE_QUOTA} 次对话已用完。\n\n升级为无限次服务或联系我们了解更多。`,
        confirmText: '了解更多',
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

export const incrementUsage = async (): Promise<void> => {
  try {
    await api.incrementUsage();
  } catch (error) {
    console.error('增加使用次数失败:', error);
  }
};

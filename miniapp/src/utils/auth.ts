// 微信登录
import Taro from '@tarojs/taro';
import { storage } from './storage';
import { STORAGE_KEYS } from '../constants';

export const login = async (): Promise<string> => {
  try {
    const { code } = await Taro.login();

    // TODO: 调用后端接口，用 code 换取 token 和 openid
    const res = await Taro.request({
      url: '/api/auth/login',
      method: 'POST',
      data: { code }
    });

    const { token, userId } = res.data.data;
    storage.set(STORAGE_KEYS.TOKEN, token);
    storage.set(STORAGE_KEYS.USER_ID, userId);

    return token;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getToken = (): string | null => {
  return storage.get(STORAGE_KEYS.TOKEN);
};

export const getUserId = (): string | null => {
  return storage.get(STORAGE_KEYS.USER_ID);
};

export const logout = (): void => {
  storage.remove(STORAGE_KEYS.TOKEN);
  storage.remove(STORAGE_KEYS.USER_ID);
};

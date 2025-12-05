// 用户授权页面
import React, { useState } from 'react'
import { View, Button, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { API_CONFIG } from '../../constants'
import { getToken } from '../../utils/auth'
import './index.scss'

export default function Authorize() {
  const [loading, setLoading] = useState(false)
  const [nickname, setNickname] = useState('')

  const handleNicknameInput = (e) => {
    setNickname(e.detail.value)
  }

  const handleGetPhoneNumber = async (e) => {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      Taro.showToast({ title: '获取手机号失败', icon: 'none' })
      return
    }

    if (!nickname.trim()) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    setLoading(true)

    try {
      const res = await Taro.request({
        url: `${API_CONFIG.baseURL}/auth/update-profile`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        data: {
          nickname: nickname.trim(),
          phone_code: e.detail.code
        }
      })

      if (res.data.code === 0) {
        Taro.showToast({ title: '授权成功', icon: 'success' })
        setTimeout(() => {
          Taro.reLaunch({ url: '/pages/index/index' })
        }, 1500)
      } else {
        throw new Error(res.data.message || '授权失败')
      }
    } catch (error) {
      Taro.showToast({
        title: error.message || '授权失败，请重试',
        icon: 'none',
        duration: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="authorize-page">
      <View className="authorize-container">
        <View className="logo-section">
          <Text className="app-name">AI 高管教练</Text>
          <Text className="welcome-text">欢迎使用</Text>
        </View>

        <View className="form-section">
          <View className="form-item">
            <Text className="label">昵称 *</Text>
            <Input
              className="nickname-input"
              type="text"
              placeholder="请输入昵称"
              value={nickname}
              onInput={handleNicknameInput}
              maxlength={20}
            />
          </View>

          <View className="tips">
            <Text className="tips-text">* 为了更好地为您服务，需要获取您的手机号</Text>
          </View>

          <Button
            className="submit-button"
            openType="getPhoneNumber"
            onGetPhoneNumber={handleGetPhoneNumber}
            loading={loading}
            disabled={loading || !nickname.trim()}
          >
            {loading ? '授权中...' : '授权并开始使用'}
          </Button>
        </View>

        <View className="privacy-section">
          <Text className="privacy-text">
            点击授权即表示您同意我们的服务条款和隐私政策
          </Text>
        </View>
      </View>
    </View>
  )
}

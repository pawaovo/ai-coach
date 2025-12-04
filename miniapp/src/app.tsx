// 应用入口
import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { handleNFCLaunch } from './utils/nfc'
import { login } from './utils/auth'
import './app.scss'

function App({ children }) {
  useLaunch(() => {
    console.log('App launched.')

    // 处理 NFC 唤起
    handleNFCLaunch()

    // 自动登录
    login().catch(err => {
      console.error('自动登录失败:', err)
    })
  })

  return children
}

export default App

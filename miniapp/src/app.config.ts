// 小程序全局配置
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/tools/index',
    'pages/connect/index',
    'pages/authorize/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#EFEDE6',
    navigationBarTitleText: '',
    navigationBarTextStyle: 'black',
    navigationStyle: 'custom'
  },
  tabBar: {
    custom: true,
    color: '#8D8D8A',
    selectedColor: '#191919',
    backgroundColor: '#EFEDE6',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/tools/index',
        text: '工具'
      },
      {
        pagePath: 'pages/index/index',
        text: '对话'
      },
      {
        pagePath: 'pages/connect/index',
        text: '联系'
      }
    ]
  }
})

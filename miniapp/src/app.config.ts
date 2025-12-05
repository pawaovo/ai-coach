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
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#8A8580',
    selectedColor: '#C96442',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/tools/index',
        iconPath: 'assets/tab-tools.png',
        selectedIconPath: 'assets/tab-tools.png'
      },
      {
        pagePath: 'pages/index/index',
        iconPath: 'assets/tab-coach.png',
        selectedIconPath: 'assets/tab-coach.png'
      },
      {
        pagePath: 'pages/connect/index',
        iconPath: 'assets/tab-connect.png',
        selectedIconPath: 'assets/tab-connect.png'
      }
    ]
  }
})

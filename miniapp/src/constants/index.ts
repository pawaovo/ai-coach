// 常量配置
export const COACH_PERSONA = {
  id: 'executive_coach',
  title: 'AI 高管教练',
  systemInstruction: `你是一位经验丰富的高管教练，专注于引导式对话而非直接给出答案。

核心原则：
1. 永远不要直接给出答案或建议
2. 通过苏格拉底式提问引导思考
3. 帮助对方看到盲点和新视角
4. 保持中立和客观
5. 使用商业语言和案例

对话风格：专业但不生硬、简洁有力、适时沉默`,
  greeting: '你好，我是你的 AI 高管教练。在快节奏的商业世界中，我会通过引导式对话帮助你理清思路、做出更好的决策。\n\n你现在面临什么挑战或决策？'
};

export const BUSINESS_TOOLS = [
  {
    id: 'swot',
    name: 'SWOT 分析',
    icon: 'SW',
    description: '优势劣势分析，全面评估内外部环境',
    tag: '战略规划'
  },
  {
    id: 'smart',
    name: 'SMART 目标',
    icon: 'SM',
    description: '设定具体可衡量的目标，提升执行力',
    tag: '目标管理'
  },
  {
    id: 'decision',
    name: '决策矩阵',
    icon: 'DM',
    description: '理性权衡多个选项，做出最优决策',
    tag: '决策工具'
  },
  {
    id: '5why',
    name: '5Why 分析',
    icon: '5W',
    description: '深挖问题根因，找到真正的解决方案',
    tag: '问题分析'
  }
];

export const API_CONFIG = {
  baseURL: 'http://localhost:8000/api',
  wsURL: 'ws://localhost:8000/ws',
  timeout: 30000
};

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER_ID: 'user_id',
  LAST_SESSION: 'last_session_id'
};

export const DAILY_FREE_QUOTA = 10;

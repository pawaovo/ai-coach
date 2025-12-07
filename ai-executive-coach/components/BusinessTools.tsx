import React, { useState, useRef, useEffect } from 'react';
import { BusinessTool, Message } from '../types';
import { Target, TrendingUp, Grid2x2, HelpCircle, ArrowRight, ArrowUp, Disc, X, History } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';

// Extended interface for local tools with AI config
interface ToolConfig extends BusinessTool {
  icon: React.ReactNode;
  initialMessage: string;
  systemInstruction: string;
}

interface SavedToolSession {
  id: string;
  toolId: string;
  toolTitle: string;
  preview: string;
  messages: Message[];
  timestamp: number;
}

const StarburstLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0L13.5 8.5L20.5 5L16.5 12L24 12.5L17.5 17L21.5 24L14 19L12 26L10 19L2.5 24L6.5 17L0 12.5L7.5 12L3.5 5L10.5 8.5L12 0Z" fill="#C2603F"/>
  </svg>
);

const tools: ToolConfig[] = [
  {
    id: 'swot',
    title: 'SWOT 分析',
    tag: '战略规划',
    description: '全面评估优势、劣势、机会与威胁，明确战略方向。',
    iconName: 'swot', 
    color: 'text-[#191919]',
    icon: <TrendingUp />,
    initialMessage: "你好，我是SWOT战略分析助手。请简要描述您的企业或项目背景，我将帮您进行全面的优势(Strengths)、劣势(Weaknesses)、机会(Opportunities)与威胁(Threats)分析。",
    systemInstruction: "你是一个专业的SWOT分析专家。用户会提供企业或项目背景，你需要引导用户进行SWOT分析，或者根据用户提供的信息直接生成SWOT分析矩阵。请确保分析具有深度和商业洞察力，输出格式清晰。"
  },
  {
    id: 'smart',
    title: 'SMART 目标',
    tag: '目标管理',
    description: '设定具体的、可衡量的、可实现的、相关性强且有时限的目标。',
    iconName: 'smart',
    color: 'text-[#191919]',
    icon: <Target />,
    initialMessage: "你好，我是SMART目标管理助手。请告诉我您想要达成的目标（哪怕比较模糊），我会帮您将其转化为具体的、可衡量的、可实现的、相关性强的、有时限的SMART目标。",
    systemInstruction: "你是一个目标管理专家，精通SMART原则。用户的目标往往比较模糊，你的任务是通过提问或直接修改，将用户的目标转化为符合Specific, Measurable, Achievable, Relevant, Time-bound原则的高质量目标。"
  },
  {
    id: 'matrix',
    title: '决策矩阵',
    tag: '决策工具',
    description: '通过加权评分理性权衡多个选项，科学做出最优决策。',
    iconName: 'matrix',
    color: 'text-[#191919]',
    icon: <Grid2x2 />,
    initialMessage: "你好，我是决策辅助助手。当您面临多个选择难以抉择时，请告诉我您的选项有哪些，以及您最在意的几个评价维度（如成本、收益、风险等）。",
    systemInstruction: "你是一个理性决策专家。利用决策矩阵（Decision Matrix）方法帮助用户。引导用户列出选项和评估标准（权重），并帮助用户进行打分和计算，最终给出理性建议。"
  },
  {
    id: '5why',
    title: '5Why 分析',
    tag: '问题分析',
    description: '连续追问5个“为什么”，层层递进找到问题的根本原因。',
    iconName: '5why',
    color: 'text-[#191919]',
    icon: <HelpCircle />,
    initialMessage: "你好，我是深度问题分析助手。请描述您遇到的具体问题或现象，我们将开始第一层“为什么”的追问，直到找到根本原因。",
    systemInstruction: "你是一个问题解决专家，精通5Why分析法。针对用户提出的问题，不断追问“为什么”，层层剥离表象，直到找到问题的根本原因（Root Cause），并建议相应的对策。"
  }
];

const BusinessTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolConfig | null>(null);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // History State
  const [toolHistory, setToolHistory] = useState<SavedToolSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, activeTool]);

  // Handle opening a tool (New Session)
  const handleOpenTool = (tool: ToolConfig) => {
    setActiveTool(tool);
    setMessages([{
      id: 'init',
      role: 'model',
      text: tool.initialMessage,
      timestamp: Date.now()
    }]);
    setInputText('');
    setIsLoading(false);
  };

  // Handle saving session
  const saveCurrentSession = () => {
    if (!activeTool || messages.length <= 1) return; // Don't save if only init message or no tool

    // Find first user message for preview
    const firstUserMsg = messages.find(m => m.role === 'user');
    const previewText = firstUserMsg ? firstUserMsg.text : "新对话";

    const newSession: SavedToolSession = {
      id: Date.now().toString(),
      toolId: activeTool.id,
      toolTitle: activeTool.title,
      preview: previewText,
      messages: [...messages],
      timestamp: Date.now()
    };

    setToolHistory(prev => [newSession, ...prev]);
  };

  // Handle closing
  const handleClose = () => {
    saveCurrentSession();
    setActiveTool(null);
    setMessages([]);
  };

  // Load a session from history
  const loadSession = (session: SavedToolSession) => {
    const tool = tools.find(t => t.id === session.toolId);
    if (tool) {
      setActiveTool(tool);
      setMessages(session.messages);
      setShowHistory(false);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [inputText]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || !activeTool) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(
        messages, 
        userMsg.text, 
        activeTool.systemInstruction // Pass specific instruction
      );
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full px-5 pt-8 pb-4 relative">
      {/* Header */}
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <h1 className="text-3xl font-serif text-[#191919] leading-tight">
          商业工具
        </h1>
        <button 
          onClick={() => setShowHistory(true)}
          className="p-2 rounded-full hover:bg-[#E4E0D6] transition-colors text-[#5D5D5B] hover:text-[#191919]"
          title="历史对话"
        >
          <History size={22} strokeWidth={1.5} />
        </button>
      </div>

      {/* 2x2 Grid Layout */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        {tools.map((tool) => (
          <div 
            key={tool.id}
            onClick={() => handleOpenTool(tool)}
            className="group relative bg-[#E4E0D6] rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 active:scale-[0.98] hover:bg-[#DCD8CE] cursor-pointer h-full border border-transparent hover:border-[#DEDBD2] shadow-sm"
          >
            {/* Top Section: Icon & Arrow */}
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 rounded-xl bg-[#EFEDE6] flex items-center justify-center ${tool.color} shadow-sm border border-[#DEDBD2]/60 group-hover:scale-110 transition-transform duration-300`}>
                  {React.cloneElement(tool.icon as React.ReactElement, { size: 24, strokeWidth: 1.5 })}
              </div>
              <ArrowRight size={20} className="text-[#191919] opacity-30 group-hover:opacity-100 transition-all -rotate-45 group-hover:rotate-0" />
            </div>

            {/* Bottom Section: Content */}
            <div className="flex flex-col gap-2 mt-4">
               <span className="text-[11px] font-bold tracking-widest text-[#8D8D8A] uppercase">{tool.tag}</span>
               
               <h3 className="text-xl font-serif font-medium text-[#191919] leading-tight">
                 {tool.title}
               </h3>
               
               <p className="text-sm text-[#5D5D5B] leading-relaxed font-sans line-clamp-3 opacity-90">
                 {tool.description}
               </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer Spacer */}
      <div className="h-2 shrink-0"></div>

      {/* Tool Chat Overlay */}
      {activeTool && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity duration-300" 
            onClick={handleClose}
          />
          
          {/* Sheet Container */}
          <div className="bg-[#EFEDE6] w-full max-w-md h-[80vh] rounded-t-3xl shadow-2xl flex flex-col pointer-events-auto relative animate-in slide-in-from-bottom duration-300">
             
             {/* Header / Drag Handle */}
             <div className="w-full flex items-center justify-between px-6 pt-4 pb-2 shrink-0 border-b border-[#DEDBD2]/50">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-[#E4E0D6] flex items-center justify-center text-[#191919]">
                      {React.cloneElement(activeTool.icon as React.ReactElement, { size: 16 })}
                   </div>
                   <h3 className="font-serif text-lg text-[#191919]">{activeTool.title}</h3>
                </div>
                <button 
                  onClick={handleClose}
                  className="p-1.5 rounded-full hover:bg-[#E4E0D6] text-[#8D8D8A] hover:text-[#191919] transition-colors"
                >
                  <X size={20} />
                </button>
             </div>

             {/* Messages Area */}
             <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
                <div className="space-y-6 max-w-full mx-auto">
                   {messages.map((msg) => {
                     const isUser = msg.role === 'user';
                     return (
                       <div 
                         key={msg.id} 
                         className={`flex gap-4 ${isUser ? 'flex-col items-end' : 'flex-col items-start'}`}
                       >
                         <div className={`flex items-start gap-3 max-w-[95%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                             {/* Avatar - Only for AI */}
                             {!isUser && (
                                <div className="w-6 h-6 rounded-sm shrink-0 flex items-center justify-center mt-1.5 text-[#C2603F]">
                                    <StarburstLogo />
                                </div>
                             )}

                             {/* Bubble */}
                             <div className={`
                               text-[15px] leading-7 font-sans
                               ${isUser 
                                 ? 'bg-[#E4E0D6] text-[#191919] px-4 py-2.5 rounded-2xl rounded-tr-sm' 
                                 : 'text-[#191919] px-1 py-1'}
                             `}>
                               <div className="whitespace-pre-wrap">{msg.text}</div>
                             </div>
                         </div>
                       </div>
                     );
                   })}
                   
                   {isLoading && (
                     <div className="flex items-center gap-3 pl-1">
                        <div className="w-6 h-6 rounded-sm text-[#C2603F] shrink-0 flex items-center justify-center">
                            <StarburstLogo />
                        </div>
                        <div className="flex items-center gap-1.5 h-10">
                          <div className="w-1.5 h-1.5 bg-[#8D8D8A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-[#8D8D8A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-[#8D8D8A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                     </div>
                   )}
                   <div ref={messagesEndRef} className="h-1" />
                </div>
             </div>

             {/* Input Area */}
             <div className="shrink-0 px-4 pb-6 pt-2 bg-[#EFEDE6] border-t border-[#DEDBD2]/50">
               <div className="bg-[#FFFFFF] rounded-xl flex items-end p-2 pr-2 shadow-sm border border-[#DEDBD2] transition-all">
                 <textarea
                   ref={textareaRef}
                   rows={1}
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder={`询问关于${activeTool.title}的问题...`}
                   className="flex-1 bg-transparent border-none outline-none text-[#191919] placeholder-[#8D8D8A] text-[15px] px-3 py-2.5 font-sans resize-none max-h-[120px] overflow-y-auto leading-normal"
                   style={{ minHeight: '44px' }}
                 />
                 <button
                   onClick={handleSend}
                   disabled={!inputText.trim() || isLoading}
                   className={`
                     w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 mb-[3px]
                     ${inputText.trim() && !isLoading
                       ? 'bg-[#191919] text-[#EFEDE6]' 
                       : 'bg-[#E4E0D6] text-[#8D8D8A]'}
                   `}
                 >
                   {isLoading ? <Disc size={18} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={2.5} />}
                 </button>
               </div>
             </div>

          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-6">
          <div className="bg-[#EFEDE6] w-full max-w-sm rounded-xl shadow-2xl border border-[#DEDBD2] flex flex-col max-h-[60%] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[#DEDBD2] shrink-0">
              <h3 className="font-serif text-lg text-[#191919]">历史对话</h3>
              <button 
                onClick={() => setShowHistory(false)} 
                className="p-1 rounded-full hover:bg-[#DCD8CE] text-[#5D5D5B] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-2 flex-1 no-scrollbar">
              {toolHistory.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-[#8D8D8A] text-sm">
                  暂无历史记录
                </div>
              ) : (
                <div className="space-y-1">
                  {toolHistory.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className="w-full text-left p-3 rounded-lg hover:bg-[#E4E0D6] active:bg-[#DCD8CE] transition-colors group flex items-center justify-between"
                    >
                      <div className="flex flex-col overflow-hidden pr-2">
                        <span className="text-sm font-bold text-[#191919] font-serif mb-0.5">
                          {session.toolTitle}
                        </span>
                        <span className="text-xs text-[#5D5D5B] font-sans truncate">
                          {session.preview}
                        </span>
                      </div>
                      <ArrowRight size={14} className="text-[#8D8D8A] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessTools;
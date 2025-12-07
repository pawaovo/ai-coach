import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, User, Disc, History, Plus, X, ArrowRight } from 'lucide-react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

const PRESETS = [
  { 
    label: "市场分析", 
    text: "请帮我运用波特五力模型，深度分析目前我所在行业的市场竞争格局及潜在机会。" 
  },
  { 
    label: "团队管理", 
    text: "我的团队目前执行力不足，请提供一套基于OKR管理法的具体改进方案，帮助提升团队产出。" 
  },
  { 
    label: "战略规划", 
    text: "请协助我制定一份企业年度战略规划，包含关键里程碑、资源分配及风险应对策略。" 
  },
  { 
    label: "产品创新", 
    text: "利用第一性原理，帮我构思3个具有颠覆性的产品创新方向，并分析其可行性。" 
  },
  { 
    label: "危机应对", 
    text: "模拟一次品牌公关危机，请列出标准的SOP处理流程及关键的话术回应模版。" 
  }
];

interface SavedSession {
  id: string;
  preview: string;
  messages: Message[];
  timestamp: number;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<SavedSession[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to correctly calculate scrollHeight for shrinking
      textarea.style.height = 'auto';
      // Set new height based on scrollHeight, capped at 150px
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [inputText]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    
    // Reset textarea height immediately
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(messages, userMsg.text);
      
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

  const saveCurrentSession = () => {
    if (messages.length === 0) return;

    // Find first user message for preview
    const firstUserMsg = messages.find(m => m.role === 'user');
    const previewText = firstUserMsg ? firstUserMsg.text : "新对话";

    const newSession: SavedSession = {
      id: Date.now().toString(),
      preview: previewText,
      messages: [...messages],
      timestamp: Date.now()
    };

    setChatHistory(prev => [newSession, ...prev]);
  };

  const handleNewChat = () => {
    if (isLoading) return;
    saveCurrentSession();
    setMessages([]);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const loadSession = (session: SavedSession) => {
    // If current session has unsaved messages, save them first
    if (messages.length > 0) {
      saveCurrentSession();
    }
    setMessages(session.messages);
    setShowHistory(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#EFEDE6] relative">
      {/* Header - Flex row for Title and Actions */}
      <div className="px-5 pt-8 shrink-0 flex items-center justify-between mb-2">
         <h1 className="text-3xl font-serif text-[#191919] leading-tight">
           AI Coach
         </h1>
         <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(true)}
              className="p-2 rounded-full hover:bg-[#E4E0D6] transition-colors text-[#5D5D5B] hover:text-[#191919]"
              title="历史对话"
            >
              <History size={22} strokeWidth={1.5} />
            </button>
            <button 
              onClick={handleNewChat}
              className="p-2 rounded-full hover:bg-[#E4E0D6] transition-colors text-[#5D5D5B] hover:text-[#191919]"
              title="新开对话"
            >
              <Plus size={24} strokeWidth={1.5} />
            </button>
         </div>
      </div>

      {/* Messages Area - Flex 1 to take remaining space */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">
        {messages.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center -mt-10">
              <div className="grid grid-cols-1 w-full max-w-xs gap-3">
                 {PRESETS.map((preset, index) => (
                   <button 
                     key={index}
                     onClick={() => setInputText(preset.text)} 
                     className="group bg-[#E4E0D6] hover:bg-[#DCD8CE] p-4 rounded-xl text-left transition-colors flex items-center justify-between"
                   >
                     <span className="text-sm font-medium text-[#191919]">{preset.label}</span>
                     <ArrowUp size={16} className="text-[#5D5D5B] opacity-0 group-hover:opacity-100 transition-opacity rotate-45" />
                   </button>
                 ))}
              </div>
           </div>
        ) : (
           <div className="space-y-8 max-w-full mx-auto pt-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div 
                    key={msg.id} 
                    className={`flex gap-4 ${isUser ? 'flex-col items-end' : 'flex-col items-start'}`}
                  >
                    <div className={`flex items-start gap-3 max-w-[90%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar - Only for AI */}
                        {!isUser && (
                           <div className="w-6 h-6 rounded-sm shrink-0 flex items-center justify-center mt-1.5 bg-[#E4E0D6] text-[#191919]">
                               <span className="font-serif font-bold text-xs">AI</span>
                           </div>
                        )}

                        {/* Bubble */}
                        <div className={`
                          text-[16px] leading-7 font-sans
                          ${isUser 
                            ? 'bg-[#E4E0D6] text-[#191919] px-5 py-3 rounded-2xl rounded-tr-sm' 
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
                   <div className="w-6 h-6 rounded-sm bg-[#E4E0D6] text-[#191919] shrink-0 flex items-center justify-center">
                       <span className="font-serif font-bold text-xs">AI</span>
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
        )}
      </div>

      {/* Input Area - Shrink-0, static in flex layout to push messages up */}
      <div className="shrink-0 px-4 pb-6 pt-2 z-20 bg-[#EFEDE6]">
        <div className="bg-[#FFFFFF] rounded-xl flex items-end p-2 pr-2 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-[#DEDBD2] transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="说点什么..."
            className="flex-1 bg-transparent border-none outline-none text-[#191919] placeholder-[#8D8D8A] text-[16px] px-4 py-3 font-sans resize-none max-h-[150px] overflow-y-auto leading-normal"
            style={{ minHeight: '48px' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`
              w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 mb-[5px]
              ${inputText.trim() && !isLoading
                ? 'bg-[#191919] text-[#EFEDE6]' 
                : 'bg-[#E4E0D6] text-[#8D8D8A]'}
            `}
          >
            {isLoading ? <Disc size={18} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

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
              {chatHistory.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-[#8D8D8A] text-sm">
                  暂无历史记录
                </div>
              ) : (
                <div className="space-y-1">
                  {chatHistory.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className="w-full text-left p-3 rounded-lg hover:bg-[#E4E0D6] active:bg-[#DCD8CE] transition-colors group flex items-center justify-between"
                    >
                      <span className="text-sm text-[#191919] font-sans truncate pr-4">
                        {session.preview}
                      </span>
                      <ArrowRight size={14} className="text-[#8D8D8A] opacity-0 group-hover:opacity-100 transition-opacity" />
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

export default AIChat;
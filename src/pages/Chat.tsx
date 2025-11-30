
import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Keyboard, AlertCircle, Sparkles, X, ChevronRight, Check, ArrowRight, AudioLines } from 'lucide-react';
import { createChatSession, sendAudioMessage } from '../services/geminiService';
import { ChatMessage, MoodType, PersonaConfig } from '../types';
import { Chat, GenerateContentResponse } from '@google/genai';

interface ChatProps {
  setGlobalMood: (mood: MoodType) => void;
  initialMessage?: string | null;
  clearInitialMessage?: () => void;
  currentPersona: PersonaConfig;
}

type ChatMode = 'text' | 'voice';

// MBTI Questions Data
const MBTI_QUESTIONS = [
    {
        dimension: 'EI',
        question: "在社交聚会中，你通常觉得？",
        options: [
            { label: "充满电量，喜欢认识新朋友", value: 'E' },
            { label: "消耗电量，只想和熟人待着", value: 'I' }
        ]
    },
    {
        dimension: 'SN',
        question: "当你接收新信息时，你更关注？",
        options: [
            { label: "具体的细节和当下的事实", value: 'S' },
            { label: "整体的含义和未来的可能", value: 'N' }
        ]
    },
    {
        dimension: 'TF',
        question: "做决定时，你通常更看重？",
        options: [
            { label: "逻辑分析和客观标准", value: 'T' },
            { label: "个人价值观和他人感受", value: 'F' }
        ]
    },
    {
        dimension: 'JP',
        question: "处理日常任务时，你倾向于？",
        options: [
            { label: "制定计划，按部就班", value: 'J' },
            { label: "随性而为，灵活应对", value: 'P' }
        ]
    }
];

// CBT Steps Data
const CBT_STEPS = [
    {
        title: "记录事件 (A)",
        question: "发生了什么让你感到不舒服的事？",
        placeholder: "例如：我给朋友发消息，他一天都没回。",
        field: "event"
    },
    {
        title: "捕捉想法 (B)",
        question: "当时你脑海中第一时间浮现的念头是什么？",
        placeholder: "例如：他肯定是在生我的气，或者觉得我很烦。",
        field: "thought"
    },
    {
        title: "反驳质疑 (C)",
        question: "这个想法完全真实吗？有没有其他可能性或证据？",
        placeholder: "例如：也许他只是太忙了没看手机，上次我也很久没回他。",
        field: "evidence"
    },
    {
        title: "重构思维 (D)",
        question: "试着换一个更客观、更积极的角度来看待这件事。",
        placeholder: "例如：他可能在忙工作，等他有空了自然会回我，这并不代表他讨厌我。",
        field: "reframe"
    }
];

export const ChatPage: React.FC<ChatProps> = ({ 
  setGlobalMood, 
  initialMessage, 
  clearInitialMessage, 
  currentPersona 
}) => {
  const [mode, setMode] = useState<ChatMode>('text');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // MBTI State
  const [isMBTIModalOpen, setIsMBTIModalOpen] = useState(false);
  const [mbtiStep, setMbtiStep] = useState(0);
  const [mbtiAnswers, setMbtiAnswers] = useState<string[]>([]);

  // Breathing Exercise State
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingText, setBreathingText] = useState('吸气');

  // CBT Modal State
  const [isCBTModalOpen, setIsCBTModalOpen] = useState(false);
  const [cbtStep, setCbtStep] = useState(0);
  const [cbtData, setCbtData] = useState({ event: '', thought: '', evidence: '', reframe: '' });

  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentInitialRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Initialize Chat with Persona-specific instruction
  useEffect(() => {
    // Re-create session if persona changes
    chatSessionRef.current = createChatSession(currentPersona.systemInstruction);
    
    // Set initial greeting based on persona
    let greeting = "";
    if (currentPersona.id === 'healing') {
        greeting = "你好呀，我是 Melty (小融)。我会一直在这里听你说。你现在感觉怎么样？";
    } else if (currentPersona.id === 'rational') {
        greeting = "你好，我是 Logic。让我们冷静下来，理智地分析一下你遇到的问题吧。";
    } else {
        greeting = "嘿！我是 Spark。谁又惹你不开心了？来，说出来让我开心...啊不，让我帮你怼回去！";
    }

    setMessages([{
      id: 'welcome',
      role: 'model',
      text: greeting,
      timestamp: new Date()
    }]);

    hasSentInitialRef.current = false; // Reset for potential initial message
  }, [currentPersona]);

  // Handle incoming message from other pages (e.g. Journal)
  useEffect(() => {
    if (initialMessage && !hasSentInitialRef.current && chatSessionRef.current) {
        hasSentInitialRef.current = true;
        setMode('text'); // Ensure we are in text mode to see the synced message
        setTimeout(() => {
            handleSendMessage(initialMessage);
            if (clearInitialMessage) clearInitialMessage();
        }, 500);
    }
  }, [initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mode]);

  // Breathing Exercise Logic
  useEffect(() => {
      let interval: any;
      
      if (isBreathingModalOpen) {
          // Reset to initial state
          setBreathingPhase('inhale');
          setBreathingText('吸气 (4s)');
          
          const cycle = () => {
              // Start Inhale
              setBreathingPhase('inhale');
              setBreathingText('吸气');
              
              setTimeout(() => {
                  if (!isBreathingModalOpen) return;
                  setBreathingPhase('hold');
                  setBreathingText('保持');
              }, 4000);

              setTimeout(() => {
                  if (!isBreathingModalOpen) return;
                  setBreathingPhase('exhale');
                  setBreathingText('呼气');
              }, 8000);
          };

          cycle(); // Initial run
          interval = setInterval(cycle, 12000);
      }

      return () => {
          if (interval) clearInterval(interval);
      };
  }, [isBreathingModalOpen]);

  const analyzeMood = (text: string) => {
      if (text.includes('焦虑') || text.includes('担心') || text.includes('害怕')) {
          setGlobalMood(MoodType.ANXIOUS);
      } else if (text.includes('开心') || text.includes('高兴') || text.includes('棒')) {
          setGlobalMood(MoodType.HAPPY);
      }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue;
    if (!textToSend.trim() || isLoading || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
        const response: GenerateContentResponse = await chatSessionRef.current.sendMessage({ message: userMsg.text });
        const text = response.text || "我在听...";
        analyzeMood(text);

        const modelMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
        console.error(error);
        const errorMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: "我现在连接有点不稳定，但我一直都在。",
            timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleToolClick = (toolName: string) => {
      // MBTI Quick Test
      if (toolName.includes("MBTI")) {
          setMbtiStep(0);
          setMbtiAnswers([]);
          setIsMBTIModalOpen(true);
          return;
      }

      // Mindfulness Breathing
      if (toolName.includes("正念呼吸")) {
          setIsBreathingModalOpen(true);
          return;
      }

      // CBT Therapy
      if (toolName.includes("CBT")) {
          setCbtStep(0);
          setCbtData({ event: '', thought: '', evidence: '', reframe: '' });
          setIsCBTModalOpen(true);
          return;
      }

      // Default logic for other tools
      const prompt = `(用户点击了快捷工具) 请带领我进行"${toolName}"。请直接开始引导或互动。`;
      
      const displayMsg = toolName; 
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: displayMsg,
        timestamp: new Date(),
        isTools: true
      };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);

      if (chatSessionRef.current) {
          chatSessionRef.current.sendMessage({ message: prompt }).then((response) => {
               const text = response.text || "好的，我们开始吧。";
               const modelMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'model',
                    text: text,
                    timestamp: new Date()
               };
               setMessages(prev => [...prev, modelMsg]);
               setIsLoading(false);
          }).catch(err => {
              console.error(err);
              setIsLoading(false);
          });
      }
  };

  const handleMBTISelection = (value: string) => {
      const newAnswers = [...mbtiAnswers, value];
      setMbtiAnswers(newAnswers);

      if (mbtiStep < MBTI_QUESTIONS.length - 1) {
          setMbtiStep(mbtiStep + 1);
      } else {
          // Finished
          const result = newAnswers.join('');
          setIsMBTIModalOpen(false);
          handleSendMessage(`我的 MBTI 简易测试结果是：${result}。请根据这个结果，结合我的性格特点，给我一些有趣的分析或建议。`);
      }
  };

  const handleCBTNext = () => {
      if (cbtStep < CBT_STEPS.length - 1) {
          setCbtStep(cbtStep + 1);
      } else {
          // Finished
          setIsCBTModalOpen(false);
          const summary = `我刚刚完成了 CBT 练习：
          【触发事件】：${cbtData.event}
          【自动思维】：${cbtData.thought}
          【反驳质疑】：${cbtData.evidence}
          【重构思维】：${cbtData.reframe}
          
          请Logic老师对我的思维重构进行点评和鼓励。`;
          handleSendMessage(summary);
      }
  };

  const startVoiceRecording = async () => {
    setPermissionError(null);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            stream.getTracks().forEach(track => track.stop());
            
            // Send to API
            setIsLoading(true);
            try {
                if (chatSessionRef.current) {
                    const responseText = await sendAudioMessage(chatSessionRef.current, blob);
                    analyzeMood(responseText);
                    
                    const modelMsg: ChatMessage = {
                        id: Date.now().toString(),
                        role: 'model',
                        text: responseText,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, modelMsg]);
                }
            } catch (error) {
                console.error("Audio send error", error);
            } finally {
                setIsLoading(false);
            }
        };

        mediaRecorder.start();
        setIsRecording(true);
    } catch (err: any) {
        console.error("Error accessing microphone:", err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setPermissionError("请允许麦克风权限以使用语音模式");
        } else {
            setPermissionError("无法访问麦克风");
        }
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  };

  const toggleRecording = () => {
      if (isRecording) stopVoiceRecording();
      else startVoiceRecording();
  };

  return (
    <div className="h-full flex flex-col pt-10 pb-24 px-4 max-w-2xl mx-auto relative">
      
      {/* Top Section: IP Image ONLY (Buttons Removed) */}
      <div className="flex flex-col items-center mb-4 z-10 shrink-0">
          <div className="relative w-24 h-24">
              <div className="absolute inset-0 bg-yellow-200/50 rounded-full blur-xl animate-pulse"></div>
              <img 
                  src={currentPersona.image} 
                  alt={currentPersona.title} 
                  className="w-full h-full object-cover rounded-full border-4 border-white/50 relative z-10 drop-shadow-xl" 
              />
               {/* Small Persona Label Badge */}
              <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 z-20 whitespace-nowrap">
                  <span className="text-[10px] font-bold text-gray-600 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/60 shadow-sm">
                      {currentPersona.title}
                  </span>
              </div>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
          
          {/* Permission Error Toast */}
          {permissionError && (
              <div className="absolute top-0 left-0 right-0 z-50 flex justify-center">
                  <div className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-sm border border-red-100">
                      <AlertCircle size={12} /> {permissionError}
                  </div>
              </div>
          )}

          {mode === 'text' ? (
              // Text Mode: Chat History + Input
              <>
                <div className="flex-1 overflow-y-auto space-y-4 mb-2 pr-2 scrollbar-hide pt-2">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[85%] p-4 rounded-2xl backdrop-blur-md text-sm font-light leading-relaxed tracking-wide shadow-sm
                                ${msg.role === 'user' 
                                    ? 'bg-white/30 text-gray-800 rounded-br-none border border-white/40' 
                                    : 'bg-white/60 text-gray-900 rounded-bl-none border border-white/60'}
                                ${msg.isTools ? 'bg-indigo-50/50 border-indigo-100/50 text-indigo-800' : ''}
                            `}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white/40 p-3 rounded-2xl rounded-bl-none">
                                <div className="flex space-x-1">
                                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                {/* Tools Bar */}
                <div 
                    className="mb-2 px-1 overflow-x-auto flex gap-2 shrink-0 [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {currentPersona.tools.map(tool => (
                        <button
                            key={tool}
                            onClick={() => handleToolClick(tool)}
                            disabled={isLoading}
                            className="shrink-0 px-3 py-1.5 bg-white/40 hover:bg-white/60 active:scale-95 transition-all rounded-full text-xs font-medium text-gray-700 border border-white/50 shadow-sm whitespace-nowrap"
                        >
                            {tool}
                        </button>
                    ))}
                </div>

                <div className="relative mt-auto shrink-0 mb-6">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && inputValue.trim() && handleSendMessage()}
                        placeholder="想聊点什么..."
                        className="w-full glass-panel rounded-full py-3.5 pl-5 pr-12 text-sm text-gray-700 placeholder-gray-500/70 focus:outline-none focus:bg-white/40 transition-all font-light shadow-sm"
                    />
                    <button 
                        onClick={() => {
                            if (inputValue.trim()) {
                                handleSendMessage();
                            } else {
                                setMode('voice');
                            }
                        }}
                        className="absolute right-1.5 top-1.5 bottom-1.5 w-10 flex items-center justify-center bg-white/50 hover:bg-white/80 rounded-full transition-all text-gray-700"
                    >
                        {inputValue.trim() ? (
                            <Send size={18} strokeWidth={1.5} className="ml-0.5" />
                        ) : (
                            <AudioLines size={20} strokeWidth={1.5} />
                        )}
                    </button>
                </div>
              </>
          ) : (
              // Voice Mode: Cotton Candy Sphere
              <div className="flex-1 flex flex-col items-center justify-center relative pb-10">
                  {/* Latest Bot Response Overlay */}
                  {messages.length > 0 && messages[messages.length - 1].role === 'model' && (
                      <div className="absolute top-0 left-4 right-4 text-center z-20">
                          <div className="inline-block bg-white/40 backdrop-blur-md p-4 rounded-2xl text-sm font-light text-gray-800 shadow-sm border border-white/30 animate-fade-in-up">
                              {messages[messages.length - 1].text}
                          </div>
                      </div>
                  )}

                  {/* The Sphere */}
                  <button 
                      onClick={toggleRecording}
                      disabled={isLoading}
                      className={`
                          relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500
                          bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200
                          shadow-[0_0_40px_rgba(230,230,250,0.6)]
                          ${isRecording ? 'scale-110 shadow-[0_0_60px_rgba(230,230,250,0.9)]' : 'hover:scale-105'}
                      `}
                  >
                      {/* Breathing Effect Layers */}
                      <div className={`absolute inset-0 rounded-full bg-white opacity-30 blur-xl ${isRecording ? 'animate-ping-slow' : 'animate-pulse'}`}></div>
                      <div className="absolute inset-2 rounded-full bg-gradient-to-tl from-white/40 to-transparent"></div>
                      
                      {/* Icon / Status */}
                      <div className="relative z-10 text-gray-600/50">
                          {isLoading ? (
                              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                              <Mic size={48} strokeWidth={1} className={`${isRecording ? 'text-gray-800' : 'text-white'}`} />
                          )}
                      </div>
                  </button>
                  
                  <p className="mt-8 text-sm font-light text-gray-500 tracking-widest uppercase">
                      {isRecording ? 'Listening...' : 'Tap to Speak'}
                  </p>

                  {/* Close Voice Mode Button */}
                  <button 
                    onClick={() => setMode('text')}
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2 p-4 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full text-gray-600 transition-all border border-white/40 shadow-sm active:scale-95"
                  >
                    <X size={24} strokeWidth={1.5} />
                  </button>
              </div>
          )}
      </div>

      {/* MBTI Quick Test Modal */}
      {isMBTIModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-white/20 backdrop-blur-lg animate-fade-in">
              <div className="w-full bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl border border-white/50 relative">
                  <button 
                      onClick={() => setIsMBTIModalOpen(false)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full"
                  >
                      <X size={20} />
                  </button>

                  <div className="text-center mb-6">
                      <h3 className="text-lg font-black text-gray-800">MBTI 速测</h3>
                      <div className="flex justify-center gap-1 mt-2">
                          {MBTI_QUESTIONS.map((_, i) => (
                              <div 
                                  key={i} 
                                  className={`h-1.5 w-6 rounded-full transition-colors ${i <= mbtiStep ? 'bg-indigo-500' : 'bg-gray-200'}`} 
                              />
                          ))}
                      </div>
                  </div>

                  <div className="mb-8">
                      <h4 className="text-xl font-medium text-gray-900 mb-6 text-center leading-relaxed">
                          {MBTI_QUESTIONS[mbtiStep].question}
                      </h4>
                      <div className="space-y-3">
                          {MBTI_QUESTIONS[mbtiStep].options.map((option) => (
                              <button
                                  key={option.value}
                                  onClick={() => handleMBTISelection(option.value)}
                                  className="w-full p-4 rounded-xl border border-gray-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 transition-all text-left flex items-center justify-between group"
                              >
                                  <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">
                                      {option.label}
                                  </span>
                                  <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-400" />
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* CBT Therapy Modal */}
      {isCBTModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-white/20 backdrop-blur-lg animate-fade-in">
            <div className="w-full bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl border border-white/50 relative flex flex-col max-h-[80vh]">
                <button 
                    onClick={() => setIsCBTModalOpen(false)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full"
                >
                    <X size={20} />
                </button>

                <div className="mb-6 text-center">
                    <h3 className="text-lg font-bold text-gray-800">CBT 认知重构</h3>
                    <div className="flex justify-center gap-1 mt-2">
                        {CBT_STEPS.map((_, i) => (
                            <div 
                                key={i} 
                                className={`h-1.5 w-8 rounded-full transition-colors ${i <= cbtStep ? 'bg-blue-500' : 'bg-gray-200'}`} 
                            />
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide mb-4">
                    <div className="bg-blue-50/50 p-3 rounded-xl mb-4 text-xs font-medium text-blue-800 tracking-wide text-center">
                        STEP {cbtStep + 1}: {CBT_STEPS[cbtStep].title}
                    </div>

                    <h4 className="text-lg font-medium text-gray-900 mb-4 text-center leading-relaxed">
                        {CBT_STEPS[cbtStep].question}
                    </h4>

                    <textarea
                        value={(cbtData as any)[CBT_STEPS[cbtStep].field]}
                        onChange={(e) => setCbtData({ ...cbtData, [CBT_STEPS[cbtStep].field]: e.target.value })}
                        placeholder={CBT_STEPS[cbtStep].placeholder}
                        className="w-full h-32 bg-gray-50 rounded-xl p-4 text-sm font-light focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 resize-none transition-all placeholder-gray-400"
                    />
                </div>

                <button 
                    onClick={handleCBTNext}
                    disabled={!(cbtData as any)[CBT_STEPS[cbtStep].field]}
                    className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all flex justify-center items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {cbtStep < CBT_STEPS.length - 1 ? '下一步' : '完成并分析'} <ArrowRight size={16} />
                </button>
            </div>
        </div>
      )}

      {/* Breathing Exercise Modal */}
      {isBreathingModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-blue-50/30 backdrop-blur-xl animate-fade-in">
              <div className="w-full max-w-sm flex flex-col items-center justify-center relative">
                   <button 
                      onClick={() => setIsBreathingModalOpen(false)}
                      className="absolute top-[-60px] right-0 p-2 text-gray-500 hover:bg-white/40 rounded-full backdrop-blur-md border border-white/30"
                  >
                      <X size={24} />
                  </button>

                  <h3 className="text-2xl font-thin text-gray-800 mb-12 tracking-widest uppercase">正念呼吸</h3>
                  
                  {/* Visual Breathing Circle */}
                  <div className="relative w-64 h-64 flex items-center justify-center">
                      {/* Outer Glow */}
                      <div className={`
                          absolute inset-0 rounded-full bg-blue-200/30 blur-2xl transition-all duration-[4000ms] ease-in-out
                          ${breathingPhase === 'inhale' ? 'scale-125 opacity-100' : breathingPhase === 'hold' ? 'scale-125 opacity-80' : 'scale-75 opacity-40'}
                      `}></div>
                      
                      {/* Main Circle */}
                      <div className={`
                          w-48 h-48 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 shadow-xl border-4 border-white/60 flex items-center justify-center
                          transition-all duration-[4000ms] ease-in-out relative z-10
                          ${breathingPhase === 'inhale' ? 'scale-110' : breathingPhase === 'hold' ? 'scale-110' : 'scale-75'}
                      `}>
                          <span className={`text-2xl font-light text-blue-800 transition-opacity duration-500`}>
                              {breathingText}
                          </span>
                      </div>
                  </div>

                  <p className="mt-12 text-sm text-gray-500 font-light text-center max-w-xs leading-relaxed">
                      跟随圆圈的节奏。<br/>
                      专注于你的呼吸，感受空气的流动。
                  </p>
              </div>
          </div>
      )}

      <style>{`
        @keyframes ping-slow {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-slow {
            animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

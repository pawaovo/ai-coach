
import React, { useState, useRef, useEffect } from 'react';
import { MoodType, JournalEntry, PersonaConfig } from '../types';
import { JournalModal } from '../components/JournalModal';
import { PERSONAS } from '../constants';

interface HomeProps {
    setPage: (page: string) => void;
    currentMood: MoodType;
    setGlobalMood: (mood: MoodType) => void;
    onSaveEntry: (entry: JournalEntry) => void;
    setPendingChatMessage: (msg: string) => void;
    currentPersona: PersonaConfig;
    setPersona: (persona: PersonaConfig) => void;
}

export const HomePage: React.FC<HomeProps> = ({ 
    setPage, 
    currentMood, 
    setGlobalMood,
    onSaveEntry,
    setPendingChatMessage,
    currentPersona,
    setPersona
}) => {
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  // Default to index 1 (Middle card) as per user request
  const [activeIndex, setActiveIndex] = useState(1); 
  const touchStartX = useRef<number | null>(null);

  // Sync internal index with global persona on mount or change
  useEffect(() => {
      const idx = PERSONAS.findIndex(p => p.id === currentPersona.id);
      if (idx !== -1) setActiveIndex(idx);
  }, [currentPersona]);

  const handleStartChat = (message: string) => {
    setPendingChatMessage(message);
    setPage('chat');
  };

  const switchCard = (index: number) => {
      if (index < 0 || index >= PERSONAS.length) return;
      setActiveIndex(index);
      setPersona(PERSONAS[index]);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX.current - touchEndX;

      if (Math.abs(diff) > 50) { // Threshold
          if (diff > 0) {
              // Swipe Left -> Next
              switchCard(Math.min(activeIndex + 1, PERSONAS.length - 1));
          } else {
              // Swipe Right -> Prev
              switchCard(Math.max(activeIndex - 1, 0));
          }
      }
      touchStartX.current = null;
  };

  // Helper to determine styles based on active index
  const getCardStyle = (index: number) => {
      const offset = index - activeIndex; // -1, 0, 1
      
      let transform = '';
      let zIndex = 0;
      let opacity = 1;
      let filter = 'none';

      if (offset === 0) {
          // Center
          transform = 'translateX(0) scale(1) rotate(0deg)';
          zIndex = 20;
          filter = 'brightness(100%)';
      } else if (offset < 0) {
          // Left
          transform = 'translateX(-120px) scale(0.8) rotate(-15deg)';
          zIndex = 10;
          opacity = 0.7;
          filter = 'brightness(90%) blur(1px)';
      } else {
          // Right
          transform = 'translateX(120px) scale(0.8) rotate(15deg)';
          zIndex = 10;
          opacity = 0.7;
          filter = 'brightness(90%) blur(1px)';
      }

      // Hide if out of range of visible 3 (though we only have 3)
      if (Math.abs(offset) > 1) {
           opacity = 0;
           pointerEvents: 'none';
      }

      return { transform, zIndex, opacity, filter };
  };

  return (
    <div className="h-full flex flex-col pt-10 px-6 pb-24 text-center overflow-hidden">
        
        {/* University Branding */}
        <div className="absolute top-12 left-0 right-0 flex justify-center opacity-70 z-0">
            <span className="text-sm font-normal tracking-[0.2em] text-gray-600 uppercase font-sans">
                北京邮电大学
            </span>
        </div>

        {/* Title */}
        <div className="mt-14 mb-2 relative z-10 flex flex-col items-center">
            <h1 className="text-4xl font-serif font-medium text-gray-800 tracking-wide">
                Famlée
            </h1>
            <p className="text-sm font-light text-gray-500 tracking-[0.5em] mt-1 ml-1">
                伐木布蕾
            </p>
        </div>
        
        {/* 3D Fan Carousel Area */}
        <div 
            className="relative h-72 w-full max-w-sm mx-auto flex items-center justify-center mt-4 mb-4 perspective-1000"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {PERSONAS.map((persona, index) => {
                const style = getCardStyle(index);
                return (
                    <div
                        key={persona.id}
                        onClick={() => switchCard(index)}
                        className="absolute w-52 h-52 rounded-[2rem] shadow-2xl transition-all duration-500 ease-out cursor-pointer bg-white overflow-hidden border-4 border-white/50"
                        style={{
                            ...style,
                            boxShadow: activeIndex === index ? '0 20px 50px -12px rgba(0,0,0,0.25)' : 'none'
                        }}
                    >
                         <img 
                            src={persona.image} 
                            alt={persona.title} 
                            className="w-full h-full object-cover"
                         />
                         {/* Overlay for center card title maybe? Or just keep it clean */}
                    </div>
                );
            })}
        </div>

        {/* Dynamic Text & Persona Details */}
        <div className="flex-1 flex flex-col items-center justify-start min-h-[140px] transition-all duration-500 mt-12">
             <h2 className="text-xl font-medium text-gray-800 mb-2 tracking-widest">
                 {PERSONAS[activeIndex].title}
             </h2>
             
             {/* Tags */}
             <div className="flex gap-2 mb-4 justify-center">
                 {PERSONAS[activeIndex].tags.map(tag => (
                     <span key={tag} className="text-[10px] bg-white/40 px-2 py-1 rounded-full border border-gray-200/50 text-gray-600 font-light">
                         {tag}
                     </span>
                 ))}
             </div>

             {/* Description with typewriter-ish effect (simple replacement for now) */}
             <p className="text-sm font-light text-gray-600 max-w-xs leading-relaxed tracking-wide whitespace-pre-line animate-fade-in">
                {PERSONAS[activeIndex].description}
             </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mx-auto mt-auto mb-10">
            <button 
                onClick={() => setPage('chat')}
                className="glass-panel p-5 rounded-3xl flex flex-col items-center gap-2 hover:bg-white/20 transition-all border border-white/30 hover:scale-[1.02] group"
            >
                <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
                <span className="text-sm font-light text-gray-700">疗愈对话</span>
            </button>
            <button 
                onClick={() => setIsJournalModalOpen(true)}
                className="glass-panel p-5 rounded-3xl flex flex-col items-center gap-2 hover:bg-white/20 transition-all border border-white/30 hover:scale-[1.02] group"
            >
                <span className="text-2xl group-hover:scale-110 transition-transform">📝</span>
                <span className="text-sm font-light text-gray-700">情绪记录</span>
            </button>
        </div>

        <JournalModal 
            isOpen={isJournalModalOpen}
            onClose={() => setIsJournalModalOpen(false)}
            setGlobalMood={setGlobalMood}
            onSaveEntry={onSaveEntry}
            onStartChat={handleStartChat}
        />

        <style>{`
            .perspective-1000 {
                perspective: 1000px;
            }
            .animate-fade-in {
                animation: fadeIn 0.5s ease-in-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
    </div>
  );
};

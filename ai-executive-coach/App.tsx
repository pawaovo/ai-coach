import React, { useState } from 'react';
import { LayoutGrid, MessageSquare, User } from 'lucide-react';
import BusinessTools from './components/BusinessTools';
import AIChat from './components/AIChat';
import ContactUs from './components/ContactUs';
import { Tab } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  const renderContent = () => {
    switch (activeTab) {
      case 'tools':
        return <BusinessTools />;
      case 'chat':
        return <AIChat />;
      case 'contact':
        return <ContactUs />;
      default:
        return <AIChat />;
    }
  };

  return (
    <div className="h-full w-full bg-[#EFEDE6] flex flex-col font-sans text-[#191919] relative selection:bg-[#D7D2C4] overflow-hidden">
      
      {/* Main Content Area - Exact height calculation to fit 100vh minus nav bar */}
      <main className="w-full max-w-md mx-auto relative flex flex-col" style={{ height: 'calc(100% - 70px)' }}>
        {renderContent()}
      </main>
        
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-[70px] bg-[#EFEDE6]/95 backdrop-blur-md border-t border-[#DEDBD2] z-50">
        <div className="h-full max-w-md mx-auto flex items-center justify-around px-8">
          
          <NavButton 
            active={activeTab === 'tools'} 
            onClick={() => setActiveTab('tools')} 
            icon={<LayoutGrid size={24} />}
            label="工具"
          />

          <NavButton 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')} 
            icon={<MessageSquare size={24} />}
            label="对话"
          />

          <NavButton 
            active={activeTab === 'contact'} 
            onClick={() => setActiveTab('contact')} 
            icon={<User size={24} />}
            label="联系"
          />
          
        </div>
      </nav>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-300 group
      ${active ? 'text-[#191919]' : 'text-[#8D8D8A] hover:text-[#5D5D5B]'}
    `}
  >
    <div className={`transition-transform duration-300 mb-1 ${active ? 'scale-100' : 'scale-95'}`}>
      {React.cloneElement(icon as React.ReactElement, { 
        strokeWidth: active ? 2 : 1.5,
        fill: active ? "currentColor" : "none",
        className: active ? "fill-[#191919]/5" : ""
      })}
    </div>
    <span className={`text-[10px] font-medium tracking-wide ${active ? 'opacity-100' : 'opacity-0 translate-y-2'} transition-all duration-300`}>
      {label}
    </span>
  </button>
);

export default App;
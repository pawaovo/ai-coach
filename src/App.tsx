
import React, { useState } from 'react';
import { FluidBackground } from './components/FluidBackground';
import { HomePage } from './pages/Home';
import { ChatPage } from './pages/Chat';
import { CalendarPage } from './pages/Calendar';
import { CampusPage } from './pages/Campus';
import { WaterfallPage } from './pages/Waterfall';
import { ProfilePage } from './pages/Profile';
import { MoodType, JournalEntry, PersonaConfig } from './types';
import { Home, Calendar as CalendarIcon, ClipboardList, Megaphone, User } from 'lucide-react';
import { PERSONAS } from './constants';

const generateMockEntries = (): JournalEntry[] => {
  const today = new Date();
  const subDays = (d: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    return date.toISOString();
  };

  return [
    {
      id: 'mock-1',
      date: subDays(1), // Yesterday
      mood: MoodType.ANXIOUS,
      content: '明天的Pre还没准备好，PPT还有几页没改完，感觉时间不够用了。有点焦虑，希望能顺利过关。',
      summary: '面对截止日期的压力，感到一丝焦虑。'
    },
    {
      id: 'mock-2',
      date: subDays(3),
      mood: MoodType.HAPPY,
      content: '今天在学一食堂吃到了心心念念的红烧肉！而且去图书馆正好有窗边的位置，阳光洒进来的感觉太治愈了。',
      summary: '美食与阳光带来的小确幸。'
    },
    {
      id: 'mock-3',
      date: subDays(5),
      mood: MoodType.NEUTRAL,
      content: '平平淡淡的一天，上完课去操场走了几圈。没有什么特别的事情发生，但这种平静也挺好的。',
      summary: '享受平凡日子的宁静。'
    },
    {
      id: 'mock-4',
      date: subDays(8),
      mood: MoodType.SAD,
      content: '给家里打电话，听到妈妈的声音突然有点想家了。虽然在学校也挺好，但有时候还是会觉得孤单。',
      summary: '思乡之情流露，渴望陪伴。'
    },
    {
      id: 'mock-5',
      date: subDays(12),
      mood: MoodType.ANGRY,
      content: '小组作业队友全程划水，最后还要我来兜底，真的太生气了！为什么会有这么不负责任的人？',
      summary: '对团队协作中的不公平感到愤怒。'
    },
    {
      id: 'mock-6',
      date: subDays(15),
      mood: MoodType.HAPPY,
      content: '社团活动举办得很成功！虽然很累，但是看到大家开心的样子，觉得一切都值了。',
      summary: '付出努力后收获的成就感。'
    },
    {
      id: 'mock-7',
      date: subDays(20),
      mood: MoodType.ANXIOUS,
      content: '考研倒计时，感觉复习进度有点落后了，看着周围同学都在拼命，心里有点慌。',
      summary: '学业竞争带来的同辈压力。'
    }
  ];
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [globalMood, setGlobalMood] = useState<MoodType>(MoodType.NEUTRAL);
  // Initialize with mock data so the calendar isn't empty
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(generateMockEntries());
  
  // Persona State - Default to the second one (Rational) per user request
  const [currentPersona, setCurrentPersona] = useState<PersonaConfig>(PERSONAS[1]);

  // State to hold message when switching from Journal Modal to Chat
  const [pendingChatMessage, setPendingChatMessage] = useState<string | null>(null);

  const handleAddEntry = (entry: JournalEntry) => {
    setJournalEntries(prev => [entry, ...prev]);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': 
        return <HomePage 
                  setPage={setCurrentPage} 
                  currentMood={globalMood} 
                  setGlobalMood={setGlobalMood}
                  onSaveEntry={handleAddEntry}
                  setPendingChatMessage={setPendingChatMessage}
                  currentPersona={currentPersona}
                  setPersona={setCurrentPersona}
               />;
      case 'chat': 
        return <ChatPage 
                  setGlobalMood={setGlobalMood} 
                  initialMessage={pendingChatMessage}
                  clearInitialMessage={() => setPendingChatMessage(null)}
                  currentPersona={currentPersona}
               />;
      case 'calendar': 
        return <CalendarPage 
                  entries={journalEntries} 
                  setGlobalMood={setGlobalMood} 
               />;
      case 'campus': return <CampusPage />;
      case 'waterfall': return <WaterfallPage />;
      case 'profile': return <ProfilePage />;
      default: return <HomePage 
                  setPage={setCurrentPage} 
                  currentMood={globalMood} 
                  setGlobalMood={setGlobalMood}
                  onSaveEntry={handleAddEntry}
                  setPendingChatMessage={setPendingChatMessage}
                  currentPersona={currentPersona}
                  setPersona={setCurrentPersona}
               />;
    }
  };

  const NavButton = ({ id, icon: Icon }: { id: string, icon: any }) => (
    <button 
        onClick={() => setCurrentPage(id)}
        className={`p-3 rounded-full transition-all duration-300 ${
            currentPage === id 
            ? 'bg-gray-800 text-white shadow-lg' 
            : 'text-gray-500 hover:bg-white/30'
        }`}
    >
        <Icon size={20} strokeWidth={1.5} />
    </button>
  );

  return (
    <div className="relative w-full h-screen overflow-hidden text-gray-800">
      <FluidBackground mood={globalMood} />
      
      {/* Main Content Area */}
      <main className="h-full w-full">
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 glass-panel rounded-full pl-2 pr-2 py-2 flex items-center gap-1 shadow-xl z-40 border border-white/40">
        <NavButton id="calendar" icon={CalendarIcon} />
        <NavButton id="waterfall" icon={Megaphone} />
        
        {/* Center Prominent Button for Home */}
        <button 
            onClick={() => setCurrentPage('home')}
            className={`
                mx-2 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border border-white/20
                ${currentPage === 'home' 
                ? 'bg-gray-800 text-white scale-110 shadow-gray-500/30' 
                : 'bg-white/50 text-gray-700 hover:bg-white/70'}
            `}
        >
            <Home size={24} strokeWidth={1.5} />
        </button>

        <NavButton id="campus" icon={ClipboardList} />
        <NavButton id="profile" icon={User} />
      </nav>
    </div>
  );
};

export default App;

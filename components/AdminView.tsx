
import React, { useState, useRef, useEffect } from 'react';
import { UserSession, ChatMessage, MeetingAnalysis, UserRole } from '../types';
import MessageList from './MessageList';
import AnalysisView from './AnalysisView';

interface AdminViewProps {
  session: UserSession;
  messages: ChatMessage[];
  analysis: MeetingAnalysis | null;
  isAnalyzing: boolean;
  onSendMessage: (text: string) => void;
  setTyping: (isTyping: boolean) => void;
  typingUsers: Record<string, { role: UserRole; lastSeen: number }>;
  userActivity: Record<string, { role: UserRole; lastSeen: number }>;
  closedUsers: string[];
}

const AdminView: React.FC<AdminViewProps> = ({ 
  session, messages, analysis, isAnalyzing, onSendMessage, setTyping, typingUsers, userActivity, closedUsers 
}) => {
  const [input, setInput] = useState('');
  const [showAnalysisMobile, setShowAnalysisMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const typingTimerRef = useRef<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setTyping(true);
    
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    }
  };

  const otherTyping = Object.entries(typingUsers).filter(([name]) => name !== session.userName);

  // Group members and calculate status
  // Fix: Added explicit typing for 'data' to resolve 'unknown' type errors on lines 58 and 65
  const teamStatus = Object.entries(userActivity)
    .filter(([name]) => name !== session.userName)
    .map(([name, data]: [string, { role: UserRole; lastSeen: number }]) => {
      const isTyping = typingUsers[name];
      const isClosed = closedUsers.includes(name);
      const secondsSinceSeen = (currentTime - data.lastSeen) / 1000;
      
      let status: 'TYPING' | 'ACTIVE' | 'IDLE' | 'CLOSED' = 'ACTIVE';
      if (isClosed) status = 'CLOSED';
      else if (isTyping) status = 'TYPING';
      else if (secondsSinceSeen > 60) status = 'IDLE';

      return { name, role: data.role, status };
    });

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#0f172a]">
      <div className={`flex flex-col flex-1 h-full bg-slate-50 border-r border-slate-200 shadow-inner transition-all ${showAnalysisMobile ? 'hidden' : 'flex'}`}>
        <header className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-xl shadow-slate-200">
              <i className="fa-solid fa-gauge-high text-indigo-400"></i>
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-800 uppercase tracking-tighter leading-none">Live Monitor</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Admin: {session.userName}</p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-4">
            <div className="h-8 w-px bg-slate-100 mx-2"></div>
            <div className="flex items-center space-x-3 overflow-x-auto">
              {teamStatus.map((member) => (
                <div key={member.name} className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 whitespace-nowrap">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    member.status === 'TYPING' ? 'bg-indigo-500 animate-pulse' :
                    member.status === 'ACTIVE' ? 'bg-emerald-500' :
                    member.status === 'IDLE' ? 'bg-amber-400' : 'bg-red-400'
                  }`}></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-700 leading-none">{member.name}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                      {member.status === 'TYPING' ? 'Typing...' : member.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
              {teamStatus.length === 0 && (
                <span className="text-[10px] font-black text-slate-300 uppercase italic">Waiting for team...</span>
              )}
            </div>
          </div>

          <button 
            onClick={() => setShowAnalysisMobile(true)}
            className="md:hidden px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-200"
          >
            <i className="fa-solid fa-brain mr-2"></i> View Intelligence
          </button>
        </header>

        {/* Small activity bar for tablets/small screens */}
        <div className="lg:hidden flex items-center space-x-3 px-6 py-2 bg-slate-50/50 border-b border-slate-100 overflow-x-auto">
           {teamStatus.map((member) => (
              <div key={member.name} className="flex items-center space-x-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  member.status === 'TYPING' ? 'bg-indigo-500 animate-pulse' :
                  member.status === 'ACTIVE' ? 'bg-emerald-500' :
                  member.status === 'IDLE' ? 'bg-amber-400' : 'bg-red-400'
                }`}></div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{member.name}</span>
              </div>
           ))}
        </div>

        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} currentUserName={session.userName} isAdminView />
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
          {otherTyping.length > 0 && (
            <div className="mb-2 px-4 flex items-center space-x-2 animate-fadeIn">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                {otherTyping.map(([name]) => name).join(', ')} is typing...
              </span>
            </div>
          )}
          <div className="relative flex items-center">
            <div className="absolute left-4 text-indigo-600 text-[10px] font-black uppercase tracking-widest pointer-events-none">Admin Msg</div>
            <input 
              type="text"
              className="w-full pl-24 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-medium"
              placeholder="Inject admin guidance..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="absolute right-2 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black disabled:bg-slate-200 transition-all shadow-lg"
            >
              <i className="fa-solid fa-terminal"></i>
            </button>
          </div>
        </div>
      </div>

      <div className={`md:flex flex-col w-full md:w-[450px] lg:w-[550px] h-full bg-[#1e293b] border-l border-white/5 shadow-2xl transition-all ${showAnalysisMobile ? 'flex' : 'hidden md:flex'}`}>
        <header className="px-6 py-5 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-wand-magic-sparkles text-indigo-400"></i>
            </div>
            <div>
              <h2 className="text-[11px] font-black text-slate-200 uppercase tracking-widest">Admin AI Insights</h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase">Real-time Analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isAnalyzing && (
              <div className="flex items-center space-x-2 bg-indigo-600/20 px-2 py-1 rounded-full">
                <div className="w-1 h-1 bg-indigo-400 rounded-full animate-ping"></div>
                <span className="text-[8px] font-black text-indigo-400 uppercase">Updating</span>
              </div>
            )}
            <button 
              onClick={() => setShowAnalysisMobile(false)}
              className="md:hidden w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-slate-400"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden custom-scrollbar">
          <AnalysisView analysis={analysis} isLoading={isAnalyzing} />
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

export default AdminView;

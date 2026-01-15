
import React, { useState, useRef } from 'react';
import { UserSession, ChatMessage, UserRole } from '../types';
import MessageList from './MessageList';

interface MemberViewProps {
  session: UserSession;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  setTyping: (isTyping: boolean) => void;
  typingUsers: Record<string, { role: UserRole; lastSeen: number }>;
  onCloseSession: () => void;
  isSessionClosedLocally: boolean;
}

const MemberView: React.FC<MemberViewProps> = ({ 
  session, messages, onSendMessage, setTyping, typingUsers, onCloseSession, isSessionClosedLocally 
}) => {
  const [input, setInput] = useState('');
  const typingTimerRef = useRef<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSessionClosedLocally) return;
    setInput(e.target.value);
    setTyping(true);
    
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    if (isSessionClosedLocally) return;
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    }
  };

  const isAdminTyping = Object.values(typingUsers).some((u: any) => u.role === 'ADMIN');
  const otherMembersTyping = Object.entries(typingUsers)
    .filter(([name, data]: [string, any]) => name !== session.userName && data.role === 'MEMBER')
    .map(([name]) => name);

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto bg-white shadow-xl relative">
      {isSessionClosedLocally && (
        <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-lock text-slate-400 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Session Closed</h2>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            You have successfully closed this session. Your manager has been notified.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-8 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100"
          >
            Restart App
          </button>
        </div>
      )}

      <header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
            <i className="fa-solid fa-users text-white"></i>
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800 uppercase tracking-tight">Team Space</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Member: {session.userName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {!isSessionClosedLocally && (
            <button 
              onClick={onCloseSession}
              className="px-4 py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
            >
              Session Closed
            </button>
          )}
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live Session</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} currentUserName={session.userName} />
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        {(isAdminTyping || otherMembersTyping.length > 0) && !isSessionClosedLocally && (
          <div className="mb-2 px-4 flex items-center space-x-2 animate-fadeIn">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              {isAdminTyping ? 'Admin is typing...' : `${otherMembersTyping.join(', ')} is typing...`}
            </span>
          </div>
        )}
        <div className="relative flex items-center">
          <input 
            type="text"
            disabled={isSessionClosedLocally}
            className="w-full pl-6 pr-14 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all shadow-sm font-medium disabled:opacity-50 disabled:bg-slate-50"
            placeholder={isSessionClosedLocally ? "Session is closed" : "Type a message to the team..."}
            value={input}
            onChange={handleInputChange}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isSessionClosedLocally}
            className="absolute right-2 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 disabled:bg-slate-200 transition-all shadow-lg shadow-emerald-100"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberView;

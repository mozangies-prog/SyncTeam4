
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserRole, UserSession, ChatMessage, MeetingAnalysis, BroadcastEvent } from './types';
import MemberView from './components/MemberView';
import AdminView from './components/AdminView';
import { analyzeChatHistory } from './services/geminiService';

const bc = new BroadcastChannel('syncnote_session');
const ADMIN_PASSWORD = '123456789';

const Lobby: React.FC<{ onJoin: (session: UserSession) => void }> = ({ onJoin }) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (role === 'ADMIN') {
      if (password !== ADMIN_PASSWORD) {
        setError('Invalid Admin Password.');
        return;
      }
    }

    onJoin({ role: role!, userName: name.trim() });
  };

  const isInvalid = !name.trim() || (role === 'ADMIN' && !password.trim());

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 space-y-8 animate-fadeIn">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200 rotate-6 transition-transform hover:rotate-0">
            <i className="fa-solid fa-bolt-lightning text-white text-4xl"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-800">SyncNote</h1>
        </div>

        {!role ? (
          <div className="space-y-4">
            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Select your role to continue</p>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setRole('ADMIN')}
                className="group p-6 border-2 border-slate-100 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <i className="fa-solid fa-user-shield text-2xl text-slate-400 group-hover:text-indigo-600"></i>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">Manager</span>
                </div>
                <h3 className="font-bold text-slate-800">Admin Console</h3>
                <p className="text-xs text-slate-500 mt-1">Full access to AI insights, task registry, and employee sentiment analysis.</p>
              </button>
              <button 
                onClick={() => setRole('MEMBER')}
                className="group p-6 border-2 border-slate-100 rounded-2xl hover:border-emerald-600 hover:bg-emerald-50 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <i className="fa-solid fa-users text-2xl text-slate-400 group-hover:text-emerald-600"></i>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">Employee</span>
                </div>
                <h3 className="font-bold text-slate-800">Team Space</h3>
                <p className="text-xs text-slate-500 mt-1">Join the team conversation. Clean, focused interface for daily standups.</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <button onClick={() => { setRole(null); setError(''); setPassword(''); }} className="text-indigo-600 text-xs font-bold flex items-center">
              <i className="fa-solid fa-chevron-left mr-2"></i> Back to Role Selection
            </button>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enter Your Full Name</label>
                <input 
                  autoFocus
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700"
                  placeholder="e.g. Alex Thompson"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              {role === 'ADMIN' && (
                <div className="space-y-2 animate-fadeIn">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Access Password</label>
                  <input 
                    type="password"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700"
                    placeholder="Enter 9-digit password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-[10px] font-bold py-3 px-4 rounded-xl flex items-center border border-red-100 animate-fadeIn">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {error}
              </div>
            )}

            <button 
              onClick={handleJoin}
              disabled={isInvalid}
              className={`w-full py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center space-x-2 ${
                role === 'ADMIN' ? 'bg-indigo-600 shadow-indigo-200' : 'bg-emerald-600 shadow-emerald-200'
              } text-white disabled:bg-slate-200 disabled:shadow-none hover:-translate-y-1`}
            >
              <span>Join as {role === 'ADMIN' ? 'Manager' : 'Team Member'}</span>
              <i className="fa-solid fa-door-open ml-2"></i>
            </button>
            <p className="text-[10px] text-center text-slate-400 italic">Open this app in multiple tabs to simulate a real-time team chat!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, { role: UserRole; lastSeen: number }>>({});
  const [userActivity, setUserActivity] = useState<Record<string, { role: UserRole; lastSeen: number }>>({});
  const [closedUsers, setClosedUsers] = useState<string[]>([]);
  
  const typingTimeoutRef = useRef<any>(null);

  // Sync state across tabs
  useEffect(() => {
    const handleMessage = (event: MessageEvent<BroadcastEvent>) => {
      const { type, payload } = event.data;
      if (type === 'MESSAGE_SENT') {
        setMessages(prev => [...prev, payload]);
        // Update activity when message received
        setUserActivity(prev => ({
          ...prev,
          [payload.senderName]: { role: payload.senderRole, lastSeen: Date.now() }
        }));
        setTypingUsers(prev => {
          const next = { ...prev };
          delete next[payload.senderName];
          return next;
        });
      } else if (type === 'ANALYSIS_UPDATED') {
        setAnalysis(payload);
      } else if (type === 'TYPING_STATUS') {
        setTypingUsers(prev => {
          const next = { ...prev };
          if (payload.isTyping) {
            next[payload.userName] = { role: payload.role, lastSeen: Date.now() };
          } else {
            delete next[payload.userName];
          }
          return next;
        });
        // Update activity when typing status received
        setUserActivity(prev => ({
          ...prev,
          [payload.userName]: { role: payload.role, lastSeen: Date.now() }
        }));
      } else if (type === 'SESSION_CLOSED') {
        setClosedUsers(prev => [...new Set([...prev, payload.userName])]);
      } else if (type === 'USER_ACTIVITY') {
        setUserActivity(prev => ({
          ...prev,
          [payload.userName]: { role: payload.role, lastSeen: payload.timestamp }
        }));
      }
    };
    bc.addEventListener('message', handleMessage);
    return () => bc.removeEventListener('message', handleMessage);
  }, []);

  // Broadcast own presence on join and periodically
  useEffect(() => {
    if (!session) return;
    
    const broadcastPresence = () => {
      bc.postMessage({
        type: 'USER_ACTIVITY',
        payload: { userName: session.userName, role: session.role, timestamp: Date.now() }
      });
    };

    broadcastPresence(); // Initial join
    const interval = setInterval(broadcastPresence, 10000); // Periodic heartbeats
    return () => clearInterval(interval);
  }, [session]);

  // Cleanup stale typing indicators (not activity)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => {
        let changed = false;
        const next = { ...prev };
        Object.entries(next).forEach(([name, data]: [string, any]) => {
          if (now - data.lastSeen > 3000) {
            delete next[name];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const setTyping = useCallback((isTyping: boolean) => {
    if (!session) return;
    bc.postMessage({
      type: 'TYPING_STATUS',
      payload: { userName: session.userName, isTyping, role: session.role }
    });
  }, [session]);

  const closeSession = useCallback(() => {
    if (!session) return;
    setClosedUsers(prev => [...new Set([...prev, session.userName])]);
    bc.postMessage({
      type: 'SESSION_CLOSED',
      payload: { userName: session.userName }
    });
  }, [session]);

  // Admin-only: Trigger AI analysis
  useEffect(() => {
    if (session?.role !== 'ADMIN' || messages.length === 0) return;

    const timeoutId = setTimeout(async () => {
      setIsAnalyzing(true);
      const result = await analyzeChatHistory(messages);
      if (result) {
        setAnalysis(result);
        bc.postMessage({ type: 'ANALYSIS_UPDATED', payload: result });
      }
      setIsAnalyzing(false);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [messages, session?.role]);

  const sendMessage = useCallback((text: string) => {
    if (!session) return;
    const msg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: session.userName,
      senderRole: session.role,
      text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, msg]);
    bc.postMessage({ type: 'MESSAGE_SENT', payload: msg });
    setTyping(false);
  }, [session, setTyping]);

  if (!session) return <Lobby onJoin={setSession} />;

  return (
    <div className="h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {session.role === 'ADMIN' ? (
        <AdminView 
          session={session} 
          messages={messages} 
          analysis={analysis} 
          isAnalyzing={isAnalyzing}
          onSendMessage={sendMessage}
          setTyping={setTyping}
          typingUsers={typingUsers}
          userActivity={userActivity}
          closedUsers={closedUsers}
        />
      ) : (
        <MemberView 
          session={session} 
          messages={messages} 
          onSendMessage={sendMessage}
          setTyping={setTyping}
          typingUsers={typingUsers}
          onCloseSession={closeSession}
          isSessionClosedLocally={closedUsers.includes(session.userName)}
        />
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default App;

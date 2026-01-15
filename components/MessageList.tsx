
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserName: string;
  isAdminView?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserName, isAdminView }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-3">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isAdminView ? 'bg-slate-100' : 'bg-emerald-50'}`}>
            <i className={`fa-solid ${isAdminView ? 'fa-video-slash' : 'fa-comment-dots'} text-3xl opacity-40`}></i>
          </div>
          <p className="text-sm font-bold uppercase tracking-wider">{isAdminView ? 'Waiting for Team Activity...' : 'Start the Team Conversation'}</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isMe = msg.senderName === currentUserName;
          const isAdminMsg = msg.senderRole === 'ADMIN';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
            >
              <div className="flex items-center space-x-2 mb-1 px-2">
                <span className={`text-[9px] font-black uppercase tracking-tighter ${
                  isAdminMsg ? 'text-indigo-600' : 'text-slate-400'
                }`}>
                  {msg.senderName} {isAdminMsg && <i className="fa-solid fa-shield-halved ml-1"></i>}
                </span>
              </div>
              
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm transition-all relative ${
                  isMe
                    ? (isAdminMsg ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-emerald-600 text-white rounded-tr-none')
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                } group-hover:shadow-md`}
              >
                <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                <p className={`text-[8px] mt-2 flex justify-end font-bold uppercase tracking-widest ${isMe ? 'text-white/50' : 'text-slate-300'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;

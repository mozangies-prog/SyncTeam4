
import React, { useState } from 'react';
import { MeetingAnalysis } from '../types';

interface AnalysisViewProps {
  analysis: MeetingAnalysis | null;
  isLoading: boolean;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, isLoading }) => {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskStr: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskStr)) next.delete(taskStr);
      else next.add(taskStr);
      return next;
    });
  };

  if (isLoading && !analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fa-solid fa-microchip text-indigo-400 animate-pulse"></i>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-slate-200 font-black text-xs uppercase tracking-widest">Neural Processing</p>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Deciphering team dynamics...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center">
          <i className="fa-solid fa-chart-line text-slate-700 text-3xl"></i>
        </div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">
          No team data captured. Analysis will trigger automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10 animate-fadeIn h-full overflow-y-auto">
      {/* Executive Summary */}
      <section className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 shadow-2xl">
        <h3 className="flex items-center text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">
          <i className="fa-solid fa-file-invoice mr-3"></i>
          Executive Overview
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
          "{analysis.summary}"
        </p>
      </section>

      {/* Action Registry with Checkboxes */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h3 className="flex items-center text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">
            <i className="fa-solid fa-list-check mr-3"></i>
            Action Registry
          </h3>
          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-black border border-emerald-500/20">
            {analysis.tasks.length} LOGGED
          </span>
        </div>
        <div className="space-y-3">
          {analysis.tasks.map((task, idx) => {
            const isDone = completedTasks.has(task.task);
            return (
              <div 
                key={idx}
                onClick={() => toggleTask(task.task)}
                className={`group flex items-start space-x-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  isDone 
                  ? 'bg-slate-900/20 border-white/5 opacity-40' 
                  : 'bg-white/5 border-white/5 hover:border-indigo-500/50 hover:bg-white/[0.07] shadow-lg'
                }`}
              >
                <div className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                  isDone ? 'bg-emerald-500 border-emerald-500 scale-90' : 'bg-slate-800 border-slate-700 group-hover:border-indigo-500'
                }`}>
                  {isDone && <i className="fa-solid fa-check text-slate-900 text-xs"></i>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold transition-all truncate ${
                    isDone ? 'text-slate-500 line-through' : 'text-slate-200'
                  }`}>
                    {task.task}
                  </p>
                  <div className="flex items-center mt-1.5">
                    <span className="text-[9px] font-black text-indigo-400 uppercase bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                      OWNER: {task.assignee}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Strategic Suggestions */}
      <section>
        <h3 className="flex items-center text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-5">
          <i className="fa-solid fa-brain mr-3"></i>
          Conflict & Problem Resolution
        </h3>
        <div className="grid gap-4">
          {analysis.problemSolvingSuggestions.map((suggestion, idx) => (
            <div key={idx} className="group relative text-xs text-slate-300 bg-slate-900/80 p-5 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all shadow-xl">
              <div className="absolute top-0 right-4 -translate-y-1/2 bg-amber-500 text-slate-900 text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                AI GUIDANCE
              </div>
              <p className="leading-relaxed font-medium">
                <i className="fa-solid fa-lightbulb text-amber-500 mr-2 opacity-50"></i>
                {suggestion}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Points */}
      <section>
        <h3 className="flex items-center text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
          <i className="fa-solid fa-bullseye mr-3 text-red-500"></i>
          Strategic Pillars
        </h3>
        <div className="flex flex-wrap gap-2">
          {analysis.keyPoints.map((point, idx) => (
            <span key={idx} className="text-[10px] font-bold text-slate-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">
              # {point}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AnalysisView;

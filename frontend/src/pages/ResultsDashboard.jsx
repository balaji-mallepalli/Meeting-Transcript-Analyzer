import React, { useState } from 'react';
import { Download, PlusCircle, Trash2, ChevronDown, ChevronUp, Users, MessageSquare } from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResultsDashboard({ initialResult, onReset }) {
  const [result, setResult] = useState(initialResult);
  const [openTopic, setOpenTopic] = useState(null);

  // Colors for speakers
  const SPEAKER_COLORS = ['bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700', 'bg-indigo-100 text-indigo-700', 'bg-teal-100 text-teal-700', 'bg-orange-100 text-orange-700'];

  const getSpeakerBadgeClass = (speaker) => {
    if(!result.speakers) return SPEAKER_COLORS[0];
    const idx = result.speakers.indexOf(speaker);
    return SPEAKER_COLORS[idx % SPEAKER_COLORS.length] || SPEAKER_COLORS[0];
  };

  const handleExport = () => {
    exportToPDF(result);
  };

  // --- Decision Handlers ---
  const updateDecision = (index, field, value) => {
    const newDecisions = [...result.decisions];
    newDecisions[index][field] = value;
    setResult({ ...result, decisions: newDecisions });
  };
  const addDecision = () => {
    const newDecisions = [...(result.decisions || []), { speaker: result.speakers?.[0] || 'Unknown', decision: 'New decision...', confidence: 1.0 }];
    setResult({ ...result, decisions: newDecisions });
  };
  const deleteDecision = (index) => {
    const newDecisions = [...result.decisions];
    newDecisions.splice(index, 1);
    setResult({ ...result, decisions: newDecisions });
  };

  // --- Action Handlers ---
  const updateAction = (index, field, value) => {
    const newActions = [...result.action_items];
    newActions[index][field] = value;
    setResult({ ...result, action_items: newActions });
  };
  const addAction = () => {
    const newActions = [...(result.action_items || []), { speaker: result.speakers?.[0] || 'Unknown', action: 'New action item...', deadline: '', confidence: 1.0 }];
    setResult({ ...result, action_items: newActions });
  };
  const deleteAction = (index) => {
    const newActions = [...result.action_items];
    newActions.splice(index, 1);
    setResult({ ...result, action_items: newActions });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      
      {/* 1. Meta Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-6 mb-4 md:mb-0">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-slate-400 mr-2" />
            <div className="flex flex-wrap gap-2">
              {result.speakers?.map((s, i) => (
                <span key={i} className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${getSpeakerBadgeClass(s)}`}>
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center text-slate-600 text-sm font-medium">
            <MessageSquare className="w-4 h-4 mr-1.5" />
            {result.total_turns} turns
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={onReset} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
            Analyze Another
          </button>
          <button onClick={handleExport} className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* 2. Meeting Summary Card */}
        <div className="bg-blue-50/50 rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
          <div className="bg-blue-100/50 px-6 py-4 border-b border-blue-100">
            <h2 className="text-xl font-bold text-blue-900">Meeting Summary</h2>
          </div>
          <div className="p-6">
            <p className="text-slate-700 leading-relaxed text-lg mb-6">{result.summary.overall}</p>
            
            {result.summary.by_topic && result.summary.by_topic.length > 0 && (
              <div className="mt-8 space-y-3">
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-4">By Topic</h3>
                {result.summary.by_topic.map((t, idx) => (
                  <div key={idx} className="border border-blue-200 rounded-lg overflow-hidden bg-white">
                    <button 
                      className="w-full flex justify-between items-center px-5 py-3 bg-blue-50/30 hover:bg-blue-50 transition-colors"
                      onClick={() => setOpenTopic(openTopic === idx ? null : idx)}
                    >
                      <span className="font-semibold text-blue-900">{t.topic}</span>
                      {openTopic === idx ? <ChevronUp className="w-5 h-5 text-blue-500" /> : <ChevronDown className="w-5 h-5 text-blue-500" />}
                    </button>
                    <AnimatePresence>
                      {openTopic === idx && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="p-5 text-slate-600 text-sm border-t border-blue-100 leading-relaxed">
                            {t.summary}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Key Decisions Card */}
        <div className="bg-emerald-50/30 rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
          <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-emerald-900">Key Decisions</h2>
            <button onClick={addDecision} className="text-emerald-600 hover:text-emerald-800 flex items-center text-sm font-semibold transition-colors">
              <PlusCircle className="w-4 h-4 mr-1.5" /> Add Decision
            </button>
          </div>
          <div className="p-6">
            {(!result.decisions || result.decisions.length === 0) ? (
              <p className="text-emerald-600/60 italic text-center py-4">No decisions detected.</p>
            ) : (
              <div className="space-y-4">
                {result.decisions.map((d, index) => (
                  <div key={index} className="flex items-start group bg-white p-4 rounded-xl shadow-[0_2px_4px_rgba(16,185,129,0.05)] border border-emerald-50 hover:border-emerald-200 transition-colors">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center mb-1">
                        <input
                           value={d.speaker}
                           onChange={(e) => updateDecision(index, 'speaker', e.target.value)}
                           className="font-bold text-sm text-emerald-900 bg-transparent outline-none hover:bg-emerald-50 focus:bg-emerald-50 px-1 -ml-1 rounded transition-colors w-32"
                        />
                        {d.confidence && (
                           <span className={`ml-3 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${d.confidence > 0.8 ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                             {(d.confidence * 100).toFixed(0)}% Conf
                           </span>
                        )}
                      </div>
                      <textarea
                        value={d.decision}
                        onChange={(e) => updateDecision(index, 'decision', e.target.value)}
                        className="w-full text-slate-700 bg-transparent outline-none resize-none hover:bg-emerald-50/50 focus:bg-emerald-50/50 px-1 -ml-1 rounded transition-colors block"
                        rows={2}
                      />
                    </div>
                    <button onClick={() => deleteDecision(index)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1.5 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Action Items Card */}
        <div className="bg-amber-50/30 rounded-2xl border border-amber-100 overflow-hidden shadow-sm">
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-amber-900">Action Items</h2>
            <button onClick={addAction} className="text-amber-600 hover:text-amber-800 flex items-center text-sm font-semibold transition-colors">
              <PlusCircle className="w-4 h-4 mr-1.5" /> Add Action Item
            </button>
          </div>
          <div className="p-0 sm:p-6">
             {(!result.action_items || result.action_items.length === 0) ? (
              <p className="text-amber-600/60 italic text-center py-10">No action items detected.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-amber-100 text-amber-800 text-xs uppercase tracking-wider">
                      <th className="pb-3 pl-4 sm:pl-0 w-1/4 font-semibold">Assignee</th>
                      <th className="pb-3 w-1/2 font-semibold">Task</th>
                      <th className="pb-3 px-2 font-semibold text-center">Deadline</th>
                      <th className="pb-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100/50">
                    {result.action_items.map((a, index) => (
                      <tr key={index} className="group hover:bg-white/60 transition-colors">
                        <td className="py-3 pl-4 sm:pl-0 align-top">
                          <input
                             value={a.speaker}
                             onChange={(e) => updateAction(index, 'speaker', e.target.value)}
                             className="w-full font-semibold text-sm text-amber-900 bg-transparent outline-none hover:bg-amber-100/50 focus:bg-amber-100/50 px-2 py-1 rounded transition-colors"
                          />
                        </td>
                        <td className="py-3 align-top">
                          <textarea
                             value={a.action}
                             onChange={(e) => updateAction(index, 'action', e.target.value)}
                             className="w-full text-sm text-slate-700 bg-transparent outline-none resize-none hover:bg-amber-100/50 focus:bg-amber-100/50 px-2 py-1 rounded transition-colors leading-tight"
                             rows={2}
                          />
                        </td>
                        <td className="py-3 px-2 align-top text-center relative">
                          <input
                             value={a.deadline || ''}
                             placeholder="None"
                             onChange={(e) => updateAction(index, 'deadline', e.target.value)}
                             className="w-24 text-center text-xs font-medium text-amber-800 bg-amber-100/50 placeholder-amber-800/30 outline-none hover:bg-amber-200/50 focus:bg-amber-200/50 px-2 py-1.5 rounded-md transition-colors"
                          />
                           {a.confidence && (
                             <div className={`absolute bottom-1 w-full text-center text-[9px] font-bold ${a.confidence > 0.8 ? 'text-emerald-500' : 'text-amber-500'}`}>
                               {(a.confidence * 100).toFixed(0)}% Conf
                             </div>
                           )}
                        </td>
                        <td className="py-3 pr-4 sm:pr-0 text-right align-top">
                           <button onClick={() => deleteAction(index)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1 mt-0.5 transition-all inline-block">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. Bottom Action Bar */}
      <div className="mt-8 flex justify-end space-x-4">
        <button onClick={onReset} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors">
            Analyze Another
        </button>
        <button onClick={handleExport} className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
            <Download className="w-5 h-5 mr-2" />
            Export Full PDF Report
        </button>
      </div>

    </div>
  );
}

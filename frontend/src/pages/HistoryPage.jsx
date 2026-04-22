import React, { useState } from 'react';
import { Clock, Users, MessageSquare, Trash2, ChevronRight, InboxIcon, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HistoryPage({ history, onLoadResult, onClearHistory }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClear = () => {
    onClearHistory();
    setShowConfirm(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Analysis History</h1>
          <p className="mt-2 text-slate-600">Review your past meeting transcript analyses.</p>
        </div>
        
        {history.length > 0 && (
          <button 
            onClick={() => setShowConfirm(true)}
            className="flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors border border-red-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </button>
        )}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center text-red-800">
              <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 text-red-500" />
              <p className="text-sm font-medium">Are you sure you want to permanently delete all history?</p>
            </div>
            <div className="flex space-x-3 ml-4">
              <button onClick={() => setShowConfirm(false)} className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors">Cancel</button>
              <button onClick={handleClear} className="px-3 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-sm">Delete All</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
            <InboxIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No history found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">You haven't run any transcript analyses yet. They will automatically be saved here once you do.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, idx) => (
            <motion.div 
              key={item.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onLoadResult(item.result)}
              className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between"
            >
              <div className="flex-1 mb-4 sm:mb-0">
                <div className="flex items-center text-slate-500 text-sm mb-2">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {new Date(item.timestamp).toLocaleString(undefined, {
                    dateStyle: 'medium', timeStyle: 'short'
                  })}
                </div>
                <div className="flex flex-wrap items-center mt-3 gap-2">
                  <span className="flex items-center text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md mr-2">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {item.result.total_turns} turns
                  </span>
                  <span className="flex flex-wrap gap-1">
                    <Users className="w-4 h-4 mr-1 text-slate-400" />
                    {item.result.speakers?.map((s, i) => (
                      <span key={i} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${i%2===0 ? 'bg-indigo-50 text-indigo-700':'bg-teal-50 text-teal-700'}`}>
                        {s}
                      </span>
                    )) || <span className="text-xs text-slate-400">Unknown speakers</span>}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-end">
                <div className="flex items-center bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  View Report <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { LayoutDashboard, History, FileText } from 'lucide-react';

export default function Navbar({ onNavigate, currentView, historyCount }) {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('upload')}>
            <FileText className="h-8 w-8 text-blue-600 mr-2" />
            <span className="font-bold text-xl text-slate-800 tracking-tight">
              Meeting Analyzer
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('history')}
              className={`flex items-center px-4 py-2 rounded-full transition-colors text-sm font-medium ${
                currentView === 'history' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <History className="h-4 w-4 mr-2" />
              History
              {historyCount > 0 && (
                <span className="ml-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

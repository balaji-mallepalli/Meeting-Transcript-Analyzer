import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import ResultsDashboard from './pages/ResultsDashboard';
import HistoryPage from './pages/HistoryPage';

const HISTORY_STORAGE_KEY = 'meeting_analyzer_history_v1';
const MAX_HISTORY_ITEMS = 15;

function App() {
  const [result, setResult] = useState(null);
  const [currentView, setCurrentView] = useState('upload'); // 'upload', 'results', 'history'
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse history", e);
    }
    return [];
  });

  const saveToHistory = (newResult) => {
    setHistory(prev => {
      const newEntry = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        timestamp: new Date().toISOString(),
        result: newResult
      };
      
      const newHistory = [newEntry, ...prev].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleAnalysisComplete = (newResult) => {
    setResult(newResult);
    saveToHistory(newResult);
    setCurrentView('results');
  };

  const handleLoadHistoryResult = (savedResult) => {
    setResult(savedResult);
    setCurrentView('results');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

  const handleNavigate = (view) => {
    if (view === 'upload') {
      setResult(null);
    }
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar 
        onNavigate={handleNavigate} 
        currentView={currentView} 
        historyCount={history.length} 
      />
      
      <main className="flex-1 w-full relative">
        {currentView === 'upload' && (
          <UploadPage onAnalysisComplete={handleAnalysisComplete} />
        )}
        
        {currentView === 'results' && result && (
          <ResultsDashboard 
            initialResult={result} 
            onReset={() => handleNavigate('upload')} 
          />
        )}
        
        {currentView === 'history' && (
          <HistoryPage 
            history={history} 
            onLoadResult={handleLoadHistoryResult} 
            onClearHistory={handleClearHistory} 
          />
        )}
      </main>
    </div>
  );
}

export default App;

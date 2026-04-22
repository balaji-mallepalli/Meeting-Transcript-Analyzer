import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, File, PlayCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { id: 'preprocessing', label: 'Preprocessing' },
  { id: 'segmenting topics', label: 'Segmenting Topics' },
  { id: 'summarizing', label: 'Summarizing' },
  { id: 'extracting decisions', label: 'Extracting Decisions' },
  { id: 'extracting action items', label: 'Extracting Action Items' },
  { id: 'done', label: 'Complete' }
];

export default function UploadPage({ onAnalysisComplete }) {
  const [mode, setMode] = useState('file'); // 'file' or 'text'
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Progress states
  const [currentStep, setCurrentStep] = useState(null);
  const [percent, setPercent] = useState(0);

  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.name.endsWith('.txt')) {
        setFile(dropped);
        setError(null);
      } else {
        setError('Please upload a valid .txt file.');
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const startAnalysis = async () => {
    if (mode === 'text' && text.length < 50) {
        setError('Text must be at least 50 characters long.');
        return;
    }
    if (mode === 'file' && !file) {
        setError('Please select a file first.');
        return;
    }

    const taskId = uuidv4();
    setIsLoading(true);
    setError(null);
    setCurrentStep('preprocessing');
    setPercent(0);

    // Open SSE connection
    const eventSource = new EventSource(`http://localhost:8000/api/progress/${taskId}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.step.startsWith('error')) {
            setError(data.step);
            eventSource.close();
            setIsLoading(false);
            return;
        }
        setCurrentStep(data.step);
        setPercent(data.percent);
        if (data.step === 'done') {
            eventSource.close();
        }
      } catch (err) {
        console.error("SSE Parse error", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      eventSource.close();
    };

    try {
      let response;
      if (mode === 'file') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('task_id', taskId);
        response = await axios.post('http://localhost:8000/api/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axios.post(`http://localhost:8000/api/analyze-text?task_id=${taskId}`, {
          text: text
        });
      }
      
      onAnalysisComplete(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
      eventSource.close();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Meeting Transcript Analyzer</h1>
        <p className="mt-4 text-lg text-slate-600">Extract insights, action items, and clear summaries from your meeting text in seconds.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Toggle Pill */}
        <div className="flex p-2 bg-slate-50 border-b border-slate-100">
          <div className="flex bg-slate-200/50 p-1 rounded-full relative">
            <button
              className={`relative z-10 px-6 py-2 text-sm font-semibold rounded-full transition-colors ${mode === 'file' ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setMode('file'); setError(null); }}
            >
              Upload File
            </button>
            <button
              className={`relative z-10 px-6 py-2 text-sm font-semibold rounded-full transition-colors ${mode === 'text' ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setMode('text'); setError(null); }}
            >
              Paste Text
            </button>
            <motion.div
              layoutId="mode-indicator"
              className="absolute inset-y-1 bg-white shadow-sm rounded-full"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              style={{
                width: mode === 'file' ? 'calc(50% - 4px)' : 'calc(50% - 4px)',
                left: mode === 'file' ? '4px' : 'calc(50%)'
              }}
            />
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {mode === 'file' ? (
              <motion.div
                key="file"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full"
              >
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all ${
                    isHovering ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                  onDragLeave={() => setIsHovering(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".txt" className="hidden" />
                  
                  {file ? (
                    <>
                      <File className="h-16 w-16 text-blue-500 mb-4" />
                      <p className="text-lg font-medium text-slate-800">{file.name}</p>
                      <p className="text-sm text-slate-500 mt-2">{(file.size / 1024).toFixed(2)} KB</p>
                      <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Remove File</button>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-16 w-16 text-slate-400 mb-4" />
                      <p className="text-lg font-medium text-slate-700">Drag and drop your transcript</p>
                      <p className="text-sm text-slate-500 mt-2">or click to browse for a .txt file</p>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full"
              >
                <textarea
                  className="w-full h-64 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none text-slate-700"
                  placeholder="Paste your meeting transcript here... (Format: 'Speaker: text')"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2 px-1">
                  <span className={`text-xs ${text.length < 50 && text.length > 0 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                    {text.length} characters (min 50)
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="mt-6 flex items-center p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {!isLoading ? (
            <div className="mt-8 flex justify-center">
              <button
                disabled={(mode === 'file' && !file) || (mode === 'text' && text.length < 50)}
                onClick={startAnalysis}
                className="flex items-center px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <PlayCircle className="h-6 w-6 mr-2" />
                Analyze Transcript
              </button>
            </div>
          ) : (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Processing...</h3>
                <span className="text-blue-600 font-bold">{percent}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 mb-8 overflow-hidden relative">
                <motion.div 
                  className="bg-blue-600 h-3 rounded-full relative"
                  initial={{ width: "0%" }}
                  animate={{ width: `${percent}%` }}
                  transition={{ ease: "easeOut", duration: 0.5 }}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {STEPS.map((step, idx) => {
                  const isActive = step.id === currentStep;
                  const isPast = STEPS.findIndex(s => s.id === currentStep) > idx || currentStep === 'done';
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors duration-300 ${isPast ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] animate-pulse' : 'bg-slate-200 text-slate-400'}`}>
                        {isPast ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                      </div>
                      <span className={`text-xs text-center font-medium ${isActive ? 'text-blue-700' : isPast ? 'text-slate-700' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

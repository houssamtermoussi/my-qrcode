import { useState, useEffect } from 'react';
import { qrApi } from './services/api';
import type { QRCodeData } from './services/api';
import './App.css';

function App() {
  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('url');
  const [content, setContent] = useState('');
  
  // App Data & UI States
  const [qrList, setQrList] = useState<QRCodeData[]>([]);
  const [activeQR, setActiveQR] = useState<QRCodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await qrApi.getQRCodes();
      setQrList(data);
      if (data.length > 0 && !activeQR) {
        setActiveQR(data[0]); // Default preview to latest QR
      }
    } catch (err: any) {
      setErrorMessage(
        'Could not connect to the backend database. Make sure your MySQL and Node servers are active!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Toast auto-dismissal
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const newQR = await qrApi.addQRCode(title, type, content);
      setQrList((prev) => [newQR, ...prev]);
      setActiveQR(newQR);
      
      // Reset form
      setTitle('');
      setContent('');
      showToast('QR Code generated and saved successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to generate QR Code. Check backend connection.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this QR Code from history?')) return;
    
    try {
      await qrApi.removeQRCode(id);
      setQrList((prev) => prev.filter((item) => item.id !== id));
      if (activeQR?.id === id) {
        setActiveQR(null);
      }
      showToast('QR Code deleted successfully.', 'success');
    } catch (err) {
      showToast('Failed to delete QR Code.', 'error');
    }
  };

  const handleDownload = (qrImage: string, qrTitle: string) => {
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `${qrTitle.toLowerCase().replace(/\s+/g, '_')}_qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Download started!', 'success');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied payload to clipboard!', 'success');
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    if (type === 'error') {
      setErrorMessage(msg);
      // Auto-clear error after 5s
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setSuccessMessage(msg);
    }
  };

  // Helper for type icons and colors
  const getTypeBadge = (qrType: string) => {
    switch (qrType) {
      case 'url':
        return {
          label: 'URL',
          classes: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          )
        };
      case 'text':
        return {
          label: 'Text',
          classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          )
        };
      case 'email':
        return {
          label: 'Email',
          classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )
        };
      case 'wifi':
        return {
          label: 'Wi-Fi',
          classes: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01M5.283 13.576a9 9 0 0113.434 0M1.758 10.05a14.95 14.95 0 0120.484 0" />
            </svg>
          )
        };
      default:
        return {
          label: 'Other',
          classes: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh py-8 px-4 sm:px-6 lg:px-8">
      {/* Container */}
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-pink-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white m-0 flex items-center">
                QR <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent ml-1.5 font-extrabold">Studio</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Laravel-inspired Node MVC & React Integration</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-300">Backend Connected</span>
          </div>
        </header>

        {/* Toast notifications */}
        {successMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center bg-slate-800/95 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-in">
            <svg className="w-5 h-5 mr-2.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3.5 rounded-xl shadow-lg flex items-start space-x-3 backdrop-blur-sm">
            <svg className="w-5.5 h-5.5 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-rose-200">System Warning</p>
              <p className="text-xs text-rose-300/90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Main Interface Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Column Left: Input Form */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl shadow-xl backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center">
              Create QR Code
            </h2>
            <p className="text-xs text-slate-400 mb-6">Input details and generate a high-quality vector-aligned QR Code</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* QR Title */}
              <div>
                <label htmlFor="title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  QR Label / Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. My Agency Portfolio, Guest Wi-Fi"
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  required
                />
              </div>

              {/* QR Type Selector Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  QR Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'url', label: 'URL', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101' },
                    { id: 'text', label: 'Text', icon: 'M4 6h16M4 12h16M4 18h7' },
                    { id: 'email', label: 'Email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8' },
                    { id: 'wifi', label: 'Wi-Fi', icon: 'M8.111 16.404a5.5 5.5 0 017.778 0' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setType(btn.id)}
                      className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                        type === btn.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-inner'
                          : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={btn.icon} />
                      </svg>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Content Input */}
              <div>
                <label htmlFor="content" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  {type === 'url' ? 'Target URL' : type === 'email' ? 'Email Address' : type === 'wifi' ? 'Wi-Fi Credentials' : 'Text Content'}
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    type === 'url'
                      ? 'https://example.com'
                      : type === 'email'
                      ? 'hello@example.com'
                      : type === 'wifi'
                      ? 'WIFI:S:MyNetwork;T:WPA;P:MyPassword;;'
                      : 'Enter text here...'
                  }
                  rows={4}
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 active:scale-[0.99] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating on Server...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Generate & Save to Database
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Column Right: Active QR Code Preview */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl shadow-xl backdrop-blur-md flex-1 flex flex-col justify-between">
              
              <div>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center">
                  Live Preview
                </h2>
                <p className="text-xs text-slate-400 mb-6">Generated QR details and high-resolution renderer</p>
              </div>

              {activeQR ? (
                <div className="flex-1 flex flex-col items-center justify-center py-4 space-y-6">
                  
                  {/* QR Image Frame */}
                  <div className="p-4 bg-white rounded-2xl shadow-inner shadow-black border border-slate-100 flex items-center justify-center transition-all duration-300 hover:scale-[1.02]">
                    <img
                      src={activeQR.qr_image}
                      alt={activeQR.title}
                      className="w-48 h-48 sm:w-56 sm:h-56"
                    />
                  </div>

                  {/* QR Metadata */}
                  <div className="w-full text-center space-y-2 px-4">
                    <div className="flex items-center justify-center">
                      <span className="text-md font-bold text-white truncate max-w-[250px]">
                        {activeQR.title}
                      </span>
                      <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${getTypeBadge(activeQR.type).classes} flex items-center`}>
                        {getTypeBadge(activeQR.type).icon}
                        {getTypeBadge(activeQR.type).label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-mono break-all line-clamp-2 max-w-sm mx-auto px-4 bg-slate-950/40 py-2 rounded-lg border border-slate-800/50">
                      {activeQR.content}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                    <button
                      onClick={() => handleDownload(activeQR.qr_image, activeQR.title)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 hover:border-slate-600 transition-all active:scale-[0.98]"
                    >
                      <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PNG
                    </button>
                    
                    <button
                      onClick={() => copyToClipboard(activeQR.content)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 hover:border-slate-600 transition-all active:scale-[0.98]"
                    >
                      <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy Value
                    </button>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-center mb-4 text-slate-500 animate-pulse">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-300">No QR Code Selected</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Create a new QR code using the form, or select a card from your database history below.
                  </p>
                </div>
              )}

            </div>
          </div>

        </main>

        {/* QR Code History Section */}
        <section className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/85">
            <div>
              <h2 className="text-lg font-bold text-white m-0">
                Database History
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Persisted list of generated codes from MySQL</p>
            </div>
            <button
              onClick={loadHistory}
              className="flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all border border-slate-700 cursor-pointer"
              title="Reload from Database"
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 4.757L19.743 6.22" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs text-slate-500 mt-3 font-semibold">Reading from MySQL...</span>
            </div>
          ) : qrList.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-slate-400">History is Empty</p>
              <p className="text-xs text-slate-500 mt-1">Generate your first QR code to populate the database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {qrList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveQR(item)}
                  className={`bg-slate-950/40 border p-4.5 rounded-xl transition-all cursor-pointer group flex space-x-3.5 ${
                    activeQR?.id === item.id
                      ? 'border-indigo-500/80 bg-indigo-500/5 shadow-inner'
                      : 'border-slate-800/85 hover:border-slate-700/80 hover:bg-slate-900/30'
                  }`}
                >
                  {/* Minified Image Wrapper */}
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shrink-0 border border-slate-100 p-1 group-hover:scale-[1.03] transition-all">
                    <img
                      src={item.qr_image}
                      alt={item.title}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white truncate max-w-[120px] group-hover:text-indigo-300 transition-all m-0">
                          {item.title}
                        </h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${getTypeBadge(item.type).classes} scale-95`}>
                          {getTypeBadge(item.type).label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-[150px] font-mono mt-1 mb-0">
                        {item.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>

                      {/* Small Actions */}
                      <div className="flex items-center space-x-1.5 opacity-80 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item.qr_image, item.title);
                          }}
                          className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
                          title="Download PNG"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="p-1 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded border border-slate-800 hover:border-rose-500/20 cursor-pointer transition-all"
                          title="Delete from DB"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default App;

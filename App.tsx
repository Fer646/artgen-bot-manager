
import React, { useState } from 'react';
import { Tab } from './types';
import Dashboard from './components/Dashboard';
import ChatSimulator from './components/ChatSimulator';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);

  const navItems = [
    { id: Tab.Dashboard, label: 'Market', icon: 'fa-chart-line' },
    { id: Tab.Chat, label: 'Bot', icon: 'fa-comment-dots' },
    { id: Tab.Settings, label: 'Settings', icon: 'fa-cog' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc] pb-20 lg:pb-0">
      {/* Sidebar - Desktop & iPad Pro 13 */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <i className="fas fa-microscope text-xl"></i>
            </div>
            <div>
              <h1 className="font-bold text-slate-800 tracking-tight">Artgen Bot</h1>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Biotech Dashboard</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <i className={`fas ${item.icon} w-5 text-center ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`}></i>
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <a 
            href="https://artgen.ru/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Official Website</p>
            <p className="text-sm font-semibold text-indigo-600 group-hover:underline flex items-center justify-between">
              artgen.ru
              <i className="fas fa-external-link-alt text-[10px]"></i>
            </p>
          </a>
          
          <div className="bg-slate-900 rounded-2xl p-4 text-white">
            <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-tighter">Bot Core Status</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold tracking-tight">Online</span>
            </div>
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/150?u=1" className="w-8 h-8 rounded-full border-2 border-slate-900" alt="user" />
              <img src="https://i.pravatar.cc/150?u=2" className="w-8 h-8 rounded-full border-2 border-slate-900" alt="user" />
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold border-2 border-slate-900">+12</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header (iPhone 15/17) */}
      <header className="lg:hidden bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-microscope text-sm"></i>
            </div>
            <span className="font-bold text-slate-800">Artgen Bot</span>
        </div>
        <a href="https://artgen.ru/" target="_blank" className="text-indigo-600 text-xs font-bold border border-indigo-100 px-3 py-1 rounded-full">artgen.ru</a>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto max-w-[1600px] mx-auto w-full p-4 md:p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              {activeTab === Tab.Dashboard ? 'Stock Metrics' : activeTab === Tab.Chat ? 'Bot Terminal' : 'Configuration'}
            </h2>
            <p className="text-slate-500 text-sm">Real-time surveillance for ABIO stock</p>
          </div>
          <div className="flex items-center gap-2">
             <button className="bg-white p-2 md:px-4 md:py-2 rounded-xl text-sm font-semibold text-slate-600 border shadow-sm hover:bg-slate-50 transition-all">
              <i className="fas fa-calendar-alt md:mr-2"></i>
              <span className="hidden md:inline">Last Week</span>
            </button>
            <button className="bg-indigo-600 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
              <i className="fas fa-sync-alt"></i>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        <div className="pb-10 lg:pb-0">
          {activeTab === Tab.Dashboard && <Dashboard />}
          {activeTab === Tab.Chat && <ChatSimulator />}
          {activeTab === Tab.Settings && (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 max-w-2xl">
              <h3 className="text-xl font-bold mb-6">Bot Configuration</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Telegram Bot Integration</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="password" 
                      readOnly 
                      value="5563336257:AAH9AMlx6Y2vWCsJGzUEmXyKGZ3DaEZw62A"
                      className="flex-1 bg-slate-50 border rounded-xl px-4 py-3 text-sm font-mono text-slate-500"
                    />
                    <button className="px-6 py-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 font-bold transition-all text-sm">
                      COPY TOKEN
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Primary Asset</label>
                  <input 
                    type="text" 
                    defaultValue="ABIO (Artgen)"
                    disabled
                    className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold text-slate-600"
                  />
                </div>
                <div className="pt-4 border-t flex gap-3">
                  <button className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                    SAVE CHANGES
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modern Bottom Navigation (iPhone Optimization) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 py-3 flex items-center justify-around z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] pb-safe">
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <div className={`w-12 h-8 flex items-center justify-center rounded-full transition-colors ${activeTab === item.id ? 'bg-indigo-100' : ''}`}>
              <i className={`fas ${item.icon} text-lg`}></i>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;


import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { fetchArtgenPrice } from '../services/moexService';

const ChatSimulator: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Greetings. I am the Artgen Corporate Assistant. How can I help you today with ABIO analysis?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const quickActions = [
    { label: '/price', cmd: '/price' },
    { label: 'Pipeline', cmd: 'What is the current drug pipeline?' },
    { label: 'Investors', cmd: 'Latest investor news' }
  ];

  const processCommand = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const command = text.toLowerCase().trim();
    let botResponse = '';

    try {
      if (command.includes('/price')) {
        const p = await fetchArtgenPrice();
        botResponse = `📈 **ABIO (Artgen) Quote Update**\n\nPrice: ${p.price} RUB\nChange: ${p.changePercent}%\nVolume: ${p.volume.toLocaleString()}\n\nFull financial disclosure available at artgen.ru/investors/raskrytie-informaczii/`;
 } else {
  // Делаем запрос к нашей новой серверной функции
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: text }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  botResponse = data.text;
}
    } catch (err) {
      botResponse = "Connection to MOEX/Gemini interrupted. Please try again.";
    }

    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    }]);
    setIsTyping(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processCommand(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[65vh] lg:h-[700px] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <i className="fas fa-robot text-sm"></i>
          </div>
          <div>
            <h4 className="font-bold text-sm">Artgen Bot Core</h4>
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Secure Channel</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              m.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg' 
                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
              <div className={`text-[9px] mt-2 opacity-60 text-right`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white border p-3 rounded-2xl rounded-tl-none flex gap-1">
               <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce"></div>
               <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
               <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
             </div>
           </div>
        )}
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t bg-white">
        {quickActions.map((action, i) => (
          <button 
            key={i}
            onClick={() => processCommand(action.cmd)}
            className="whitespace-nowrap px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-transparent hover:border-indigo-100"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Inquire about Artgen..."
          className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
        <button 
          type="submit"
          className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-transform active:scale-95 shadow-lg shadow-indigo-100"
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      </form>
    </div>
  );
};

export default ChatSimulator;

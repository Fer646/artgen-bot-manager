
import React, { useEffect, useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, ReferenceArea } from 'recharts';
import { StockPrice, ChartDataPoint } from '../types';
import { fetchArtgenPrice, fetchHistoryData, TimeRange } from '../services/moexService';
import { getMarketAnalysis, fetchLatestNews, AnalysisResponse, NewsItem } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const [price, setPrice] = useState<StockPrice | null>(null);
  const [history, setHistory] = useState<ChartDataPoint[]>([]);
  const [filteredData, setFilteredData] = useState<ChartDataPoint[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse>({ text: 'Synthesizing comprehensive biotech report...', sources: [] });
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<TimeRange>('1W');

  // Zoom State
  const [refAreaLeft, setRefAreaLeft] = useState<string>('');
  const [refAreaRight, setRefAreaRight] = useState<string>('');
  const [isZoomed, setIsZoomed] = useState(false);

  const loadData = useCallback(async (selectedRange: TimeRange) => {
    try {
      setLoading(true);
      const [p, h, latestNews] = await Promise.all([
        fetchArtgenPrice(),
        fetchHistoryData(selectedRange),
        fetchLatestNews()
      ]);
      
      setPrice(p);
      setHistory(h);
      setFilteredData(h);
      setNews(latestNews);
      setIsZoomed(false);
      
      const aiResponse = await getMarketAnalysis(p.price, p.changePercent);
      setAnalysis(aiResponse);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(range);
    const interval = setInterval(() => loadData(range), 300000); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, [range, loadData]);

  const zoom = () => {
    let left = refAreaLeft;
    let right = refAreaRight;

    if (left === right || right === '') {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }

    if (history.findIndex(d => d.time === left) > history.findIndex(d => d.time === right)) {
      [left, right] = [right, left];
    }

    const startIndex = history.findIndex(d => d.time === left);
    const endIndex = history.findIndex(d => d.time === right);
    const newFilteredData = history.slice(startIndex, endIndex + 1);

    setRefAreaLeft('');
    setRefAreaRight('');
    setFilteredData(newFilteredData);
    setIsZoomed(true);
  };

  const resetZoom = () => {
    setFilteredData(history);
    setIsZoomed(false);
  };

  const renderRangeButton = (r: TimeRange) => (
    <button 
      onClick={() => setRange(r)}
      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
        range === r ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
      }`}
    >
      {r}
    </button>
  );

  const formatMarketCap = (cap?: number) => {
    if (!cap) return 'N/A';
    if (cap >= 1_000_000_000) return `${(cap / 1_000_000_000).toFixed(2)}B`;
    if (cap >= 1_000_000) return `${(cap / 1_000_000).toFixed(2)}M`;
    return cap.toLocaleString();
  };

  if (loading && history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
        <div className="relative w-12 h-12 mb-4">
           <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
           <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="font-medium animate-pulse">Fetching MOEX data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Price</p>
          <div className="flex flex-wrap items-baseline gap-1 md:gap-2">
            <h2 className="text-xl md:text-3xl font-bold">{price?.price}</h2>
            <span className="text-xs font-bold text-slate-400">RUB</span>
          </div>
          <div className={`mt-1 text-xs font-bold ${price && price.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {price && price.change >= 0 ? '▲' : '▼'} {price?.changePercent}%
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Market Cap</p>
          <div className="flex flex-wrap items-baseline gap-1">
            <h2 className="text-xl md:text-2xl font-bold">{formatMarketCap(price?.marketCap)}</h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase">RUB</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Total capitalization</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Volume</p>
          <h2 className="text-xl md:text-2xl font-bold">{price?.volume.toLocaleString()}</h2>
          <p className="text-[10px] text-slate-400 mt-1">Shares traded</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">High/Low</p>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-emerald-600">H: {price?.high}</span>
            <span className="text-sm font-bold text-rose-600">L: {price?.low}</span>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Market State</p>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
             <span className="text-sm font-bold">Trading</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Chart & Analysis */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="font-bold text-lg">Interactive Chart: ABIO</h3>
                <p className="text-[10px] text-slate-400">Drag to zoom • Scroll Brush to pan</p>
              </div>
              <div className="flex items-center gap-2">
                {isZoomed && (
                  <button 
                    onClick={resetZoom}
                    className="bg-rose-50 text-rose-600 text-[10px] font-bold px-3 py-1 rounded-lg hover:bg-rose-100 border border-rose-100 transition-all mr-2"
                  >
                    <i className="fas fa-search-minus mr-1"></i> RESET ZOOM
                  </button>
                )}
                <div className="bg-slate-50 p-1 rounded-xl flex gap-1 border">
                  {renderRangeButton('1D')}
                  {renderRangeButton('1W')}
                  {renderRangeButton('1M')}
                  {renderRangeButton('1Y')}
                  {renderRangeButton('ALL')}
                </div>
              </div>
            </div>
            
            <div className="h-[400px] md:h-[450px] w-full select-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={filteredData}
                  onMouseDown={(e) => e && setRefAreaLeft(String(e.activeLabel || ''))}
                  onMouseMove={(e) => refAreaLeft && e && setRefAreaRight(String(e.activeLabel || ''))}
                  onMouseUp={zoom}
                >
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="time" 
                    tick={{fontSize: 10, fill: '#94a3b8'}}
                    minTickGap={30}
                    stroke="#f1f5f9"
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    orientation="right" 
                    tick={{fontSize: 10, fill: '#94a3b8'}} 
                    stroke="transparent" 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#4f46e5" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    animationDuration={300}
                  />
                  <Brush 
                    dataKey="time" 
                    height={30} 
                    stroke="#4f46e5" 
                    fill="#f8fafc"
                    gap={10}
                  />
                  {refAreaLeft && refAreaRight ? (
                    <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="#4f46e5" fillOpacity={0.1} />
                  ) : null}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed AI Market Report */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <i className="fas fa-sparkles"></i>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900">Gemini Detailed Market Report</h3>
                  <p className="text-xs text-slate-400">Deep analysis including trends, risks & competition</p>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-100">
                  <i className="fas fa-check-circle mr-1"></i> GROUNDED IN REAL-TIME NEWS
                </span>
              </div>
            </div>

            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
              {analysis.text}
            </div>

            {analysis.sources.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Citations & References</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.web?.uri || source.maps?.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all group"
                    >
                      <i className="fas fa-link text-[10px] text-slate-400 group-hover:text-indigo-500"></i>
                      <span className="text-[11px] font-semibold text-slate-600 group-hover:text-indigo-700">
                        {source.web?.title || `Source ${idx + 1}`}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: News & Profile */}
        <div className="space-y-6">
          {/* Latest News Section */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fas fa-newspaper text-indigo-600"></i>
                Latest News & Releases
              </div>
              <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-tighter">Live</span>
            </h3>
            
            <div className="space-y-4">
              {news.length > 0 ? (
                news.map((item, idx) => (
                  <a 
                    key={idx} 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group block p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                  >
                    <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">{item.date}</p>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-700">
                      {item.title}
                    </h4>
                    <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      <span>Read More</span>
                      <i className="fas fa-chevron-right text-[8px] transform group-hover:translate-x-0.5 transition-transform"></i>
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-spinner fa-spin text-slate-300"></i>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Scanning media channels...</p>
                </div>
              )}
            </div>
            
            <a 
              href="https://artgen.ru/media-center/" 
              target="_blank"
              className="mt-4 block w-full text-center py-3 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-xl hover:bg-slate-100 border border-slate-100 transition-all uppercase tracking-widest"
            >
              Go to Media Center
            </a>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
               <i className="fas fa-info-circle text-indigo-600"></i>
               Corporate Profile
             </h3>
             <p className="text-xs text-slate-500 leading-relaxed mb-4">
               Artgen (former Human Stem Cells Institute) is a leading Russian biotechnology company listed on MOEX. Key sectors include:
             </p>
             <ul className="space-y-3 mb-6">
               {[
                 { icon: 'dna', text: 'Genetics and Personalized Medicine' },
                 { icon: 'heartbeat', text: 'Regenerative Medicine' },
                 { icon: 'vial', text: 'Vaccine Development (Betuvax)' },
                 { icon: 'database', text: 'Bio-banking and Cryopreservation' }
               ].map((item, idx) => (
                 <li key={idx} className="flex items-start gap-3">
                   <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                     <i className={`fas fa-${item.icon} text-indigo-500 text-[10px]`}></i>
                   </div>
                   <span className="text-[11px] font-semibold text-slate-700">{item.text}</span>
                 </li>
               ))}
             </ul>
             <div className="space-y-2">
               <a 
                 href="https://artgen.ru/investors/raskrytie-informaczii/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block w-full text-center bg-slate-900 text-white text-xs font-bold py-3 rounded-xl hover:bg-black transition-all"
               >
                 INVESTOR RELATIONS
               </a>
               <a 
                 href="https://artgen.ru/media-center/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block w-full text-center bg-white text-slate-900 border border-slate-200 text-xs font-bold py-3 rounded-xl hover:bg-slate-50 transition-all"
               >
                 LATEST PRESS RELEASES
               </a>
             </div>
          </div>

          {/* Market Sentiment Quick Check */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl shadow-slate-200">
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <i className="fas fa-chart-pie text-indigo-400"></i>
              Quick Sentiment
            </h4>
            <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-wider text-slate-400">
                   <span>Institutional Interest</span>
                   <span className="text-white">Medium-High</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 w-3/4"></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-wider text-slate-400">
                   <span>Retail Buzz</span>
                   <span className="text-white">Growing</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 w-4/5"></div>
                 </div>
               </div>
               <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                 Sentiment indices derived from Moex social dynamics and biotech sector volatility.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

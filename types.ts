
export interface StockPrice {
  price: number;
  change: number;
  changePercent: number;
  lastUpdate: string;
  volume: number;
  high: number;
  low: number;
  marketCap?: number;
}

export interface ChartDataPoint {
  time: string;
  price: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export enum Tab {
  Dashboard = 'dashboard',
  Chat = 'chat',
  Settings = 'settings'
}

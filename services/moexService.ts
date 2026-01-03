
import { StockPrice, ChartDataPoint } from '../types';

const TICKER = 'ABIO'; // Artgen Ticker

export const fetchArtgenPrice = async (): Promise<StockPrice> => {
  try {
    const response = await fetch(`https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities/${TICKER}.json`);
    const data = await response.json();
    
    const marketData = data.marketdata.data;
    const lastRow = marketData[0];
    const lastPrice = lastRow[12] || lastRow[30] || 0;
    const change = lastRow[25] || 0;
    const changePct = lastRow[26] || 0;
    const volume = lastRow[37] || 0;
    const high = lastRow[10] || 0;
    const low = lastRow[11] || 0;

    // Capitalization is often available in the securities block or marketdata block.
    // In TQBR, ISSUECAPITALIZATION is usually column 45 in marketdata or available in the specific securities table.
    // Let's try to find 'ISSUECAPITALIZATION' column index
    const mktColumns = data.marketdata.columns;
    const capIndex = mktColumns.indexOf('ISSUECAPITALIZATION');
    const marketCap = capIndex !== -1 ? lastRow[capIndex] : undefined;

    return {
      price: lastPrice,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePct.toFixed(2)),
      lastUpdate: new Date().toLocaleTimeString(),
      volume: volume,
      high: high,
      low: low,
      marketCap: marketCap ? parseFloat(marketCap) : undefined
    };
  } catch (error) {
    console.error('Error fetching MOEX data:', error);
    throw error;
  }
};

export type TimeRange = '1D' | '1W' | '1M' | '1Y' | 'ALL';

export const fetchHistoryData = async (range: TimeRange = '1D'): Promise<ChartDataPoint[]> => {
  try {
    let interval = '60'; // default 1 hour
    let daysBack = 7;

    switch (range) {
      case '1D':
        interval = '10'; // 10 minutes
        daysBack = 1;
        break;
      case '1W':
        interval = '60'; // 1 hour
        daysBack = 7;
        break;
      case '1M':
        interval = '60'; // 1 hour
        daysBack = 30;
        break;
      case '1Y':
        interval = '24'; // 1 day
        daysBack = 365;
        break;
      case 'ALL':
        interval = '24';
        daysBack = 365 * 5;
        break;
    }

    const fromDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const url = `https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities/${TICKER}/candles.json?from=${fromDate}&interval=${interval}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    const candles = data.candles.data;
    return candles.map((c: any) => {
      const date = new Date(c[6]);
      let timeLabel = '';
      
      if (range === '1D') {
        timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (range === '1Y' || range === 'ALL') {
        timeLabel = date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      } else {
        timeLabel = date.toLocaleDateString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      }

      return {
        time: timeLabel,
        price: c[1] // close price
      };
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
};

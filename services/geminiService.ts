import { GoogleGenAI } from "@google/genai";

// 1. Актуальные финансовые показатели из отчета РСБУ (9 месяцев 2025)
const ABIO_FINANCIALS_2025 = {
  period: "9 месяцев 2025 г. (РСБУ)",
  revenue: "290.5 млн руб. (рост в 2.5 раза год к году)",
  operatingProfit: "197.2 млн руб. (против убытка 19.7 млн руб. в 2024)",
  netProfit: "266.4 млн руб.",
  cashOnBalance: "3.2 млн руб.",
  keyNote: "Компания вышла на операционную прибыльность. Наблюдается значительный рост инвестиций в финансовые вложения (строка 1170)."
};

// 2. Единая системная инструкция для ИИ
const SYSTEM_INSTRUCTION = `You are the lead financial and scientific analyst for Artgen (ABIO), a major Russian biotechnology company listed on the Moscow Exchange. 
Your expertise covers:
1. Regenerative medicine (Neovasculgen).
2. Genetics and genetic testing.
3. Bio-banking.
4. Vaccine development (Betuvax).

When analyzing Artgen, provide a structured report that covers:
- **Biotech Trends**: How Artgen aligns with current global and local biotech innovations.
- **Competitive Landscape**: Artgen's position compared to peers in the Russian and international markets.
- **Potential Risks**: Market volatility, regulatory hurdles, or clinical trial risks.
- **Strategic Outlook**: Future growth potential.

Always refer to the official website https://artgen.ru/ and recent financial reports. 
Keep the tone professional, objective, and deeply analytical. Use Markdown for formatting.

ОФИЦИАЛЬНЫЕ ПОКАЗАТЕЛИ (РСБУ 9М 2025):
- Период: ${ABIO_FINANCIALS_2025.period}
- Выручка: ${ABIO_FINANCIALS_2025.revenue}
- Прибыль от продаж: ${ABIO_FINANCIALS_2025.operatingProfit}
- Чистая прибыль: ${ABIO_FINANCIALS_2025.netProfit}
- Денежные средства: ${ABIO_FINANCIALS_2025.cashOnBalance}
- Важное примечание: ${ABIO_FINANCIALS_2025.keyNote}`;

export interface AnalysisResponse {
  text: string;
  sources: any[];
}

export interface NewsItem {
  title: string;
  url: string;
  date: string;
  snippet: string;
}

// Заменяем process.env.API_KEY на специальный формат Vite
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const getMarketAnalysis = async (stockPrice: number, change: number): Promise<AnalysisResponse> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Provide a comprehensive market analysis for Artgen (ABIO). 
Current Quote: ${stockPrice} RUB (${change}% change). 
Include details on:
1. Specific biotech trends affecting Artgen.
2. The competitive landscape in the Russian pharmaceutical sector.
3. Potential operational and market risks.
4. References to recent news, reports, or corporate developments.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      }
    });
    
    return {
      text: response.text || "Analysis currently unavailable.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error('Gemini error:', error);
    return {
      text: `Market analysis engine encountered an error. Current quote: ${stockPrice} RUB. Please review the latest documents on artgen.ru.`,
      sources: []
    };
  }
};

export const fetchLatestNews = async (): Promise<NewsItem[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Find the latest news, press releases, and corporate announcements for Artgen (ABIO) from artgen.ru and financial news outlets. List the top 5 most recent items with titles and dates.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a news aggregator for Artgen (ABIO). Focus on accuracy and recent dates.",
        tools: [{ googleSearch: {} }],
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const news: NewsItem[] = chunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web.title,
        url: chunk.web.uri,
        date: "Recent",
        snippet: ""
      }))
      .slice(0, 5);

    return news;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

export const getSearchGroundedInfo = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for the latest corporate news or financial reports from Artgen (ABIO) regarding: ${query}. Use artgen.ru as a primary source reference.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    
    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, sources };
  } catch (error) {
    console.error('Search grounding error:', error);
    return { text: "Search currently unavailable. Please check artgen.ru directly.", sources: [] };
  }
};
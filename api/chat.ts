import { GoogleGenerativeAI } from "@google/generative-ai";

// Наши актуальные данные для обучения модели
const ARTGEN_DATA_2025 = {
  company: "Артген биотех",
  period: "9 месяцев 2025 года (РСБУ)",
  revenue: "290.5 млн руб.",
  netProfit: "12.1 млн руб.",
  status: "Выход на прибыльность"
};

export default async function handler(req: any, res: any) {
  // На сервере Vercel мы используем process.env
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "API Key is missing on server" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-latest",
    systemInstruction: `Ты — эксперт по компании Артген. 
    Используй эти данные: ${JSON.stringify(ARTGEN_DATA_2025)}.
    Отвечай четко и по делу.`
  });

  try {
    const { message } = req.body;
    const result = await model.generateContent(message);
    const response = await result.response;
    
    // Возвращаем результат фронтенду
    return res.status(200).json({ text: response.text() });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: "Ошибка при запросе к ИИ" });
  }
}
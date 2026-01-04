import { GoogleGenerativeAI } from "@google/generative-ai";

// Данные компании для контекста ИИ
const ARTGEN_DATA_2025 = {
  company: "Артген биотех",
  period: "9 месяцев 2025 года (РСБУ)",
  revenue: "290.5 млн руб.",
  netProfit: "12.1 млн руб.",
  status: "Выход на прибыльность"
};

export default async function handler(req: any, res: any) {
  // 1. Проверяем наличие API ключа
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("Критическая ошибка: VITE_GEMINI_API_KEY не найден в переменных окружения.");
    return res.status(500).json({ error: "API Key is missing on server" });
  }

  // 2. Проверяем, пришло ли сообщение от пользователя
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Используем стандартное имя модели
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `Ты — эксперт по компании Артген. 
      Используй эти данные для ответов: ${JSON.stringify(ARTGEN_DATA_2025)}.
      Отвечай кратко, профессионально и только по делу.`
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    // Возвращаем успешный ответ
    return res.status(200).json({ text });

  } catch (error: any) {
    // Подробное логирование для отладки в Vercel
    console.error("Ошибка Google AI:", error.message || error);
    
    return res.status(500).json({ 
      error: "Ошибка при запросе к ИИ",
      details: error.message 
    });
  }
}
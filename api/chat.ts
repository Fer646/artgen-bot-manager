import { GoogleGenerativeAI } from "@google/generative-ai";

// 📊 Данные компании для контекста ИИ
const ARTGEN_DATA_2025 = {
  company: "Артген биотех",
  period: "9 месяцев 2025 года (РСБУ)",
  revenue: "290.5 млн руб.",
  netProfit: "12.1 млн руб.",
  status: "Выход на прибыльность"
};

export default async function handler(req: any, res: any) {
  // 1. 🛡️ Проверка метода запроса
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // 2. 🔑 Получение API ключа (поддержка разных имен переменных)
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("Ошибка: API ключ не найден в process.env");
    return res.status(500).json({ error: "API Key configuration missing on server" });
  }

  // 3. 💬 Проверка входящего сообщения
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message content is empty" });
  }

  try {
    // 1. Попробуем явно указать версию API v1 (стабильную)
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel(
  { 
    model: "gemini-1.5-flash",
    systemInstruction: {
      role: 'system',
      parts: [{ text: `Ты — эксперт по компании Артген. Используй эти данные: ${JSON.stringify(ARTGEN_DATA_2025)}. Отвечай кратко и профессионально.` }]
    }
  },
  { apiVersion: 'v1' }
);

    // 🧠 Генерация контента с системной инструкцией
    const result = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: message }] }]
});

    const response = await result.response;
    const text = response.text();
    
    // ✅ Успешный ответ
    return res.status(200).json({ text });

  } catch (error: any) {
  console.error("Gemini API Error:", error);
  
  // Проверяем, не лимит ли это
  if (error.message?.includes('429') || error.status === 429) {
    return res.status(429).json({ 
      error: "Слишком много запросов. Пожалуйста, подождите 1 минуту и попробуйте снова." 
    });
  }

  return res.status(500).json({ error: "Ошибка ИИ: " + error.message });
}
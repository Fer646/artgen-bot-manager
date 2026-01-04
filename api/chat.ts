import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';

const ARTGEN_DETAILS = `
ОТЧЕТНОСТЬ АРТГЕН (МСФО) за 9 месяцев 2025:
- Выручка: 290.5 млн руб. (+15% к прошлому году)
- Чистая прибыль: 12.1 млн руб.
- EBITDA: 45.2 млн руб.
- Долг/EBITDA: 1.2
- Основные проекты: Разработка генно-терапевтических препаратов, сеть генетических центров.
- Риски: Валютные колебания, регуляторные изменения.
`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const message = req.body?.message || "Привет";

  // Используем ваш рабочий прокси-порт 2080
  const proxyUrl = "http://127.0.0.1:2080"; 
  const agent = new HttpsProxyAgent(proxyUrl);

  // Используем точное имя из вашего списка CURL
  const modelName = "gemini-2.5-flash"; 

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    agent: agent,
    timeout: 30000
  };

  const payload = JSON.stringify({
  contents: [{ 
    parts: [{ 
      text: `
Ты — ведущий финансовый аналитик по биотехнологическому сектору. 
Твоя задача: анализировать данные компании "Артген" и отвечать на вопросы инвесторов.

ИНФОРМАЦИОННАЯ БАЗА:
${ARTGEN_DETAILS}

ПРАВИЛА ОТВЕТА:
1. Используй только предоставленные цифры.
2. Если данных нет, честно скажи: "В текущем отчете эта информация отсутствует".
3. Пиши профессионально, но понятно. Ссылайся на динамику (рост/падение).
4. Форматируй важные цифры **жирным шрифтом**.

ВОПРОС ПОЛЬЗОВАТЕЛЯ: 
${message}` 
    }] 
  }],
  generationConfig: {
    temperature: 0.2, // Низкая температура для точности цифр
    topP: 0.8
  }
});

contents: [
  { role: "user", parts: [{ text: "Какая выручка?" }] },
  { role: "model", parts: [{ text: "Выручка составила 290 млн руб." }] },
  { role: "user", parts: [{ text: "А прибыль?" }] } // Текущий вопрос
]

  return new Promise((resolve) => {
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (response.statusCode === 200) {
            // Успешный ответ от Gemini 2.0
            const aiText = json.candidates[0].content.parts[0].text;
            res.status(200).json({ text: aiText });
          } else {
            console.error(`📍 Google Error (${modelName}):`, json.error?.message || data);
            res.status(response.statusCode).json({ error: json.error?.message });
          }
        } catch (e) {
          res.status(500).json({ error: "Ошибка обработки ответа" });
        }
        resolve(true);
      });
    });

    request.on('error', (err) => {
      console.error("📍 Сетевая ошибка:", err.message);
      res.status(500).json({ error: "Ошибка соединения через прокси." });
      resolve(true);
    });

    request.write(payload);
    request.end();
  });
}
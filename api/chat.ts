import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("❌ API Key is missing in environment variables");
      return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });
    }

    // Инициализация Google AI SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Получаем последнее сообщение от пользователя
    const userPrompt = messages[messages.length - 1].content;

    // Генерируем ответ
    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ content: text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("📍 Google SDK Error:", error.message);
    return new Response(JSON.stringify({ 
      error: "Google SDK Error", 
      details: error.message 
    }), { status: 500 });
  }
}
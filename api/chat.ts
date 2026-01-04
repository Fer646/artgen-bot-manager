import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const body = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });

    // Принудительно устанавливаем версию v1 в настройках SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" },
      { apiVersion: 'v1' } // ЭТО КРИТИЧЕСКИ ВАЖНАЯ СТРОКА
    );

    const userPrompt = body.messages 
      ? body.messages[body.messages.length - 1].content 
      : (body.message || "Hello");

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ content: text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("📍 SDK Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
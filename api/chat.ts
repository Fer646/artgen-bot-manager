import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const body = await req.json();
    console.log("📍 Received body:", JSON.stringify(body)); // Увидим данные в логах Vercel

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });

    // ЗАЩИТА: Проверяем, есть ли сообщения и не пуст ли массив
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided in request" }), { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const userMessage = body.messages[body.messages.length - 1].content;
    const result = await model.generateContent(userMessage);
    const text = result.response.text();

    return new Response(JSON.stringify({ content: text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("📍 SDK Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
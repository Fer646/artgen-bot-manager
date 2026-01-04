import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const body = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });

    // АДАПТАЦИЯ ПОД ВАШ ФРОНТЕНД:
    // Берем текст из body.message (как пришло в логе) или из body.messages
    const userPrompt = body.message || (body.messages && body.messages[body.messages.length - 1].content);

    if (!userPrompt) {
      return new Response(JSON.stringify({ error: "No message found in request" }), { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();

    return new Response(JSON.stringify({ content: text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("📍 Final Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
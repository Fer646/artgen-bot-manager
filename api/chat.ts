import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    const { messages } = await req.json();
    // Используем переменную напрямую, чтобы исключить ошибки парсинга
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const userMessage = messages[messages.length - 1].content;
    const result = await model.generateContent(userMessage);
    
    return new Response(JSON.stringify({ content: result.response.text() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("📍 Final Attempt Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
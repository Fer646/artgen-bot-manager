// Принудительно задаем регион Сан-Франциско на уровне кода
export const config = { 
  runtime: 'edge',
  regions: ['sfo1'] 
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const body = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // Берем сообщение из вашего формата {"message": "привет"}
    const userPrompt = body.message || (body.messages && body.messages[body.messages.length - 1].content);

    if (!userPrompt) return new Response(JSON.stringify({ error: "No message found" }), { status: 400 });

    // Прямой запрос к v1beta — теперь с активным API в проекте это обязано работать
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ 
        error: data.error?.message || "Google API Error",
        region: "sfo1" 
      }), { status: response.status });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    return new Response(JSON.stringify({ content: aiText }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
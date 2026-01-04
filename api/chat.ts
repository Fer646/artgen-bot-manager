export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const body = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });

    // Извлекаем текст (поддержка обоих форматов)
    const userPrompt = body.message || (body.messages && body.messages[body.messages.length - 1].content);

    if (!userPrompt) {
      return new Response(JSON.stringify({ error: "No message found" }), { status: 400 });
    }

    // Прямой запрос к STABLE V1 API (минуя капризы SDK)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Google API Error");
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

    return new Response(JSON.stringify({ content: aiText }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("📍 Final Direct Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
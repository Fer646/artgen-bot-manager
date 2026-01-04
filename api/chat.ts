export const config = { 
  runtime: 'edge',
  regions: ['sfo1'] 
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const body = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // Поддержка вашего формата {"message": "привет"}
    const userPrompt = body.message || (body.messages && body.messages[body.messages.length - 1].content);

    if (!userPrompt) return new Response(JSON.stringify({ error: "No message found" }), { status: 400 });

    // ВНИМАНИЕ: Используем стабильную версию /v1/ вместо /v1beta/
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
      // Если снова будет 404, мы увидим подробности в логах
      console.error("📍 Google Error Details:", JSON.stringify(data));
      return new Response(JSON.stringify({ 
        error: data.error?.message || "Google API Error",
        status: response.status 
      }), { status: response.status });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

    return new Response(JSON.stringify({ content: aiText }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("📍 Critical Crash:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
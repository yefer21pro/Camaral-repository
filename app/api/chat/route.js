import fs from "fs";
import path from "path";

export async function POST(req) {
  const { messages, agent } = await req.json();

  const kbPath = path.join(process.cwd(), "data", "knowledge.md");
  const knowledge = fs.readFileSync(kbPath, "utf8");

  const systemText = `
Eres un asistente de Camaral. Responde SOLO usando la información del CONTEXTO.
Si no encuentras la respuesta en el contexto, dilo claramente y ofrece un siguiente paso.
Sé claro, breve y profesional.

Estilo del agente: ${agent || "Asistente Camaral"}

CONTEXTO:
${knowledge}
`.trim();

  const contents = (messages || []).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "x-goog-api-key": process.env.GEMINI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        role: "user",
        parts: [{ text: systemText }],
      },
      contents,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }

  const data = await resp.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
    "No pude generar respuesta.";

  return Response.json({ text });
}
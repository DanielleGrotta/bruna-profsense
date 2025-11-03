// POST /api/ideas  -> gera plano/ideias de aula
import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const body = req.body || (await readBody(req));
    const { tema = "", objetivos = "", conteudos = "", duracao = 50, turma = "" } = body;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Você é uma IA pedagógica. Gere um plano de aula curto e prático em JSON com:
{ "titulo", "objetivos", "atividades", "avaliacao", "materiais", "tags": [string] }.
Contexto: tema="${tema}", objetivos="${objetivos}", conteudos="${conteudos}", duracao=${duracao}, turma="${turma}".
Responda apenas JSON válido.
`;

    const rsp = await client.responses.create({ model: "gpt-5", input: prompt });
    const text = rsp.output_text || "{}";

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(text); // já é JSON puro
  } catch (err) {
    res.status(500).json({ error: "IA_ERROR", detail: String(err?.message || err) });
  }
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}
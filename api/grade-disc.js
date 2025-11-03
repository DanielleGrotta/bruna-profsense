// POST /api/grade-disc  -> corrige questões dissertativas com critérios
import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const body = req.body || (await readBody(req));
    const { pergunta = "", criterios = [], max = 10, respostas = [] } = body;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
Corrija respostas de alunos para: "${pergunta}".
Avalie presença dos critérios: ${criterios.join(", ")}.
Devolva JSON de [{nome, hits, nota, feedback}], onde:
- hits = qtd de critérios presentes
- nota = (hits / total_criterios) * ${max}, com 2 casas
- feedback curto mencionando faltas principais.
Responda apenas JSON.
Respostas: ${JSON.stringify(respostas)}
`;

    const rsp = await client.responses.create({ model: "gpt-5", input: prompt });
    const text = rsp.output_text || "[]";

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(text);
  } catch (err) {
    res.status(500).json({ error: "IA_ERROR", detail: String(err?.message || err) });
  }
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}
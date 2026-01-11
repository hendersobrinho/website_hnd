import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const buildPrompt = (message) => {
  return [
    "Gere 10 questoes educacionais em portugues do Brasil com base no pedido abaixo.",
    "Retorne em texto simples, com questoes numeradas e alternativas A-D.",
    "Depois, inclua uma secao chamada \"Gabarito\" com a resposta de cada questao.",
    "",
    `Pedido: ${message}`
  ].join("\n");
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo nao permitido." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY nao configurada." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (error) {
      return res.status(400).json({ error: "JSON invalido." });
    }
  }

  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) {
    return res.status(400).json({ error: "O campo message e obrigatorio." });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "Voce e um gerador de questoes educacionais. Responda em texto simples e direto."
        },
        {
          role: "user",
          content: buildPrompt(message)
        }
      ]
    });

    const text = completion.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return res.status(500).json({ error: "Resposta vazia da OpenAI." });
    }

    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({
      error: "Falha ao gerar resposta.",
      details: error.message
    });
  }
}

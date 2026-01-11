const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const rateLimits = new Map();

const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket?.remoteAddress || 'unknown';
};

const isRateLimited = (ip) => {
    const now = Date.now();
    const entry = rateLimits.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return false;
    }
    if (entry.count >= RATE_LIMIT_MAX) {
        return true;
    }
    entry.count += 1;
    return false;
};

const buildPrompt = ({ tema, nivel, materia, dificuldade }) => {
    const nivelText = nivel ? `Nivel: ${nivel}.` : 'Nivel nao informado; assuma nivel medio.';
    const materiaText = materia ? `Materia: ${materia}.` : '';
    const dificuldadeText = dificuldade ? `Dificuldade: ${dificuldade}.` : 'Dificuldade: medio.';

    return `Gere exatamente 10 questoes educacionais em portugues do Brasil sobre o tema informado. Se o tema for muito amplo, escolha um recorte comum e siga nele. ${nivelText} ${materiaText} ${dificuldadeText}`.trim();
};

const readJsonBody = (req) => new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
        return resolve(req.body);
    }
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        if (!body) {
            return resolve({});
        }
        try {
            resolve(JSON.parse(body));
        } catch (error) {
            reject(error);
        }
    });
});

const sendJson = (res, statusCode, payload) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(payload));
};

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return sendJson(res, 405, { message: 'Metodo nao permitido.' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return sendJson(res, 500, { message: 'OPENAI_API_KEY nao configurada.' });
    }

    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
        return sendJson(res, 429, { message: 'Limite de requisicoes atingido. Tente novamente em alguns minutos.' });
    }

    let payload;
    try {
        payload = await readJsonBody(req);
    } catch (error) {
        return sendJson(res, 400, { message: 'JSON invalido.' });
    }

    const tema = typeof payload.tema === 'string' ? payload.tema.trim() : '';
    const nivel = typeof payload.nivel === 'string' ? payload.nivel.trim() : '';
    const materia = typeof payload.materia === 'string' ? payload.materia.trim() : '';
    const dificuldade = typeof payload.dificuldade === 'string' ? payload.dificuldade.trim() : '';

    if (!tema) {
        return sendJson(res, 400, { message: 'O tema e obrigatorio.' });
    }
    if (tema.length > 200) {
        return sendJson(res, 400, { message: 'O tema deve ter no maximo 200 caracteres.' });
    }

    const systemPrompt = 'Voce e um gerador de questoes educacionais. Responda somente com JSON valido e sem markdown. Sempre retorne exatamente 10 questoes no schema combinado. Cada questao deve ter enunciado, alternativas A-D, gabarito, comentario curto e nivel de dificuldade.';

    const body = {
        model: 'gpt-4o-mini',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: `${buildPrompt({ tema, nivel, materia, dificuldade })}\n\nSchema esperado:\n{\n  "tema": "...",\n  "nivel": "...",\n  "dificuldade": "...",\n  "questoes": [\n    {\n      "numero": 1,\n      "enunciado": "...",\n      "alternativas": {"A": "...", "B": "...", "C": "...", "D": "..."},\n      "gabarito": "B",\n      "comentario": "...",\n      "dificuldade": "..."\n    }\n  ]\n}`
            }
        ]
    };

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const text = await response.text();
            return sendJson(res, 500, { message: `Erro na OpenAI: ${response.status} ${text}` });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            return sendJson(res, 500, { message: 'Resposta invalida da OpenAI.' });
        }

        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch (error) {
            return sendJson(res, 500, { message: 'A OpenAI retornou um JSON invalido.' });
        }

        return sendJson(res, 200, parsed);
    } catch (error) {
        return sendJson(res, 500, { message: 'Nao foi possivel gerar as questoes agora.' });
    }
};

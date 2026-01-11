const http = require('http');
const { readFile } = require('fs/promises');
const path = require('path');

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const rateLimits = new Map();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
let generationCount = 0;

const sendJson = (res, statusCode, payload) => {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify(payload));
};

const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'unknown';
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
    const nivelText = nivel ? `Nível: ${nivel}.` : 'Nível não informado; assuma nível médio.';
    const materiaText = materia ? `Matéria: ${materia}.` : '';
    const dificuldadeText = dificuldade ? `Dificuldade: ${dificuldade}.` : 'Dificuldade: médio.';

    return `Gere exatamente 10 questões educacionais em português do Brasil sobre o tema informado. Se o tema for muito amplo, escolha um recorte comum e siga nele. ${nivelText} ${materiaText} ${dificuldadeText}`.trim();
};

const requestOpenAI = async ({ tema, nivel, materia, dificuldade }) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const systemPrompt = `Você é um gerador de questões educacionais. Responda somente com JSON válido e sem markdown. Sempre retorne exatamente 10 questões no schema combinado. Cada questão deve ter enunciado, alternativas A-D, gabarito, comentário curto e nível de dificuldade.`;

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erro na OpenAI: ${response.status} ${text}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
        throw new Error('Resposta inválida da OpenAI.');
    }

    return JSON.parse(content);
};

const serveStatic = async (req, res) => {
    const urlPath = req.url === '/' ? '/index.html' : req.url;
    const filePath = path.join(__dirname, urlPath.split('?')[0]);

    try {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.json': 'application/json'
        }[ext] || 'application/octet-stream';

        const file = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(file);
    } catch (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Arquivo não encontrado.');
    }
};

const server = http.createServer(async (req, res) => {
    if (req.url?.startsWith('/api/questoes')) {
        if (req.method !== 'POST') {
            return sendJson(res, 405, { message: 'Método não permitido.' });
        }

        if (!OPENAI_API_KEY) {
            return sendJson(res, 500, { message: 'OPENAI_API_KEY não configurada.' });
        }

        const ip = getClientIp(req);
        if (isRateLimited(ip)) {
            return sendJson(res, 429, { message: 'Limite de requisições atingido. Tente novamente em alguns minutos.' });
        }

        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', async () => {
            try {
                const payload = JSON.parse(body || '{}');
                const tema = typeof payload.tema === 'string' ? payload.tema.trim() : '';
                const nivel = typeof payload.nivel === 'string' ? payload.nivel.trim() : '';
                const materia = typeof payload.materia === 'string' ? payload.materia.trim() : '';
                const dificuldade = typeof payload.dificuldade === 'string' ? payload.dificuldade.trim() : '';

                if (!tema) {
                    return sendJson(res, 400, { message: 'O tema é obrigatório.' });
                }
                if (tema.length > 200) {
                    return sendJson(res, 400, { message: 'O tema deve ter no máximo 200 caracteres.' });
                }

                const result = await requestOpenAI({ tema, nivel, materia, dificuldade });
                generationCount += 1;
                console.info(`QuestõesBR geradas: ${generationCount}`);

                return sendJson(res, 200, result);
            } catch (error) {
                const message = error.name === 'AbortError'
                    ? 'Tempo limite atingido ao gerar as questões.'
                    : 'Não foi possível gerar as questões agora.';

                console.error('Erro ao gerar questões:', error.message);
                return sendJson(res, 500, { message });
            }
        });

        return;
    }

    await serveStatic(req, res);
});

server.listen(PORT, () => {
    console.info(`Servidor rodando em http://localhost:${PORT}`);
});

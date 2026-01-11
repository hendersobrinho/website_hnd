const questoesForm = document.getElementById('questoesForm');
const chatMessages = document.getElementById('chatMessages');
const copiarJsonBtn = document.getElementById('copiarJsonBtn');
const gerarBtn = document.getElementById('gerarBtn');
const chatHint = document.getElementById('chatHint');

let lastJson = null;

const escapeHtml = (value) => {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
};

const appendMessage = (content, role = 'assistant') => {
    const message = document.createElement('div');
    message.className = `message ${role}`;
    message.innerHTML = content;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return message;
};

const renderQuestions = (data) => {
    const header = `
        <div class="message-header">
            <strong>Resultado: ${escapeHtml(data.tema || 'Tema')} (${escapeHtml(data.nivel || 'nivel não informado')})</strong>
            <span class="badge">Dificuldade: ${escapeHtml(data.dificuldade || 'médio')}</span>
        </div>
    `;

    const questions = data.questoes
        .map((q) => {
            const alternativas = Object.entries(q.alternativas || {})
                .map(([key, value]) => `<li><strong>${escapeHtml(key)}.</strong> ${escapeHtml(value)}</li>`)
                .join('');
            return `
                <li class="question-card">
                    <h4>Questão ${escapeHtml(String(q.numero))}</h4>
                    <p>${escapeHtml(q.enunciado || '')}</p>
                    <ul class="alternatives">${alternativas}</ul>
                    <p><strong>Gabarito:</strong> ${escapeHtml(q.gabarito || '')}</p>
                    <p class="comment"><strong>Comentário:</strong> ${escapeHtml(q.comentario || '')}</p>
                    <p class="difficulty">Nível: ${escapeHtml(q.dificuldade || data.dificuldade || 'médio')}</p>
                </li>
            `;
        })
        .join('');

    return `${header}<ol class="question-list">${questions}</ol>`;
};

const setLoading = (isLoading) => {
    gerarBtn.disabled = isLoading;
    gerarBtn.textContent = isLoading ? 'Gerando...' : 'Gerar 10 questões';
};

const handleCopy = async () => {
    if (!lastJson) return;
    try {
        await navigator.clipboard.writeText(lastJson);
        copiarJsonBtn.textContent = 'JSON copiado!';
        setTimeout(() => {
            copiarJsonBtn.textContent = 'Copiar JSON';
        }, 2000);
    } catch (error) {
        copiarJsonBtn.textContent = 'Não foi possível copiar';
    }
};

copiarJsonBtn.addEventListener('click', handleCopy);

appendMessage(
    '<p>Olá! Informe um tema e clique em <strong>Gerar 10 questões</strong>. Eu retorno um JSON pronto para você estudar.</p>',
    'assistant'
);

questoesForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const tema = document.getElementById('tema').value.trim();
    const nivel = document.getElementById('nivel').value;
    const materia = document.getElementById('materia').value;
    const dificuldade = document.getElementById('dificuldade').value;

    if (!tema) {
        chatHint.textContent = 'Por favor, informe um tema.';
        chatHint.classList.add('error');
        return;
    }

    chatHint.textContent = 'A resposta aparecerá no chat abaixo.';
    chatHint.classList.remove('error');

    appendMessage(`<p><strong>Pedido:</strong> ${escapeHtml(tema)}</p>`, 'user');
    const loadingMessage = appendMessage('<p>Gerando 10 questões...</p>', 'assistant');

    setLoading(true);
    copiarJsonBtn.disabled = true;

    try {
        const response = await fetch('/api/questoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tema,
                nivel,
                materia,
                dificuldade
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Não foi possível gerar as questões agora.');
        }

        lastJson = JSON.stringify(data, null, 2);
        loadingMessage.innerHTML = renderQuestions(data);
        copiarJsonBtn.disabled = false;
    } catch (error) {
        loadingMessage.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
    } finally {
        setLoading(false);
    }
});

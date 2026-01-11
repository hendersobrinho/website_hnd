const questoesForm = document.getElementById('questoesForm');
const chatMessages = document.getElementById('chatMessages');
const gerarBtn = document.getElementById('gerarBtn');
const chatHint = document.getElementById('chatHint');
const nivelToggle = document.getElementById('nivelToggle');
const nivelMenu = document.getElementById('nivelMenu');
const nivelSelected = document.getElementById('nivelSelected');
const nivelOptions = Array.from(document.querySelectorAll('.nivel-option'));

let selectedNivel = '';

const nivelLabels = {
    fundamental: 'Fundamental',
    medio: 'Medio',
    vestibular: 'Vestibular'
};

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
    const nivelValue = data.nivel || selectedNivel || 'automatico';
    const tema = data.tema || 'o tema informado';
    const intro = `
        <p>Perfeito! Aqui estao as questoes de ${escapeHtml(tema)} (${escapeHtml(nivelValue)}).</p>
    `;

    const questions = (data.questoes || [])
        .map((q) => {
            const alternativas = Object.entries(q.alternativas || {})
                .map(([key, value]) => `<li><strong>${escapeHtml(key)}.</strong> ${escapeHtml(value)}</li>`)
                .join('');
            return `
                <div class="question-item">
                    <p class="question-title">Questao ${escapeHtml(String(q.numero))}.</p>
                    <p>${escapeHtml(q.enunciado || '')}</p>
                    <ul class="alternatives">${alternativas}</ul>
                    <p class="comment"><strong>Comentario:</strong> ${escapeHtml(q.comentario || '')}</p>
                </div>
            `;
        })
        .join('');

    const gabaritoItems = (data.questoes || [])
        .map((q) => `<li><strong>${escapeHtml(String(q.numero))}.</strong> ${escapeHtml(q.gabarito || '')}</li>`)
        .join('');
    const gabarito = gabaritoItems
        ? `<div class="answer-block"><p class="answer-title">Gabarito</p><ul class="answer-list">${gabaritoItems}</ul></div>`
        : '';

    return `<div class="ai-answer">${intro}<div class="question-list">${questions}</div>${gabarito}</div>`;
};

const setLoading = (isLoading) => {
    gerarBtn.disabled = isLoading;
    gerarBtn.textContent = isLoading ? 'Enviando...' : 'Enviar';
};

const setNivel = (value) => {
    selectedNivel = value || '';
    const label = selectedNivel ? nivelLabels[selectedNivel] : 'automatico';
    nivelSelected.textContent = `Nivel: ${label}`;
    nivelOptions.forEach((option) => {
        option.classList.toggle('active', option.dataset.nivel === selectedNivel);
    });
};

const openNivelMenu = () => {
    nivelMenu.removeAttribute('hidden');
    nivelToggle.setAttribute('aria-expanded', 'true');
};

const closeNivelMenu = () => {
    nivelMenu.setAttribute('hidden', '');
    nivelToggle.setAttribute('aria-expanded', 'false');
};

nivelToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    if (nivelMenu.hasAttribute('hidden')) {
        openNivelMenu();
    } else {
        closeNivelMenu();
    }
});

nivelOptions.forEach((option) => {
    option.addEventListener('click', () => {
        setNivel(option.dataset.nivel);
        closeNivelMenu();
    });
});

document.addEventListener('click', (event) => {
    if (nivelMenu.hasAttribute('hidden')) return;
    if (!event.target.closest('.chat-composer')) {
        closeNivelMenu();
    }
});

appendMessage(
    '<p>Ola! Peca as questoes e escolha o nivel no botao Nivel. Eu respondo aqui mesmo no chat.</p>',
    'assistant'
);

questoesForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const tema = document.getElementById('tema').value.trim();

    if (!tema) {
        chatHint.textContent = 'Por favor, informe um pedido.';
        chatHint.classList.add('error');
        return;
    }

    chatHint.textContent = 'A resposta aparece no chat.';
    chatHint.classList.remove('error');

    const nivelLabel = selectedNivel ? nivelLabels[selectedNivel] : 'automatico';
    appendMessage(`<p><strong>Pedido:</strong> ${escapeHtml(tema)}<br><strong>Nivel:</strong> ${escapeHtml(nivelLabel)}</p>`, 'user');
    const loadingMessage = appendMessage('<p>Gerando questoes...</p>', 'assistant');

    setLoading(true);

    try {
        const response = await fetch('/api/questoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tema,
                nivel: selectedNivel
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Nao foi possivel gerar as questoes agora.');
        }

        loadingMessage.innerHTML = renderQuestions(data);
    } catch (error) {
        loadingMessage.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
    } finally {
        setLoading(false);
    }
});

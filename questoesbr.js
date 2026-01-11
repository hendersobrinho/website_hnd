const questoesForm = document.getElementById('questoesForm');
const chatMessages = document.getElementById('chatMessages');
const gerarBtn = document.getElementById('gerarBtn');
const chatHint = document.getElementById('chatHint');
const nivelToggle = document.getElementById('nivelToggle');
const nivelMenu = document.getElementById('nivelMenu');
const nivelSelected = document.getElementById('nivelSelected');
const nivelOptions = Array.from(document.querySelectorAll('.nivel-option'));

let selectedNivel = '';
let lastGabaritoText = '';

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

const splitGabarito = (text) => {
    const match = text.match(/(?:^|\n)gabarito\s*:\s*[\s\S]+/i);
    if (!match) {
        return { questionsText: text.trim(), gabaritoText: '' };
    }
    const gabaritoText = match[0].trim();
    const questionsText = text.replace(match[0], '').trim();
    return { questionsText, gabaritoText };
};

const renderAnswer = (text) => {
    return `<div class="ai-answer"><p>${escapeHtml(text).replace(/\n/g, '<br>')}</p></div>`;
};

const removeGabaritoButton = () => {
    const buttonMessage = chatMessages.querySelector('.message .btn-gabarito')?.closest('.message');
    if (buttonMessage) {
        buttonMessage.remove();
    }
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

chatMessages.addEventListener('click', (event) => {
    const button = event.target.closest('.btn-gabarito');
    if (!button || !lastGabaritoText) return;
    appendMessage(renderAnswer(lastGabaritoText), 'assistant');
    lastGabaritoText = '';
    button.closest('.message')?.remove();
});

questoesForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const tema = document.getElementById('tema').value.trim();

    if (!tema) {
        chatHint.textContent = 'Por favor, informe um pedido.';
        chatHint.classList.add('error');
        return;
    }

    chatHint.textContent = '';
    chatHint.classList.remove('error');

    const nivelLabel = selectedNivel ? nivelLabels[selectedNivel] : 'automatico';
    appendMessage(`<p><strong>Pedido:</strong> ${escapeHtml(tema)}<br><strong>Nivel:</strong> ${escapeHtml(nivelLabel)}</p>`, 'user');
    const loadingMessage = appendMessage('<p>Gerando questoes...</p>', 'assistant');

    setLoading(true);
    lastGabaritoText = '';
    removeGabaritoButton();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Tema: ${tema}. Nivel: ${nivelLabel}. Gere 10 questoes. Ao final, inclua a secao "Gabarito:" com as respostas. Nao mostre o gabarito junto das questoes.`
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Nao foi possivel gerar as questoes agora.');
        }

        const { questionsText, gabaritoText } = splitGabarito(data.text || '');
        loadingMessage.innerHTML = renderAnswer(questionsText || data.text || '');
        if (gabaritoText) {
            lastGabaritoText = gabaritoText;
            appendMessage('<div class="gabarito-action"><button type="button" class="btn-gabarito">Ver gabarito</button></div>', 'assistant');
        }
    } catch (error) {
        loadingMessage.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
    } finally {
        setLoading(false);
    }
});

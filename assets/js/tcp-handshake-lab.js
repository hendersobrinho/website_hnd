(function () {
    const STEPS = [
        {
            client: "CLOSED",
            server: "LISTEN",
            detail: "Nenhum segmento trafegou ainda.",
            explain:
                "O servidor está em LISTEN: de ouvido em pé na porta 8080, sem nenhuma conexão em andamento. O cliente está CLOSED, nenhum socket aberto, nenhuma intenção declarada. Pro sistema operacional, essas duas máquinas ainda nem sabem uma da outra."
        },
        {
            client: "SYN_SENT",
            server: "LISTEN",
            packetDir: "right",
            packetLabel: "SYN",
            detail: "SYN = 1 · seq = x",
            explain:
                "ConnectAsync dispara um segmento só com a flag SYN ligada, propondo um número de sequência inicial x escolhido de forma pseudoaleatória. O cliente já muda seu próprio estado para SYN_SENT — mas o servidor ainda nem sabe que esse pacote está a caminho."
        },
        {
            client: "SYN_SENT",
            server: "SYN_RCVD",
            packetDir: "left",
            packetLabel: "SYN-ACK",
            detail: "SYN = 1, ACK = 1 · seq = y · ack = x + 1",
            explain:
                "O servidor recebe o SYN, muda para SYN_RCVD e responde com um único segmento que faz duas coisas ao mesmo tempo: confirma o x do cliente (ack = x + 1) e propõe seu próprio número de sequência y."
        },
        {
            client: "ESTABLISHED",
            server: "ESTABLISHED",
            packetDir: "right",
            packetLabel: "ACK",
            detail: "ACK = 1 · ack = y + 1",
            explain:
                "O cliente confirma o y do servidor (ack = y + 1) e já considera a conexão ESTABLISHED antes mesmo desse ACK terminar de viajar — é por isso que ConnectAsync pode retornar e o cliente já mandar dado de aplicação em seguida. Quando o ACK chega, o servidor também vira ESTABLISHED: só agora, dos dois lados, existe de fato uma conexão pronta, e é o instante em que AcceptTcpClientAsync() retorna no TcpDemo."
        }
    ];

    const reduceMotion =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll(".handshake-lab").forEach((root, index) => {
        const titleId = `handshake-lab-title-${index + 1}`;

        root.setAttribute("aria-labelledby", titleId);
        root.innerHTML = `
            <span class="handshake-lab__eyebrow">Simulação interativa</span>
            <h3 id="${titleId}" class="handshake-lab__title">Veja o handshake acontecer, passo a passo</h3>
            <p class="handshake-lab__intro">Avance com os botões (ou clique num passo) e acompanhe os estados reais que o TCP usa por baixo dos panos em cada lado da conexão.</p>
            <div class="handshake-lab__stage">
                <div class="handshake-lab__node">
                    <span class="handshake-lab__node-name">Cliente</span>
                    <span class="handshake-lab__node-state" data-client-state>CLOSED</span>
                </div>
                <div class="handshake-lab__track">
                    <div class="handshake-lab__track-line"></div>
                    <div class="handshake-lab__packet" data-packet></div>
                </div>
                <div class="handshake-lab__node">
                    <span class="handshake-lab__node-name">Servidor</span>
                    <span class="handshake-lab__node-state" data-server-state>LISTEN</span>
                </div>
            </div>
            <p class="handshake-lab__detail" data-detail></p>
            <p class="handshake-lab__explain" data-explain aria-live="polite"></p>
            <div class="handshake-lab__controls">
                <button type="button" class="handshake-lab__button" data-action="prev">‹ Anterior</button>
                <div class="handshake-lab__dots" role="group" aria-label="Passos do handshake" data-dots></div>
                <button type="button" class="handshake-lab__button handshake-lab__button--primary" data-action="next">Próximo ›</button>
                <button type="button" class="handshake-lab__button" data-action="play">▶ Reproduzir</button>
            </div>
        `;

        const clientState = root.querySelector("[data-client-state]");
        const serverState = root.querySelector("[data-server-state]");
        const packet = root.querySelector("[data-packet]");
        const detailEl = root.querySelector("[data-detail]");
        const explainEl = root.querySelector("[data-explain]");
        const dotsEl = root.querySelector("[data-dots]");
        const prevBtn = root.querySelector('[data-action="prev"]');
        const nextBtn = root.querySelector('[data-action="next"]');
        const playBtn = root.querySelector('[data-action="play"]');

        dotsEl.innerHTML = STEPS.map(
            (_, stepIndex) =>
                `<button type="button" class="handshake-lab__dot" data-step="${stepIndex}" aria-label="Ir para o passo ${stepIndex}">${stepIndex}</button>`
        ).join("");

        const dots = Array.from(dotsEl.querySelectorAll("[data-step]"));

        let current = 0;
        let playTimer = null;

        function stopPlaying() {
            if (playTimer) {
                window.clearTimeout(playTimer);
                playTimer = null;
            }
            playBtn.textContent = "▶ Reproduzir";
        }

        function updateStates(step) {
            clientState.textContent = step.client;
            serverState.textContent = step.server;
            clientState.classList.toggle("is-established", step.client === "ESTABLISHED");
            serverState.classList.toggle("is-established", step.server === "ESTABLISHED");
        }

        function applyStep(stepIndex, animated) {
            const step = STEPS[stepIndex];
            current = stepIndex;

            dots.forEach((dot) => {
                dot.classList.toggle("is-active", Number(dot.dataset.step) === stepIndex);
            });
            prevBtn.disabled = stepIndex === 0;
            nextBtn.disabled = stepIndex === STEPS.length - 1;
            detailEl.textContent = step.detail;
            explainEl.textContent = step.explain;

            if (!step.packetDir) {
                packet.classList.remove("is-visible");
                updateStates(step);
                return;
            }

            const useAnimation = animated && !reduceMotion;
            const startLeft = step.packetDir === "right" ? "4%" : "96%";
            const endLeft = step.packetDir === "right" ? "96%" : "4%";
            packet.textContent = step.packetLabel;

            if (useAnimation) {
                packet.classList.add("no-transition");
                packet.style.left = startLeft;
                packet.classList.add("is-visible");
                void packet.offsetWidth;
                packet.classList.remove("no-transition");
                requestAnimationFrame(() => {
                    packet.style.left = endLeft;
                });
                window.setTimeout(() => updateStates(step), 700);
            } else {
                packet.classList.add("no-transition");
                packet.style.left = endLeft;
                packet.classList.add("is-visible");
                updateStates(step);
                void packet.offsetWidth;
                packet.classList.remove("no-transition");
            }
        }

        function stepForward() {
            if (current >= STEPS.length - 1) {
                stopPlaying();
                return;
            }
            applyStep(current + 1, true);
            playTimer = window.setTimeout(stepForward, 1700);
        }

        prevBtn.addEventListener("click", () => {
            stopPlaying();
            if (current > 0) applyStep(current - 1, false);
        });

        nextBtn.addEventListener("click", () => {
            stopPlaying();
            if (current < STEPS.length - 1) applyStep(current + 1, true);
        });

        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                stopPlaying();
                const target = Number(dot.dataset.step);
                applyStep(target, target === current + 1);
            });
        });

        playBtn.addEventListener("click", () => {
            if (playTimer) {
                stopPlaying();
                return;
            }
            if (current >= STEPS.length - 1) {
                applyStep(0, false);
            }
            playBtn.textContent = "❚❚ Pausar";
            playTimer = window.setTimeout(stepForward, 500);
        });

        applyStep(0, false);
    });
}());

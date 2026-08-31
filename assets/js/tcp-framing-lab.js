(function () {
    const WORD = ["O", "I", "T", "U", "D", "O"];
    const CORRECT_CUT = 2;

    const VERDICTS = {
        1: 'Vira "O" e "ITUDO". Não parece nada com o que o cliente mandou.',
        2: 'Essa divisão até bate com a intenção real do cliente. Mas olhando só pros bytes crus, como você saberia com certeza?',
        3: 'Vira "OIT" e "UDO". Não quer dizer nada, mas é um corte tão válido quanto qualquer outro pra quem só vê bytes.',
        4: 'Vira "OITU" e "DO". De novo, nada que faça sentido.',
        5: 'Vira "OITUD" e "O". Também não ajuda muito.'
    };

    const TAPE_B = [
        { header: true, label: "2" },
        { header: false, label: "O" },
        { header: false, label: "I" },
        { header: true, label: "4" },
        { header: false, label: "T" },
        { header: false, label: "U" },
        { header: false, label: "D" },
        { header: false, label: "O" }
    ];

    const STEPS_B = [
        { highlight: [], text: 'Clique em "Próximo" para ver o servidor lendo essa fita, célula por célula.' },
        {
            highlight: [0],
            text: "Lê 1 byte especial primeiro: ele diz que a próxima mensagem tem 2 bytes."
        },
        {
            highlight: [1, 2],
            text: 'Consome exatamente esses 2 bytes: mensagem 1 = "OI", completa, sem depender de sorte.',
            deliver: "OI"
        },
        {
            highlight: [3],
            text: "Lê o próximo byte especial: a próxima mensagem tem 4 bytes."
        },
        {
            highlight: [4, 5, 6, 7],
            text: 'Consome os 4 bytes: mensagem 2 = "TUDO". Em nenhum momento sobrou dúvida, porque o tamanho veio combinado antes do conteúdo.',
            deliver: "TUDO"
        }
    ];

    document.querySelectorAll(".framing-lab").forEach((root, rootIndex) => {
        const titleId = "framing-lab-title-" + (rootIndex + 1);

        root.setAttribute("aria-labelledby", titleId);
        root.innerHTML =
            '<span class="framing-lab__eyebrow">Desafio interativo</span>' +
            '<h3 id="' + titleId + '" class="framing-lab__title">Onde termina a mensagem?</h3>' +
            '<p class="framing-lab__intro">O cliente mandou "OI" e, logo em seguida, "TUDO". Isso é o que realmente chegou numa única leitura do <code>ReadAsync</code>, sem nada separando as duas.</p>' +
            '<div class="framing-lab__section">' +
            '<div class="framing-lab__section-title">1. Sem combinar nada antes: tente adivinhar o corte</div>' +
            '<div class="framing-lab__tape-wrap"><div class="framing-lab__tape" data-tape-a></div></div>' +
            '<div class="framing-lab__result" data-result-a></div>' +
            '<p class="framing-lab__verdict" data-verdict-a>Clique entre duas letras pra tentar adivinhar onde uma mensagem termina e a outra começa.</p>' +
            '<div class="framing-lab__reveal">' +
            '<button type="button" class="framing-lab__button" data-action="reveal">Revelar a intenção original</button>' +
            "</div>" +
            '<p class="framing-lab__note" data-note-a>O cliente realmente quis dizer "OI" e "TUDO", em duas chamadas separadas de <code>WriteAsync</code>. Mas essa informação não está nos bytes: ela mora só na cabeça de quem escreveu o cliente. É exatamente isso que o framing resolve.</p>' +
            "</div>" +
            '<div class="framing-lab__section">' +
            '<div class="framing-lab__section-title">2. Com framing: um tamanho combinado antes de cada mensagem</div>' +
            '<div class="framing-lab__tape-wrap"><div class="framing-lab__tape" data-tape-b></div></div>' +
            '<p class="framing-lab__step-line" data-step-line-b></p>' +
            '<div class="framing-lab__delivered-label">Entregue à aplicação</div>' +
            '<div class="framing-lab__delivered" data-delivered-b></div>' +
            '<div class="framing-lab__controls">' +
            '<button type="button" class="framing-lab__button" data-action="prev-b">‹ Anterior</button>' +
            '<span class="framing-lab__step-count" data-step-count-b></span>' +
            '<button type="button" class="framing-lab__button framing-lab__button--primary" data-action="next-b">Próximo ›</button>' +
            "</div>" +
            "</div>";

        const tapeA = root.querySelector("[data-tape-a]");
        const resultA = root.querySelector("[data-result-a]");
        const verdictA = root.querySelector("[data-verdict-a]");
        const noteA = root.querySelector("[data-note-a]");
        const revealBtn = root.querySelector('[data-action="reveal"]');

        const tapeB = root.querySelector("[data-tape-b]");
        const stepLineB = root.querySelector("[data-step-line-b]");
        const deliveredB = root.querySelector("[data-delivered-b]");
        const stepCountB = root.querySelector("[data-step-count-b]");
        const prevB = root.querySelector('[data-action="prev-b"]');
        const nextB = root.querySelector('[data-action="next-b"]');

        // --- Seção A: fita ambígua, sem framing ---
        let cutA = null;
        let cellsA = [];

        function renderResultA() {
            if (cutA === null) {
                resultA.innerHTML =
                    '<span class="framing-lab__result-chip"><strong>Mensagem 1</strong>?</span>' +
                    '<span class="framing-lab__result-chip"><strong>Mensagem 2</strong>?</span>';
                verdictA.textContent = "Clique entre duas letras pra tentar adivinhar onde uma mensagem termina e a outra começa.";
                return;
            }

            const part1 = WORD.slice(0, cutA).join("");
            const part2 = WORD.slice(cutA).join("");

            resultA.innerHTML =
                '<span class="framing-lab__result-chip"><strong>Mensagem 1</strong>"' + part1 + '"</span>' +
                '<span class="framing-lab__result-chip"><strong>Mensagem 2</strong>"' + part2 + '"</span>';
            verdictA.textContent = VERDICTS[cutA];
        }

        function buildTapeA() {
            tapeA.innerHTML = "";
            cellsA = [];

            WORD.forEach((letter, index) => {
                const byte = document.createElement("span");
                byte.className = "framing-lab__byte";
                byte.textContent = letter;
                tapeA.appendChild(byte);
                cellsA.push(byte);

                if (index < WORD.length - 1) {
                    const gap = document.createElement("button");
                    gap.type = "button";
                    gap.className = "framing-lab__gap";
                    gap.dataset.cut = String(index + 1);
                    gap.setAttribute("aria-label", "Cortar depois da letra " + (index + 1));
                    gap.addEventListener("click", () => {
                        cutA = Number(gap.dataset.cut);
                        root.querySelectorAll(".framing-lab__gap").forEach((g) => {
                            g.classList.toggle("is-active", g === gap);
                        });
                        renderResultA();
                    });
                    tapeA.appendChild(gap);
                }
            });
        }

        revealBtn.addEventListener("click", () => {
            const gap = root.querySelector('.framing-lab__gap[data-cut="' + CORRECT_CUT + '"]');
            if (gap) gap.click();
            noteA.classList.add("is-visible");
        });

        buildTapeA();
        renderResultA();

        // --- Seção B: fita com framing por tamanho ---
        let stepB = 0;
        let cellsB = [];

        function buildTapeB() {
            tapeB.innerHTML = "";
            cellsB = TAPE_B.map((item) => {
                const cell = document.createElement("span");
                cell.className = item.header ? "framing-lab__byte framing-lab__byte--header" : "framing-lab__byte";
                cell.textContent = item.label;
                tapeB.appendChild(cell);
                return cell;
            });
        }

        function renderStepB() {
            const step = STEPS_B[stepB];

            cellsB.forEach((cell, index) => {
                cell.classList.toggle("is-highlighted", step.highlight.indexOf(index) !== -1);
            });

            stepLineB.textContent = step.text;
            stepCountB.textContent = "Passo " + stepB + " de " + (STEPS_B.length - 1);
            prevB.disabled = stepB === 0;
            nextB.disabled = stepB === STEPS_B.length - 1;

            const delivered = [];
            for (let i = 0; i <= stepB; i += 1) {
                if (STEPS_B[i].deliver) delivered.push(STEPS_B[i].deliver);
            }
            deliveredB.innerHTML = delivered
                .map((msg) => '<span class="framing-lab__delivered-chip">' + msg + "</span>")
                .join("");
        }

        prevB.addEventListener("click", () => {
            if (stepB > 0) {
                stepB -= 1;
                renderStepB();
            }
        });

        nextB.addEventListener("click", () => {
            if (stepB < STEPS_B.length - 1) {
                stepB += 1;
                renderStepB();
            }
        });

        buildTapeB();
        renderStepB();
    });
}());

(function () {
    const stages = [
        {
            abbr: "IF",
            key: "if",
            name: "Instruction Fetch",
            label: "Busca da instrução",
            border: "var(--pipeline-if-border)",
            description:
                "A CPU lê o PC (Program Counter), que aponta para a próxima instrução, acessa a memória e busca esse conteúdo para iniciar o processamento.",
            receives: "Endereço da instrução (PC)",
            produces: "Instrução em bits"
        },
        {
            abbr: "ID",
            key: "id",
            name: "Instruction Decode",
            label: "Decodificação",
            border: "var(--pipeline-id-border)",
            description:
                "Os bits da instrução são interpretados. Nessa etapa, a CPU descobre qual operação deve executar, quais registradores participarão e quais operandos precisam ser lidos.",
            receives: "Instrução bruta",
            produces: "Operação + operandos"
        },
        {
            abbr: "EX",
            key: "ex",
            name: "Execute",
            label: "Execução",
            border: "var(--pipeline-ex-border)",
            description:
                "A ULA realiza o cálculo principal. Pode ser uma soma, subtração, comparação ou o cálculo de um endereço que será usado em seguida.",
            receives: "Operação + operandos",
            produces: "Resultado da operação"
        },
        {
            abbr: "MEM",
            key: "mem",
            name: "Memory Access",
            label: "Acesso à memória",
            border: "var(--pipeline-mem-border)",
            description:
                "Essa fase entra em ação quando a instrução precisa ler ou gravar dados na memória. Em operações puramente aritméticas, ela pode passar sem trabalho relevante.",
            receives: "Endereço de memória",
            produces: "Dado lido ou valor gravado"
        },
        {
            abbr: "WB",
            key: "wb",
            name: "Write Back",
            label: "Escrita do resultado",
            border: "var(--pipeline-wb-border)",
            description:
                "O resultado final é escrito no registrador de destino. A partir daqui, essa informação já pode ser aproveitada por instruções seguintes.",
            receives: "Resultado final",
            produces: "Registrador atualizado"
        }
    ];

    const stageOrder = ["IF", "ID", "EX", "MEM", "WB"];

    document.querySelectorAll(".pipeline-demo").forEach((root, index) => {
        const titleId = `pipeline-demo-title-${index + 1}`;

        root.setAttribute("aria-labelledby", titleId);
        root.innerHTML = `
            <h3 id="${titleId}" class="pipeline-demo__title">Visualizando as etapas IF, ID, EX, MEM e WB</h3>
            <p class="pipeline-demo__intro">Selecione uma etapa para ver o papel dela na CPU e compare a execução de três instruções com e sem pipeline.</p>
            <div class="pipeline-demo__section-label">Etapas do pipeline</div>
            <div class="pipeline-demo__pills" data-pipeline-pills></div>
            <div class="pipeline-demo__detail" data-pipeline-detail>
                <p>Clique em uma etapa para ver o que acontece naquele momento.</p>
            </div>
            <div class="pipeline-demo__section-label">Execução de 3 instruções</div>
            <div class="pipeline-demo__mode-switch" role="group" aria-label="Modo de comparação do pipeline">
                <button type="button" class="pipeline-demo__mode-button is-active" data-pipeline-mode="sem">Sem pipeline</button>
                <button type="button" class="pipeline-demo__mode-button" data-pipeline-mode="com">Com pipeline</button>
            </div>
            <div class="pipeline-demo__stats" data-pipeline-stats></div>
            <div class="pipeline-demo__grid-wrap" data-pipeline-grid></div>
            <p class="pipeline-demo__note" data-pipeline-note></p>
        `;

        const pillsEl = root.querySelector("[data-pipeline-pills]");
        const detailEl = root.querySelector("[data-pipeline-detail]");
        const statsEl = root.querySelector("[data-pipeline-stats]");
        const gridEl = root.querySelector("[data-pipeline-grid]");
        const noteEl = root.querySelector("[data-pipeline-note]");
        const modeButtons = Array.from(root.querySelectorAll("[data-pipeline-mode]"));

        let selectedStage = null;
        let mode = "sem";

        function renderPills() {
            pillsEl.innerHTML = stages
                .map((stage) => {
                    const isActive = selectedStage === stage.key ? " is-active" : "";
                    return `<button type="button" class="pipeline-demo__pill${isActive}" data-stage="${stage.key}">${stage.abbr}</button>`;
                })
                .join("");

            pillsEl.querySelectorAll("[data-stage]").forEach((button) => {
                button.addEventListener("click", () => {
                    const key = button.getAttribute("data-stage");
                    selectedStage = selectedStage === key ? null : key;
                    render();
                });
            });
        }

        function renderDetail() {
            if (!selectedStage) {
                detailEl.style.borderLeftColor = "var(--border)";
                detailEl.innerHTML = "<p>Clique em uma etapa para ver o que acontece naquele momento.</p>";
                return;
            }

            const stage = stages.find((item) => item.key === selectedStage);

            detailEl.style.borderLeftColor = stage.border;
            detailEl.innerHTML = `
                <div class="pipeline-demo__detail-header">
                    <span class="pipeline-demo__detail-abbr">${stage.abbr}</span>
                    <span class="pipeline-demo__detail-name">${stage.name}</span>
                    <span class="pipeline-demo__detail-label">${stage.label}</span>
                </div>
                <p class="pipeline-demo__detail-copy">${stage.description}</p>
                <div class="pipeline-demo__detail-grid">
                    <div class="pipeline-demo__detail-box">
                        <span class="pipeline-demo__detail-box-label">Recebe</span>
                        <span>${stage.receives}</span>
                    </div>
                    <div class="pipeline-demo__detail-box">
                        <span class="pipeline-demo__detail-box-label">Produz</span>
                        <span>${stage.produces}</span>
                    </div>
                </div>
            `;
        }

        function renderStats() {
            const stats = mode === "sem"
                ? [
                    { value: "15", label: "ciclos para 3 instruções" },
                    { value: "1 instrução / 5 ciclos", label: "throughput" },
                    { value: "1", label: "etapa útil por vez" }
                ]
                : [
                    { value: "7", label: "ciclos para 3 instruções" },
                    { value: "1 instrução / ciclo", label: "throughput em regime" },
                    { value: "até 5", label: "etapas ativas ao mesmo tempo" }
                ];

            statsEl.innerHTML = stats
                .map(
                    (stat) => `
                        <div class="pipeline-demo__stat">
                            <span class="pipeline-demo__stat-value">${stat.value}</span>
                            <span class="pipeline-demo__stat-label">${stat.label}</span>
                        </div>
                    `
                )
                .join("");
        }

        function buildRows() {
            const totalColumns = mode === "sem" ? 15 : 7;
            const rows = [];

            for (let instructionIndex = 0; instructionIndex < 3; instructionIndex += 1) {
                const cells = Array(totalColumns).fill(null);
                const start = mode === "sem" ? instructionIndex * 5 : instructionIndex;

                for (let stageIndex = 0; stageIndex < stageOrder.length; stageIndex += 1) {
                    cells[start + stageIndex] = stageOrder[stageIndex];
                }

                rows.push({
                    label: `I${instructionIndex + 1}`,
                    cells
                });
            }

            return { totalColumns, rows };
        }

        function renderGrid() {
            const { totalColumns, rows } = buildRows();
            root.style.setProperty("--pipeline-columns", String(totalColumns));

            let html = '<div class="pipeline-demo__grid">';
            html += '<div></div>';

            for (let column = 0; column < totalColumns; column += 1) {
                html += `<div class="pipeline-demo__grid-head">C${column + 1}</div>`;
            }

            rows.forEach((row) => {
                html += `<div class="pipeline-demo__grid-row-label">${row.label}</div>`;

                row.cells.forEach((cell) => {
                    if (!cell) {
                        html += '<div class="pipeline-demo__cell pipeline-demo__cell--empty"></div>';
                        return;
                    }

                    const key = cell.toLowerCase();
                    const dimClass = selectedStage && selectedStage !== key ? " is-dim" : "";

                    html += `
                        <button
                            type="button"
                            class="pipeline-demo__cell pipeline-demo__cell--clickable${dimClass}"
                            data-cell-stage="${key}"
                            data-stage="${key}"
                            title="${cell}: clique para ver detalhes"
                        >
                            ${cell}
                        </button>
                    `;
                });
            });

            html += "</div>";
            gridEl.innerHTML = html;

            gridEl.querySelectorAll("[data-cell-stage]").forEach((button) => {
                button.addEventListener("click", () => {
                    const key = button.getAttribute("data-cell-stage");
                    selectedStage = selectedStage === key ? null : key;
                    render();
                });
            });

            noteEl.textContent = mode === "sem"
                ? "Sem pipeline, cada instrução precisa atravessar todas as etapas sozinha antes da próxima começar. Enquanto uma fase trabalha, boa parte do hardware fica esperando."
                : "Com pipeline, assim que uma instrução avança para a próxima etapa, a seguinte já pode ocupar o espaço que ficou livre. O ganho aparece no ritmo de execução, não na duração individual de cada instrução.";
        }

        function renderModeButtons() {
            modeButtons.forEach((button) => {
                const isActive = button.getAttribute("data-pipeline-mode") === mode;
                button.classList.toggle("is-active", isActive);
            });
        }

        function render() {
            renderPills();
            renderDetail();
            renderModeButtons();
            renderStats();
            renderGrid();
        }

        modeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                mode = button.getAttribute("data-pipeline-mode");
                render();
            });
        });

        render();
    });
}());

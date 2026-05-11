(function () {
    const authScenarios = [
        {
            id: "mesmo-dominio",
            label: "Mesmo domínio",
            badgeClass: "pipeline-auth__badge pipeline-auth__badge--success",
            badgeText: "Cookie encaixa melhor",
            explain:
                "<strong>Mesma origem:</strong> frontend e backend compartilham protocolo, domínio e porta. Nesse caso, o navegador envia o cookie automaticamente em toda requisição depois do login.",
            diagram: `
                <svg class="pipeline-auth__diagram" viewBox="0 0 680 230" role="img" aria-label="Cenário de frontend e backend no mesmo domínio com cookie sendo enviado automaticamente">
                    <defs>
                        <marker id="auth-arrow-1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        </marker>
                    </defs>
                    <g class="c-teal">
                        <rect x="70" y="30" width="200" height="60" rx="8" stroke-width="0.5"></rect>
                        <text class="th" x="170" y="55" text-anchor="middle" dominant-baseline="central">Frontend</text>
                        <text class="ts" x="170" y="75" text-anchor="middle" dominant-baseline="central">museudebug.com</text>
                    </g>
                    <g class="c-teal">
                        <rect x="410" y="30" width="200" height="60" rx="8" stroke-width="0.5"></rect>
                        <text class="th" x="510" y="55" text-anchor="middle" dominant-baseline="central">Backend / API</text>
                        <text class="ts" x="510" y="75" text-anchor="middle" dominant-baseline="central">museudebug.com/api</text>
                    </g>
                    <line x1="270" y1="60" x2="294" y2="60" stroke="#1d9e75" stroke-width="1.5"></line>
                    <line x1="386" y1="60" x2="408" y2="60" stroke="#1d9e75" stroke-width="1.5" marker-end="url(#auth-arrow-1)"></line>
                    <rect x="294" y="44" width="92" height="24" rx="6" fill="rgba(29, 158, 117, 0.14)" stroke="none"></rect>
                    <text class="ts" x="340" y="60" text-anchor="middle" dominant-baseline="central" style="fill:#0f5b47;font-weight:700">🍪 cookie</text>
                    <rect x="130" y="130" width="420" height="74" rx="10" fill="rgba(127, 119, 221, 0.06)" stroke="rgba(127, 119, 221, 0.18)" stroke-width="0.8"></rect>
                    <text class="ts" x="340" y="155" text-anchor="middle" dominant-baseline="central" style="fill:currentColor">Mesma origem: o navegador envia o cookie automaticamente.</text>
                    <text class="ts" x="340" y="177" text-anchor="middle" dominant-baseline="central" style="fill:currentColor">Você configura no login e o browser cuida do resto.</text>
                    <text class="ts" x="340" y="199" text-anchor="middle" dominant-baseline="central" style="fill:#0f5b47;font-weight:700">Fluxo mais simples para aplicações web tradicionais.</text>
                </svg>
            `
        },
        {
            id: "subdominio",
            label: "Subdomínio",
            badgeClass: "pipeline-auth__badge pipeline-auth__badge--warn",
            badgeText: "JWT simplifica",
            explain:
                "<strong>Origem diferente:</strong> quando a API vai para <code>api.seudominio.com</code>, a presença do subdomínio já muda a origem. Até dá para usar cookie com configuração cuidadosa, mas JWT em <code>Authorization: Bearer</code> costuma dar menos atrito.",
            diagram: `
                <svg class="pipeline-auth__diagram" viewBox="0 0 680 250" role="img" aria-label="Cenário com subdomínio diferente em que o cookie deixa de ser o caminho mais simples">
                    <defs>
                        <marker id="auth-arrow-2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        </marker>
                    </defs>
                    <g class="c-teal">
                        <rect x="70" y="30" width="200" height="60" rx="8" stroke-width="0.5"></rect>
                        <text class="th" x="170" y="55" text-anchor="middle" dominant-baseline="central">Frontend</text>
                        <text class="ts" x="170" y="75" text-anchor="middle" dominant-baseline="central">museudebug.com</text>
                    </g>
                    <g class="c-amber">
                        <rect x="410" y="30" width="200" height="60" rx="8" stroke-width="0.5"></rect>
                        <text class="th" x="510" y="55" text-anchor="middle" dominant-baseline="central">Backend / API</text>
                        <text class="ts" x="510" y="75" text-anchor="middle" dominant-baseline="central">api.museudebug.com</text>
                    </g>
                    <line x1="270" y1="60" x2="292" y2="60" stroke="#ba7517" stroke-width="1.5" stroke-dasharray="5 3"></line>
                    <line x1="388" y1="60" x2="408" y2="60" stroke="#ba7517" stroke-width="1.5" stroke-dasharray="5 3" marker-end="url(#auth-arrow-2)"></line>
                    <rect x="292" y="44" width="96" height="24" rx="6" fill="rgba(186, 117, 23, 0.16)" stroke="none"></rect>
                    <text class="ts" x="340" y="60" text-anchor="middle" dominant-baseline="central" style="fill:#7a4809;font-weight:700">origens diferentes</text>
                    <rect x="60" y="120" width="560" height="110" rx="10" fill="rgba(127, 119, 221, 0.06)" stroke="rgba(127, 119, 221, 0.18)" stroke-width="0.8"></rect>
                    <text class="ts" x="340" y="145" text-anchor="middle" dominant-baseline="central" style="fill:currentColor">O prefixo api. já altera a origem.</text>
                    <text class="ts" x="340" y="167" text-anchor="middle" dominant-baseline="central" style="fill:currentColor">Cookie passa a depender de CORS e flags específicas.</text>
                    <text class="ts" x="340" y="189" text-anchor="middle" dominant-baseline="central" style="fill:currentColor">Funciona, mas exige mais cuidado de configuração.</text>
                    <text class="ts" x="340" y="211" text-anchor="middle" dominant-baseline="central" style="fill:#7a4809;font-weight:700">JWT tende a ser o caminho mais direto aqui.</text>
                </svg>
            `
        },
        {
            id: "terceiros",
            label: "API pública",
            badgeClass: "pipeline-auth__badge pipeline-auth__badge--info",
            badgeText: "JWT ou API Key",
            explain:
                "<strong>Clientes externos:</strong> se terceiros vão consumir sua API, você não pode depender de um cookie do navegador. O mais comum é emitir um token ou chave que qualquer cliente consiga guardar e mandar no header.",
            diagram: `
                <svg class="pipeline-auth__diagram" viewBox="0 0 680 260" role="img" aria-label="Cenário de API pública sendo consumida por sistema de terceiros com JWT ou API Key">
                    <defs>
                        <marker id="auth-arrow-3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        </marker>
                    </defs>
                    <g class="c-coral">
                        <rect x="70" y="30" width="190" height="60" rx="8" stroke-width="0.5"></rect>
                        <text class="th" x="165" y="55" text-anchor="middle" dominant-baseline="central">Sistema externo</text>
                        <text class="ts" x="165" y="75" text-anchor="middle" dominant-baseline="central">sistema-deles.com</text>
                    </g>
                    <g class="c-purple">
                        <rect x="420" y="30" width="190" height="60" rx="8" stroke-width="0.5"></rect>
                        <text class="th" x="515" y="55" text-anchor="middle" dominant-baseline="central">Sua API</text>
                        <text class="ts" x="515" y="75" text-anchor="middle" dominant-baseline="central">museudebug.com/api</text>
                    </g>
                    <line x1="260" y1="60" x2="274" y2="60" stroke="#533ab7" stroke-width="1.5"></line>
                    <line x1="406" y1="60" x2="418" y2="60" stroke="#533ab7" stroke-width="1.5" marker-end="url(#auth-arrow-3)"></line>
                    <rect x="274" y="44" width="132" height="24" rx="6" fill="rgba(55, 138, 221, 0.14)" stroke="none"></rect>
                    <text class="ts" x="340" y="60" text-anchor="middle" dominant-baseline="central" style="fill:#15558f;font-weight:700">JWT / API Key</text>
                    <rect x="60" y="125" width="560" height="115" rx="10" fill="rgba(127, 119, 221, 0.06)" stroke="rgba(127, 119, 221, 0.18)" stroke-width="0.8"></rect>
                    <text class="ts" x="340" y="150" text-anchor="middle" dominant-baseline="central" style="fill:currentColor">Domínios diferentes: cookie não é o centro dessa conversa.</text>
                    <text class="ts" x="340" y="172" text-anchor="middle" dominant-baseline="central" style="fill:currentColor">A API emite um token e o cliente envia no header.</text>
                    <text class="ts" x="340" y="194" text-anchor="middle" dominant-baseline="central" style="fill:currentColor;font-style:italic">Authorization: Bearer token</text>
                    <text class="ts" x="340" y="222" text-anchor="middle" dominant-baseline="central" style="fill:#15558f;font-weight:700">Padrão comum para integrações e APIs públicas.</text>
                </svg>
            `
        },
        {
            id: "multiplos-clientes",
            label: "Múltiplos clientes",
            badgeClass: "pipeline-auth__badge pipeline-auth__badge--neutral",
            badgeText: "JWT é mais portátil",
            explain:
                "<strong>Web, mobile e desktop:</strong> cookie é uma tecnologia do navegador. Quando você precisa atender vários tipos de cliente, JWT vira uma alternativa mais portátil porque continua sendo apenas uma string enviada no header.",
            diagram: `
                <svg class="pipeline-auth__diagram" viewBox="0 0 680 250" role="img" aria-label="Cenário com web, mobile e desktop falando com a mesma API por meio de JWT">
                    <defs>
                        <marker id="auth-arrow-4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        </marker>
                    </defs>
                    <g class="c-purple">
                        <rect x="280" y="95" width="160" height="60" rx="8" stroke-width="0.5"></rect>
                        <text class="th" x="360" y="118" text-anchor="middle" dominant-baseline="central">Sua API</text>
                        <text class="ts" x="360" y="138" text-anchor="middle" dominant-baseline="central">museudebug.com</text>
                    </g>
                    <g class="c-teal">
                        <rect x="30" y="20" width="140" height="50" rx="8" stroke-width="0.5"></rect>
                        <text class="th" x="100" y="40" text-anchor="middle" dominant-baseline="central">Web</text>
                        <text class="ts" x="100" y="58" text-anchor="middle" dominant-baseline="central">navegador</text>
                    </g>
                    <g class="c-blue">
                        <rect x="30" y="100" width="140" height="50" rx="8" stroke-width="0.5"></rect>
                        <text class="th" x="100" y="118" text-anchor="middle" dominant-baseline="central">Mobile</text>
                        <text class="ts" x="100" y="138" text-anchor="middle" dominant-baseline="central">app nativo</text>
                    </g>
                    <g class="c-gray">
                        <rect x="30" y="180" width="140" height="50" rx="8" stroke-width="0.5"></rect>
                        <text class="th" x="100" y="198" text-anchor="middle" dominant-baseline="central">Desktop</text>
                        <text class="ts" x="100" y="218" text-anchor="middle" dominant-baseline="central">Electron / outro cliente</text>
                    </g>
                    <line x1="170" y1="45" x2="278" y2="110" stroke="#1d9e75" stroke-width="1.2" marker-end="url(#auth-arrow-4)"></line>
                    <line x1="170" y1="125" x2="278" y2="125" stroke="#378add" stroke-width="1.2" marker-end="url(#auth-arrow-4)"></line>
                    <line x1="170" y1="205" x2="278" y2="140" stroke="rgba(95, 94, 90, 0.8)" stroke-width="1.2" marker-end="url(#auth-arrow-4)"></line>
                    <rect x="462" y="80" width="188" height="90" rx="10" fill="rgba(127, 119, 221, 0.06)" stroke="rgba(127, 119, 221, 0.18)" stroke-width="0.8"></rect>
                    <text class="ts" x="556" y="110" text-anchor="middle" dominant-baseline="central" style="fill:currentColor">Cookie vive no navegador.</text>
                    <text class="ts" x="556" y="132" text-anchor="middle" dominant-baseline="central" style="fill:currentColor">JWT pode ser guardado por</text>
                    <text class="ts" x="556" y="154" text-anchor="middle" dominant-baseline="central" style="fill:currentColor">web, mobile ou desktop.</text>
                </svg>
            `
        }
    ];

    const deployCommits = [
        { commit: "2cc241c", build: 1, runtime: 0 },
        { commit: "8eebae7", build: 2, runtime: 0 },
        { commit: "4b9e34e", build: 0, runtime: 4 },
        { commit: "14e5701", build: 0, runtime: 6 },
        { commit: "3da37cb", build: 0, runtime: 13 },
        { commit: "e58f6f8", build: 0, runtime: 4 },
        { commit: "9982fff", build: 0, runtime: 6 }
    ];

    function renderAuthScenarios() {
        document.querySelectorAll("[data-auth-scenarios]").forEach((root, rootIndex) => {
            let activeIndex = 0;

            function render() {
                const scenario = authScenarios[activeIndex];
                const tabs = authScenarios
                    .map((item, index) => {
                        const isActive = index === activeIndex ? " is-active" : "";
                        return `
                            <button
                                type="button"
                                class="pipeline-auth__tab${isActive}"
                                data-auth-tab="${index}"
                                aria-pressed="${String(index === activeIndex)}"
                            >
                                ${item.label}
                            </button>
                        `;
                    })
                    .join("");

                root.innerHTML = `
                    <h3 class="pipeline-auth__title">Cookie vs JWT na prática</h3>
                    <p class="pipeline-auth__intro">A decisão não depende só de gosto. Ela muda bastante conforme o domínio, o tipo de cliente e a forma como a API será consumida.</p>
                    <div class="pipeline-auth__tabs" role="tablist" aria-label="Cenários de autenticação do pipeline ${rootIndex + 1}">
                        ${tabs}
                    </div>
                    <div class="pipeline-auth__panel">
                        <div class="pipeline-auth__panel-meta">
                            <span class="${scenario.badgeClass}">${scenario.badgeText}</span>
                        </div>
                        ${scenario.diagram}
                        <p class="pipeline-auth__explain">${scenario.explain}</p>
                    </div>
                `;

                root.querySelectorAll("[data-auth-tab]").forEach((button) => {
                    button.addEventListener("click", () => {
                        activeIndex = Number(button.getAttribute("data-auth-tab"));
                        render();
                    });
                });
            }

            render();
        });
    }

    function renderDeployFailures() {
        const totalFailures = deployCommits.reduce((sum, item) => sum + item.build + item.runtime, 0);
        const runtimeFailures = deployCommits.reduce((sum, item) => sum + item.runtime, 0);
        const buildFailures = deployCommits.reduce((sum, item) => sum + item.build, 0);

        document.querySelectorAll("[data-deploy-failures]").forEach((root) => {
            const bars = deployCommits
                .map((item) => {
                    const total = item.build + item.runtime;
                    const runtimeWidth = total ? (item.runtime / totalFailures) * 100 : 0;
                    const buildWidth = total ? (item.build / totalFailures) * 100 : 0;

                    return `
                        <div class="deploy-failures__bar-row">
                            <div class="deploy-failures__bar-label">${item.commit}</div>
                            <div class="deploy-failures__bar-track" aria-label="Commit ${item.commit} com ${total} falhas">
                                <div class="deploy-failures__bar-segment deploy-failures__bar-segment--runtime" style="width:${runtimeWidth}%"></div>
                                <div class="deploy-failures__bar-segment deploy-failures__bar-segment--build" style="width:${buildWidth}%"></div>
                            </div>
                            <div class="deploy-failures__bar-total">${total}</div>
                        </div>
                    `;
                })
                .join("");

            root.innerHTML = `
                <h3 class="deploy-failures__title">36 falhas até o deploy subir</h3>
                <p class="deploy-failures__intro">O que mais chamou a atenção não foi a compilação em si, mas a quantidade de problemas que só apareceram quando a aplicação tentou rodar em produção.</p>
                <div class="deploy-failures__legend" aria-hidden="true">
                    <span class="deploy-failures__legend-item">
                        <span class="deploy-failures__legend-swatch deploy-failures__legend-swatch--runtime"></span>
                        status 139 (runtime crash)
                    </span>
                    <span class="deploy-failures__legend-item">
                        <span class="deploy-failures__legend-swatch deploy-failures__legend-swatch--build"></span>
                        status 1 (build error)
                    </span>
                </div>
                <div class="deploy-failures__bars">
                    ${bars}
                </div>
                <div class="deploy-failures__summary">
                    <div class="deploy-failures__summary-card">
                        <span class="deploy-failures__summary-value">${totalFailures}</span>
                        <span class="deploy-failures__summary-label">total de falhas</span>
                    </div>
                    <div class="deploy-failures__summary-card">
                        <span class="deploy-failures__summary-value deploy-failures__summary-value--runtime">${runtimeFailures}</span>
                        <span class="deploy-failures__summary-label">runtime crash</span>
                    </div>
                    <div class="deploy-failures__summary-card">
                        <span class="deploy-failures__summary-value deploy-failures__summary-value--build">${buildFailures}</span>
                        <span class="deploy-failures__summary-label">build error</span>
                    </div>
                </div>
                <ul class="deploy-failures__commit-list">
                    <li><code>2cc241c</code> e <code>8eebae7</code>: tentativas iniciais de preparar o deploy e reposicionar o Dockerfile.</li>
                    <li><code>4b9e34e</code>, <code>14e5701</code> e <code>3da37cb</code>: ajustes de caminho, configuracao do frontend e binding de porta.</li>
                    <li><code>e58f6f8</code> e <code>9982fff</code>: dependencias de runtime e configuracao final da porta HTTP.</li>
                </ul>
            `;
        });
    }

    renderAuthScenarios();
    renderDeployFailures();
})();

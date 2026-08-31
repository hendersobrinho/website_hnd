(function () {
    const BANDS = [
        { key: "wellknown", name: "Conhecidas", min: 0, max: 1023 },
        { key: "registered", name: "Registradas", min: 1024, max: 49151 },
        { key: "dynamic", name: "Dinâmicas / efêmeras", min: 49152, max: 65535 }
    ];

    const MARKERS = [
        {
            band: "wellknown",
            port: 21,
            name: "FTP",
            year: "1971",
            text: "Um dos primeiros serviços da ARPANET (RFC 114), muito antes de existir o TCP/IP como conhecemos hoje. Usa duas portas: 21 para comandos, 20 para os dados em si."
        },
        {
            band: "wellknown",
            port: 22,
            name: "SSH",
            year: "1995",
            text: "Criado por Tatu Ylönen depois de um ataque de sniffing de senhas na própria universidade. Nasceu pra substituir o Telnet com tudo criptografado."
        },
        {
            band: "wellknown",
            port: 23,
            name: "Telnet",
            year: "1969",
            text: "Um dos protocolos mais antigos da internet, texto puro, sem nenhuma criptografia. É por causa dele, literalmente, que o SSH existe."
        },
        {
            band: "wellknown",
            port: 25,
            name: "SMTP",
            year: "1982",
            text: "A RFC 821 formalizou o envio de e-mail. Uma das poucas peças da internet que ainda funciona quase do jeito que foi desenhada há mais de 40 anos."
        },
        {
            band: "wellknown",
            port: 53,
            name: "DNS",
            year: "1983",
            text: "Tradução de nome para IP. Roda sobre UDP na maioria das consultas, e só migra pra TCP quando a resposta é grande demais pra um datagrama só."
        },
        {
            band: "wellknown",
            port: 80,
            name: "HTTP",
            year: "1991",
            text: "Formalizada por Tim Berners-Lee no CERN. Hoje é o serviço mais reconhecível da internet, e o motivo do navegador esconder \":80\" na barra de endereço."
        },
        {
            band: "wellknown",
            port: 443,
            name: "HTTPS",
            year: "1994",
            text: "Criada pela Netscape junto com o SSL, a camada de criptografia que mais tarde virou o TLS que a gente usa hoje."
        },
        {
            band: "registered",
            port: 3306,
            name: "MySQL",
            year: "1995",
            text: "Registrada na IANA pelos próprios criadores do MySQL. Nada nesse número é \"de banco de dados\" por natureza, é só uma convenção que o projeto escolheu."
        },
        {
            band: "registered",
            port: 5000,
            name: "ASP.NET Core (dev)",
            year: "convenção",
            text: "Comum em ambiente de desenvolvimento (ASP.NET Core, Flask e outros). Não é reservada oficialmente pra isso: é só tooling padronizando um número pra facilitar a vida de quem está aprendendo."
        },
        {
            band: "registered",
            port: 5432,
            name: "PostgreSQL",
            year: "1996",
            text: "Escolhida pelos mantenedores do Postgres e registrada na IANA, no mesmo espírito do MySQL: um número combinado pra evitar colisão com outros serviços conhecidos."
        },
        {
            band: "registered",
            port: 6379,
            name: "Redis",
            year: "2009",
            text: "Registrada pelos criadores do Redis. Curiosidade sem nenhuma relação técnica: no teclado numérico de um telefone antigo, 6379 soletra parte do nome de uma cantora que o criador do projeto admirava."
        },
        {
            band: "registered",
            port: 8080,
            name: "HTTP alternativo",
            year: "convenção",
            text: "Alternativa não privilegiada à porta 80. Ficou popular porque, historicamente, abrir a porta 80 de verdade exigia privilégio de root no servidor."
        },
        {
            band: "registered",
            port: 27017,
            name: "MongoDB",
            year: "2009",
            text: "Registrada pelos criadores do MongoDB, seguindo a mesma lógica dos outros bancos: um número combinado, documentado, sem significado técnico intrínseco."
        },
        {
            band: "dynamic",
            port: 49152,
            name: "Portas dinâmicas / efêmeras",
            year: "RFC 6335, 2011",
            text: "Essa faixa inteira não pertence a nenhum serviço específico. O sistema operacional usa essas portas automaticamente pro lado que inicia a conexão: é a porta aleatória que o seu TcpClient recebe assim que chama ConnectAsync."
        }
    ];

    function bandOf(key) {
        return BANDS.find((band) => band.key === key);
    }

    document.querySelectorAll(".port-ranges-lab").forEach((root, rootIndex) => {
        const titleId = "port-ranges-lab-title-" + (rootIndex + 1);

        root.setAttribute("aria-labelledby", titleId);
        root.innerHTML =
            '<span class="port-ranges-lab__eyebrow">Linha do tempo interativa</span>' +
            '<h3 id="' + titleId + '" class="port-ranges-lab__title">De onde vêm essas convenções</h3>' +
            '<p class="port-ranges-lab__intro">Clique num ponto pra ver por que aquele número específico virou o que é hoje.</p>' +
            '<div class="port-ranges-lab__ruler" data-ruler></div>' +
            '<div class="port-ranges-lab__band-labels" data-band-labels></div>' +
            '<p class="port-ranges-lab__note">As três faixas são desenhadas com a mesma largura pra facilitar a leitura. Na numeração real, "Registradas" cobre bem mais números que as outras duas juntas.</p>' +
            '<div class="port-ranges-lab__detail" data-detail></div>';

        const rulerEl = root.querySelector("[data-ruler]");
        const labelsEl = root.querySelector("[data-band-labels]");
        const detailEl = root.querySelector("[data-detail]");

        labelsEl.innerHTML = BANDS.map(
            (band) =>
                '<div class="port-ranges-lab__band-label">' +
                '<span class="port-ranges-lab__band-name">' + band.name + "</span>" +
                '<span class="port-ranges-lab__band-range">' + band.min + "–" + band.max + "</span>" +
                "</div>"
        ).join("");

        rulerEl.innerHTML = BANDS.map(
            (band) => '<div class="port-ranges-lab__band" data-band="' + band.key + '"><div class="port-ranges-lab__band-fill"></div></div>'
        ).join("");

        const markerButtons = [];

        MARKERS.forEach((marker) => {
            const band = bandOf(marker.band);
            const bandEl = rulerEl.querySelector('[data-band="' + marker.band + '"]');
            const pct = ((marker.port - band.min) / (band.max - band.min)) * 100;

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "port-ranges-lab__marker";
            btn.style.left = Math.min(97, Math.max(3, pct)) + "%";
            btn.setAttribute("aria-label", "Porta " + marker.port + ", " + marker.name);
            btn.dataset.port = String(marker.port);
            bandEl.appendChild(btn);
            markerButtons.push({ el: btn, marker });
        });

        function renderDetail(marker) {
            detailEl.innerHTML =
                '<div class="port-ranges-lab__detail-header">' +
                '<span class="port-ranges-lab__detail-port">:' + marker.port + "</span>" +
                '<span class="port-ranges-lab__detail-name">' + marker.name + "</span>" +
                '<span class="port-ranges-lab__detail-year">' + marker.year + "</span>" +
                "</div>" +
                '<p class="port-ranges-lab__detail-text">' + marker.text + "</p>";
        }

        markerButtons.forEach(({ el, marker }) => {
            el.addEventListener("click", () => {
                markerButtons.forEach(({ el: other }) => other.classList.remove("is-active"));
                el.classList.add("is-active");
                renderDetail(marker);
            });
        });

        const first = markerButtons.find(({ marker }) => marker.port === 80) || markerButtons[0];
        if (first) {
            first.el.classList.add("is-active");
            renderDetail(first.marker);
        }
    });
}());

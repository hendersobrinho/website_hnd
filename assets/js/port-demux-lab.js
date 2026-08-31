(function () {
    const PROCESSES = [
        { port: 22, name: "sshd" },
        { port: 80, name: "nginx" },
        { port: 5000, name: "API .NET (dotnet run)" },
        { port: 6379, name: "redis-server" }
    ];

    const PRESETS = [22, 80, 5000, 6379, 9999];

    const reduceMotion =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll(".port-demux-lab").forEach((root, rootIndex) => {
        const titleId = "port-demux-lab-title-" + (rootIndex + 1);

        root.setAttribute("aria-labelledby", titleId);
        root.innerHTML =
            '<span class="port-demux-lab__eyebrow">Simulação interativa</span>' +
            '<h3 id="' + titleId + '" class="port-demux-lab__title">Pra quem esse pacote vai?</h3>' +
            '<p class="port-demux-lab__intro">Sua máquina só tem um IP, mas vários programas escutando ao mesmo tempo. Escolha uma porta de destino e veja o kernel decidir quem recebe o pacote.</p>' +
            '<div class="port-demux-lab__stage">' +
            '<div class="port-demux-lab__incoming">' +
            '<span class="port-demux-lab__incoming-name">Pacote chegando</span>' +
            '<span class="port-demux-lab__incoming-hint" data-incoming-hint>escolha uma porta</span>' +
            "</div>" +
            '<div class="port-demux-lab__track" data-track>' +
            '<div class="port-demux-lab__lane">' +
            '<span class="port-demux-lab__kernel-label">Tabela de sockets do kernel</span>' +
            '<div class="port-demux-lab__kernel"></div>' +
            '<div class="port-demux-lab__packet" data-packet></div>' +
            "</div>" +
            '<div class="port-demux-lab__processes" data-processes></div>' +
            "</div>" +
            "</div>" +
            '<p class="port-demux-lab__log" data-log aria-live="polite">Nenhum pacote enviado ainda.</p>' +
            '<div class="port-demux-lab__controls" data-controls></div>';

        const track = root.querySelector("[data-track]");
        const packet = root.querySelector("[data-packet]");
        const processesEl = root.querySelector("[data-processes]");
        const logEl = root.querySelector("[data-log]");
        const controlsEl = root.querySelector("[data-controls]");
        const incomingHint = root.querySelector("[data-incoming-hint]");

        processesEl.innerHTML = PROCESSES.map(
            (proc) =>
                '<div class="port-demux-lab__process" data-process="' + proc.port + '">' +
                '<span class="port-demux-lab__process-port">:' + proc.port + "</span>" +
                '<span class="port-demux-lab__process-name">' + proc.name + "</span>" +
                "</div>"
        ).join("");

        controlsEl.innerHTML = PRESETS.map(
            (port) =>
                '<button type="button" class="port-demux-lab__button" data-port="' + port + '">porta ' + port + "</button>"
        ).join("");

        const buttons = Array.from(controlsEl.querySelectorAll("[data-port]"));
        let running = false;

        function setButtonsDisabled(disabled) {
            buttons.forEach((btn) => {
                btn.disabled = disabled;
            });
        }

        function moveTo(el, left, duration) {
            return new Promise((resolve) => {
                if (reduceMotion) {
                    el.style.transition = "none";
                    el.style.left = left;
                    resolve();
                    return;
                }
                el.style.transition = "left " + duration + "ms ease, opacity 250ms ease";
                requestAnimationFrame(() => {
                    el.style.left = left;
                });
                window.setTimeout(resolve, duration);
            });
        }

        async function send(port) {
            if (running) return;
            running = true;
            setButtonsDisabled(true);
            buttons.forEach((btn) => btn.classList.toggle("is-active", Number(btn.dataset.port) === port));

            processesEl.querySelectorAll("[data-process]").forEach((el) => el.classList.remove("is-hit"));

            const match = PROCESSES.find((proc) => proc.port === port);

            incomingHint.textContent = "dst :" + port;
            packet.textContent = "dst :" + port;
            packet.className = "port-demux-lab__packet";
            packet.style.transition = "none";
            packet.style.left = "0%";
            void packet.offsetWidth;
            packet.classList.add("is-visible");

            logEl.textContent = "Pacote chega com destino à porta " + port + ". O kernel confere a tabela de sockets…";

            await moveTo(packet, "50%", 550);

            if (match) {
                const processEl = processesEl.querySelector('[data-process="' + port + '"]');
                if (processEl) processEl.classList.add("is-hit");
                logEl.textContent =
                    "Porta " + port + " tem um socket em LISTEN: o kernel entrega o pacote pro processo " +
                    match.name + ". É por isso que ele responde.";
                await new Promise((resolve) => window.setTimeout(resolve, 500));
                packet.classList.remove("is-visible");
            } else {
                packet.classList.add("is-refused");
                logEl.textContent =
                    "Nenhum processo está escutando na porta " + port + ". O kernel nem tenta entregar em lugar nenhum: " +
                    "ele responde na hora com um RST, e a conexão nunca chega a existir.";
                await moveTo(packet, "0%", 550);
                packet.classList.remove("is-visible");
            }

            setButtonsDisabled(false);
            running = false;
        }

        buttons.forEach((btn) => {
            btn.addEventListener("click", () => send(Number(btn.dataset.port)));
        });
    });
}());

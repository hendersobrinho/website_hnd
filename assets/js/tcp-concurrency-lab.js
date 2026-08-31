(function () {
    const ARRIVALS = [0, 150, 300, 450, 600];
    const PROCESS_DURATION = 1400;
    const ACCEPT_TICK = 80;
    const TOTAL_SCALE = 7600;
    const END_PAUSE = 500;

    const reduceMotion =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function formatTime(ms) {
        return (ms / 1000).toFixed(2).replace(/0$/, "") + "s";
    }

    function pct(ms) {
        return (ms / TOTAL_SCALE) * 100 + "%";
    }

    function buildSchedule(mode) {
        let loopFree = 0;
        return ARRIVALS.map((arrival, index) => {
            const id = index + 1;
            const acceptStart = Math.max(arrival, loopFree);
            const acceptEnd = mode === "blocking" ? acceptStart : acceptStart + ACCEPT_TICK;
            const processEnd = acceptEnd + PROCESS_DURATION;
            loopFree = mode === "blocking" ? processEnd : acceptEnd;
            return {
                id,
                arrival,
                acceptStart,
                acceptEnd,
                processEnd,
                wait: acceptStart - arrival
            };
        });
    }

    function buildTimeline(schedule) {
        const events = [];
        schedule.forEach((client) => {
            events.push({ time: client.arrival, kind: "arrival", client });
            events.push({ time: client.acceptStart, kind: "accept", client });
            events.push({ time: client.processEnd, kind: "finish", client });
        });
        events.sort((a, b) => a.time - b.time);
        return events;
    }

    function logText(mode, event) {
        const c = event.client;
        const t = "[" + formatTime(event.time) + "]";
        switch (event.kind) {
            case "arrival":
                return t + " Cliente " + c.id + " tenta conectar.";
            case "accept":
                if (mode === "blocking") {
                    return c.wait > 30
                        ? t +
                              " Servidor finalmente aceita o cliente " +
                              c.id +
                              " — esperou " +
                              formatTime(c.wait) +
                              " na fila porque o loop estava preso com o cliente anterior."
                        : t + " Servidor aceita o cliente " + c.id + " e começa a atendê-lo — o loop trava até terminar.";
                }
                return t + " Servidor aceita o cliente " + c.id + " e já dispara o atendimento em paralelo — o loop segue livre.";
            case "finish":
                return t + " Cliente " + c.id + " atendido e desconectado.";
            default:
                return "";
        }
    }

    document.querySelectorAll(".concurrency-lab").forEach((root, rootIndex) => {
        const titleId = "concurrency-lab-title-" + (rootIndex + 1);

        root.setAttribute("aria-labelledby", titleId);
        root.innerHTML =
            '<span class="concurrency-lab__eyebrow">Simulação interativa</span>' +
            '<h3 id="' + titleId + '" class="concurrency-lab__title">Um garçom só, um salão lotado</h3>' +
            '<p class="concurrency-lab__intro">5 clientes tentam conectar quase ao mesmo tempo. Escolha como o servidor reage a isso e clique em enviar.</p>' +
            '<div class="concurrency-lab__mode-switch" role="group" aria-label="Escolha o modo de atendimento">' +
            '<button type="button" class="concurrency-lab__mode-button is-active" data-mode="blocking">await (bloqueante)</button>' +
            '<button type="button" class="concurrency-lab__mode-button" data-mode="fireforget">fire-and-forget</button>' +
            "</div>" +
            '<div class="concurrency-lab__loop">' +
            '<div class="concurrency-lab__section-label">Loop do servidor (AcceptTcpClientAsync)</div>' +
            '<div class="concurrency-lab__loop-track" data-loop-track></div>' +
            "</div>" +
            '<div class="concurrency-lab__section-label">Clientes</div>' +
            '<div class="concurrency-lab__lanes" data-lanes></div>' +
            '<div class="concurrency-lab__log" data-log aria-live="polite"></div>' +
            '<div class="concurrency-lab__summary" data-summary></div>' +
            '<div class="concurrency-lab__controls">' +
            '<button type="button" class="concurrency-lab__button" data-action="play">▶ Chegar 5 clientes</button>' +
            "</div>";

        const modeButtons = Array.from(root.querySelectorAll("[data-mode]"));
        const loopTrack = root.querySelector("[data-loop-track]");
        const lanesEl = root.querySelector("[data-lanes]");
        const logEl = root.querySelector("[data-log]");
        const summaryEl = root.querySelector("[data-summary]");
        const playBtn = root.querySelector('[data-action="play"]');

        let mode = "blocking";
        let timers = [];
        let running = false;
        const laneRefs = {};

        function clearTimers() {
            timers.forEach((id) => window.clearTimeout(id));
            timers = [];
        }

        function schedule(fn, time) {
            timers.push(window.setTimeout(fn, reduceMotion ? Math.min(time, 60) : time));
        }

        function resetDisplay() {
            loopTrack.innerHTML = "";
            logEl.innerHTML = "";
            summaryEl.classList.remove("is-visible");
            summaryEl.textContent = "";

            lanesEl.innerHTML = ARRIVALS.map(
                (_, index) =>
                    '<div class="concurrency-lab__lane">' +
                    '<span class="concurrency-lab__lane-label">Cliente ' + (index + 1) + "</span>" +
                    '<div class="concurrency-lab__lane-track" data-lane-track="' + (index + 1) + '">' +
                    '<div class="concurrency-lab__lane-wait" data-lane-wait="' + (index + 1) + '"></div>' +
                    '<div class="concurrency-lab__lane-busy" data-lane-busy="' + (index + 1) + '"></div>' +
                    "</div>" +
                    "</div>"
            ).join("");

            ARRIVALS.forEach((_, index) => {
                const id = index + 1;
                laneRefs[id] = {
                    wait: root.querySelector('[data-lane-wait="' + id + '"]'),
                    busy: root.querySelector('[data-lane-busy="' + id + '"]')
                };
            });
        }

        function appendLog(text) {
            const line = document.createElement("div");
            line.className = "concurrency-lab__log-line";
            line.textContent = text;
            logEl.appendChild(line);
            logEl.scrollTop = logEl.scrollHeight;
        }

        function renderLoopSegment(client) {
            const segment = document.createElement("div");
            segment.className = "concurrency-lab__loop-segment";
            segment.style.left = pct(client.acceptStart);
            segment.textContent = String(client.id);

            const endTime = mode === "blocking" ? client.processEnd : client.acceptEnd;
            const duration = endTime - client.acceptStart;

            loopTrack.appendChild(segment);

            if (reduceMotion) {
                segment.style.width = pct(duration);
                return;
            }

            requestAnimationFrame(() => {
                segment.style.transition = "width " + duration + "ms linear";
                requestAnimationFrame(() => {
                    segment.style.width = pct(duration);
                });
            });
        }

        function renderWait(client) {
            const refs = laneRefs[client.id];
            refs.wait.style.left = pct(client.arrival);
            refs.wait.style.width = pct(client.wait);
        }

        function renderBusyStart(client) {
            const refs = laneRefs[client.id];
            const duration = client.processEnd - client.acceptEnd;
            refs.busy.style.left = pct(client.acceptEnd);

            if (reduceMotion) {
                refs.busy.style.width = pct(duration);
                return;
            }

            requestAnimationFrame(() => {
                refs.busy.style.transition = "width " + duration + "ms linear";
                requestAnimationFrame(() => {
                    refs.busy.style.width = pct(duration);
                });
            });
        }

        function renderBusyDone(client) {
            laneRefs[client.id].busy.classList.add("is-done");
        }

        function play() {
            if (running) return;
            running = true;
            clearTimers();
            resetDisplay();
            playBtn.disabled = true;
            playBtn.textContent = "Atendendo…";

            const schedule_ = buildSchedule(mode);
            const timeline = buildTimeline(schedule_);

            timeline.forEach((event) => {
                schedule(() => {
                    appendLog(logText(mode, event));

                    if (event.kind === "arrival") {
                        renderWait(event.client);
                    } else if (event.kind === "accept") {
                        renderLoopSegment(event.client);
                        renderBusyStart(event.client);
                    } else if (event.kind === "finish") {
                        renderBusyDone(event.client);
                    }
                }, event.time);
            });

            const totalTime = Math.max(...schedule_.map((c) => c.processEnd));
            const maxWait = Math.max(...schedule_.map((c) => c.wait));

            schedule(() => {
                summaryEl.textContent =
                    mode === "blocking"
                        ? "😩 5 clientes atendidos, mas em fila — o último esperou " +
                          formatTime(maxWait) +
                          " só para ser aceito, porque um cliente bloqueava o loop inteiro até terminar. Tempo total: " +
                          formatTime(totalTime) +
                          "."
                        : "🚀 5 clientes aceitos quase ao mesmo tempo — a espera máxima para ser aceito foi de só " +
                          formatTime(maxWait) +
                          ", porque o loop nunca fica preso esperando ninguém. Tempo total: " +
                          formatTime(totalTime) +
                          ".";
                summaryEl.classList.add("is-visible");
                playBtn.disabled = false;
                playBtn.textContent = "↺ Enviar de novo";
                running = false;
            }, totalTime + END_PAUSE);
        }

        modeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                if (running) return;
                mode = button.dataset.mode;
                modeButtons.forEach((btn) => btn.classList.toggle("is-active", btn === button));
                resetDisplay();
                playBtn.textContent = "▶ Chegar 5 clientes";
            });
        });

        playBtn.addEventListener("click", play);

        resetDisplay();
    });
}());

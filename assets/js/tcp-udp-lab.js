(function () {
    const NETWORK = [
        { id: 1, depart: 0, arriveAt: 700, lost: false },
        { id: 2, depart: 300, arriveAt: 1000, lost: false },
        { id: 3, depart: 600, arriveAt: 1000, lost: true },
        { id: 4, depart: 900, arriveAt: 1900, lost: false },
        { id: 5, depart: 1200, arriveAt: 1600, lost: false },
        { id: 6, depart: 1500, arriveAt: 2000, lost: false }
    ];
    const RETRANSMIT_DELAY = 1800;
    const RETRANSMIT_TRAVEL = 700;
    const LANE_TOPS = ["18%", "42%", "66%", "88%"];
    const END_PAUSE = 500;

    const reduceMotion =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function formatTime(ms) {
        return (ms / 1000).toFixed(1) + "s";
    }

    function buildFlights(mode) {
        const flights = NETWORK.map((pkt, index) => ({
            id: pkt.id,
            label: String(pkt.id),
            depart: pkt.depart,
            duration: pkt.arriveAt - pkt.depart,
            lost: pkt.lost,
            lane: LANE_TOPS[index % LANE_TOPS.length]
        }));

        if (mode === "tcp") {
            const lostPkt = NETWORK.find((pkt) => pkt.lost);
            flights.push({
                id: lostPkt.id,
                label: lostPkt.id + " ↻",
                depart: lostPkt.depart + RETRANSMIT_DELAY,
                duration: RETRANSMIT_TRAVEL,
                lost: false,
                lane: LANE_TOPS[flights.length % LANE_TOPS.length]
            });
        }

        return flights;
    }

    function buildTimeline(mode) {
        const rawEvents = [];
        NETWORK.forEach((pkt) => {
            rawEvents.push({ time: pkt.depart, kind: "send", id: pkt.id });
            rawEvents.push({ time: pkt.arriveAt, kind: pkt.lost ? "lost" : "arrive", id: pkt.id });
        });

        if (mode === "tcp") {
            const lostPkt = NETWORK.find((pkt) => pkt.lost);
            const retransDepart = lostPkt.depart + RETRANSMIT_DELAY;
            rawEvents.push({ time: retransDepart, kind: "send", id: lostPkt.id, retransmit: true });
            rawEvents.push({
                time: retransDepart + RETRANSMIT_TRAVEL,
                kind: "arrive",
                id: lostPkt.id,
                retransmit: true
            });
        }

        rawEvents.sort((a, b) => a.time - b.time);

        const timeline = [];
        let expected = 1;
        const buffer = [];

        function flushBuffer(startTime) {
            let t = startTime;
            let flushed = true;
            while (flushed) {
                flushed = false;
                const index = buffer.indexOf(expected);
                if (index !== -1) {
                    buffer.splice(index, 1);
                    timeline.push({ time: t, kind: "deliver", id: expected, buffer: buffer.slice() });
                    expected += 1;
                    t += 150;
                    flushed = true;
                }
            }
        }

        rawEvents.forEach((event) => {
            if (event.kind === "send") {
                timeline.push({ time: event.time, kind: "send", id: event.id, retransmit: !!event.retransmit });
                return;
            }

            if (event.kind === "lost") {
                timeline.push({ time: event.time, kind: "lost", id: event.id });
                return;
            }

            if (mode === "udp") {
                timeline.push({ time: event.time, kind: "deliver-udp", id: event.id });
                return;
            }

            if (event.id === expected) {
                timeline.push({ time: event.time, kind: "deliver", id: event.id, buffer: buffer.slice() });
                expected += 1;
                flushBuffer(event.time + 150);
            } else {
                buffer.push(event.id);
                timeline.push({ time: event.time, kind: "hold", id: event.id, expected, buffer: buffer.slice() });
            }
        });

        return timeline;
    }

    function logText(mode, event) {
        const t = "[" + formatTime(event.time) + "]";
        switch (event.kind) {
            case "send":
                return event.retransmit
                    ? t + " Cliente percebe que o pacote " + event.id + " não foi confirmado e reenvia."
                    : t + " Cliente envia o pacote " + event.id + ".";
            case "lost":
                return mode === "udp"
                    ? t + " Pacote " + event.id + " se perde na rede — ninguém vai reclamar, a aplicação nunca vai saber que ele existiu."
                    : t + " Pacote " + event.id + " se perde na rede — o TCP vai notar a falta e reagir.";
            case "deliver-udp":
                return t + " Servidor entrega o pacote " + event.id + " para a aplicação assim que chega.";
            case "hold":
                return (
                    t +
                    " Pacote " +
                    event.id +
                    " chega fora de ordem — o TCP guarda no buffer e continua esperando o pacote " +
                    event.expected +
                    "."
                );
            case "deliver":
                return t + " Servidor entrega o pacote " + event.id + " para a aplicação, em ordem.";
            default:
                return "";
        }
    }

    document.querySelectorAll(".tcp-udp-lab").forEach((root, rootIndex) => {
        const titleId = "tcp-udp-lab-title-" + (rootIndex + 1);

        root.setAttribute("aria-labelledby", titleId);
        root.innerHTML =
            '<span class="tcp-udp-lab__eyebrow">Simulação interativa</span>' +
            '<h3 id="' + titleId + '" class="tcp-udp-lab__title">Mesma rede, duas filosofias diferentes</h3>' +
            '<p class="tcp-udp-lab__intro">Os mesmos 6 pacotes, pela mesma rede instável (um se perde, dois trocam de ordem no caminho). Escolha um protocolo e clique em enviar para ver como cada um resolve — ou finge que não viu — o mesmo problema.</p>' +
            '<div class="tcp-udp-lab__mode-switch" role="group" aria-label="Escolha o protocolo">' +
            '<button type="button" class="tcp-udp-lab__mode-button is-active" data-mode="tcp">TCP (confiável)</button>' +
            '<button type="button" class="tcp-udp-lab__mode-button" data-mode="udp">UDP (rápido)</button>' +
            "</div>" +
            '<div class="tcp-udp-lab__stage">' +
            '<div class="tcp-udp-lab__node"><span class="tcp-udp-lab__node-name">Cliente</span><span class="tcp-udp-lab__node-hint">envia 1 → 6</span></div>' +
            '<div class="tcp-udp-lab__track" data-track></div>' +
            '<div class="tcp-udp-lab__node"><span class="tcp-udp-lab__node-name">Servidor</span><span class="tcp-udp-lab__node-hint" data-server-hint>aplicação recebe aqui</span></div>' +
            "</div>" +
            '<div class="tcp-udp-lab__buffer" data-buffer></div>' +
            '<div class="tcp-udp-lab__section-label">Entregue à aplicação</div>' +
            '<div class="tcp-udp-lab__ticker" data-ticker></div>' +
            '<div class="tcp-udp-lab__section-label">O que está acontecendo</div>' +
            '<div class="tcp-udp-lab__log" data-log aria-live="polite"></div>' +
            '<div class="tcp-udp-lab__summary" data-summary></div>' +
            '<div class="tcp-udp-lab__controls">' +
            '<button type="button" class="tcp-udp-lab__button" data-action="play">▶ Enviar pacotes</button>' +
            "</div>";

        const modeButtons = Array.from(root.querySelectorAll("[data-mode]"));
        const track = root.querySelector("[data-track]");
        const bufferEl = root.querySelector("[data-buffer]");
        const tickerEl = root.querySelector("[data-ticker]");
        const logEl = root.querySelector("[data-log]");
        const summaryEl = root.querySelector("[data-summary]");
        const playBtn = root.querySelector('[data-action="play"]');

        let mode = "tcp";
        let timers = [];
        let running = false;

        function clearTimers() {
            timers.forEach((id) => window.clearTimeout(id));
            timers = [];
        }

        function schedule(fn, time) {
            timers.push(window.setTimeout(fn, reduceMotion ? Math.min(time, 60) : time));
        }

        function resetDisplay() {
            track.innerHTML = '<div class="tcp-udp-lab__track-line"></div>';
            bufferEl.innerHTML = "";
            tickerEl.innerHTML = "";
            logEl.innerHTML = "";
            summaryEl.classList.remove("is-visible");
            summaryEl.textContent = "";
        }

        function appendLog(text) {
            const line = document.createElement("div");
            line.className = "tcp-udp-lab__log-line";
            line.textContent = text;
            logEl.appendChild(line);
            logEl.scrollTop = logEl.scrollHeight;
        }

        function renderTicker(chips) {
            tickerEl.innerHTML = chips
                .map((chip) => {
                    const cls = chip.gap ? "tcp-udp-lab__ticker-chip is-gap" : "tcp-udp-lab__ticker-chip";
                    return '<span class="' + cls + '">' + chip.label + "</span>";
                })
                .join("");
        }

        function renderBuffer(ids, expected) {
            if (!ids.length) {
                if (mode !== "tcp") {
                    bufferEl.innerHTML = "";
                } else if (expected > NETWORK.length) {
                    bufferEl.innerHTML = '<span class="tcp-udp-lab__buffer-label">Buffer: vazio — tudo entregue.</span>';
                } else {
                    bufferEl.innerHTML =
                        '<span class="tcp-udp-lab__buffer-label">Buffer: vazio, esperando pacote ' + expected + "</span>";
                }
                return;
            }
            const chips = ids
                .slice()
                .sort((a, b) => a - b)
                .map((id) => '<span class="tcp-udp-lab__buffer-chip">' + id + "</span>")
                .join("");
            bufferEl.innerHTML =
                '<span class="tcp-udp-lab__buffer-label">Buffer, esperando pacote ' + expected + ":</span>" + chips;
        }

        function spawnFlight(flight) {
            const chip = document.createElement("span");
            chip.className = "tcp-udp-lab__chip no-transition";
            chip.textContent = flight.label;
            chip.style.top = flight.lane;
            chip.style.left = "4%";
            track.appendChild(chip);

            void chip.offsetWidth;
            chip.classList.add("is-visible");

            const duration = reduceMotion ? 40 : flight.duration;
            const endLeft = flight.lost ? "50%" : "96%";

            requestAnimationFrame(() => {
                chip.style.transition = "left " + duration + "ms linear";
                chip.classList.remove("no-transition");
                requestAnimationFrame(() => {
                    chip.style.left = endLeft;
                });
            });

            window.setTimeout(() => {
                if (flight.lost) {
                    chip.classList.add("is-lost");
                    chip.textContent = "✕ " + flight.id;
                }
                window.setTimeout(() => {
                    chip.style.transition = "opacity 300ms ease";
                    chip.classList.remove("is-visible");
                    window.setTimeout(() => chip.remove(), 320);
                }, 350);
            }, duration);
        }

        function play() {
            if (running) return;
            running = true;
            clearTimers();
            resetDisplay();
            playBtn.disabled = true;
            playBtn.textContent = "Enviando…";

            const flights = buildFlights(mode);
            const timeline = buildTimeline(mode);

            flights.forEach((flight) => {
                schedule(() => spawnFlight(flight), flight.depart);
            });

            const deliveredChips = [];
            let lastExpected = 1;

            timeline.forEach((event) => {
                schedule(() => {
                    appendLog(logText(mode, event));

                    if (event.kind === "deliver-udp") {
                        deliveredChips.push({ label: String(event.id), gap: false });
                        renderTicker(deliveredChips);
                    } else if (event.kind === "lost" && mode === "udp") {
                        deliveredChips.push({ label: "✕", gap: true });
                        renderTicker(deliveredChips);
                    } else if (event.kind === "deliver") {
                        deliveredChips.push({ label: String(event.id), gap: false });
                        renderTicker(deliveredChips);
                        lastExpected = event.id + 1;
                        renderBuffer(event.buffer, lastExpected);
                    } else if (event.kind === "hold") {
                        lastExpected = event.expected;
                        renderBuffer(event.buffer, lastExpected);
                    }
                }, event.time);
            });

            const lastTime = Math.max(
                0,
                ...flights.map((f) => f.depart + f.duration + 400),
                ...timeline.map((e) => e.time)
            );

            schedule(() => {
                const total = deliveredChips.filter((chip) => !chip.gap).length;
                const timeLabel = formatTime(lastTime);

                if (mode === "tcp") {
                    summaryEl.textContent =
                        "✅ 6 de 6 pacotes entregues, em ordem perfeita (1, 2, 3, 4, 5, 6). Custou 1 retransmissão e " +
                        timeLabel +
                        " no total — esse é o preço de nunca perder nada.";
                } else {
                    summaryEl.textContent =
                        "⚠️ " +
                        total +
                        " de 6 pacotes entregues, fora de ordem (1, 2, 5, 4, 6) — o pacote 3 sumiu de vez e ninguém vai reenviar. Em compensação, levou só " +
                        timeLabel +
                        ", bem menos que o TCP.";
                }
                summaryEl.classList.add("is-visible");
                playBtn.disabled = false;
                playBtn.textContent = "↺ Enviar de novo";
                running = false;
            }, lastTime + END_PAUSE);
        }

        modeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                if (running) return;
                mode = button.dataset.mode;
                modeButtons.forEach((btn) => btn.classList.toggle("is-active", btn === button));
                resetDisplay();
                playBtn.textContent = "▶ Enviar pacotes";
            });
        });

        playBtn.addEventListener("click", play);

        resetDisplay();
    });
}());

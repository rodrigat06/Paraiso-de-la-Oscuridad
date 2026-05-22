document.addEventListener("DOMContentLoaded", () => {
    const estilosVinilo = {
        "WORLWIDE TORTURE": ["#ff6a9e", "#f5ff7e", "#2a0012"],
        "WAR ZONE URCHIN": ["#d6ff4f", "#ff4a9b", "#130016"],
        "PESTICIDES": ["#7dffcb", "#b3002d", "#061410"],
        "SUPER SLAUGHTER": ["#ff273f", "#ffffff", "#190006"],
        "YANDERE": ["#ff9ad5", "#f5ff7e", "#210014"],
        "MONSTER TRUCK": ["#ff3131", "#66dbff", "#150006"],
        "R U LOOKING 4 ME NOW": ["#9ad7ff", "#ff7fa7", "#07111c"],
        "PUPPY POUND": ["#ffa6d6", "#7dffcb", "#1a0615"],
        "CARNAGE": ["#ff003c", "#f5ff7e", "#1a0005"],
        "PIGGIE": ["#ffc2df", "#ff3d86", "#1f0612"],
        "FAVOURITE TOY": ["#c7b6ff", "#66dbff", "#10081c"],
        "TERRIFIED": ["#8da2ff", "#ff9ad5", "#080b1f"],
        "YOU KNOW WHAT YOU'VE DONE": ["#ff5d5d", "#f5ff7e", "#1c0303"],
        "IT'S NOT MY FAULT(IT'S YOURS)": ["#ff7fa7", "#ffffff", "#210008"],
        "DARLING": ["#ffd1dc", "#7dffcb", "#160014"]
    };

    const cards = Array.from(document.querySelectorAll(".cd-card"));
    const giroActivo = new WeakMap();

    function iniciarGiro(card) {
        const button = card.querySelector(".cd-boton");
        if (!button || giroActivo.has(card)) return;

        const estado = { angulo: 0, ultimoTiempo: performance.now(), frame: 0 };
        giroActivo.set(card, estado);

        function girar(tiempo) {
            if (!card.classList.contains("reproduciendo")) {
                button.style.removeProperty("transform");
                giroActivo.delete(card);
                return;
            }

            const diferencia = tiempo - estado.ultimoTiempo;
            estado.ultimoTiempo = tiempo;
            estado.angulo = (estado.angulo + diferencia * 0.22) % 360;
            button.style.setProperty("transform", `rotate(${estado.angulo}deg)`, "important");
            estado.frame = requestAnimationFrame(girar);
        }

        estado.frame = requestAnimationFrame(girar);
    }

    function detenerGiro(card) {
        const button = card.querySelector(".cd-boton");
        const estado = giroActivo.get(card);
        if (estado) cancelAnimationFrame(estado.frame);
        giroActivo.delete(card);
        if (button) button.style.removeProperty("transform");
    }

    function normalizar(texto) {
        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, " ")
            .trim();
    }

    function fuenteAudio(audio) {
        return audio?.querySelector("source")?.getAttribute("src") || audio?.getAttribute("src") || "";
    }

    function pausarOtros(audioActual) {
        cards.forEach((card) => {
            const audio = card.querySelector("audio");
            if (audio && audio !== audioActual) {
                audio.pause();
                audio.currentTime = 0;
                card.classList.remove("reproduciendo", "encontrada");
                detenerGiro(card);
            }
        });
    }

    function reproducirCard(card) {
        const button = card.querySelector(".cd-boton");
        const audio = card.querySelector("audio");
        const status = card.querySelector(".estado-audio");
        const title = card.querySelector("h3")?.textContent?.trim() || "vinilo";
        if (!button || !audio) return;

        if (!fuenteAudio(audio)) {
            card.classList.add("audio-pendiente", "encontrada");
            if (status) status.textContent = "Añade el audio";
            card.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        pausarOtros(audio);
        card.classList.add("encontrada");
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("reproduciendo");
        iniciarGiro(card);
        button.setAttribute("aria-label", "Pausar " + title);
        if (status) status.textContent = "Reproduciendo";

        audio.play().catch(() => {
            if (status) status.textContent = "Revisa el archivo de audio";
        });
    }

    cards.forEach((card) => {
        const button = card.querySelector(".cd-boton");
        const audio = card.querySelector("audio");
        const status = card.querySelector(".estado-audio");
        const title = card.querySelector("h3")?.textContent?.trim() || "vinilo";
        if (!button || !audio) return;

        const colors = estilosVinilo[title] || ["#ff7fa7", "#66dbff", "#1a0005"];
        card.style.setProperty("--vinyl-primary", colors[0]);
        card.style.setProperty("--vinyl-secondary", colors[1]);
        card.style.setProperty("--vinyl-shadow", colors[2]);
        card.style.setProperty("--vinyl-title", colors[1]);

        const image = button.querySelector("img");
        if (image) {
            button.style.setProperty("--single-cover", `url("${image.getAttribute("src")}")`);
        }

        if (!fuenteAudio(audio)) {
            card.classList.add("audio-pendiente");
            button.title = "Añade el audio de " + title;
            if (status) status.textContent = "Añade el audio";
        }

        button.addEventListener("click", () => {
            if (card.classList.contains("reproduciendo")) {
                audio.pause();
                card.classList.remove("reproduciendo");
                detenerGiro(card);
                button.setAttribute("aria-label", "Reproducir " + title);
                if (status) status.textContent = "Pausado";
                return;
            }

            reproducirCard(card);
        });

        audio.addEventListener("ended", () => {
            card.classList.remove("reproduciendo");
            detenerGiro(card);
            button.setAttribute("aria-label", "Reproducir " + title);
            if (status) status.textContent = "Finalizado";
        });
    });

    window.Ejecutar = function () {
        const buscador = document.getElementById("mibuscador");
        const termino = normalizar(buscador?.value || "");
        if (!termino) return;

        const encontrada = cards.find((card) => normalizar(card.querySelector("h3")?.textContent).includes(termino));
        if (encontrada) reproducirCard(encontrada);
    };

    const buscador = document.getElementById("mibuscador");
    if (buscador) {
        let temporizador;
        buscador.addEventListener("input", () => {
            clearTimeout(temporizador);
            temporizador = setTimeout(() => {
                const termino = normalizar(buscador.value);
                if (termino.length < 3) return;
                const coincidencias = cards.filter((card) => normalizar(card.querySelector("h3")?.textContent).includes(termino));
                if (coincidencias.length === 1) reproducirCard(coincidencias[0]);
            }, 550);
        });

        buscador.addEventListener("keydown", (event) => {
            if (event.key === "Enter") window.Ejecutar();
        });
    }
});




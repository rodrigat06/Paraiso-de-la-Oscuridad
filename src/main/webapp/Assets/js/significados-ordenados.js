(function () {
    function limpiar(texto) {
        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function textoAlbum(summary) {
        const copia = summary.cloneNode(true);
        copia.querySelectorAll("span").forEach((span) => span.remove());
        return copia.textContent.trim();
    }

    function idCancion(album, cancion) {
        return limpiar(`${album}-${cancion}`).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }

    function cantanteActual() {
        if (document.body.classList.contains("melanie-seccion")) return "Melanie Martinez";
        if (document.body.classList.contains("jazmin-seccion")) return "Jazmin Bean";
        return "";
    }

    function categoriaCancion(album, titulo) {
        const albumLimpio = limpiar(album);
        const tituloLimpio = limpiar(titulo);
        const epKeys = [
            "ep",
            "remixes",
            "session",
            "the voice performances"
        ];
        const singles = new Set([
            "dollhouse",
            "pity party",
            "soap",
            "sippy cup",
            "gingerbreadman",
            "copy cat",
            "fire drill",
            "void",
            "possession",
            "disney princess",
            "worlwide torture",
            "war zone urchin",
            "pesticides",
            "super slaughter",
            "yandere",
            "monster truck",
            "r u looking 4 me now",
            "puppy pound",
            "carnage",
            "piggie",
            "favourite toy",
            "terrified",
            "you know what youve done",
            "its not my fault its yours",
            "darling"
        ]);

        if (epKeys.some((key) => albumLimpio.includes(key))) return "EPs";
        if (singles.has(tituloLimpio)) return "Singles";
        return "Albums";
    }

    function extraerDatos() {
        const albumes = [];
        const cantantePagina = cantanteActual();
        const cantantes = Array.from(document.querySelectorAll(".cantante-significado"));
        const origenes = cantantePagina
            ? cantantes.filter((cantante) => limpiar(cantante.querySelector(":scope > summary span")?.textContent) === limpiar(cantantePagina))
            : cantantes;

        (origenes.length ? origenes : cantantes).forEach((cantante) => {
            cantante.querySelectorAll(".album-significado").forEach((albumDetalle) => {
            const summaryAlbum = albumDetalle.querySelector(":scope > summary");
            const album = textoAlbum(summaryAlbum || albumDetalle);
            const canciones = [];

            albumDetalle.querySelectorAll(".cancion-detalle").forEach((detalle) => {
                const summaryCancion = detalle.querySelector(":scope > summary");
                const titulo = (summaryCancion?.textContent || "Cancion").trim();
                const panelLetra = detalle.querySelector(".letra-panel");
                const panelSentido = detalle.querySelector(".sentido-panel");
                const letra = panelSentido ? (panelLetra?.innerHTML || "") : "";
                const significado = panelSentido?.innerHTML || panelLetra?.innerHTML || "<p>Significado pendiente.</p>";
                canciones.push({ album, titulo, letra, significado, id: idCancion(album, titulo), categoria: categoriaCancion(album, titulo) });
            });

            if (canciones.length) albumes.push({ album, canciones });
            });
        });

        if (cantantePagina === "Melanie Martinez") completarMelanie(albumes);
        return albumes;
    }

    function crearCancionExtra(album, titulo, categoria) {
        const tema = categoria === "EPs"
            ? `pieza publicada dentro de ${album}`
            : "single destacado dentro del universo visual de Melanie Martinez";
        return {
            album,
            titulo,
            categoria,
            id: idCancion(`${categoria}-${album}`, titulo),
            letra: `<h4>Letra</h4><p class="letra-placeholder">Añade aquí la letra de "${titulo}".</p><p class="tema-guia"><strong>Tema guía:</strong> ${tema}.</p>`,
            significado: `<h4>Significado</h4><p>"${titulo}" funciona como ${tema}. Puedes ampliar este significado con detalles concretos de la canción, sus símbolos y su relación con la estética de Melanie Martinez.</p>`
        };
    }

    function completarMelanie(albumes) {
        const eps = [
            ["The Voice Performances EP", ["Toxic", "Hit The Road Jack", "Seven Nation Army", "Too Close", "Crazy", "Lights", "Bulletproof"]],
            ["Dollhouse EP", ["Dollhouse", "Carousel", "Dead To Me", "Bittersweet Tragedy"]],
            ["Carousel Remixes", ["Carousel", "Carousel - Bleep Bloop Remix", "Carousel - Bobby Green Remix", "Carousel - SNBRN Remix"]],
            ["Soap Remixes", ["Soap", "Soap - Steve James Remix", "Soap - Stooki Sound Remix", "Soap - Sailors Remix"]],
            ["Pity Party Remixes", ["Pity Party", "Pity Party - K Theory Remix", "Pity Party - The Feels Remix", "Pity Party - XV Remix"]],
            ["After School EP", ["Notebook", "Test Me", "Brain & Heart", "Numbers", "Glued", "Field Trip", "The Bakery"]]
        ];
        const singles = ["Dollhouse", "Pity Party", "Soap", "Sippy Cup", "Gingerbreadman", "Copy Cat", "Fire Drill", "Void", "Possession", "Disney Princess"];

        eps.forEach(([album, titulos]) => {
            albumes.push({ album, canciones: titulos.map((titulo) => crearCancionExtra(album, titulo, "EPs")) });
        });
        albumes.push({ album: "Singles", canciones: singles.map((titulo) => crearCancionExtra("Singles", titulo, "Singles")) });
    }

    function crearBoton(cancion) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "significado-cancion-btn";
        boton.dataset.significadoId = cancion.id;
        boton.innerHTML = `<strong>${cancion.titulo}</strong><span>${cancion.album}</span>`;
        return boton;
    }

    function montarVista(albumes) {
        const contenedor = document.querySelector(".significados-artistas");
        if (!contenedor || !albumes.length) return;
        const canciones = albumes.flatMap((album) => album.canciones);
        contenedor.innerHTML = "";
        contenedor.className = "significados-archivo";

        const buscador = document.createElement("section");
        buscador.className = "significados-buscador-panel";
        buscador.innerHTML = `<label for="buscador-significados-interno">Buscar significado</label><input id="buscador-significados-interno" type="search" placeholder="Cancion, album o tema..."><div class="sugerencias-significados"></div>`;

        const indice = document.createElement("aside");
        indice.className = "significados-indice";
        const categorias = ["Albums", "EPs", "Singles"];
        categorias.forEach((categoria) => {
            const cancionesCategoria = canciones.filter((cancion) => cancion.categoria === categoria);
            if (!cancionesCategoria.length) return;

            const grupoCategoria = document.createElement("details");
            grupoCategoria.className = "significados-categoria-bloque";
            grupoCategoria.open = categoria === "Albums";
            grupoCategoria.innerHTML = `<summary>${categoria} <span>${cancionesCategoria.length} canciones</span></summary>`;

            if (categoria === "Singles") {
                const bloque = document.createElement("section");
                const vistas = new Set();
                bloque.className = "significados-album-bloque";
                bloque.dataset.significadoCategoria = categoria;
                bloque.innerHTML = "<h3>Singles</h3>";
                cancionesCategoria.forEach((cancion) => {
                    const clave = limpiar(cancion.titulo);
                    if (vistas.has(clave)) return;
                    vistas.add(clave);
                    bloque.appendChild(crearBoton(cancion));
                });
                grupoCategoria.querySelector("span").textContent = `${vistas.size} canciones`;
                grupoCategoria.appendChild(bloque);
            } else {
                albumes.forEach((grupo) => {
                    const cancionesGrupo = grupo.canciones.filter((cancion) => cancion.categoria === categoria);
                    if (!cancionesGrupo.length) return;
                    const bloque = document.createElement("section");
                    bloque.className = "significados-album-bloque";
                    bloque.dataset.significadoCategoria = categoria;
                    bloque.innerHTML = `<h3>${grupo.album}</h3>`;
                    cancionesGrupo.forEach((cancion) => bloque.appendChild(crearBoton(cancion)));
                    grupoCategoria.appendChild(bloque);
                });
            }

            if (grupoCategoria.querySelector("[data-significado-id]")) indice.appendChild(grupoCategoria);
        });

        if (!indice.children.length) {
            albumes.forEach((grupo) => {
                const bloque = document.createElement("section");
                bloque.className = "significados-album-bloque";
                bloque.innerHTML = `<h3>${grupo.album}</h3>`;
                grupo.canciones.forEach((cancion) => bloque.appendChild(crearBoton(cancion)));
                indice.appendChild(bloque);
            });
        }

        const ficha = document.createElement("article");
        ficha.className = "significado-ficha-activa";

        const layout = document.createElement("div");
        layout.className = "significados-layout-fijo";
        layout.append(indice, ficha);
        contenedor.append(buscador, layout);

        function mostrar(cancion) {
            const letraHtml = cancion.letra ? `<section class="significado-bloque-texto significado-bloque-letra">${cancion.letra}</section>` : "";
            ficha.innerHTML = `
                <header>
                    <p>${cancion.album}</p>
                    <h2>${cancion.titulo}</h2>
                </header>
                <div class="significado-dos-columnas ${cancion.letra ? "" : "significado-dos-columnas--solo"}">
                    ${letraHtml}
                    <section class="significado-bloque-texto significado-bloque-sentido">${cancion.significado}</section>
                </div>
            `;
            document.querySelectorAll("[data-significado-id]").forEach((boton) => {
                boton.classList.toggle("activo", boton.dataset.significadoId === cancion.id);
            });
            history.replaceState(null, "", `#${cancion.id}`);
        }

        function filtrar(valor) {
            const termino = limpiar(valor);
            const resultados = canciones.filter((cancion) => limpiar(`${cancion.titulo} ${cancion.album} ${cancion.significado}`).includes(termino));
            document.querySelectorAll(".significados-album-bloque").forEach((bloque) => {
                let visibles = 0;
                bloque.querySelectorAll("[data-significado-id]").forEach((boton) => {
                    const visible = !termino || resultados.some((cancion) => cancion.id === boton.dataset.significadoId);
                    boton.hidden = !visible;
                    if (visible) visibles += 1;
                });
                bloque.hidden = visibles === 0;
            });
            document.querySelectorAll(".significados-categoria-bloque").forEach((bloque) => {
                const visibles = Array.from(bloque.querySelectorAll(".significados-album-bloque")).some((grupo) => !grupo.hidden);
                bloque.hidden = visibles === false;
                if (termino && visibles) bloque.open = true;
            });
            return resultados;
        }

        contenedor.addEventListener("click", (event) => {
            const boton = event.target.closest("[data-significado-id]");
            if (!boton) return;
            const cancion = canciones.find((item) => item.id === boton.dataset.significadoId);
            if (cancion) mostrar(cancion);
        });

        const inputInterno = buscador.querySelector("input");
        const sugerencias = buscador.querySelector(".sugerencias-significados");
        const inputSuperior = document.getElementById("mibuscador");

        function actualizarBusqueda(valor) {
            const resultados = filtrar(valor).slice(0, 8);
            sugerencias.innerHTML = "";
            if (!valor.trim()) return;
            resultados.forEach((cancion) => {
                const opcion = crearBoton(cancion);
                opcion.classList.add("sugerencia-significado");
                sugerencias.appendChild(opcion);
            });
        }

        [inputInterno, inputSuperior].filter(Boolean).forEach((input) => {
            input.addEventListener("input", () => actualizarBusqueda(input.value));
            input.addEventListener("keydown", (event) => {
                if (event.key !== "Enter") return;
                const primero = filtrar(input.value)[0];
                if (primero) mostrar(primero);
            });
        });

        const inicial = canciones.find((item) => `#${item.id}` === window.location.hash) || canciones[0];
        mostrar(inicial);
    }

    document.addEventListener("DOMContentLoaded", () => montarVista(extraerDatos()));
})();


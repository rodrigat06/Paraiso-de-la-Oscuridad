(function () {
    function getLeaves(book) {
        const leaves = Array.from(book.querySelectorAll(".hoja"));
        const numbered = leaves.every((leaf) => /^p\d+$/i.test(leaf.id || ""));
        if (!numbered) return leaves;
        return leaves.sort((a, b) => Number(a.id.replace(/\D/g, "")) - Number(b.id.replace(/\D/g, "")));
    }

    function getBackImage(leaf) {
        const back = leaf.querySelector(".cara.trasera");
        const image = back ? back.querySelector("img") : null;
        return leaf.dataset.imagenTrasera ||
            leaf.dataset.backImage ||
            (back && (back.dataset.imagenTrasera || back.dataset.backImage)) ||
            (image ? image.getAttribute("src") : "") ||
            "";
    }

    function prepareBackImages(leaves) {
        leaves.forEach((leaf) => {
            const back = leaf.querySelector(".cara.trasera");
            if (!back) return;
            const path = getBackImage(leaf);
            let image = back.querySelector("img");
            if (!image && path) {
                image = document.createElement("img");
                image.src = path;
                image.alt = "";
                back.appendChild(image);
            }
            if (image) {
                image.classList.add("imagen-trasera-hoja");
                back.classList.add("tiene-imagen-trasera");
            }
            back.querySelectorAll(".pagina-trasera-placeholder").forEach((item) => item.remove());
        });
    }

    function ensureLeftPage(book) {
        let page = book.querySelector(".pagina-izquierda-visual");
        if (!page) {
            page = document.createElement("div");
            page.className = "pagina-izquierda-visual";
            book.appendChild(page);
        }
        return page;
    }

    function cloneButton(button) {
        if (!button) return null;
        const clone = button.cloneNode(true);
        clone.removeAttribute("onclick");
        button.replaceWith(clone);
        return clone;
    }

    function initBook(book) {
        if (book.dataset.bookNormalized === "true") return;
        const leaves = getLeaves(book);
        if (!leaves.length) return;

        book.dataset.bookNormalized = "true";
        book.classList.add("libro-normalizado");
        prepareBackImages(leaves);

        let open = book.classList.contains("abierto");
        let current = open ? 1 : 0;
        const container = book.closest(".contenedor-maestro") || document;
        const controls = container.querySelector(".controles-libro");
        const buttons = controls ? Array.from(controls.querySelectorAll(".btn-libro, button")) : [];
        const prev = cloneButton(buttons.find((button) => button.matches("[data-ep-prev-page]")) || buttons[0]);
        const toggle = cloneButton(buttons.find((button) => button.matches("[data-ep-toggle]")) || buttons[1]);
        const next = cloneButton(buttons.find((button) => button.matches("[data-ep-next-page]")) || buttons[2]);
        const label = container.querySelector("[data-ep-page-label], .ep-page-label");
        const leftPage = ensureLeftPage(book);

        function pauseMedia() {
            book.querySelectorAll("audio, video").forEach((media) => media.pause());
        }

        function render() {
            book.classList.toggle("abierto", open);
            leaves.forEach((leaf, index) => {
                leaf.classList.toggle("girada", index < current);
                leaf.classList.toggle("pagina-actual", index === current);
                leaf.classList.toggle("pagina-previa", open && index === current - 1);
                leaf.style.zIndex = index < current ? String(100 + index) : String(100 + leaves.length - index);
            });

            if (!open || current <= 0) {
                leftPage.classList.remove("activa", "con-imagen");
                leftPage.innerHTML = "";
            } else {
                const imagePath = getBackImage(leaves[current - 1]);
                leftPage.classList.add("activa");
                leftPage.classList.toggle("con-imagen", Boolean(imagePath));
                leftPage.innerHTML = imagePath ? `<img src="${imagePath}" alt="">` : "";
            }

            if (toggle) toggle.textContent = open ? "Cerrar libro" : "Abrir libro";
            if (prev) prev.disabled = !open || current <= 0;
            if (next) next.disabled = !open || current >= leaves.length - 1;
            if (label) label.textContent = `${Math.min(current + 1, leaves.length)} / ${leaves.length}`;
            pauseMedia();
        }

        function goTo(index) {
            open = true;
            current = Math.max(0, Math.min(index, leaves.length - 1));
            render();
        }

        function findPageBySearch(query) {
            const normalized = query.toLowerCase().trim();
            if (!normalized) return -1;
            return leaves.findIndex((leaf) =>
                Array.from(leaf.querySelectorAll("h3")).some((title) => title.textContent.toLowerCase().trim() === normalized)
            );
        }

        if (toggle) {
            toggle.addEventListener("click", () => {
                open = !open;
                current = open ? Math.max(current, 1) : 0;
                render();
            });
        }

        if (prev) {
            prev.addEventListener("click", () => {
                if (!open || current <= 0) return;
                current -= 1;
                render();
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                if (!open) {
                    open = true;
                    current = Math.max(current, 1);
                    render();
                    return;
                }
                if (current < leaves.length - 1) {
                    current += 1;
                    render();
                }
            });
        }

        book.bookGoTo = goTo;
        book.bookFindPage = findPageBySearch;

        if (book.id === "miLibro") {
            window.abrirCerrar = () => {
                open = !open;
                current = open ? Math.max(current, 1) : 0;
                render();
            };
            window.avanzar = () => {
                if (!open) open = true;
                if (current < leaves.length - 1) current += 1;
                render();
            };
            window.retroceder = () => {
                if (!open || current <= 0) return;
                current -= 1;
                render();
            };
            window.irAPaginaDirecto = (pageNumber) => {
                const index = Math.max(0, Number(pageNumber || 1) - 1);
                goTo(index);
            };
        }

        render();
    }

    function initSearch() {
        const input = document.getElementById("mibuscador");
        const book = document.querySelector(".libro-fisico");
        if (!input || !book || book.dataset.searchNormalized === "true") return;
        book.dataset.searchNormalized = "true";

        window.Ejecutar = function () {
            const index = typeof book.bookFindPage === "function" ? book.bookFindPage(input.value) : -1;
            if (index === -1) {
                alert("Esa canción no existe en este libro.");
                return;
            }
            book.bookGoTo(index);
            input.value = "";
        };

        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                window.Ejecutar();
            }
        });
    }

    function init() {
        document.querySelectorAll(".libro-fisico").forEach(initBook);
        initSearch();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

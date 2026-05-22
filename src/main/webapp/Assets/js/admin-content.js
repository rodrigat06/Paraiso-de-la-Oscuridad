(function () {
    const KEY = "wikisingers_admin_contenido_v1";
    const ADMIN_ROLE_KEY = "sportbook-user-role";


    function injectStyles() {
        if (document.getElementById("admin-content-style")) return;
        const style = document.createElement("style");
        style.id = "admin-content-style";
        style.textContent = `
            .admin-fab{position:fixed;right:1rem;bottom:1rem;z-index:9999;width:3.1rem;height:3.1rem;border-radius:50%;border:.14rem solid #fff;background:#111;color:#fff;font-family:Arial,sans-serif;font-weight:700;font-size:.82rem;cursor:pointer;box-shadow:0 .35rem 1rem rgba(0,0,0,.28);display:grid;place-items:center}.admin-fab:hover{background:#ff7fa7;color:#111}.admin-backdrop{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.42);display:grid;place-items:center;padding:1rem}.admin-backdrop[hidden]{display:none}.panel-admin-contenido{width:min(34rem,94%);max-height:88vh;overflow:auto;background:#fff;color:#181018;border:.12rem solid #222;border-radius:.45rem;box-shadow:0 1rem 2.4rem rgba(0,0,0,.38);box-sizing:border-box;font-family:Arial,sans-serif}.admin-panel-header{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 1rem .75rem;border-bottom:.08rem solid #eee}.admin-panel-header h2{margin:0;font-size:1rem;line-height:1.3;color:#181018}.admin-panel-header p{margin:.18rem 0 0;color:#666;font-size:.82rem}.admin-close{border:0;background:#eee;color:#222;width:2rem;height:2rem;border-radius:.35rem;cursor:pointer;font-size:1.2rem;line-height:1}.admin-close:hover{background:#ddd}.admin-form-contenido{display:grid;gap:.75rem;padding:1rem}.admin-form-contenido[hidden]{display:none}.admin-form-contenido label{display:grid;gap:.32rem;color:#222;font-size:.82rem;font-weight:700}.admin-form-contenido input,.admin-form-contenido textarea{width:100%;min-height:2.3rem;padding:.62rem .7rem;background:#fff;color:#111;border:.08rem solid #ccc;border-radius:.35rem;font:inherit;font-size:.92rem;box-sizing:border-box}.admin-form-contenido input:focus,.admin-form-contenido textarea:focus{outline:.14rem solid rgba(255,127,167,.35);border-color:#ff7fa7}.admin-form-contenido textarea{min-height:6rem;resize:vertical}.admin-form-acciones{display:flex;justify-content:flex-end;gap:.5rem;padding-top:.2rem}.admin-form-acciones button,.admin-lista-contenido button{border:0;border-radius:.35rem;padding:.62rem .85rem;font-weight:700;cursor:pointer}.admin-form-acciones button[type=submit]{background:#111;color:#fff}.admin-form-acciones button[type=submit]:hover{background:#ff7fa7;color:#111}.admin-form-acciones [data-admin-cancelar]{background:#eee;color:#222}.admin-lista-contenido{display:grid;gap:.45rem;padding:0 1rem 1rem}.admin-lista-contenido:empty{display:none}.admin-lista-contenido article{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.4rem .65rem;align-items:center;padding:.65rem;border:.08rem solid #eee;border-radius:.4rem;background:#fafafa}.admin-lista-contenido strong{color:#181018;font-size:.9rem}.admin-lista-contenido span{grid-column:1;color:#777;font-size:.8rem}.admin-lista-contenido button{grid-column:2;grid-row:1 / span 2;background:#ffe8ef;color:#8f0033}.admin-lista-contenido button:hover{background:#ffbfd2}.canciones-admin-libro{width:min(64rem,92%);margin:1.5rem auto;padding:1rem;background:#fff;color:#181018;border:.12rem solid #222;border-radius:.45rem;box-shadow:0 .7rem 1.6rem rgba(0,0,0,.22);box-sizing:border-box;font-family:Arial,sans-serif}.canciones-admin-libro h2{margin:0 0 .9rem;font-size:1rem}.canciones-admin-libro>div{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:.8rem}.cancion-admin-card{display:grid;grid-template-columns:4.8rem minmax(0,1fr);gap:.75rem;padding:.75rem;background:#fafafa;color:#181018;border:.08rem solid #eee;border-radius:.45rem}.cancion-admin-card img{width:4.8rem;height:4.8rem;object-fit:cover;border-radius:.3rem}.cancion-admin-card h3,.cancion-admin-card p{margin:0 0 .35rem}.cancion-admin-card audio{width:100%}@media (max-width:36rem){.admin-fab{right:.75rem;bottom:.75rem}.admin-form-acciones{justify-content:stretch}.admin-form-acciones button{flex:1}.admin-lista-contenido article,.cancion-admin-card{grid-template-columns:1fr}.admin-lista-contenido span,.admin-lista-contenido button{grid-column:auto;grid-row:auto}}
        `;
        document.head.appendChild(style);
    }

    function isAdmin() {
        return String(localStorage.getItem(ADMIN_ROLE_KEY) || "").toLowerCase() === "admin";
    }

    function load() {
        try {
            return JSON.parse(localStorage.getItem(KEY) || "{}");
        } catch {
            return {};
        }
    }

    function save(data) {
        localStorage.setItem(KEY, JSON.stringify(data));
    }

    function pageKey() {
        return decodeURIComponent(location.pathname).replace(/\\/g, "/").toLowerCase();
    }

    function esc(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function slug(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "nuevo";
    }

    function entries(type) {
        return (load()[pageKey()] || []).filter((item) => item.type === type);
    }

    function addEntry(entry) {
        const data = load();
        const key = pageKey();
        data[key] = data[key] || [];
        data[key].push({ ...entry, id: `${Date.now()}-${Math.random().toString(16).slice(2)}` });
        save(data);
    }

    function removeEntry(id) {
        const data = load();
        const key = pageKey();
        data[key] = (data[key] || []).filter((item) => item.id !== id);
        save(data);
    }

    function detectType() {
        if (document.querySelector(".cd-grid")) return "single";
        if (document.querySelector(".significados-artistas")) return "significado";
        if (document.querySelector(".grid-albums")) return location.pathname.toLowerCase().includes("eps.html") ? "ep" : "album";
        if (document.querySelector(".libro-fisico, .ep-book")) return "cancion-libro";
        return "contenido";
    }

    function field(name, label, type = "text", placeholder = "") {
        return `<label>${label}<input name="${name}" type="${type}" placeholder="${placeholder}"></label>`;
    }

    function textarea(name, label, placeholder = "") {
        return `<label>${label}<textarea name="${name}" placeholder="${placeholder}"></textarea></label>`;
    }

    function formHtml(type) {
        if (type === "single") {
            return `
                ${field("titulo", "Cancion", "text", "Nombre de la cancion")}
                ${field("genero", "Genero", "text", "Dark Pop, Trap Metal...")}
                ${field("mood", "Mood", "text", "Rabia, Triste, Amor...")}
                ${field("imagen", "Imagen", "text", "../img/portada.jpg")}
                ${field("audio", "Audio", "text", "../audio/cancion.mp3")}
            `;
        }

        if (type === "album" || type === "ep") {
            return `
                ${field("titulo", type === "ep" ? "EP" : "Album", "text", "Nombre")}
                ${field("imagen", "Imagen", "text", "../img/portada.jpg")}
                ${field("enlace", "Enlace", "text", "Mi Album.html")}
            `;
        }

        if (type === "significado") {
            return `
                ${field("titulo", "Cancion", "text", "Nombre de la cancion")}
                ${field("album", "Disco", "text", "Singles, EP o album")}
                ${textarea("significado", "Significado", "Escribe el significado...")}
            `;
        }

        return `
            ${field("titulo", "Cancion", "text", "Nombre de la cancion")}
            ${field("genero", "Genero", "text", "Genero")}
            ${field("mood", "Mood", "text", "Mood")}
            ${field("imagen", "Imagen", "text", "../img/portada.jpg")}
            ${field("audio", "Audio", "text", "../audio/cancion.mp3")}
            ${textarea("descripcion", "Descripcion", "Texto de la pagina o nota")}
        `;
    }

    function adminPanel(type) {
        if (!isAdmin()) return;
        const fab = document.createElement("button");
        fab.type = "button";
        fab.className = "admin-fab";
        fab.textContent = "+";
        fab.setAttribute("aria-label", `Añadir ${labelType(type)}`);

        const backdrop = document.createElement("div");
        backdrop.className = "admin-backdrop";
        backdrop.hidden = true;
        backdrop.innerHTML = `
            <section class="panel-admin-contenido" role="dialog" aria-modal="true" aria-label="Panel de administrador">
                <header class="admin-panel-header">
                    <div>
                        <h2>Añadir ${labelType(type)}</h2>
                        <p>Completa los datos y guarda.</p>
                    </div>
                    <button type="button" class="admin-close" aria-label="Cerrar">×</button>
                </header>
                <form class="admin-form-contenido">
                    ${formHtml(type)}
                    <div class="admin-form-acciones">
                        <button type="button" data-admin-cancelar>Cancelar</button>
                        <button type="submit">Guardar</button>
                    </div>
                </form>
                <div class="admin-lista-contenido"></div>
            </section>
        `;
        document.body.append(fab, backdrop);

        const form = backdrop.querySelector("form");
        const open = () => {
            backdrop.hidden = false;
            form.querySelector("input, textarea")?.focus();
        };
        const close = () => {
            backdrop.hidden = true;
            form.reset();
        };

        fab.addEventListener("click", open);
        backdrop.querySelector(".admin-close").addEventListener("click", close);
        backdrop.querySelector("[data-admin-cancelar]").addEventListener("click", close);
        backdrop.addEventListener("click", (event) => {
            if (event.target === backdrop) close();
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !backdrop.hidden) close();
        });
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(form).entries());
            if (!data.titulo?.trim()) return;
            addEntry({ type, ...data });
            location.reload();
        });
        renderAdminList(backdrop, type);
    }

    function labelType(type) {
        return ({ single: "single", album: "album", ep: "EP", significado: "significado", "cancion-libro": "cancion" })[type] || "contenido";
    }

    function renderAdminList(panel, type) {
        const list = panel.querySelector(".admin-lista-contenido");
        const items = entries(type);
        if (!items.length) return;
        list.innerHTML = items.map((item) => `
            <article>
                <strong>${esc(item.titulo)}</strong>
                <span>${esc(item.album || item.genero || labelType(type))}</span>
                <button type="button" data-admin-remove="${esc(item.id)}">Eliminar</button>
            </article>
        `).join("");
        list.addEventListener("click", (event) => {
            const button = event.target.closest("[data-admin-remove]");
            if (!button) return;
            removeEntry(button.dataset.adminRemove);
            location.reload();
        });
    }

    function renderSingle(item) {
        const grid = document.querySelector(".cd-grid");
        if (!grid) return;
        const title = esc(item.titulo).toUpperCase();
        const image = esc(item.imagen || "../img/singles.jpg");
        const audio = esc(item.audio || "");
        grid.insertAdjacentHTML("beforeend", `
            <article class="cd-card admin-creado" data-genero="${esc(item.genero)}" data-mood="${esc(item.mood)}">
                <button type="button" class="cd-boton" aria-label="Reproducir ${title}">
                    <img src="${image}" alt="${title}">
                </button>
                <h3>${title}</h3>
                <p class="estado-audio">${audio ? `Audio preparado: ${esc(audio.split('/').pop())}` : "Añade el audio"}</p>
                <audio preload="none">${audio ? `<source src="${audio}" type="audio/mpeg">` : ""}</audio>
            </article>
        `);
    }

    function renderAlbumCard(item) {
        const grid = document.querySelector(".grid-albums");
        if (!grid) return;
        const href = esc(item.enlace || "#");
        const image = esc(item.imagen || "../img/singles.jpg");
        grid.insertAdjacentHTML("beforeend", `
            <a href="${href}" class="album-card admin-creado">
                <img src="${image}" alt="${esc(item.titulo)}">
                <p>${esc(item.titulo)}</p>
                <img src="${image}" alt="">
            </a>
        `);
    }

    function renderSignificado(item) {
        const contenedor = document.querySelector(".cantante-significado") || document.querySelector(".significados-artistas");
        if (!contenedor) return;
        let album = Array.from(contenedor.querySelectorAll(".album-significado")).find((detalle) => {
            const summary = detalle.querySelector(":scope > summary");
            return summary && summary.textContent.toLowerCase().includes(String(item.album || "admin").toLowerCase());
        });
        if (!album) {
            album = document.createElement("details");
            album.className = "album-significado";
            album.open = true;
            album.innerHTML = `<summary>${esc(item.album || "Añadidas por admin")} <span>Admin</span></summary><div class="canciones-significado"></div>`;
            contenedor.appendChild(album);
        }
        album.querySelector(".canciones-significado")?.insertAdjacentHTML("beforeend", `
            <details class="cancion-detalle admin-creado">
                <summary>${esc(item.titulo)}</summary>
                <div class="letra-panel"><h4>Significado</h4><p>${esc(item.significado)}</p></div>
            </details>
        `);
    }

    function renderBookSong(item) {
        const controles = document.querySelector(".controles-libro");
        if (!controles) return;
        let panel = document.querySelector(".canciones-admin-libro");
        if (!panel) {
            panel = document.createElement("section");
            panel.className = "canciones-admin-libro";
            panel.innerHTML = "<h2>Canciones añadidas</h2><div></div>";
            controles.insertAdjacentElement("afterend", panel);
        }
        const image = esc(item.imagen || "../img/singles.jpg");
        const audio = esc(item.audio || "");
        panel.querySelector("div").insertAdjacentHTML("beforeend", `
            <article class="cancion-admin-card admin-creado" data-genero="${esc(item.genero)}" data-mood="${esc(item.mood)}">
                <img src="${image}" alt="${esc(item.titulo)}">
                <div>
                    <h3>${esc(item.titulo)}</h3>
                    <p>${esc(item.descripcion || "Cancion añadida por administrador.")}</p>
                    ${audio ? `<audio controls preload="none" src="${audio}"></audio>` : `<p>Añade el audio</p>`}
                </div>
            </article>
        `);
    }

    function renderEntries(type) {
        entries(type).forEach((item) => {
            if (type === "single") renderSingle(item);
            if (type === "album" || type === "ep") renderAlbumCard(item);
            if (type === "significado") renderSignificado(item);
            if (type === "cancion-libro") renderBookSong(item);
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        injectStyles();
        const type = detectType();
        renderEntries(type);
        adminPanel(type);
    });
})();




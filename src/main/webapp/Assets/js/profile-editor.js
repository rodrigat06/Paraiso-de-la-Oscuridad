(function () {
    const KEY = "wikisingers_perfil_usuario";
    const ARTISTS_KEY = "wikisingers_artistas_personalizados";

    function normalEmail(value) {
        return String(value || "").trim().toLowerCase();
    }

    function currentEmail() {
        return normalEmail(localStorage.getItem("sportbook-user-email") || localStorage.getItem("user-email"));
    }

    function profileKey(email = currentEmail()) {
        const clean = normalEmail(email).replace(/[^a-z0-9._-]/g, "_");
        return clean ? `${KEY}_${clean}` : KEY;
    }

    function loadProfile() {
        try {
            const activeEmail = currentEmail();
            const profile = JSON.parse(localStorage.getItem(profileKey(activeEmail)) || "{}");
            if (profile && Object.keys(profile).length) return profile;

            const legacy = JSON.parse(localStorage.getItem(KEY) || "{}");
            if (normalEmail(legacy.email) === activeEmail) return legacy;
            return {};
        } catch { return {}; }
    }

    function loadArtists() {
        try {
            const artists = JSON.parse(localStorage.getItem(ARTISTS_KEY) || "[]");
            return Array.isArray(artists) ? artists : [];
        } catch { return []; }
    }

    function saveProfile(profile) {
        const email = currentEmail();
        const safeProfile = { ...profile, email };
        localStorage.setItem(profileKey(email), JSON.stringify(safeProfile));
        window.WikiSingersSQL?.guardarEstado?.(profileKey(email), JSON.stringify(safeProfile), { email }).catch(() => {});
    }

    function escapeHTML(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    function defaultProfile() {
        const stored = loadProfile();
        const email = currentEmail();
        return {
            nombre: stored.nombre || (email ? email.split("@")[0] : "Mi perfil"),
            email,
            descripcion: stored.descripcion || "",
            imagen: stored.imagen || ""
        };
    }

    function readFile(file) {
        return new Promise((resolve) => {
            if (!file) { resolve(""); return; }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve("");
            reader.readAsDataURL(file);
        });
    }

    function fallbackAvatar(profile) {
        return profile.imagen || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23140509'/%3E%3Ccircle cx='50' cy='34' r='18' fill='%23ffb5dc'/%3E%3Cpath d='M18 92c5-24 20-36 32-36s27 12 32 36' fill='%23ff7fa7'/%3E%3C/svg%3E";
    }

    function ownArtists(profile) {
        const email = normalEmail(profile.email);
        return loadArtists().filter((artist) => {
            const owner = normalEmail(artist.ownerEmail || artist.creadorEmail || artist.email);
            if (artist.tipo !== "propio") return false;
            if (!email) return false;
            return owner === email;
        });
    }

    function countSongs(artist) {
        const albumSongs = (artist.albums || []).reduce((total, album) => total + (album.canciones || []).length, 0);
        const epSongs = (artist.eps || []).reduce((total, ep) => total + (ep.canciones || []).length, 0);
        return albumSongs + epSongs + (artist.singles || []).length;
    }

    function discographyMarkup(profile) {
        const artists = ownArtists(profile);
        if (!artists.length) {
            return `<div class="perfil-discografia-vacia">Todavía no has publicado música propia.</div>`;
        }

        return artists.map((artist) => `
            <article class="perfil-disco-artista">
                <img src="${escapeHTML(artist.portada || fallbackAvatar(profile))}" alt="${escapeHTML(artist.nombre)}">
                <div>
                    <h3>${escapeHTML(artist.nombre)}</h3>
                    <p>${countSongs(artist)} canciones · ${(artist.albums || []).length} albums · ${(artist.eps || []).length} EPs · ${(artist.singles || []).length} singles</p>
                    <div class="perfil-discografia-lista">
                        ${(artist.albums || []).map((item) => `<span>Album: ${escapeHTML(item.titulo)}</span>`).join("")}
                        ${(artist.eps || []).map((item) => `<span>EP: ${escapeHTML(item.titulo)}</span>`).join("")}
                        ${(artist.singles || []).map((item) => `<span>Single: ${escapeHTML(item.titulo)}</span>`).join("")}
                    </div>
                    <a href="${profileArtistUrl(artist.id)}">Abrir página</a>
                </div>
            </article>
        `).join("");
    }

    function profileArtistUrl(id) {
        const path = decodeURIComponent(location.pathname).replace(/\\/g, "/");
        const segments = path.split("/").filter(Boolean);
        const rootIndex = Math.max(segments.indexOf("webapp"), segments.indexOf("buscador-contactos"));
        const depth = segments.slice(rootIndex >= 0 ? rootIndex + 1 : 0, -1).length;
        const prefix = depth <= 0 ? "" : "../".repeat(depth);
        return `${prefix}Artista Personalizado.html?id=${encodeURIComponent(id)}`;
    }

    function injectStyles() {
        if (document.getElementById("perfil-editor-style")) return;
        const style = document.createElement("style");
        style.id = "perfil-editor-style";
        style.textContent = `
            .perfil-editor-btn{order:1!important;width:7rem!important;min-width:7rem!important;max-width:7rem!important;min-height:6.15rem!important;display:grid!important;grid-template-rows:3.45rem 1.8rem!important;justify-items:center!important;align-items:center!important;gap:.35rem!important;align-self:flex-start!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;color:#66dbff!important;box-shadow:none!important;text-decoration:none!important;font-family:'Press Start 2P','Courier New',monospace!important;cursor:pointer!important;text-transform:uppercase!important;line-height:1!important}.perfil-editor-btn:hover,.perfil-editor-btn:focus-visible{color:#66dbff!important;outline:0!important}.perfil-editor-avatar{width:3.05rem!important;height:3.05rem!important;max-width:3.05rem!important;max-height:3.05rem!important;display:block!important;object-fit:cover!important;object-position:center!important;border-radius:50%!important;border:.12rem solid #ff7fa7!important;background:#140509!important;box-shadow:0 0 .25rem rgba(255,0,0,.8)!important;image-rendering:auto!important;align-self:center!important;justify-self:center!important}.perfil-editor-btn:hover .perfil-editor-avatar,.perfil-editor-btn:focus-visible .perfil-editor-avatar{transform:scale(1.04)}.perfil-editor-btn span{width:6.15rem!important;min-width:6.15rem!important;max-width:6.15rem!important;min-height:1.75rem!important;margin:0!important;padding:.35rem .25rem!important;box-sizing:border-box!important;border:.125rem solid #ff7fa7!important;border-radius:0!important;background-color:#0b0204!important;color:currentColor!important;box-shadow:.25rem .25rem 0 #1a0005,.38rem .38rem 0 #b3002d!important;font-size:.46rem!important;line-height:1.45!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;text-transform:uppercase!important;white-space:normal!important;overflow:hidden!important;text-overflow:ellipsis!important}
            .perfil-modal{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:1rem;background:rgba(6,0,6,.78);backdrop-filter:contrast(1.1) saturate(1.1)}.perfil-modal[hidden]{display:none}
            .perfil-card{width:min(43rem,94vw);max-height:90vh;overflow:auto;background:linear-gradient(135deg,#100006 0%,#21000e 55%,#090004 100%);color:#fff7fb;border:.18rem solid #ff7fa7;border-radius:0;outline:.12rem solid #b3002d;box-shadow:.55rem .55rem 0 #120006,-.35rem -.35rem 0 #ff9fbd,0 0 1.2rem rgba(255,47,125,.45);font-family:'Press Start 2P','Courier New',monospace;scrollbar-color:#ff7fa7 #140509;scrollbar-width:thin}.perfil-card header{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.05rem 1rem;border-bottom:.125rem solid #ff7fa7;background:#140509}.perfil-card h2{margin:0;font-family:'Press Start 2P','Courier New',monospace;font-size:.9rem;line-height:1.5;color:#ff9fbd;text-transform:uppercase;text-shadow:.12rem .12rem 0 #52001b}.perfil-cerrar{display:grid;place-items:center;width:2.25rem;height:2.25rem;border:.125rem solid #ff7fa7;border-radius:0;background:#0b0204;color:#fff7fb;box-shadow:.18rem .18rem 0 #b3002d;cursor:pointer;font-family:'Press Start 2P','Courier New',monospace;font-size:.9rem}.perfil-cerrar:hover{background:#b3002d;color:#fff}
            .perfil-form{display:grid;grid-template-columns:10rem minmax(0,1fr);gap:1rem;padding:1rem}.perfil-preview{display:grid;align-content:start;justify-items:center;gap:.7rem}.perfil-preview img{width:7rem;height:7rem;object-fit:cover;border-radius:50%;border:.16rem solid #ff7fa7;background:#140509;box-shadow:0 0 .8rem rgba(255,127,167,.65)}.perfil-preview span{max-width:100%;font-size:.62rem;line-height:1.45;color:#fff7fb;text-align:center;text-shadow:.12rem .12rem 0 #b3002d;overflow-wrap:anywhere}.perfil-campos{display:grid;gap:.85rem}.perfil-form label{display:grid;gap:.45rem;font-size:.62rem;line-height:1.45;font-weight:400;color:#ff9fbd;text-transform:uppercase;text-shadow:.1rem .1rem 0 #380012}.perfil-form input,.perfil-form textarea{width:100%;min-height:2.8rem;box-sizing:border-box;padding:.72rem .8rem;border:.125rem solid #ff7fa7;border-radius:0;background:#0b0204;color:#fff7fb;box-shadow:.18rem .18rem 0 #4a0018;font:inherit;font-size:.7rem;line-height:1.6}.perfil-form input:focus,.perfil-form textarea:focus{outline:.12rem solid #fff7fb;border-color:#ff9fbd;box-shadow:.18rem .18rem 0 #b3002d}.perfil-form input::placeholder,.perfil-form textarea::placeholder{color:#9b7d8c}.perfil-form input[type=file]{color:#ff9fbd}.perfil-form textarea{min-height:6rem;resize:vertical}
            .perfil-discografia{grid-column:1/-1;display:grid;gap:.75rem;border-top:.125rem solid #ff7fa7;padding-top:1rem}.perfil-discografia h3{margin:0;color:#ff9fbd;text-transform:uppercase;font-size:.78rem;text-shadow:.12rem .12rem 0 #52001b}.perfil-discografia-vacia{padding:.85rem;background:#0b0204;border:.125rem solid #ff7fa7;border-radius:0;color:#fff7fb;box-shadow:.18rem .18rem 0 #4a0018;font-size:.62rem;line-height:1.6}.perfil-disco-artista{display:grid;grid-template-columns:4.5rem minmax(0,1fr);gap:.8rem;padding:.75rem;background:#0b0204;border:.125rem solid #ff7fa7;border-radius:0;box-shadow:.18rem .18rem 0 #4a0018}.perfil-disco-artista img{width:4.5rem;height:4.5rem;object-fit:cover;border-radius:0;border:.1rem solid #ff9fbd}.perfil-disco-artista h3,.perfil-disco-artista p{margin:0 0 .45rem;font-size:.62rem;line-height:1.55;color:#fff7fb}.perfil-discografia-lista{display:flex;flex-wrap:wrap;gap:.35rem;margin:.45rem 0}.perfil-discografia-lista span{padding:.32rem .45rem;background:#2b0011;border:.08rem solid #ff7fa7;border-radius:0;color:#ffbdd3;font-size:.58rem;line-height:1.4}.perfil-disco-artista a{color:#ff9fbd;font-size:.62rem}.perfil-acciones{grid-column:1/-1;display:flex;justify-content:flex-end;gap:.55rem}.perfil-acciones button{border:.125rem solid #ff7fa7;border-radius:0;padding:.75rem .9rem;background:#0b0204;color:#fff7fb;box-shadow:.18rem .18rem 0 #4a0018;font-family:'Press Start 2P','Courier New',monospace;font-size:.62rem;line-height:1.4;text-transform:uppercase;cursor:pointer}.perfil-guardar{background:#b3002d!important;color:#fff!important}.perfil-cancelar{background:#140509!important;color:#ff9fbd!important}.perfil-acciones button:hover{background:#ff7fa7!important;color:#140509!important;border-color:#fff7fb!important}
            @media(max-width:46rem){.perfil-form{grid-template-columns:1fr}.perfil-acciones{justify-content:stretch}.perfil-acciones button{flex:1}.contenedor-derecha{flex-wrap:wrap}}
        `
        document.head.appendChild(style);
    }

    function createModal(profile) {
        let modal = document.getElementById("perfil-editor-modal");
        if (modal) return modal;
        modal = document.createElement("div");
        modal.id = "perfil-editor-modal";
        modal.className = "perfil-modal";
        modal.hidden = true;
        modal.innerHTML = `
            <section class="perfil-card" role="dialog" aria-modal="true" aria-label="Editar perfil">
                <header>
                    <h2>Editar perfil</h2>
                    <button type="button" class="perfil-cerrar" aria-label="Cerrar">×</button>
                </header>
                <form class="perfil-form">
                    <div class="perfil-preview"><img id="perfil-preview-img" alt="Imagen de perfil"><span id="perfil-preview-nombre"></span></div>
                    <div class="perfil-campos">
                        <label>Nombre<input name="nombre" type="text" autocomplete="name"></label>
                        <label>Email<input name="email" type="email" autocomplete="email" readonly></label>
                        <label>Descripción<textarea name="descripcion" placeholder="Cuenta quién eres o qué música haces..."></textarea></label>
                        <label>Foto de perfil<input name="imagen" type="file" accept="image/*"></label>
                    </div>
                    <section class="perfil-discografia"><h3>Mi discografía</h3><div id="perfil-discografia-contenido"></div></section>
                    <div class="perfil-acciones"><button type="button" class="perfil-cancelar">Cancelar</button><button type="submit" class="perfil-guardar">Guardar</button></div>
                </form>
            </section>
        `;
        document.body.appendChild(modal);
        bindModal(modal);
        fillModal(modal, profile);
        return modal;
    }

    function fillModal(modal, profile) {
        const form = modal.querySelector("form");
        form.elements.nombre.value = profile.nombre || "";
        form.elements.email.value = profile.email || "";
        form.elements.descripcion.value = profile.descripcion || "";
        modal.querySelector("#perfil-preview-img").src = fallbackAvatar(profile);
        modal.querySelector("#perfil-preview-nombre").textContent = profile.nombre || "Mi perfil";
        modal.querySelector("#perfil-discografia-contenido").innerHTML = discographyMarkup(profile);
    }

    function bindModal(modal) {
        const close = () => { modal.hidden = true; modal.querySelector("form").reset(); };
        modal.querySelector(".perfil-cerrar").addEventListener("click", close);
        modal.querySelector(".perfil-cancelar").addEventListener("click", close);
        modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
        modal.querySelector('input[name="imagen"]').addEventListener("change", async (event) => {
            const dataUrl = await readFile(event.target.files[0]);
            if (dataUrl) modal.querySelector("#perfil-preview-img").src = dataUrl;
        });
        modal.querySelector('input[name="nombre"]').addEventListener("input", (event) => {
            modal.querySelector("#perfil-preview-nombre").textContent = event.target.value || "Mi perfil";
        });
        modal.querySelector("form").addEventListener("submit", async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const current = defaultProfile();
            const image = await readFile(form.elements.imagen.files[0]);
            const profile = {
                nombre: form.elements.nombre.value.trim() || "Mi perfil",
                email: currentEmail(),
                descripcion: form.elements.descripcion.value.trim(),
                imagen: image || current.imagen || ""
            };
            saveProfile(profile);
            renderButtons(profile);
            close();
        });
        document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modal.hidden) close(); });
    }

    function renderButtons(profile = defaultProfile()) {
        document.querySelectorAll(".perfil-editor-btn").forEach((button) => {
            const img = button.querySelector("img");
            const span = button.querySelector("span");
            if (img) img.src = fallbackAvatar(profile);
            if (span) span.textContent = profile.nombre || "Perfil";
        });
    }

    function buildButton(profile) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "perfil-editor-btn";
        button.innerHTML = `<img class="perfil-editor-avatar" src="${escapeHTML(fallbackAvatar(profile))}" alt="Perfil"><span>${escapeHTML(profile.nombre || "Perfil")}</span>`;
        button.addEventListener("click", () => {
            const fresh = defaultProfile();
            const modal = createModal(fresh);
            fillModal(modal, fresh);
            modal.hidden = false;
            modal.querySelector('input[name="nombre"]')?.focus();
        });
        return button;
    }

    function insertButtons(profile) {
        document.querySelectorAll(".contenedor-derecha").forEach((container) => {
            if (container.querySelector(".perfil-editor-btn")) return;
            const userBox = container.querySelector(".seccion-usuario");
            const button = buildButton(profile);
            if (userBox) container.insertBefore(button, userBox); else container.appendChild(button);
        });

        if (document.querySelector(".contenedor-derecha .perfil-editor-btn")) return;

        document.querySelectorAll(".contenedor-perfil, .seccion-usuario").forEach((container) => {
            if (!container || container.querySelector(".perfil-editor-btn")) return;
            const button = buildButton(profile);
            const logout = container.querySelector(".btn-logout");
            if (logout) logout.insertAdjacentElement("beforebegin", button); else container.appendChild(button);
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        injectStyles();
        const profile = defaultProfile();
        insertButtons(profile);
        renderButtons(profile);
    });
})();



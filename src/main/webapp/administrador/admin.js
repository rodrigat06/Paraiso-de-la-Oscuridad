const KEYS = {
    customArtists: "wikisingers_artistas_personalizados",
    hiddenOfficialArtists: "wikisingers_artistas_oficiales_ocultos",
    localBans: "wikisingers_usuarios_baneados",
    warnings: "wikisingers_advertencias_usuarios",
    adminContent: "wikisingers_admin_contenido_v1"
};

const API_BASE = window.location.origin;
const officialArtists = ["Jazmin Bean", "Melanie Martinez"];

const elements = {
    nav: document.querySelector(".barra-admin"),
    pageTitle: document.getElementById("titulo-vista"),
    toast: document.getElementById("toast"),
    metrics: {
        users: document.getElementById("metric-usuarios"),
        comments: document.getElementById("metric-comentarios"),
        blocked: document.getElementById("metric-bloqueados"),
        warnings: document.getElementById("metric-advertencias")
    },
    recent: document.getElementById("actividad-reciente"),
    comments: document.getElementById("lista-comentarios"),
    users: document.getElementById("lista-usuarios"),
    officialList: document.getElementById("lista-oficiales"),
    customList: document.getElementById("lista-personalizados"),
    moderation: document.getElementById("lista-moderacion")
};

function isAdminSession() {
    return String(localStorage.getItem("sportbook-user-role") || "").toLowerCase() === "admin";
}

function requireAdminSession() {
    if (isAdminSession()) return true;
    document.body.classList.add("admin-bloqueado");
    document.body.innerHTML = `
        <main class="panel-admin panel-acceso-denegado">
            <section class="tarjeta-admin">
                <h1>Acceso reservado</h1>
                <p>Solo el administrador puede entrar en este panel.</p>
                <a href="../Menú.html">Volver al menú</a>
            </section>
        </main>
    `;
    setTimeout(() => {
        window.location.href = "../Menú.html";
    }, 1800);
    return false;
}

function load(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
        return value ?? fallback;
    } catch {
        return fallback;
    }
}

function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("activo");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => elements.toast.classList.remove("activo"), 2400);
}

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function setView(name) {
    document.querySelectorAll(".vista").forEach((view) => view.classList.remove("activa"));
    document.getElementById(`vista-${name}`)?.classList.add("activa");
    document.querySelectorAll("[data-vista]").forEach((button) => button.classList.toggle("activo", button.dataset.vista === name));
    elements.pageTitle.textContent = document.querySelector(`[data-vista="${name}"]`)?.textContent || "Panel";
}

function getCustomArtists() {
    const artists = load(KEYS.customArtists, []);
    return Array.isArray(artists) ? artists : [];
}

function getWarnings() {
    const warnings = load(KEYS.warnings, []);
    return Array.isArray(warnings) ? warnings.map((warning, index) => ({ ...warning, source: "local", localIndex: index })) : [];
}

async function fetchWarningsFromServer() {
    try {
        const data = await fetchJson("/admin/advertencias");
        const warnings = Array.isArray(data) ? data : data.advertencias;
        return Array.isArray(warnings) ? warnings.map((warning) => ({ ...warning, source: "server" })) : [];
    } catch {
        return [];
    }
}

function getLocalBans() {
    const bans = load(KEYS.localBans, []);
    return Array.isArray(bans) ? bans : [];
}

function collectSongComments() {
    const rows = [];
    getCustomArtists().forEach((artist) => {
        const interactions = artist.interacciones || {};
        Object.entries(interactions).forEach(([songId, interaction]) => {
            const comments = Array.isArray(interaction.comentarios) ? interaction.comentarios : [];
            comments.forEach((comment, index) => {
                rows.push({
                    id: `${artist.id}:${songId}:${index}`,
                    artistId: artist.id,
                    artist: artist.nombre || "Artista",
                    songId,
                    song: findSongTitle(artist, songId),
                    rating: Number(interaction.estrellas || 0),
                    comment
                });
            });
        });
    });
    return rows;
}

function findSongTitle(artist, songId) {
    const collections = ["singles", "albums", "eps"];
    for (const collection of collections) {
        for (const item of artist[collection] || []) {
            if (collection === "singles" && item.id === songId) return item.titulo || "Canción";
            for (const song of item.canciones || []) {
                if (typeof song === "object" && song.id === songId) return song.titulo || "Canción";
            }
        }
    }
    return "Canción";
}

function deleteComment(rowId) {
    const [artistId, songId, rawIndex] = rowId.split(":");
    const index = Number(rawIndex);
    const artists = getCustomArtists();
    const artist = artists.find((item) => item.id === artistId);
    const comments = artist?.interacciones?.[songId]?.comentarios;
    if (!Array.isArray(comments) || Number.isNaN(index)) return;
    comments.splice(index, 1);
    save(KEYS.customArtists, artists);
    renderAll();
    showToast("Comentario eliminado.");
}

async function fetchJson(path) {
    const response = await fetch(`${API_BASE}${path}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

async function fetchUsersFromServer() {
    try {
        const data = await fetchJson("/admin/listarUsuarios");
        const users = Array.isArray(data) ? data : data.usuarios;
        return Array.isArray(users) ? users : [];
    } catch {
        try {
            const data = await fetchJson("/admin/usuarios");
            const users = Array.isArray(data) ? data : data.usuarios;
            return Array.isArray(users) ? users : [];
        } catch {
            return [];
        }
    }
}

async function fetchBlockedUsers() {
    try {
        const data = await fetchJson("/admin/listarBloqueados");
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.bloqueados)) return data.bloqueados;
        if (Array.isArray(data.usuarios)) return data.usuarios;
    } catch {
    }
    return getLocalBans();
}

function localUsers() {
    const emails = new Set();
    const current = normalizeEmail(localStorage.getItem("sportbook-user-email") || localStorage.getItem("user-email"));
    if (current) emails.add(current);
    getCustomArtists().forEach((artist) => {
        if (artist.email) emails.add(normalizeEmail(artist.email));
    });
    getLocalBans().forEach((user) => {
        if (user.email) emails.add(normalizeEmail(user.email));
    });
    getWarnings().forEach((warning) => {
        if (warning.email) emails.add(normalizeEmail(warning.email));
    });
    return Array.from(emails).map((email) => ({ email, nombre: email.split("@")[0], rol: email === current ? localStorage.getItem("sportbook-user-role") || "user" : "user" }));
}

function mergeUsers(serverUsers, blockedUsers) {
    const byEmail = new Map();
    [...serverUsers, ...localUsers()].forEach((user) => {
        const email = normalizeEmail(user.email);
        if (!email) return;
        byEmail.set(email, { ...user, email });
    });
    blockedUsers.forEach((blocked) => {
        const email = normalizeEmail(blocked.email);
        if (!email) return;
        byEmail.set(email, { ...(byEmail.get(email) || { email }), bloqueado: true, motivo: blocked.motivo || "Bloqueado" });
    });
    return Array.from(byEmail.values()).sort((a, b) => a.email.localeCompare(b.email));
}

async function blockUser(email, reason = "Bloqueado desde administrador") {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) return;
    try {
        await fetch(`${API_BASE}/admin/bloquear`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail, motivo: reason })
        });
    } catch {
    }
    const bans = getLocalBans().filter((item) => normalizeEmail(item.email) !== cleanEmail);
    bans.push({ email: cleanEmail, motivo: reason, creado_en: new Date().toISOString() });
    save(KEYS.localBans, bans);
    await renderAll();
    showToast("Usuario bloqueado.");
}

async function unblockUser(email) {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) return;
    try {
        await fetch(`${API_BASE}/admin/desbloquear`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail })
        });
    } catch {
    }
    save(KEYS.localBans, getLocalBans().filter((item) => normalizeEmail(item.email) !== cleanEmail));
    await renderAll();
    showToast("Usuario desbloqueado.");
}

async function warnUser(email) {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) return;
    const motivo = prompt("Motivo de la advertencia:", "Revisa tu comportamiento en comentarios.");
    if (!motivo) return;
    try {
        await fetch(`${API_BASE}/admin/advertirUsuario`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail, motivo })
        });
    } catch {
    }
    const warnings = getWarnings();
    warnings.push({ email: cleanEmail, motivo, creado_en: new Date().toISOString() });
    save(KEYS.warnings, warnings);
    await renderAll();
    showToast("Advertencia registrada.");
}

function removeWarning(index) {
    const warnings = getWarnings();
    warnings.splice(index, 1);
    save(KEYS.warnings, warnings);
    renderAll();
    showToast("Advertencia eliminada.");
}

function renderMetrics(users, comments, blocked, warnings) {
    elements.metrics.users.textContent = users.length;
    elements.metrics.comments.textContent = comments.length;
    elements.metrics.blocked.textContent = blocked.length;
    elements.metrics.warnings.textContent = warnings.length;
}

function empty(title, text) {
    return `<article class="item-admin"><h3>${escapeHTML(title)}</h3><p>${escapeHTML(text)}</p></article>`;
}

function renderRecent(comments, warnings) {
    const recent = [
        ...comments.slice(-4).reverse().map((item) => ({ type: "Comentario", title: item.song, text: `${item.artist}: ${item.comment}` })),
        ...warnings.slice(-3).reverse().map((item) => ({ type: "Advertencia", title: item.email, text: item.motivo }))
    ].slice(0, 6);
    elements.recent.innerHTML = recent.length ? recent.map((item) => `
        <article class="item-admin item-compacto">
            <h3>${escapeHTML(item.type)} · ${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(item.text)}</p>
        </article>
    `).join("") : empty("Sin actividad", "Cuando haya comentarios o advertencias aparecerán aquí.");
}

function renderComments(comments) {
    elements.comments.innerHTML = comments.length ? comments.map((item) => `
        <article class="item-admin">
            <h3>${escapeHTML(item.song)}</h3>
            <p><strong>${escapeHTML(item.artist)}</strong> · ${item.rating ? `${item.rating}/5 estrellas` : "Sin valoración"}</p>
            <p>${escapeHTML(item.comment)}</p>
            <div class="acciones-item">
                <button type="button" class="peligro" data-delete-comment="${escapeHTML(item.id)}">Eliminar comentario</button>
            </div>
        </article>
    `).join("") : empty("No hay comentarios", "Aún no se han comentado canciones.");
}

function renderUsers(users) {
    elements.users.innerHTML = users.length ? users.map((user) => `
        <article class="item-admin usuario-item ${user.bloqueado ? "usuario-bloqueado" : ""}">
            <h3>${escapeHTML(user.nombre || user.name || user.email)}</h3>
            <p>${escapeHTML(user.email)} · ${escapeHTML(user.rol || user.role || "user")}</p>
            <p>${user.bloqueado ? `Bloqueado: ${escapeHTML(user.motivo || "Sin motivo")}` : "Usuario activo"}</p>
            <div class="acciones-item">
                <button type="button" data-warn-user="${escapeHTML(user.email)}">Advertir</button>
                ${user.bloqueado
                    ? `<button type="button" data-unblock-user="${escapeHTML(user.email)}">Desbloquear</button>`
                    : `<button type="button" class="peligro" data-block-user="${escapeHTML(user.email)}">Bloquear</button>`}
            </div>
        </article>
    `).join("") : empty("No hay usuarios", "Cuando haya cuentas registradas aparecerán aquí.");
}

function renderArtists() {
    const hidden = load(KEYS.hiddenOfficialArtists, []).filter((name) => officialArtists.includes(name));
    elements.officialList.innerHTML = officialArtists.map((name) => {
        const isHidden = hidden.includes(name);
        return `
            <article class="item-admin">
                <h3>${escapeHTML(name)}</h3>
                <p>${isHidden ? "Oculto en el menú" : "Visible en el menú"}</p>
                <div class="acciones-item">
                    <button type="button" data-toggle-official="${escapeHTML(name)}">${isHidden ? "Mostrar" : "Ocultar"}</button>
                </div>
            </article>
        `;
    }).join("");

    const customArtists = getCustomArtists();
    elements.customList.innerHTML = customArtists.length ? customArtists.map((artist) => `
        <article class="item-admin">
            <h3>${escapeHTML(artist.nombre)}</h3>
            <p>${escapeHTML(artist.tipo === "propio" ? "Artista propio" : "Artista famoso añadido")}</p>
            <div class="acciones-item">
                <a class="boton-secundario" href="../Artista Personalizado.html?id=${encodeURIComponent(artist.id)}">Editar</a>
                <button type="button" class="peligro" data-delete-custom="${escapeHTML(artist.id)}">Eliminar</button>
            </div>
        </article>
    `).join("") : empty("No hay artistas personalizados", "Los artistas creados desde Añadir aparecerán aquí.");
}

function renderModeration(blocked, warnings) {
    const blockMarkup = blocked.length ? blocked.map((user) => `
        <article class="item-admin usuario-bloqueado">
            <h3>${escapeHTML(user.email)}</h3>
            <p>${escapeHTML(user.motivo || "Sin motivo")}</p>
            <div class="acciones-item"><button type="button" data-unblock-user="${escapeHTML(user.email)}">Desbloquear</button></div>
        </article>
    `).join("") : empty("Sin bloqueos", "No hay usuarios bloqueados.");

    const warningMarkup = warnings.length ? warnings.map((warning) => `
        <article class="item-admin usuario-advertido">
            <h3>${escapeHTML(warning.email)}</h3>
            <p>${escapeHTML(warning.motivo)}</p>
            ${warning.source === "local" ? `<div class="acciones-item"><button type="button" data-remove-warning="${warning.localIndex}">Quitar advertencia</button></div>` : ""}
        </article>
    `).join("") : empty("Sin advertencias", "No hay advertencias activas.");

    elements.moderation.innerHTML = `<h3 class="subtitulo-lista">Bloqueados</h3>${blockMarkup}<h3 class="subtitulo-lista">Advertencias</h3>${warningMarkup}`;
}

async function renderAll() {
    const comments = collectSongComments();
    const blocked = await fetchBlockedUsers();
    const users = mergeUsers(await fetchUsersFromServer(), blocked);
    const serverWarnings = await fetchWarningsFromServer();
    const warnings = [...serverWarnings, ...getWarnings()];
    renderMetrics(users, comments, blocked, warnings);
    renderRecent(comments, warnings);
    renderComments(comments);
    renderUsers(users);
    renderArtists();
    renderModeration(blocked, warnings);
}

document.addEventListener("DOMContentLoaded", () => {
    if (!requireAdminSession()) return;

    renderAll();

    elements.nav.addEventListener("click", (event) => {
        const button = event.target.closest("[data-vista]");
        if (button) setView(button.dataset.vista);
    });

    document.addEventListener("click", async (event) => {
        const deleteComment = event.target.closest("[data-delete-comment]");
        const block = event.target.closest("[data-block-user]");
        const unblock = event.target.closest("[data-unblock-user]");
        const warn = event.target.closest("[data-warn-user]");
        const removeWarn = event.target.closest("[data-remove-warning]");
        const toggleOfficial = event.target.closest("[data-toggle-official]");
        const deleteCustom = event.target.closest("[data-delete-custom]");

        if (deleteComment) deleteCommentByButton(deleteComment);
        if (block) await blockUser(block.dataset.blockUser);
        if (unblock) await unblockUser(unblock.dataset.unblockUser);
        if (warn) await warnUser(warn.dataset.warnUser);
        if (removeWarn) removeWarning(Number(removeWarn.dataset.removeWarning));
        if (toggleOfficial) toggleOfficialArtist(toggleOfficial.dataset.toggleOfficial);
        if (deleteCustom) deleteCustomArtist(deleteCustom.dataset.deleteCustom);
    });

    document.getElementById("salir-admin").addEventListener("click", () => {
        localStorage.removeItem("sportbook-authenticated");
        localStorage.removeItem("sportbook-user-role");
        window.location.href = "../index.html";
    });
});

function deleteCommentByButton(button) {
    if (!confirm("¿Eliminar este comentario?")) return;
    deleteComment(button.dataset.deleteComment);
}

function toggleOfficialArtist(name) {
    const hidden = load(KEYS.hiddenOfficialArtists, []);
    const next = hidden.includes(name) ? hidden.filter((item) => item !== name) : [...hidden, name];
    save(KEYS.hiddenOfficialArtists, next);
    renderAll();
    showToast("Visibilidad actualizada.");
}

function deleteCustomArtist(id) {
    if (!confirm("¿Eliminar este artista personalizado?")) return;
    save(KEYS.customArtists, getCustomArtists().filter((artist) => artist.id !== id));
    renderAll();
    showToast("Artista eliminado.");
}


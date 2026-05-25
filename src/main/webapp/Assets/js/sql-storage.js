(function () {
    function loadResponsiveFixes() {
        if (document.querySelector('link[data-responsive-fixes="paraiso"]')) return;

        const script = document.currentScript;
        const src = script ? script.getAttribute("src") || "" : "";
        const base = src.includes("/")
            ? src.slice(0, src.lastIndexOf("/") + 1)
            : "";
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `${base}../css/responsive-fix.css?v=responsive-20260525-2`;
        link.dataset.responsiveFixes = "paraiso";
        document.head.appendChild(link);
    }

    loadResponsiveFixes();

    const globalKeys = new Set([
        "wikisingers_artistas_personalizados",
        "wikisingers_artistas_ocultos",
        "wikisingers_admin_textos",
        "wikisingers_usuarios_baneados",
        "wikisingers_advertencias_usuarios"
    ]);

    const managedPrefixes = [
        "wikisingers_",
        "wikisingers-",
        "sportbook-"
    ];

    const passthroughKeys = new Set([
        "sportbook-authenticated",
        "sportbook-user-email",
        "sportbook-user-role",
        "user-email",
        "wikisingers-auth",
        "filtroMusica"
    ]);

    const original = {
        getItem: Storage.prototype.getItem,
        setItem: Storage.prototype.setItem,
        removeItem: Storage.prototype.removeItem
    };
    const memoryCache = {};

    function shouldSync(key) {
        return key && !passthroughKeys.has(key) && managedPrefixes.some((prefix) => key.startsWith(prefix));
    }

    function userEmail() {
        return (original.getItem.call(localStorage, "sportbook-user-email") || original.getItem.call(localStorage, "user-email") || "").trim().toLowerCase();
    }

    function isGlobal(key) {
        return globalKeys.has(key);
    }

    function apiBase() {
        const path = window.location.pathname;
        const origin = window.location.origin;
        const context = path.includes("/buscador-contactos/") ? "/buscador-contactos" : "";
        return `${origin}${context}/api/state`;
    }

    function canUseSql() {
        return /^https?:$/.test(window.location.protocol);
    }

    function post(endpoint, body) {
        if (!canUseSql()) return;
        fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(body)
        }).catch(() => {});
    }

    async function postEsperando(endpoint, body) {
        if (!canUseSql()) return { ok: false, offline: true };

        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.ok === false) {
            throw new Error(data.mensaje || "No se pudo guardar en MySQL.");
        }
        return data;
    }

    function hydrate() {
        if (!canUseSql()) return;

        try {
            const xhr = new XMLHttpRequest();
            const email = encodeURIComponent(userEmail());
            xhr.open("GET", `${apiBase()}?email=${email}`, false);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.send();

            if (xhr.status < 200 || xhr.status >= 300) return;
            const data = JSON.parse(xhr.responseText || "{}");
            const estado = data.estado || {};

            Object.entries(estado).forEach(([key, value]) => {
                const cleanKey = key.endsWith("::user") ? key.slice(0, -6) : key;
                if (shouldSync(cleanKey)) {
                    try {
                        original.setItem.call(localStorage, cleanKey, value);
                    } catch (error) {
                        memoryCache[cleanKey] = value;
                    }
                }
            });
        } catch (error) {
        }
    }

    Storage.prototype.getItem = function (key) {
        const value = original.getItem.call(this, key);
        if (value !== null || this !== localStorage) return value;
        return Object.prototype.hasOwnProperty.call(memoryCache, key) ? memoryCache[key] : null;
    };

    Storage.prototype.setItem = function (key, value) {
        try {
            original.setItem.call(this, key, value);
            if (this === localStorage) delete memoryCache[key];
        } catch (error) {
            if (this !== localStorage) throw error;
            memoryCache[key] = String(value);
        }

        if (this !== localStorage || !shouldSync(key)) return;

        post(apiBase(), {
            clave: key,
            valor: String(value),
            email: userEmail(),
            global: isGlobal(key)
        });
    };

    Storage.prototype.removeItem = function (key) {
        original.removeItem.call(this, key);
        if (this === localStorage) delete memoryCache[key];
        if (this !== localStorage || !shouldSync(key)) return;

        post(`${apiBase()}/eliminar`, {
            clave: key,
            email: userEmail(),
            global: isGlobal(key)
        });
    };

    window.WikiSingersSQL = {
        guardarEstado(key, value, options = {}) {
            try {
                original.setItem.call(localStorage, key, String(value));
                delete memoryCache[key];
            } catch (error) {
                memoryCache[key] = String(value);
                console.warn("No cabe en localStorage, se intentara guardar solo en MySQL:", key);
            }

            if (!shouldSync(key)) return Promise.resolve({ ok: true, localOnly: true });

            return postEsperando(apiBase(), {
                clave: key,
                valor: String(value),
                email: options.email || userEmail(),
                global: options.global ?? isGlobal(key)
            });
        },
        eliminarEstado(key, options = {}) {
            original.removeItem.call(localStorage, key);
            if (!shouldSync(key)) return Promise.resolve({ ok: true, localOnly: true });

            return postEsperando(`${apiBase()}/eliminar`, {
                clave: key,
                email: options.email || userEmail(),
                global: options.global ?? isGlobal(key)
            });
        }
    };

    hydrate();
})();

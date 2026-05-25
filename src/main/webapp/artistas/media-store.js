// Guarda imagenes y audios elegidos desde el ordenador en el navegador.
// No sube archivos a Railway: quedan guardados en este navegador con IndexedDB.
const MEDIA_DB_NAME = "paraiso-media";
const MEDIA_STORE_NAME = "files";
const MEDIA_PREFIX = "media:";
const mediaUrlCache = new Map();

function openMediaDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MEDIA_DB_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(MEDIA_STORE_NAME, { keyPath: "id" });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function createMediaId(file) {
  const random = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return `${random}-${file.name.replace(/[^a-z0-9.]+/gi, "-").toLowerCase()}`;
}

async function saveFile(file) {
  if (!file) return "";

  const db = await openMediaDb();
  const id = createMediaId(file);
  const record = {
    id,
    name: file.name,
    type: file.type,
    blob: file
  };

  await new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE_NAME, "readwrite");
    tx.objectStore(MEDIA_STORE_NAME).put(record);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });

  return `${MEDIA_PREFIX}${id}`;
}

async function readFile(ref) {
  if (!ref || !ref.startsWith(MEDIA_PREFIX)) return null;

  const id = ref.slice(MEDIA_PREFIX.length);
  const db = await openMediaDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE_NAME, "readonly");
    const request = tx.objectStore(MEDIA_STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function resolve(ref) {
  if (!ref || !ref.startsWith(MEDIA_PREFIX)) return ref || "";
  if (mediaUrlCache.has(ref)) return mediaUrlCache.get(ref);

  const record = await readFile(ref);
  if (!record) return "";

  const url = URL.createObjectURL(record.blob);
  mediaUrlCache.set(ref, url);
  return url;
}

function isMediaRef(value) {
  return typeof value === "string" && value.startsWith(MEDIA_PREFIX);
}

async function hydrate(root = document) {
  const nodes = root.querySelectorAll("[data-media-src]");

  for (const node of nodes) {
    const url = await resolve(node.dataset.mediaSrc);
    if (!url) continue;

    if (node.tagName === "SOURCE") {
      node.src = url;
      node.parentElement?.load();
    } else {
      node.src = url;
    }
  }
}

window.artistMedia = { hydrate, isMediaRef, resolve, saveFile };

const STORAGE_KEY = "sportbook-client-reservations-v1";
const HELP_STORAGE_KEY = "sportbook-help-requests-v1";
const REVIEW_STORAGE_KEY = "sportbook-reviews-v1";
const AUTH_STORAGE_KEY = "sportbook-authenticated";
const ROLE_STORAGE_KEY = "sportbook-user-role";
const API_BASE = window.location.origin;

const elements = {
  navButtons: document.querySelectorAll(".nav button"),
  views: document.querySelectorAll(".view"),
  pageTitle: document.querySelector("#pageTitle"),
  paidIncome: document.querySelector("#paidIncome"),
  pendingIncome: document.querySelector("#pendingIncome"),
  bookingCount: document.querySelector("#bookingCount"),
  blockedCount: document.querySelector("#blockedCount"),
  summaryMessage: document.querySelector("#summaryMessage"),
  paymentFilter: document.querySelector("#paymentFilter"),
  bookingSearch: document.querySelector("#bookingSearch"),
  paymentsTable: document.querySelector("#paymentsTable"),
  helpTable: document.querySelector("#helpTable"),
  reviewsTable: document.querySelector("#reviewsTable"),
  blockedTable: document.querySelector("#blockedTable"),
  blockForm: document.querySelector("#blockForm"),
  blockEmailInput: document.querySelector("#blockEmailInput"),
  refreshButton: document.querySelector("#refreshButton"),
  logoutButton: document.querySelector("#logoutButton"),
  homeButton: document.querySelector("#homeButton"),
  toast: document.querySelector("#toast")
};

let reservations = [];
let helpRequests = [];
let reviews = [];
let blockedUsers = [];

// -------------------------
// UTILIDADES
// -------------------------

function loadArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveArray(key, value) {
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

function formatCurrency(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function displayActivity(activity) {
  const names = {
    Futbol: "Fútbol",
    Padel: "Pádel",
    Natacion: "Natación"
  };

  return names[activity] || activity;
}

function formatDate(dateISO) {
  if (!dateISO) return "Sin fecha";
  if (String(dateISO).includes(" ") || String(dateISO).includes("T")) {
    const parsed = new Date(String(dateISO).replace(" ", "T"));
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(parsed);
    }
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${dateISO}T12:00:00`));
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => elements.toast.classList.remove("show"), 2400);
}

// -------------------------
// CARGA DE DATOS
// -------------------------

function loadData() {
  reservations = loadArray(STORAGE_KEY).map((reservation) => ({
    ...reservation,
    paymentStatus: reservation.paymentStatus || "Pendiente"
  }));
  helpRequests = loadArray(HELP_STORAGE_KEY);
  reviews = loadArray(REVIEW_STORAGE_KEY);
}

function renderAll() {
  loadData();
  renderSummary();
  renderPayments();
  renderHelp();
  renderReviews();
  renderBlocked();
}

// -------------------------
// RESUMEN
// -------------------------

function renderSummary() {
  const paidIncome = reservations
    .filter((r) => r.paymentStatus === "Pagado")
    .reduce((t, r) => t + Number(r.price || 0), 0);

  const pendingIncome = reservations
    .filter((r) => r.paymentStatus !== "Pagado" && r.status !== "Cancelada")
    .reduce((t, r) => t + Number(r.price || 0), 0);

  const pendingBookings = reservations.filter(
    (r) => r.paymentStatus !== "Pagado" && r.status !== "Cancelada"
  ).length;

  elements.paidIncome.textContent = formatCurrency(paidIncome);
  elements.pendingIncome.textContent = formatCurrency(pendingIncome);
  elements.bookingCount.textContent = reservations.length;
  elements.blockedCount.textContent = blockedUsers.length;

  elements.summaryMessage.innerHTML = `
    <strong>${pendingBookings} reservas pendientes de pago</strong>
    <span>${helpRequests.length} solicitudes de ayuda · ${reviews.length} reseñas publicadas</span>
  `;
}

// -------------------------
// PAGOS
// -------------------------

function renderPayments() {
  const filter = elements.paymentFilter.value;
  const search = elements.bookingSearch.value.trim().toLowerCase();

  const filtered = reservations.filter((reservation) => {
    const paymentOk =
      filter === "all" ||
      (filter === "paid" && reservation.paymentStatus === "Pagado") ||
      (filter === "pending" && reservation.paymentStatus !== "Pagado");

    const text = `${reservation.client} ${reservation.email} ${reservation.phone} ${reservation.sport} ${reservation.resource}`.toLowerCase();

    return paymentOk && text.includes(search);
  });

  if (!filtered.length) {
    elements.paymentsTable.innerHTML = emptyMarkup("No hay reservas", "Cuando haya reservas, aparecerán aquí.");
    return;
  }

  elements.paymentsTable.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Reserva</th>
            <th>Importe</th>
            <th>Estado</th>
            <th>Pago</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${filtered
            .map(
              (reservation) => `
            <tr>
              <td><strong>${escapeHTML(reservation.client)}</strong><br><span class="muted">${escapeHTML(reservation.email)} · ${escapeHTML(reservation.phone)}</span></td>
              <td>${escapeHTML(displayActivity(reservation.sport))} · ${escapeHTML(reservation.resource)}<br><span class="muted">${formatDate(reservation.date)} · ${escapeHTML(reservation.time)}</span></td>
              <td>${formatCurrency(reservation.price)}</td>
              <td><span class="badge ${reservation.status === "Cancelada" ? "danger" : "success"}">${escapeHTML(reservation.status)}</span></td>
              <td><span class="badge ${reservation.paymentStatus === "Pagado" ? "success" : "danger"}">${escapeHTML(reservation.paymentStatus)}</span></td>
              <td>
                <div class="actions">
                  <button class="button success" type="button" data-paid-id="${reservation.id}">Pagado</button>
                  <button class="button" type="button" data-pending-id="${reservation.id}">Pendiente</button>
                  <button class="button danger" type="button" data-ban-email="${escapeHTML(reservation.email)}">Bloquear</button>
                </div>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

// -------------------------
// AYUDA
// -------------------------

function renderHelp() {
  if (!helpRequests.length) {
    elements.helpTable.innerHTML = emptyMarkup("No hay formularios de ayuda", "Los mensajes enviados aparecerán aquí.");
    return;
  }

  elements.helpTable.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Motivo</th>
            <th>Mensaje</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${helpRequests
            .map(
              (request) => `
            <tr>
              <td><strong>${escapeHTML(request.name)}</strong><br><span class="muted">${escapeHTML(request.email)} · ${escapeHTML(request.phone || "Sin teléfono")}</span></td>
              <td>${escapeHTML(request.topic)}</td>
              <td>${escapeHTML(request.message)}</td>
              <td>
                <div class="actions">
                  <button class="button danger" type="button" data-delete-help-id="${request.id}">Eliminar</button>
                  <button class="button danger" type="button" data-ban-email="${escapeHTML(request.email)}">Bloquear</button>
                </div>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

// -------------------------
// RESEÑAS
// -------------------------

function renderReviews() {
  if (!reviews.length) {
    elements.reviewsTable.innerHTML = emptyMarkup("No hay reseñas", "Las reseñas publicadas aparecerán aquí.");
    return;
  }

  elements.reviewsTable.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Autor</th>
            <th>Actividad</th>
            <th>Valoración</th>
            <th>Comentario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${reviews
            .map(
              (review) => `
            <tr>
              <td><strong>${escapeHTML(review.name)}</strong></td>
              <td>${escapeHTML(displayActivity(review.sport))}</td>
              <td><span class="badge">${escapeHTML(review.rating)} / 5</span></td>
              <td>${escapeHTML(review.comment)}</td>
              <td><button class="button danger" type="button" data-delete-review-id="${review.id}">Eliminar</button></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

// -------------------------
// 🔥 BLOQUEO REAL EN MYSQL
// -------------------------

async function blockEmail(email) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) return;

  try {
    const res = await fetch(`${API_BASE}/admin/bloquear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, motivo: "Bloqueado desde el panel de administrador" })
    });

    console.log("Respuesta /admin/bloquear:", res.status);

    if (!res.ok) {
      showToast("Error al bloquear (HTTP " + res.status + ")");
      return;
    }

    const data = await res.json().catch(() => ({}));
    console.log("JSON /admin/bloquear:", data);

    if (data.ok === false) {
      showToast(data.mensaje || "No se pudo bloquear el usuario.");
      return;
    }

    showToast("Usuario bloqueado.");
    renderAll();

  } catch (err) {
    console.error("Error bloqueando usuario:", err);
    showToast("Error al conectar con el servidor al bloquear.");
  }
}

async function unblockEmail(email) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) return;

  try {
    const res = await fetch(`${API_BASE}/admin/desbloquear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail })
    });

    console.log("Respuesta /admin/desbloquear:", res.status);

    if (!res.ok) {
      showToast("Error al desbloquear (HTTP " + res.status + ")");
      return;
    }

    const data = await res.json().catch(() => ({}));
    console.log("JSON /admin/desbloquear:", data);

    if (data.ok === false) {
      showToast(data.mensaje || "No se pudo desbloquear el usuario.");
      return;
    }

    showToast("Usuario desbloqueado.");
    renderAll();

  } catch (err) {
    console.error("Error desbloqueando usuario:", err);
    showToast("Error al conectar con el servidor al desbloquear.");
  }
}


// -------------------------
// TABLA DE BLOQUEADOS
// -------------------------


async function renderBlocked() {
  try {
    const res = await fetch(`${API_BASE}/admin/listarBloqueados`);
    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }
    const data = await res.json();
    blockedUsers = Array.isArray(data) ? data : [];
    elements.blockedCount.textContent = blockedUsers.length;

    if (!blockedUsers.length) {
      elements.blockedTable.innerHTML = `
        <div class="empty">
          <strong>No hay usuarios bloqueados</strong>
          <span>Cuando bloquees usuarios aparecerán aquí.</span>
        </div>
      `;
      return;
    }

    elements.blockedTable.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Correo electrónico</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${blockedUsers.map(u => `
              <tr>
                <td>${escapeHTML(u.email)}</td>
                <td>${formatDate(u.creado_en || u.createdAt)}</td>
                <td>
                  <button class="button danger" data-unban-email="${escapeHTML(u.email)}">Desbloquear</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    console.error("Error cargando bloqueados:", err);
    elements.blockedTable.innerHTML = `
      <div class="empty">
        <strong>Error cargando datos</strong>
        <span>No se pudo conectar con el servidor.</span>
      </div>
    `;
  }
}



// -------------------------
// ACCIONES
// -------------------------

function emptyMarkup(title, text) {
  return `<div class="empty"><strong>${escapeHTML(title)}</strong><span>${escapeHTML(text)}</span></div>`;
}

function setPaymentStatus(id, status) {
  reservations = reservations.map((reservation) =>
    String(reservation.id) === String(id)
      ? { ...reservation, paymentStatus: status }
      : reservation
  );
  saveArray(STORAGE_KEY, reservations);
  renderAll();
  showToast(status === "Pagado" ? "Reserva marcada como pagada." : "Reserva marcada como pendiente.");
}

function deleteHelp(id) {
  helpRequests = helpRequests.filter((request) => request.id !== id);
  saveArray(HELP_STORAGE_KEY, helpRequests);
  renderAll();
  showToast("Solicitud eliminada.");
}

function deleteReview(id) {
  reviews = reviews.filter((review) => review.id !== id);
  saveArray(REVIEW_STORAGE_KEY, reviews);
  renderAll();
  showToast("Reseña eliminada.");
}

// -------------------------
// EVENTOS
// -------------------------

elements.navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    elements.navButtons.forEach((item) => item.classList.toggle("active", item === button));
    elements.views.forEach((view) => view.classList.toggle("active", view.id === button.dataset.view));
    elements.pageTitle.textContent = button.textContent;
  });
});

elements.paymentFilter.addEventListener("change", renderPayments);
elements.bookingSearch.addEventListener("input", renderPayments);

elements.refreshButton.addEventListener("click", () => {
  renderAll();
  showToast("Datos actualizados.");
});

const logoutButton = document.querySelector("#logoutButton");

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("sportbook-authenticated");

  const logoutMessage = document.createElement("div");
  logoutMessage.className = "logout-screen";
  logoutMessage.innerHTML = `
    <div class="logout-card">
      <div class="logout-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M20 6 9 17l-5-5"></path>
        </svg>
      </div>
      <h2>Tu sesión se ha cerrado</h2>
      <p>Volviendo al menú principal...</p>
    </div>
  `;

  document.body.appendChild(logoutMessage);

  setTimeout(() => {
    window.location.href = "../index.html";
  }, 1800);
});

elements.paymentsTable.addEventListener("click", (event) => {
  const paidButton = event.target.closest("[data-paid-id]");
  const pendingButton = event.target.closest("[data-pending-id]");
  const banButton = event.target.closest("[data-ban-email]");

  if (paidButton) setPaymentStatus(paidButton.dataset.paidId, "Pagado");
  if (pendingButton) setPaymentStatus(pendingButton.dataset.pendingId, "Pendiente");
  if (banButton) blockEmail(banButton.dataset.banEmail);
});

elements.helpTable.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-help-id]");
  const banButton = event.target.closest("[data-ban-email]");

  if (deleteButton) deleteHelp(deleteButton.dataset.deleteHelpId);
  if (banButton) blockEmail(banButton.dataset.banEmail);
});

elements.reviewsTable.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-review-id]");
  if (deleteButton) deleteReview(deleteButton.dataset.deleteReviewId);
});

elements.blockedTable.addEventListener("click", (event) => {
  const unbanButton = event.target.closest("[data-unban-email]");
  if (unbanButton) unblockEmail(unbanButton.dataset.unbanEmail);
});

elements.blockForm.addEventListener("submit", (event) => {
  event.preventDefault();
  blockEmail(elements.blockEmailInput.value);
  elements.blockForm.reset();
});

// -------------------------
// INICIO
// -------------------------

renderAll();


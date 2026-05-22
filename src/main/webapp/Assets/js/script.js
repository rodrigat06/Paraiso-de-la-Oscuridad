const STORAGE_KEY = "sportbook-client-reservations-v1";
const HELP_STORAGE_KEY = "sportbook-help-requests-v1";
const REVIEW_STORAGE_KEY = "sportbook-reviews-v1";
const AUTH_STORAGE_KEY = "sportbook-authenticated";
const USER_EMAIL_STORAGE_KEY = "sportbook-user-email";
const USER_PHONE_STORAGE_KEY = "sportbook-user-phone";
const LEGACY_KEYS = ["sportbook-reservas-v1", "sportbook-reservas-empty-v1"];
const PUBLIC_API = window.location.origin.includes("localhost:8080") || window.location.origin.includes("127.0.0.1:8080") ? `${window.location.origin}/api` : "http://localhost:8080/api";

const activities = {
  Futbol: {
    label: "FÃºtbol",
    description: "Campo completo o fÃºtbol sala para jugar con tu grupo.",
    icon: "football",
    resources: ["Campo 1", "Campo 2", "FÃºtbol sala"],
    slots: ["09:00", "10:30", "12:00", "17:00", "18:30", "20:00"],
    price: 45,
    duration: "60 min"
  },
  Yoga: {
    label: "Yoga",
    description: "Clases tranquilas para movilidad, respiraciÃ³n y equilibrio.",
    icon: "yoga",
    resources: ["Sala Zen", "Sala Norte", "Terraza"],
    slots: ["08:00", "09:30", "11:00", "18:00", "19:30"],
    price: 14,
    duration: "50 min"
  },
  Gimnasio: {
    label: "Gimnasio",
    description: "Acceso a zona cardio, fuerza o entrenamiento personal.",
    icon: "gym",
    resources: ["Zona fuerza", "Zona cardio", "Entrenamiento personal"],
    slots: ["07:00", "08:00", "12:00", "16:00", "18:00", "20:00"],
    price: 20,
    duration: "90 min"
  },
  Padel: {
    label: "PÃ¡del",
    description: "Pistas exteriores y cubiertas para partidos de dobles.",
    icon: "padel",
    resources: ["Pista de pÃ¡del 1", "Pista de pÃ¡del 2", "Pista cubierta"],
    slots: ["09:00", "10:30", "16:30", "18:00", "19:30", "21:00"],
    price: 28,
    duration: "90 min"
  },
  Natacion: {
    label: "NataciÃ³n",
    description: "Calles de piscina para nado libre o entreno guiado.",
    icon: "swim",
    resources: ["Calle 1", "Calle 2", "Piscina infantil"],
    slots: ["08:00", "10:00", "13:00", "17:00", "19:00"],
    price: 12,
    duration: "45 min"
  }
};

const facilityLocations = {
  "Campo 1": "Ciudad Deportiva Norte, Av. del Deporte 18, Madrid",
  "Campo 2": "Ciudad Deportiva Norte, Av. del Deporte 18, Madrid",
  "FÃºtbol sala": "Pabellon Cubierto Norte, Calle Cancha 3, Madrid",
  "FÃƒÂºtbol sala": "Pabellon Cubierto Norte, Calle Cancha 3, Madrid",
  "Sala Zen": "Centro Wellness, Calle Tranquilidad 7, Madrid",
  "Sala Norte": "Centro Wellness, Calle Tranquilidad 7, Madrid",
  "Terraza": "Centro Wellness, Calle Tranquilidad 7, Madrid",
  "Zona fuerza": "Gimnasio Central, Paseo Fitness 22, Madrid",
  "Zona cardio": "Gimnasio Central, Paseo Fitness 22, Madrid",
  "Entrenamiento personal": "Gimnasio Central, Paseo Fitness 22, Madrid",
  "Pista de pÃ¡del 1": "Club Padel Sur, Calle Cristal 14, Madrid",
  "Pista de pÃ¡del 2": "Club Padel Sur, Calle Cristal 14, Madrid",
  "Pista de pÃƒÂ¡del 1": "Club Padel Sur, Calle Cristal 14, Madrid",
  "Pista de pÃƒÂ¡del 2": "Club Padel Sur, Calle Cristal 14, Madrid",
  "Pista cubierta": "Club Padel Sur, Calle Cristal 14, Madrid",
  "Calle 1": "Piscina Municipal Este, Ronda del Agua 5, Madrid",
  "Calle 2": "Piscina Municipal Este, Ronda del Agua 5, Madrid",
  "Piscina infantil": "Piscina Municipal Este, Ronda del Agua 5, Madrid"
};
const elements = {
  form: document.querySelector("#bookingForm"),
  resource: document.querySelector("#resource"),
  sport: document.querySelector("#sport"),
  resourceLocation: document.querySelector("#resourceLocation"),
  bookingDate: document.querySelector("#bookingDate"),
  bookingTime: document.querySelector("#bookingTime"),
  people: document.querySelector("#people"),
  activityPicker: document.querySelector("#activityPicker"),
  activityCatalog: document.querySelector("#activityCatalog"),
  summaryTitle: document.querySelector("#summaryTitle"),
  summaryMeta: document.querySelector("#summaryMeta"),
  summaryPrice: document.querySelector("#summaryPrice"),
  bookingsList: document.querySelector("#bookingsList"),
  emptyState: document.querySelector("#emptyState"),
  toast: document.querySelector("#toast"),
  clearBookingsButton: document.querySelector("#clearBookingsButton"),
  headerBookingsButton: document.querySelector("#headerBookingsButton"),
  helpForm: document.querySelector("#helpForm"),
  helpAuthPrompt: document.querySelector("#helpAuthPrompt"),
  reviewForm: document.querySelector("#reviewForm"),
  starRating: document.querySelector("#starRating"),
  reviewsList: document.querySelector("#reviewsList"),
  reviewsEmptyState: document.querySelector("#reviewsEmptyState"),
  reviewSubmitButton: document.querySelector("#reviewSubmitButton"),
  cancelReviewEditButton: document.querySelector("#cancelReviewEditButton")
};

LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));

const today = new Date();
const pad = (value) => String(value).padStart(2, "0");
const toInputDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
elements.bookingDate.min = toInputDate(today);

let reservations = loadReservations();
let helpRequests = loadArray(HELP_STORAGE_KEY);
let reviews = loadArray(REVIEW_STORAGE_KEY);
let selectedRating = 0;
let editingReviewId = null;

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `reserva-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadReservations() {
  return loadArray(STORAGE_KEY);
}

function loadArray(storageKey) {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReservations() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

function saveHelpRequests() {
  localStorage.setItem(HELP_STORAGE_KEY, JSON.stringify(helpRequests));
}

function saveReviews() {
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
}

function isLoggedIn() {
  return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

function renderHelpAccess() {
  const loggedIn = isLoggedIn();
  elements.helpForm.hidden = !loggedIn;
  elements.helpAuthPrompt.hidden = loggedIn;
}

function getLoggedUserEmail() {
  return (localStorage.getItem(USER_EMAIL_STORAGE_KEY) || "").trim().toLowerCase();
}

function getLoggedUserPhone() {
  return (localStorage.getItem(USER_PHONE_STORAGE_KEY) || "No especificado").trim();
}

function fillContactFields() {
  const email = getLoggedUserEmail();
  const phone = getLoggedUserPhone();

  if (elements.form.elements.email) {
    elements.form.elements.email.value = email;
  }

  if (elements.form.elements.phone) {
    elements.form.elements.phone.value = phone;
  }

  if (elements.helpForm.elements.helpEmail) {
    elements.helpForm.elements.helpEmail.value = email;
  }

  if (elements.helpForm.elements.helpPhone) {
    elements.helpForm.elements.helpPhone.value = phone;
  }
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateISO) {
  if (!dateISO) return "";
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${dateISO}T12:00:00`));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function formatStars(rating) {
  return Array.from({ length: 5 }, (_, index) => index < rating ? "&#9733;" : "&#9734;").join("");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 2400);
}

async function postPublicData(path, payload) {
  try {
    const response = await fetch(`${PUBLIC_API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return { response, data };
  } catch {
    return null;
  }
}

function optionMarkup(items, placeholder) {
  return [
    `<option value="" selected>${placeholder}</option>`,
    ...items.map((item) => `<option>${escapeHTML(item)}</option>`)
  ].join("");
}

function getResourceAddress(resource) {
  const value = String(resource || "").toLowerCase();
  if (facilityLocations[resource]) return facilityLocations[resource];
  if (value.includes("f") && value.includes("sala")) return "Pabellon Cubierto Norte, Calle Cancha 3, Madrid";
  if (value.includes("padel") || value.includes("pÃ¡del") || value.includes("pÃƒÂ¡del")) return "Club Padel Sur, Calle Cristal 14, Madrid";
  return "";
}

function updateResourceLocation() {
  const address = getResourceAddress(elements.resource.value);

  if (!elements.resourceLocation) return;

  elements.resourceLocation.innerHTML = address
    ? `<span>Direcci&oacute;n</span><strong>${escapeHTML(address)}</strong>`
    : `<span>Direcci&oacute;n</span><strong>Selecciona una instalaci&oacute;n para ver d&oacute;nde ir.</strong>`;
}

function updateActivity(sport) {
  const activity = activities[sport];
  elements.sport.value = sport || "";
  elements.resource.innerHTML = optionMarkup(activity ? activity.resources : [], "Selecciona una instalaciÃ³n");
  elements.bookingTime.innerHTML = optionMarkup(activity ? activity.slots : [], "Selecciona una hora");
  elements.people.value = "";
  updateResourceLocation();

  document.querySelectorAll(".activity-option").forEach((button) => {
    button.classList.toggle("active", button.dataset.sport === sport);
  });

  updateSummary();
}

function updateSummary() {
  const activity = activities[elements.sport.value];
  const people = Number(elements.people.value);

  if (!activity) {
    elements.summaryTitle.textContent = "Sin actividad seleccionada";
    elements.summaryMeta.textContent = "El precio aparecerÃ¡ al completar la reserva.";
    elements.summaryPrice.textContent = "--";
    return;
  }

  const total = activity.price * (people || 1);
  elements.summaryTitle.textContent = activity.label;
  elements.summaryMeta.textContent = `${activity.duration} Â· ${formatCurrency(activity.price)} por persona`;
  elements.summaryPrice.textContent = people ? formatCurrency(total) : `${formatCurrency(activity.price)}+`;
}

function renderActivityCatalog() {
  elements.activityCatalog.innerHTML = Object.entries(activities).map(([key, activity]) => `
    <article class="activity-card">
      <div class="activity-card-top">
        <span class="activity-icon ${activity.icon}" aria-hidden="true">${activityIcon(activity.icon)}</span>
        <div>
          <h3>${activity.label}</h3>
          <p>${activity.description}</p>
        </div>
      </div>
      <div class="activity-card-footer">
        <span class="price-pill">${formatCurrency(activity.price)}</span>
        <button class="button secondary" type="button" data-catalog-sport="${key}">Elegir</button>
      </div>
    </article>
  `).join("");
}

function activityIcon(icon) {
  const icons = {
    football: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"></circle><path d="m9 8 3-2 3 2-1 4h-4L9 8Z"></path><path d="m10 12-3 3"></path><path d="m14 12 3 3"></path></svg>',
    yoga: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"></path><path d="M4 20c3-5 6-7 8-7s5 2 8 7"></path><path d="M7 11c2 2 4 3 5 3s3-1 5-3"></path></svg>',
    gym: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 7v10"></path><path d="M18 7v10"></path><path d="M3 9v6"></path><path d="M21 9v6"></path><path d="M6 12h12"></path></svg>',
    padel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 7a5 5 0 0 1 8 6l-5 5a3 3 0 0 1-4-4l5-5"></path><path d="m15 15 4 4"></path></svg>',
    swim: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 17c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1"></path><path d="M2 21c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1"></path><path d="m15 8-3-3-6 6"></path><path d="m14 6 4-2"></path></svg>'
  };

  return icons[icon] || icons.football;
}

async function addReservation(event) {
  event.preventDefault();
  fillContactFields();
  const formData = new FormData(elements.form);
  const sport = formData.get("sport");
  const activity = activities[sport];
  const people = Number(formData.get("people"));
  const email = getLoggedUserEmail();

  if (!email) {
    showToast("Inicia sesion para confirmar la reserva.");
    return;
  }

  const reservation = {
    id: createId(),
    sport,
    resource: formData.get("resource"),
    address: getResourceAddress(formData.get("resource")),
    date: formData.get("bookingDate"),
    time: formData.get("bookingTime"),
    people,
    client: formData.get("clientName").trim(),
    phone: getLoggedUserPhone(),
    email,
    price: activity.price * people,
    status: "Confirmada"
  };

  const serverResult = await postPublicData("/reservas", reservation);
  if (serverResult && !serverResult.data.ok) {
    showToast(serverResult.data.mensaje || "No se pudo guardar la reserva.");
    return;
  }

  if (serverResult?.data?.reserva?.id) {
    reservation.id = serverResult.data.reserva.id;
  }

  reservations = [...reservations, reservation].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  saveReservations();
  renderReservations();
  elements.form.reset();
  updateActivity("");
  document.querySelector("#mis-reservas").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("Reserva confirmada. La tienes en Mis reservas.");
}

function renderReservations() {
  elements.emptyState.classList.toggle("visible", reservations.length === 0);
  elements.bookingsList.innerHTML = reservations.map((reservation) => {
    const isCancelled = reservation.status === "Cancelada";
    return `
      <article class="reservation-item">
        <div>
          <p class="reservation-title">
            ${escapeHTML(activities[reservation.sport]?.label || reservation.sport)} Â· ${escapeHTML(reservation.resource)}
            <span class="status-badge ${isCancelled ? "status-cancelled" : "status-confirmed"}">${escapeHTML(reservation.status)}</span>
          </p>
          <p class="reservation-meta">
            ${formatDate(reservation.date)} a las ${escapeHTML(reservation.time)} Â· ${escapeHTML(reservation.people)} pers. Â· ${formatCurrency(Number(reservation.price))}
          </p>
          <p class="reservation-meta">
            DirecciÃ³n: ${escapeHTML(reservation.address || getResourceAddress(reservation.resource) || "Consulta la instalaciÃ³n seleccionada")}
          </p>
          <p class="reservation-meta">
            ${escapeHTML(reservation.client)} Â· ${escapeHTML(reservation.phone)} Â· ${escapeHTML(reservation.email)}
          </p>
        </div>
        <button class="reservation-action danger" type="button" data-cancel-id="${reservation.id}" ${isCancelled ? "disabled" : ""}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          ${isCancelled ? "Cancelada" : "Cancelar"}
        </button>
      </article>
    `;
  }).join("");
}

async function addHelpRequest(event) {
  event.preventDefault();

  if (!isLoggedIn()) {
    renderHelpAccess();
    showToast("Necesitas iniciar sesiÃ³n para pedir ayuda.");
    return;
  }

  fillContactFields();
  const formData = new FormData(elements.helpForm);

  const helpRequest = {
    id: createId(),
    name: formData.get("helpName").trim(),
    email: getLoggedUserEmail(),
    phone: getLoggedUserPhone(),
    topic: formData.get("helpTopic"),
    message: formData.get("helpMessage").trim(),
    createdAt: new Date().toISOString()
  };

  const serverResult = await postPublicData("/ayuda", helpRequest);
  if (serverResult && !serverResult.data.ok) {
    showToast(serverResult.data.mensaje || "No se pudo enviar la solicitud.");
    return;
  }

  helpRequests = [...helpRequests, helpRequest];

  saveHelpRequests();
  elements.helpForm.reset();
  showToast("Solicitud enviada. Te contactaremos pronto.");
}

function setRating(rating) {
  selectedRating = rating;
  elements.starRating.querySelectorAll("button").forEach((button) => {
    const isActive = Number(button.dataset.rating) <= selectedRating;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function resetReviewEditor() {
  editingReviewId = null;
  elements.reviewSubmitButton.textContent = "Publicar reseÃ±a";
  elements.cancelReviewEditButton.hidden = true;
  setRating(0);
}

function addReview(event) {
  event.preventDefault();

  if (!selectedRating) {
    showToast("Selecciona una valoraciÃ³n con estrellas.");
    return;
  }

  const formData = new FormData(elements.reviewForm);
  const reviewData = {
    name: formData.get("reviewName").trim(),
    sport: formData.get("reviewSport"),
    rating: selectedRating,
    comment: formData.get("reviewComment").trim()
  };
  const wasEditing = Boolean(editingReviewId);

  if (editingReviewId) {
    reviews = reviews.map((review) => {
      if (review.id !== editingReviewId) return review;
      return {
        ...review,
        ...reviewData,
        updatedAt: new Date().toISOString()
      };
    });
  } else {
    reviews = [
      {
        id: createId(),
        ...reviewData,
        createdAt: new Date().toISOString()
      },
      ...reviews
    ];
  }

  saveReviews();
  renderReviews();
  elements.reviewForm.reset();
  resetReviewEditor();
  showToast(wasEditing ? "ReseÃ±a actualizada." : "ReseÃ±a publicada. Gracias por compartir tu experiencia.");
}

function renderReviews() {
  elements.reviewsEmptyState.classList.toggle("visible", reviews.length === 0);
  elements.reviewsList.innerHTML = reviews.map((review) => `
    <article class="review-item">
      <div class="review-head">
        <div>
          <p class="review-title">${escapeHTML(review.name)}</p>
          <p class="review-meta">${escapeHTML(activities[review.sport]?.label || review.sport)}</p>
        </div>
        <div class="review-stars" aria-label="${review.rating} de 5 estrellas">${formatStars(Number(review.rating))}</div>
      </div>
      <p class="review-comment">${escapeHTML(review.comment)}</p>
      <div class="review-actions">
        <button class="reservation-action" type="button" data-edit-review-id="${review.id}">Editar</button>
        <button class="reservation-action danger" type="button" data-delete-review-id="${review.id}">Eliminar</button>
      </div>
    </article>
  `).join("");
}

function startEditingReview(reviewId) {
  const review = reviews.find((item) => item.id === reviewId);
  if (!review) return;

  editingReviewId = review.id;
  elements.reviewForm.elements.reviewName.value = review.name;
  elements.reviewForm.elements.reviewSport.value = review.sport;
  elements.reviewForm.elements.reviewComment.value = review.comment;
  setRating(Number(review.rating));
  elements.reviewSubmitButton.textContent = "Guardar cambios";
  elements.cancelReviewEditButton.hidden = false;
  document.querySelector("#resenas").scrollIntoView({ behavior: "smooth", block: "start" });
  elements.reviewForm.elements.reviewName.focus({ preventScroll: true });
}

function deleteReview(reviewId) {
  reviews = reviews.filter((review) => review.id !== reviewId);
  saveReviews();
  renderReviews();

  if (editingReviewId === reviewId) {
    elements.reviewForm.reset();
    resetReviewEditor();
  }

  showToast("ReseÃ±a eliminada.");
}

elements.activityPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-sport]");
  if (!button) return;
  updateActivity(button.dataset.sport);
});

elements.activityCatalog.addEventListener("click", (event) => {
  const button = event.target.closest("[data-catalog-sport]");
  if (!button) return;
  updateActivity(button.dataset.catalogSport);
  document.querySelector("#reservar").scrollIntoView({ behavior: "smooth", block: "start" });
});

elements.sport.addEventListener("change", () => updateActivity(elements.sport.value));
elements.resource.addEventListener("change", updateResourceLocation);
elements.people.addEventListener("input", updateSummary);
elements.form.addEventListener("submit", addReservation);
elements.form.addEventListener("reset", () => {
  window.setTimeout(() => updateActivity(""), 0);
});

elements.bookingsList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cancel-id]");
  if (!button) return;

  reservations = reservations.map((reservation) => {
    if (reservation.id !== button.dataset.cancelId) return reservation;
    return { ...reservation, status: "Cancelada" };
  });
  saveReservations();
  renderReservations();
  showToast("Reserva cancelada.");
});

elements.clearBookingsButton.addEventListener("click", () => {
  reservations = [];
  localStorage.removeItem(STORAGE_KEY);
  renderReservations();
  showToast("Tus reservas se han vaciado.");
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
      <h2>Tu sesion se ha cerrado</h2>
      <p>Volviendo al menu principal...</p>
    </div>
  `;

  document.body.appendChild(logoutMessage);

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1800);
});

elements.headerBookingsButton.addEventListener("click", () => {
  document.querySelector("#mis-reservas").scrollIntoView({ behavior: "smooth", block: "start" });
});

elements.helpForm.addEventListener("submit", addHelpRequest);
elements.reviewForm.addEventListener("submit", addReview);
elements.reviewForm.addEventListener("reset", () => {
  window.setTimeout(resetReviewEditor, 0);
});
elements.starRating.addEventListener("click", (event) => {
  const button = event.target.closest("[data-rating]");
  if (!button) return;
  setRating(Number(button.dataset.rating));
});
elements.cancelReviewEditButton.addEventListener("click", () => {
  elements.reviewForm.reset();
  resetReviewEditor();
});
elements.reviewsList.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-review-id]");
  if (editButton) {
    startEditingReview(editButton.dataset.editReviewId);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-review-id]");
  if (deleteButton) {
    deleteReview(deleteButton.dataset.deleteReviewId);
  }
});

renderActivityCatalog();
updateActivity("");
fillContactFields();
renderReservations();
renderHelpAccess();
renderReviews();



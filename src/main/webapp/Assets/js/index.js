    const scrollHint = document.querySelector(".scroll-hint");
    const scrollTargets = ["#about", "#features", "#instalaciones", "#ayuda"];
    let nextSectionIndex = 0;
    let shouldGoTop = false;

    function updateNextSection() {
        const scrollPosition = window.scrollY + 120;
        const lastSection = document.querySelector(scrollTargets[scrollTargets.length - 1]);
        const isAtPageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;

        if ((lastSection && scrollPosition >= lastSection.offsetTop) || isAtPageBottom) {
            shouldGoTop = true;
            nextSectionIndex = scrollTargets.length - 1;
            scrollHint.classList.add("up");
            scrollHint.href = "#home";
            scrollHint.setAttribute("aria-label", "Volver arriba");
            return;
        }

        nextSectionIndex = scrollTargets.findIndex((selector) => {
            const section = document.querySelector(selector);
            return section && section.offsetTop > scrollPosition;
        });

        if (nextSectionIndex === -1) {
            nextSectionIndex = scrollTargets.length - 1;
        }

        shouldGoTop = false;
        scrollHint.classList.remove("up");
        scrollHint.href = scrollTargets[nextSectionIndex];
        scrollHint.setAttribute("aria-label", "Ir a la siguiente seccion");
    }

    scrollHint.addEventListener("click", (event) => {
        event.preventDefault();
        updateNextSection();

        if (shouldGoTop) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            window.setTimeout(updateNextSection, 700);
            return;
        }

        const target = document.querySelector(scrollTargets[nextSectionIndex]);
        if (!target) return;

        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (nextSectionIndex === scrollTargets.length - 1) {
            shouldGoTop = true;
            scrollHint.classList.add("up");
            scrollHint.href = "#home";
            scrollHint.setAttribute("aria-label", "Volver arriba");
        }
        window.setTimeout(updateNextSection, 700);
    });

    window.addEventListener("scroll", updateNextSection, { passive: true });
    updateNextSection();

const publicHelpForm = document.querySelector("#publicHelpForm");
const publicHelpMessage = document.querySelector("#publicHelpMessage");

if (publicHelpForm) {
    publicHelpForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(publicHelpForm);
        const gmail = String(formData.get("gmail") || "").trim().toLowerCase();

        if (!gmail.endsWith("@gmail.com")) {
            publicHelpMessage.textContent = "Introduce un Gmail valido para poder responderte.";
            return;
        }

        const request = {
            fullName: String(formData.get("fullName") || "").trim(),
            gmail,
            topic: formData.get("topic"),
            message: String(formData.get("message") || "").trim(),
            createdAt: new Date().toISOString()
        };

        const stored = localStorage.getItem("sportbook-public-help-v1");
        const requests = stored ? JSON.parse(stored) : [];
        requests.push(request);
        localStorage.setItem("sportbook-public-help-v1", JSON.stringify(requests));

        publicHelpForm.reset();
        publicHelpMessage.textContent = "Pregunta enviada. Te responderemos por Gmail.";
    });
}

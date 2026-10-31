const CONTACT_EMAIL = "info@talentedicons.com";

// Nav background on scroll
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
const setMenu = (open) => {
  links.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
};
toggle.addEventListener("click", () => setMenu(!links.classList.contains("open")));
links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// Scroll reveal
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  io.observe(el);
});

// Contact form: creator/brand toggle
const form = document.getElementById("contactForm");
const handleLabel = document.getElementById("handleLabel");
const setType = (type) => {
  const radio = form.querySelector(`input[value="${type}"]`);
  if (radio) radio.checked = true;
  handleLabel.textContent = type === "Brand" ? "Company / website" : "Main social handle";
};
form.querySelectorAll('input[name="type"]').forEach((r) =>
  r.addEventListener("change", () => setType(r.value))
);
document.querySelectorAll("[data-intent]").forEach((a) =>
  a.addEventListener("click", () => setType(a.dataset.intent === "brand" ? "Brand" : "Creator"))
);

// Contact form submit — delivered to CONTACT_EMAIL by FormSubmit (formsubmit.co).
// The very first submission triggers a one-time activation email to that inbox.
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;
const note = document.getElementById("formNote");
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  if (data.get("_honey")) return; // bot filled the hidden field
  const type = data.get("type");
  const subject = `${type} inquiry — ${data.get("name")}`;
  const detailLabel = type === "Brand" ? "Company / website" : "Social handle";

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";
  note.classList.remove("is-error");
  note.textContent = "";

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: subject,
        _template: "table",
        _captcha: "false",
        _replyto: data.get("email"),
        "Inquiry type": type,
        Name: data.get("name"),
        Email: data.get("email"),
        [detailLabel]: data.get("handle") || "—",
        Message: data.get("message"),
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || String(json.success) !== "true") throw new Error(json.message || res.status);

    form.reset();
    setType("Creator");
    form.classList.add("is-sent");
    note.textContent = "Thank you — your inquiry is in. Our team will be in touch within two business days.";
  } catch (err) {
    // Fallback: let the visitor send it from their own mail app
    const body = [`Name: ${data.get("name")}`, `Email: ${data.get("email")}`, `${detailLabel}: ${data.get("handle") || "—"}`, "", data.get("message")].join("\n");
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.classList.add("is-error");
    note.innerHTML = `Something went wrong sending your message. <a href="${mailto}">Email us directly</a> instead.`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send inquiry";
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

// Count-up on hero stats
const countUp = (el) => {
  const target = Number(el.dataset.count);
  const { prefix = "", suffix = "" } = el.dataset;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const start = performance.now();
  const dur = 1600;
  const tick = (now) => {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const statIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    countUp(e.target);
    statIO.unobserve(e.target);
  });
});
document.querySelectorAll("[data-count]").forEach((el) => statIO.observe(el));

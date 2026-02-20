// ===== Helpers =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

// ===== Year =====
$("#year").textContent = new Date().getFullYear();

// ===== Theme Toggle (saved) =====
const themeToggle = $("#themeToggle");
const storedTheme = localStorage.getItem("theme");
if (storedTheme === "light" || storedTheme === "dark") {
  document.documentElement.setAttribute("data-theme", storedTheme);
}

function toggleTheme(){
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}
themeToggle.addEventListener("click", toggleTheme);

// ===== Mobile nav =====
const navToggle = $("#navToggle");
const navList = $("#navList");

navToggle.addEventListener("click", () => {
  const open = navList.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});

// Close menu on link click (mobile)
$$('#navList a').forEach(a => {
  a.addEventListener("click", () => {
    navList.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ===== Scroll progress =====
const progressBar = $("#progressBar");
function updateProgress(){
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const scrollHeight = doc.scrollHeight - doc.clientHeight;
  const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  progressBar.style.width = `${clamp(pct, 0, 100)}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// ===== Toast + copy buttons =====
const toast = $("#toast");
let toastTimer = null;

function showToast(msg){
  if (!toast) return;
  toast.textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.textContent = ""), 2200);
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    showToast(`Copied: ${text}`);
  }catch{
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast(`Copied: ${text}`);
  }
}

$$("[data-copy]").forEach(btn => {
  btn.addEventListener("click", () => copyText(btn.getAttribute("data-copy") || ""));
});

$("#copyUIN").addEventListener("click", () => copyText($("#copyUIN").dataset.copy));

// ===== Animated counters (on view) =====
const counters = $$("[data-count]");
function animateCount(el){
  const target = Number(el.getAttribute("data-count") || "0");
  const start = 0;
  const dur = 900;
  const t0 = performance.now();

  function frame(t){
    const p = clamp((t - t0) / dur, 0, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(start + (target - start) * eased);
    el.textContent = String(val);
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ===== Skill bars (on view) =====
const bars = $$(".bar");

const io = new IntersectionObserver((entries) => {
  for (const e of entries){
    if (!e.isIntersecting) continue;

    if (e.target.matches("[data-count]")){
      animateCount(e.target);
      io.unobserve(e.target);
    }

    if (e.target.classList.contains("bar")){
      const pct = e.target.getAttribute("data-bar") || "0";
      const fill = $(".bar__fill", e.target);
      fill.style.width = `${clamp(Number(pct), 0, 100)}%`;
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.35 });

counters.forEach(el => io.observe(el));
bars.forEach(el => io.observe(el));

// ===== Contact form (mailto) =====
const form = $("#contactForm");
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const fd = new FormData(form);
  const name = String(fd.get("name") || "").trim();
  const email = String(fd.get("email") || "").trim();
  const message = String(fd.get("message") || "").trim();

  const subject = encodeURIComponent(`Portfolio Contact — ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n--\nSent from Adyan Shaikh's portfolio`);
  // Replace with your real email:
  const to = "your.email@example.com";
  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
});
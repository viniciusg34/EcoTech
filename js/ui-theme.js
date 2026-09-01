"use strict";

/* ══════════════════════════════
   Esse módulo foi unificado em app-ui.js.
   Mantido apenas como compatibilidade com páginas antigas.
══════════════════════════════ */

if (typeof window.EcoUI !== "object") {
  window.EcoUI = {};
}

window.EcoUI.initTheme = function initTheme() {
  const saved = localStorage.getItem("eco-theme");
  const pref =
    saved ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
  document.documentElement.setAttribute("data-theme", pref);
};

window.EcoUI.initThemeToggle = function initThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  if (!themeToggle || !themeIcon) return;

  const currentTheme = document.documentElement.getAttribute("data-theme");
  themeIcon.textContent = currentTheme === "dark" ? "🌙" : "☀️";

  themeToggle.addEventListener("click", () => {
    const root = document.documentElement;
    const isDark = root.getAttribute("data-theme") === "dark";
    const newTheme = isDark ? "light" : "dark";

    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("eco-theme", newTheme);

    themeIcon.style.transform = "rotate(360deg)";
    themeIcon.style.transition = "transform 0.3s ease";
    setTimeout(() => {
      themeIcon.textContent = newTheme === "dark" ? "🌙" : "☀️";
      themeIcon.style.transform = "rotate(0deg)";
    }, 150);
  });
};

window.EcoUI.initMobileMenu = function initMobileMenu() {
  const menuToggleBtn = document.getElementById("menu-toggle");
  const mainNav = document.getElementById("main-nav");
  if (menuToggleBtn && mainNav) {
    menuToggleBtn.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });
  }
};

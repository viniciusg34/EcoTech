"use strict";

/* ══════════════════════════════
   Abas unificadas em app-ui.js.
   Mantido apenas para compatibilidade com páginas antigas.
══════════════════════════════ */

if (typeof window.EcoUI !== "object") {
  window.EcoUI = {};
}

window.EcoUI.initTabs = function initTabs() {
  const tabs = document.querySelectorAll(".tools-tab");
  const pages = document.querySelectorAll(".page");
  if (!tabs.length || !pages.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.target;

      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });

      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      pages.forEach((p) => {
        p.classList.toggle("active", p.id === targetId);
      });
    });
  });
};

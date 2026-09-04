"use strict";

/* ══════════════════════════════
   ABAS: Scanner / Recompensas / Histórico
══════════════════════════════ */
function initTabs() {
  const tabs = document.querySelectorAll(".tools-tab");
  const pages = document.querySelectorAll(".page");

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
}

"use strict";

/* ══════════════════════════════
   INICIALIZAÇÃO GERAL — coleta.html
   Agora a UI é inicializada via app-ui.js.
══════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  if (window.EcoUI) {
    window.EcoUI.initAppUI();
  }

  if (typeof initMap === "function") initMap();
  if (typeof initUserPoints === "function") initUserPoints();

  if (typeof renderScanHistory === "function") renderScanHistory();
  if (typeof renderRewardsGrid === "function") renderRewardsGrid();
  if (typeof renderTimeline === "function") renderTimeline();
});

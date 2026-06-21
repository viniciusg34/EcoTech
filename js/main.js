"use strict";

/* ══════════════════════════════
   INICIALIZAÇÃO GERAL — coleta.html
══════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initThemeToggle();
  initMobileMenu();
  initTabs();
  initMap();
  initUserPoints();

  renderScanHistory();
  renderRewardsGrid();
  renderTimeline();
});

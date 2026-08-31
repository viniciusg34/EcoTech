"use strict";

/* ══════════════════════════════
   RECOMPENSAS / SISTEMA DE PONTOS
   depende de: rewardsCatalog, timeline (data-rewards.js),
   showToast (ui-toast.js)
══════════════════════════════ */

function renderRewardsGrid(filter = "todos") {
  const el = document.getElementById("rewards-grid");
  if (!el) return;
  const items =
    filter === "todos"
      ? rewardsCatalog
      : rewardsCatalog.filter((r) => r.cat === filter);
  el.innerHTML = items
    .map(
      (r) => `
    <div class="reward-card">
      <h4>${r.icon} ${r.name}</h4>
      <p>${r.desc}</p>
      <p style="margin-top:8px; font-weight:700; color:var(--sage-600);">${r.cost} pontos</p>
    </div>`,
    )
    .join("");
}

function filterRewards(btn, cat) {
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderRewardsGrid(cat);
}

function renderTimeline() {
  const el = document.getElementById("timeline-list");
  if (!el) return;
  el.innerHTML = timeline
    .map(
      (t) => `
    <div class="timeline-item ${t.type === "redeem" ? "redeem" : ""}">
      <div class="timeline-icon">${t.icon}</div>
      <div class="timeline-info"><strong>${t.desc}</strong><small>${t.time}</small></div>
      <div class="timeline-pts">${t.pts}🪙</div>
    </div>`,
    )
    .join("");
}

/* ── PONTOS DO USUÁRIO (banner "Simular Descarte" + loja estática) ── */
function initUserPoints() {
  let userPoints = parseInt(localStorage.getItem("ecotech_points") || "0");
  const pointsSpan = document.getElementById("userPoints");
  const simulateBtn = document.getElementById("simulateDisposal");

  function updatePointsUI() {
    if (pointsSpan) pointsSpan.innerText = userPoints;
    localStorage.setItem("ecotech_points", userPoints);
    document.querySelectorAll(".reward-item").forEach((el) => {
      const cost = parseInt(el.dataset.cost);
      if (userPoints < cost) el.classList.add("disabled");
      else el.classList.remove("disabled");
    });
  }

  if (simulateBtn) {
    simulateBtn.addEventListener("click", () => {
      userPoints += 10;
      updatePointsUI();
      showToast("✅ +10 pontos! Continue reciclando!");
    });
  }

  document.querySelectorAll(".reward-item").forEach((el) => {
    el.addEventListener("click", () => {
      const cost = parseInt(el.dataset.cost);
      const name = el.dataset.name;
      if (userPoints >= cost) {
        userPoints -= cost;
        updatePointsUI();
        showToast(`🎉 Parabéns! Você resgatou: ${name}!`);
      } else {
        showToast(`❌ Pontos insuficientes para ${name}. Recicle mais!`);
      }
    });
  });

  updatePointsUI();
}

"use strict";

/* ══════════════════════════════════════════════════════════════
   MODAL DE COLETA POR ECOPONTO
   Acionado pelo scanner quando o código lido corresponde ao
   padrão ECO-XX (QR code afixado nos Ecopontos físicos).

   Depende de:
     - API_PESSOA / getLoggedUserId()   (eco-session.js ou coleta.js)
     - saveUserCoins()                  (coleta.js)
     - addTimelineEntry()               (coleta.js)
     - showToast()                      (ui-toast.js ou coleta.js)
     - POINTS[]                         (definido abaixo, espelho do mapa)
     - coleta.css                       (estilos base já carregados)
══════════════════════════════════════════════════════════════ */

/* ── Catálogo de materiais aceitos por categoria ── */
const MATERIAIS = {
  plastico:    { label: "Plástico PET",   emoji: "🥤", pts: 12, unit: "kg"  },
  papel:       { label: "Papel/Papelão",  emoji: "📦", pts: 8,  unit: "kg"  },
  metal:       { label: "Metal/Latinhas", emoji: "🥫", pts: 20, unit: "kg"  },
  vidro:       { label: "Vidro",          emoji: "🍾", pts: 6,  unit: "kg"  },
  eletronicos: { label: "Eletrônicos",    emoji: "💻", pts: 25, unit: "un." },
  madeira:     { label: "Madeira",        emoji: "🪵", pts: 5,  unit: "kg"  },
};

/* ── Estado interno do modal ── */
let _ecoModalPoint = null;   // Ecoponto ativo
let _ecoQtd = {};            // { categoria: quantidade }

/* ════════════════════════════════════════════════════
   PONTO DE ENTRADA — chamado pelo validateCode()
   quando o código começa com "ECO-"
════════════════════════════════════════════════════ */
function openEcopontoModal(code) {
  const point = ECOPONTOS.find(
    (p) => p.code === code.trim().toUpperCase()
  );

  if (!point) {
    showToast("❌ Ecoponto não encontrado: " + code);
    return;
  }

  _ecoModalPoint = point;
  _ecoQtd = {};

  _renderModal(point);
  _showModal();
}

/* ════════════════════════════════════════════════════
   CRIAÇÃO / ATUALIZAÇÃO DO DOM
════════════════════════════════════════════════════ */
function _renderModal(point) {
  _ensureModalDOM();

  /* Cabeçalho */
  document.getElementById("eco-modal-name").textContent  = point.name;
  document.getElementById("eco-modal-code").textContent  = point.code;
  document.getElementById("eco-modal-desc").textContent  = point.desc;

  /* Chips de categoria */
  document.getElementById("eco-modal-cats").innerHTML = point.cats
    .map((c) => `<span class="eco-cat-chip">${c}</span>`)
    .join("");

  /* Grade de materiais (apenas os aceitos por este ponto) */
  document.getElementById("eco-modal-materials").innerHTML = point.cats
    .map((cat) => {
      const m = MATERIAIS[cat];
      if (!m) return "";
      return `
        <div class="eco-mat-row" id="eco-mat-${cat}">
          <div class="eco-mat-label">
            <span class="eco-mat-emoji">${m.emoji}</span>
            <div>
              <strong>${m.label}</strong>
              <small>${m.pts} pts / ${m.unit}</small>
            </div>
          </div>
          <div class="eco-mat-controls">
            <button class="eco-qty-btn" onclick="ecoChangeQty('${cat}', -1)" aria-label="Diminuir quantidade de ${m.label}">−</button>
            <span class="eco-qty-val" id="eco-qty-${cat}">0</span>
            <button class="eco-qty-btn" onclick="ecoChangeQty('${cat}', +1)" aria-label="Aumentar quantidade de ${m.label}">+</button>
            <span class="eco-mat-unit">${m.unit}</span>
          </div>
        </div>`;
    })
    .join("");

  /* Mostra painel principal, esconde tela de sucesso */
  document.getElementById("eco-modal-main").style.display    = "";
  document.getElementById("eco-modal-success").style.display = "none";
  document.getElementById("eco-modal-api-error").style.display = "none";

  _updateSummary();
}

/* ── Garante que o elemento modal existe no DOM ── */
function _ensureModalDOM() {
  if (document.getElementById("eco-modal-overlay")) return;

  /* Inject CSS */
  const style = document.createElement("style");
  style.textContent = `
    #eco-modal-overlay {
      position: fixed; inset: 0;
      background: rgba(26, 46, 27, 0.55);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 4000;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      opacity: 0; pointer-events: none;
      transition: opacity 0.25s cubic-bezier(0.22,1,0.36,1);
    }
    #eco-modal-overlay.open {
      opacity: 1; pointer-events: auto;
    }
    #eco-modal-box {
      background: var(--white, #fff);
      border-radius: var(--br-lg, 28px);
      border: 1.5px solid var(--sage-100, #d6ebd6);
      box-shadow: var(--sh-lg, 0 20px 56px rgba(30,82,32,0.14));
      width: 100%; max-width: 480px;
      max-height: 90vh; overflow-y: auto;
      padding: 28px;
      transform: translateY(12px);
      transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
    }
    #eco-modal-overlay.open #eco-modal-box {
      transform: translateY(0);
    }

    /* ── Cabeçalho ── */
    .eco-modal-header {
      display: flex; align-items: flex-start; gap: 14px;
      padding-bottom: 20px;
      border-bottom: 1.5px solid var(--sage-100, #d6ebd6);
      margin-bottom: 20px;
    }
    .eco-modal-badge {
      width: 48px; height: 48px; flex-shrink: 0;
      border-radius: var(--br-md, 20px);
      background: var(--mint, #e8f7e8);
      border: 1px solid var(--mint-border, #c2e4c2);
      display: grid; place-items: center; font-size: 22px;
    }
    .eco-modal-name {
      font-family: "Lora", serif;
      font-weight: 600; font-size: 1.05rem;
      color: var(--ink, #1a2e1b); margin-bottom: 3px;
    }
    .eco-modal-code {
      font-size: 0.75rem; font-weight: 700;
      color: var(--sage-500, #3d9140);
      letter-spacing: 0.06em; text-transform: uppercase;
      margin-bottom: 5px;
    }
    .eco-modal-desc {
      font-size: 0.82rem; color: var(--ink-3, #6b8f6c);
      line-height: 1.5;
    }
    .eco-modal-cats {
      display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px;
    }
    .eco-cat-chip {
      font-size: 0.72rem; font-weight: 600;
      padding: 3px 10px; border-radius: var(--br-pill, 99px);
      background: var(--sage-50, #eef5ee);
      border: 1px solid var(--sage-100, #d6ebd6);
      color: var(--ink-2, #3b5e3d);
      text-transform: capitalize;
    }

    /* ── Botão fechar ── */
    .eco-modal-close {
      position: absolute; top: 16px; right: 16px;
      background: var(--sage-50, #eef5ee);
      border: 1.5px solid var(--sage-100, #d6ebd6);
      color: var(--ink-3, #6b8f6c);
      width: 32px; height: 32px; border-radius: 50%;
      font-size: 15px; cursor: pointer; line-height: 1;
      display: grid; place-items: center;
      transition: background 0.2s, color 0.2s;
    }
    .eco-modal-close:hover {
      background: var(--sage-100, #d6ebd6); color: var(--ink, #1a2e1b);
    }

    /* ── Linha de saldo ── */
    .eco-saldo-row {
      display: flex; align-items: center; gap: 10px;
      background: var(--mint, #e8f7e8);
      border: 1px solid var(--mint-border, #c2e4c2);
      border-radius: var(--br-md, 20px);
      padding: 12px 16px; margin-bottom: 20px;
      font-size: 0.9rem;
    }
    .eco-saldo-row .saldo-label { color: var(--ink-3, #6b8f6c); flex: 1; }
    .eco-saldo-row .saldo-valor {
      font-weight: 800; font-size: 1rem; color: var(--sage-600, #2d7230);
    }

    /* ── Materiais ── */
    .eco-materials-label {
      font-size: 0.75rem; font-weight: 700; letter-spacing: 0.07em;
      text-transform: uppercase; color: var(--ink-3, #6b8f6c);
      margin-bottom: 12px;
    }
    #eco-modal-materials { margin-bottom: 20px; }
    .eco-mat-row {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px;
      background: var(--cream, #faf9f6);
      border: 1.5px solid var(--sage-100, #d6ebd6);
      border-radius: var(--br-md, 20px);
      padding: 12px 16px; margin-bottom: 10px;
      transition: border-color 0.2s, background 0.2s;
    }
    .eco-mat-row.active {
      border-color: var(--sage-400, #5aab5a);
      background: var(--mint, #e8f7e8);
    }
    .eco-mat-label {
      display: flex; align-items: center; gap: 10px;
    }
    .eco-mat-emoji { font-size: 22px; }
    .eco-mat-label strong {
      display: block; font-size: 0.88rem; color: var(--ink, #1a2e1b);
    }
    .eco-mat-label small {
      font-size: 0.75rem; color: var(--sage-500, #3d9140); font-weight: 600;
    }
    .eco-mat-controls {
      display: flex; align-items: center; gap: 6px; flex-shrink: 0;
    }
    .eco-qty-btn {
      width: 30px; height: 30px; border-radius: 50%;
      border: 1.5px solid var(--sage-200, #acd4ac);
      background: var(--white, #fff); color: var(--ink-2, #3b5e3d);
      font-size: 16px; font-weight: 700;
      cursor: pointer; display: grid; place-items: center; line-height: 1;
      transition: background 0.15s, border-color 0.15s;
    }
    .eco-qty-btn:hover {
      background: var(--sage-100, #d6ebd6);
      border-color: var(--sage-400, #5aab5a);
    }
    .eco-qty-val {
      min-width: 26px; text-align: center;
      font-size: 1rem; font-weight: 700; color: var(--ink, #1a2e1b);
    }
    .eco-mat-unit {
      font-size: 0.72rem; color: var(--ink-3, #6b8f6c);
      min-width: 20px;
    }

    /* ── Resumo ── */
    .eco-summary {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--sage-50, #eef5ee);
      border: 1.5px solid var(--sage-100, #d6ebd6);
      border-radius: var(--br-md, 20px);
      padding: 14px 18px; margin-bottom: 18px;
    }
    .eco-summary-coins {
      font-family: "Lora", serif; font-size: 1.6rem; font-weight: 600;
      color: var(--sage-600, #2d7230); line-height: 1;
    }
    .eco-summary-label {
      font-size: 0.75rem; color: var(--ink-3, #6b8f6c);
      font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    .eco-summary-items {
      font-size: 0.82rem; color: var(--ink-3, #6b8f6c);
    }

    /* ── Botão confirmar ── */
    #eco-btn-confirm {
      width: 100%; padding: 15px 24px;
      border-radius: var(--br-pill, 99px);
      background: var(--sage-500, #3d9140); color: #fff;
      border: none; font-family: "Plus Jakarta Sans", sans-serif;
      font-weight: 700; font-size: 1rem; cursor: pointer;
      box-shadow: 0 4px 16px rgba(61,145,64,0.28);
      transition: background 0.2s, transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    }
    #eco-btn-confirm:hover:not(:disabled) {
      background: var(--sage-600, #2d7230);
      transform: translateY(-2px);
      box-shadow: 0 6px 22px rgba(61,145,64,0.36);
    }
    #eco-btn-confirm:disabled {
      opacity: 0.45; cursor: not-allowed; transform: none;
    }

    /* ── Mensagem de erro API ── */
    #eco-modal-api-error {
      margin-top: 10px; font-size: 0.82rem;
      color: #c0392b; text-align: center;
    }

    /* ── Tela de sucesso ── */
    #eco-modal-success {
      text-align: center; padding: 16px 0;
    }
    .eco-success-icon {
      width: 64px; height: 64px; border-radius: 50%;
      background: var(--mint, #e8f7e8);
      border: 2px solid var(--sage-200, #acd4ac);
      display: grid; place-items: center; font-size: 30px;
      margin: 0 auto 16px;
    }
    .eco-success-title {
      font-family: "Lora", serif; font-size: 1.4rem; font-weight: 600;
      color: var(--ink, #1a2e1b); margin-bottom: 6px;
    }
    .eco-success-pts {
      font-size: 2rem; font-weight: 800;
      color: var(--sage-500, #3d9140); margin-bottom: 8px;
    }
    .eco-success-msg {
      font-size: 0.85rem; color: var(--ink-3, #6b8f6c);
      margin-bottom: 6px; line-height: 1.55;
    }
    .eco-success-balance {
      font-size: 0.9rem; color: var(--ink-2, #3b5e3d);
      font-weight: 600; margin-bottom: 24px;
    }
    .eco-success-balance span { color: var(--sage-600, #2d7230); }
    #eco-btn-close-success {
      padding: 12px 36px; border-radius: var(--br-pill, 99px);
      background: var(--sage-50, #eef5ee);
      border: 1.5px solid var(--sage-200, #acd4ac);
      color: var(--ink-2, #3b5e3d);
      font-family: "Plus Jakarta Sans", sans-serif;
      font-weight: 700; font-size: 0.9rem; cursor: pointer;
      transition: background 0.2s, transform 0.2s;
    }
    #eco-btn-close-success:hover {
      background: var(--sage-100, #d6ebd6); transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);

  /* Inject HTML */
  const overlay = document.createElement("div");
  overlay.id = "eco-modal-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "eco-modal-name");
  overlay.innerHTML = `
    <div id="eco-modal-box" style="position:relative;">
      <button class="eco-modal-close" onclick="closeEcopontoModal()" aria-label="Fechar">✕</button>

      <!-- Painel principal -->
      <div id="eco-modal-main">
        <div class="eco-modal-header">
          <div class="eco-modal-badge">♻️</div>
          <div>
            <p class="eco-modal-name" id="eco-modal-name">—</p>
            <p class="eco-modal-code" id="eco-modal-code">—</p>
            <p class="eco-modal-desc" id="eco-modal-desc">—</p>
            <div class="eco-modal-cats" id="eco-modal-cats"></div>
          </div>
        </div>

        <div class="eco-saldo-row">
          <span class="saldo-label">🪙 Seu saldo</span>
          <span class="saldo-valor" id="eco-saldo-atual">…</span>
        </div>

        <p class="eco-materials-label">O que você está entregando?</p>
        <div id="eco-modal-materials"></div>

        <div class="eco-summary">
          <div>
            <p class="eco-summary-label">EcoCoins a ganhar</p>
            <p class="eco-summary-coins" id="eco-total-coins">0 🪙</p>
          </div>
          <div style="text-align:right">
            <p class="eco-summary-label">Quantidade total</p>
            <p class="eco-summary-items" id="eco-total-items">0 itens</p>
          </div>
        </div>

        <button id="eco-btn-confirm" onclick="confirmEcoColeta()" disabled>
          Confirmar coleta
        </button>
        <p id="eco-modal-api-error" style="display:none;">
          ❌ Erro ao salvar. Verifique sua conexão e tente novamente.
        </p>
      </div>

      <!-- Tela de sucesso -->
      <div id="eco-modal-success" style="display:none;">
        <div class="eco-success-icon">✅</div>
        <h3 class="eco-success-title">Coleta registrada!</h3>
        <p class="eco-success-pts" id="eco-success-pts">+0 🪙</p>
        <p class="eco-success-msg" id="eco-success-msg">—</p>
        <p class="eco-success-balance">
          Novo saldo: <span id="eco-success-balance">—</span> EcoCoins
        </p>
        <button id="eco-btn-close-success" onclick="closeEcopontoModal()">
          Fechar
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* Fecha ao clicar fora */
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeEcopontoModal();
  });

  /* Fecha com Escape */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeEcopontoModal();
  });
}

/* ════════════════════════════════════════════════════
   CONTROLES DO MODAL
════════════════════════════════════════════════════ */
function _showModal() {
  const overlay = document.getElementById("eco-modal-overlay");
  if (overlay) overlay.classList.add("open");

  /* Carrega saldo atual da API de forma assíncrona */
  _loadSaldo();
}

function closeEcopontoModal() {
  const overlay = document.getElementById("eco-modal-overlay");
  if (overlay) overlay.classList.remove("open");
  _ecoModalPoint = null;
  _ecoQtd = {};
}

function ecoChangeQty(cat, delta) {
  _ecoQtd[cat] = Math.max(0, (_ecoQtd[cat] || 0) + delta);

  const valEl = document.getElementById("eco-qty-" + cat);
  if (valEl) valEl.textContent = _ecoQtd[cat];

  const row = document.getElementById("eco-mat-" + cat);
  if (row) row.classList.toggle("active", _ecoQtd[cat] > 0);

  _updateSummary();
}

function _updateSummary() {
  let totalPts = 0;
  let totalItens = 0;

  Object.entries(_ecoQtd).forEach(([cat, qty]) => {
    if (qty > 0 && MATERIAIS[cat]) {
      totalPts  += qty * MATERIAIS[cat].pts;
      totalItens += qty;
    }
  });

  const coinsEl = document.getElementById("eco-total-coins");
  const itensEl = document.getElementById("eco-total-items");
  const btnEl   = document.getElementById("eco-btn-confirm");

  if (coinsEl) coinsEl.textContent = totalPts + " 🪙";
  if (itensEl) itensEl.textContent = totalItens + (totalItens === 1 ? " item" : " itens");
  if (btnEl)   btnEl.disabled = totalPts === 0;
}

/* ── Busca saldo atual do usuário ── */
async function _loadSaldo() {
  const el = document.getElementById("eco-saldo-atual");
  if (!el) return;
  el.textContent = "…";

  try {
    const id  = (typeof getLoggedUserId === "function") ? getLoggedUserId() : (localStorage.getItem("ecotech_user_id") || "1");
    const res = await fetch(`${API_PESSOA}/pessoa/${id}`);
    if (!res.ok) throw new Error();
    const u = await res.json();
    el.textContent = Math.floor(parseFloat(u.coins || 0)).toLocaleString("pt-BR") + " 🪙";
  } catch {
    el.textContent = "— 🪙";
  }
}

/* ════════════════════════════════════════════════════
   CONFIRMAÇÃO — salva na API e atualiza UI global
════════════════════════════════════════════════════ */
async function confirmEcoColeta() {
  const btn    = document.getElementById("eco-btn-confirm");
  const errEl  = document.getElementById("eco-modal-api-error");

  /* Calcula pontos e monta lista de itens reciclados */
  let totalPts = 0;
  const novosItens = [];

  Object.entries(_ecoQtd).forEach(([cat, qty]) => {
    if (qty > 0 && MATERIAIS[cat]) {
      const m   = MATERIAIS[cat];
      const pts = qty * m.pts;
      totalPts += pts;
      novosItens.push({
        name: `${m.label} (${qty} ${m.unit}) — ${_ecoModalPoint.code}`,
        icon: m.emoji,
        pts,
        time: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
      });
    }
  });

  if (totalPts === 0) return;

  /* Estado de carregamento */
  btn.disabled     = true;
  btn.textContent  = "Salvando…";
  errEl.style.display = "none";

  try {
    const id  = (typeof getLoggedUserId === "function") ? getLoggedUserId() : (localStorage.getItem("ecotech_user_id") || "1");

    /* 1. Busca estado atual do usuário */
    const getRes = await fetch(`${API_PESSOA}/pessoa/${id}`);
    if (!getRes.ok) throw new Error("GET /pessoa falhou");
    const user = await getRes.json();

    const prevCoins   = parseFloat(user.coins || 0);
    const newCoins    = prevCoins + totalPts;
    const prevRec     = Array.isArray(user.reciclado) ? user.reciclado : [];

    /* 2. Salva novo saldo + histórico */
    const putRes = await fetch(`${API_PESSOA}/pessoa/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        coins:     newCoins.toFixed(2),
        reciclado: [...novosItens, ...prevRec],
      }),
    });
    if (!putRes.ok) throw new Error("PUT /pessoa falhou");

    /* 3. Atualiza estado global (userCoins, currentUser) se existirem */
    if (typeof userCoins !== "undefined")   userCoins   = newCoins;
    if (typeof currentUser !== "undefined" && currentUser) currentUser.coins = newCoins.toFixed(2);

    /* 4. Atualiza UIs da página (coins, timeline) se as funções existirem */
    if (typeof updateCoinsUI    === "function") updateCoinsUI();
    if (typeof addTimelineEntry === "function") {
      novosItens.forEach((item) =>
        addTimelineEntry({ type: "earn", icon: item.icon, desc: item.name, pts: "+" + item.pts, time: item.time })
      );
    }

    /* 5. Mostra tela de sucesso dentro do modal */
    const descItems = novosItens
      .map((i) => i.name.replace(` — ${_ecoModalPoint.code}`, ""))
      .join(", ");

    document.getElementById("eco-success-pts").textContent    = "+" + totalPts + " 🪙";
    document.getElementById("eco-success-msg").textContent    = descItems + " entregues em " + _ecoModalPoint.name + ".";
    document.getElementById("eco-success-balance").textContent = Math.floor(newCoins).toLocaleString("pt-BR");

    document.getElementById("eco-modal-main").style.display    = "none";
    document.getElementById("eco-modal-success").style.display = "";

  } catch (err) {
    console.error("[EcoTech] Erro na coleta:", err);
    errEl.style.display = "block";
    btn.disabled    = false;
    btn.textContent = "Confirmar coleta";
  }
}

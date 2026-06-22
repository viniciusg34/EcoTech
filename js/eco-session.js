"use strict";
/* ══════════════════════════════════════════════════════
   eco-session.js — Sessão e Avatar no Header (EcoTech)
   Inclua este script em TODAS as páginas que têm header.
   <script src="js/eco-session.js"></script>
══════════════════════════════════════════════════════ */

const SESSION_KEY = "ecotech_session";

/* Retorna a sessão ativa (sessionStorage tem prioridade) */
function getSession() {
  try {
    return (
      JSON.parse(sessionStorage.getItem(SESSION_KEY)) ||
      JSON.parse(localStorage.getItem(SESSION_KEY))   ||
      null
    );
  } catch (_) { return null; }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("ecotech_user_id");
}

/* Injeta o avatar/nome no header e adiciona botão de logout */
function initHeader() {
  const sessao  = getSession();
  const iconBtn = document.querySelector(".icon-btn[aria-label='Perfil']");
  if (!iconBtn) return;

  if (!sessao) {
    /* Não logado — mantém link para login com emoji */
    iconBtn.href        = "login.html";
    iconBtn.innerHTML   = "👤";
    iconBtn.title       = "Entrar";
    return;
  }

  /* Logado — troca emoji por avatar circular */
  const firstName = sessao.nome ? sessao.nome.split(" ")[0] : "Perfil";

  if (sessao.avatar) {
    iconBtn.innerHTML = `
      <img
        src="${sessao.avatar}"
        alt="${firstName}"
        style="
          width: 32px; height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--sage-400, #81c784);
          display: block;
        "
        onerror="this.replaceWith(document.createTextNode('👤'))"
      />`;
  } else {
    /* Fallback: iniciais coloridas */
    const initials = sessao.nome
      ? sessao.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
      : "?";
    iconBtn.innerHTML = `
      <div style="
        width: 32px; height: 32px;
        border-radius: 50%;
        background: var(--sage-500, #66bb6a);
        color: #fff;
        font-size: 13px;
        font-weight: 700;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid var(--sage-400, #81c784);
        font-family: inherit;
      ">${initials}</div>`;
  }

  iconBtn.href  = "#";
  iconBtn.title = firstName;

  /* Dropdown simples ao clicar */
  let dropdown = null;

  iconBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (dropdown) { dropdown.remove(); dropdown = null; return; }

    dropdown = document.createElement("div");
    dropdown.style.cssText = `
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: var(--surface, #fff);
      border: 1px solid var(--border, #e0e0e0);
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.13);
      padding: 8px;
      min-width: 200px;
      z-index: 9999;
      font-family: 'Plus Jakarta Sans', 'Poppins', sans-serif;
    `;
    dropdown.innerHTML = `
      <div style="padding: 10px 12px 8px; border-bottom: 1px solid var(--border, #eee); margin-bottom: 4px;">
        <div style="font-weight: 700; font-size: 0.9rem; color: var(--ink);">${sessao.nome}</div>
        <div style="font-size: 0.75rem; color: var(--ink-3);">${sessao.email}</div>
      </div>
      <a href="coleta.html" style="${ddItemStyle()}">🌿 Minha Coleta</a>
      <button id="eco-logout-btn" style="${ddItemStyle()} border:none; cursor:pointer; width:100%; text-align:left; background:transparent;">🚪 Sair</button>
    `;

    /* Posiciona relativo ao botão */
    iconBtn.style.position = "relative";
    iconBtn.appendChild(dropdown);

    document.getElementById("eco-logout-btn").addEventListener("click", () => {
      clearSession();
      window.location.href = "login.html";
    });

    /* Fecha ao clicar fora */
    setTimeout(() => {
      document.addEventListener("click", function closeDD() {
        dropdown?.remove(); dropdown = null;
        document.removeEventListener("click", closeDD);
      });
    }, 0);
  });
}

function ddItemStyle() {
  return `
    display: block;
    padding: 9px 12px;
    border-radius: 9px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--ink);
    text-decoration: none;
    transition: background 0.15s;
  `;
}

/* Roda quando o DOM estiver pronto */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeader);
} else {
  initHeader();
}

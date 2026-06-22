"use strict";
/* ══════════════════════════════════════════════════════════
   eco-session.js — Sessão, Avatar e Proteção de Rota
   Inclua em TODAS as páginas com header:
     <script src="js/eco-session.js"></script>

   Para páginas que exigem login, adicione TAMBÉM:
      <script>requireAuth();</script>
   (antes de qualquer outro script da página)
══════════════════════════════════════════════════════════ */

const SESSION_KEY = "ecotech_session";

/* ── Lê sessão (sessionStorage tem prioridade) ── */
function getSession() {
  try {
    return (
      JSON.parse(sessionStorage.getItem(SESSION_KEY)) ||
      JSON.parse(localStorage.getItem(SESSION_KEY))   ||
      null
    );
  } catch (_) { return null; }
}

/* ── Destrói sessão e redireciona ── */
function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("ecotech_user_id");
  window.location.replace("login.html");
}

/* ── Proteção de rota: chame no topo da página protegida ── */
function requireAuth() {
  const s = getSession();
  if (!s || !s.id) {
    window.location.replace("login.html");
    /* Lança para parar qualquer JS que viria depois */
    throw new Error("Sessão inválida — redirecionando para login.");
  }
  return s;
}

/* ══════════════════════════════════════════════════════════
   Injeta avatar / dropdown no header
══════════════════════════════════════════════════════════ */
function initHeader() {
  const sessao  = getSession();
  const iconBtn = document.querySelector(".icon-btn[aria-label='Perfil']");
  if (!iconBtn) return;

  if (!sessao || !sessao.id) {
    iconBtn.href      = "login.html";
    iconBtn.innerHTML = "👤";
    iconBtn.title     = "Entrar";
    return;
  }

  const firstName = sessao.nome ? sessao.nome.split(" ")[0] : "Perfil";

  /* Avatar circular */
  if (sessao.avatar) {
    iconBtn.innerHTML = `
      <img src="${sessao.avatar}" alt="${firstName}"
        style="width:32px;height:32px;border-radius:50%;object-fit:cover;
               border:2px solid var(--sage-400,#81c784);display:block;"
        onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'👤'}))"
      />`;
  } else {
    const initials = (sessao.nome || "?")
      .split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
    iconBtn.innerHTML = `
      <div style="width:32px;height:32px;border-radius:50%;
                  background:var(--sage-500,#66bb6a);color:#fff;
                  font-size:13px;font-weight:700;
                  display:flex;align-items:center;justify-content:center;
                  border:2px solid var(--sage-400,#81c784);">${initials}</div>`;
  }

  iconBtn.href  = "#";
  iconBtn.title = firstName;

  /* ── Dropdown ── */
  let dropdown = null;

  iconBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (dropdown) { dropdown.remove(); dropdown = null; return; }

    dropdown = document.createElement("div");
    dropdown.style.cssText = `
      position:absolute; top:calc(100% + 8px); right:0;
      background:var(--surface,#fff);
      border:1px solid var(--border,#e0e0e0);
      border-radius:14px;
      box-shadow:0 8px 32px rgba(0,0,0,0.13);
      padding:8px; min-width:210px; z-index:9999;
      font-family:'Plus Jakarta Sans','Poppins',sans-serif;
    `;

    dropdown.innerHTML = `
      <div style="padding:10px 12px 8px;border-bottom:1px solid var(--border,#eee);margin-bottom:4px;">
        <div style="font-weight:700;font-size:.9rem;color:var(--ink);">${sessao.nome}</div>
        <div style="font-size:.75rem;color:var(--ink-3);">${sessao.email}</div>
      </div>
      <a href="coleta.html" style="${_ddItem()}">🌿 Minha Coleta</a>
      <button id="eco-logout-btn" style="${_ddItem()}border:none;cursor:pointer;width:100%;text-align:left;background:transparent;">
        🚪 Sair
      </button>`;

    iconBtn.style.position = "relative";
    iconBtn.appendChild(dropdown);

    document.getElementById("eco-logout-btn").addEventListener("click", logout);

    /* Fecha ao clicar fora */
    setTimeout(() => {
      document.addEventListener("click", function close() {
        dropdown?.remove(); dropdown = null;
        document.removeEventListener("click", close);
      });
    }, 0);
  });
}

function _ddItem() {
  return `display:block;padding:9px 12px;border-radius:9px;
          font-size:.875rem;font-weight:500;
          color:var(--ink);text-decoration:none;
          transition:background .15s;`;
}

/* Roda quando DOM estiver pronto */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeader);
} else {
  initHeader();
}
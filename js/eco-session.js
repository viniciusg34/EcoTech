"use strict";

const SESSION_KEY = "ecotech_session";

function getSession() {
  try {
    return (
      JSON.parse(sessionStorage.getItem(SESSION_KEY)) ||
      JSON.parse(localStorage.getItem(SESSION_KEY)) ||
      null
    );
  } catch (_) { return null; }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("ecotech_user_id");
}

function ddItemStyle(color = "var(--ink)") {
  return `
    display:flex;
    align-items:center;
    gap:10px;
    padding:10px 14px;
    border-radius:10px;
    font-size:0.875rem;
    font-weight:500;
    color:${color};
    text-decoration:none;
    background:transparent;
    border:none;
    width:100%;
    text-align:left;
    cursor:pointer;
    font-family:inherit;
    transition:background 0.15s,color 0.15s;
  `;
}

function initHeader() {
  const sessao  = getSession();
  const iconBtn = document.querySelector(".icon-btn[aria-label='Perfil']");
  if (!iconBtn) return;

  if (!sessao) {
    iconBtn.href      = "login.html";
    iconBtn.innerHTML = "👤";
    iconBtn.title     = "Entrar";
    return;
  }

  const firstName = sessao.nome ? sessao.nome.split(" ")[0] : "Perfil";
  const initials  = sessao.nome
    ? sessao.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  if (sessao.avatar) {
    iconBtn.innerHTML = `
      <img src="${sessao.avatar}" alt="${firstName}"
        style="width:32px;height:32px;border-radius:50%;object-fit:cover;
               border:2px solid var(--sage-400);display:block;"
        onerror="this.replaceWith(document.createTextNode('👤'))" />`;
  } else {
    iconBtn.innerHTML = `
      <div style="width:32px;height:32px;border-radius:50%;
                  background:var(--sage-500);color:#fff;font-size:13px;
                  font-weight:700;display:flex;align-items:center;
                  justify-content:center;border:2px solid var(--sage-400);
                  font-family:inherit;">${initials}</div>`;
  }

  iconBtn.href  = "#";
  iconBtn.title = firstName;
  iconBtn.style.position = "relative";

  let dropdown = null;

  iconBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (dropdown) { dropdown.remove(); dropdown = null; return; }

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";

    const bg     = isDark ? "#1e251f" : "#ffffff";
    const border = isDark ? "rgba(90,171,90,0.25)" : "#e2ece2";
    const divClr = isDark ? "rgba(90,171,90,0.15)" : "#eef5ee";
    const metaClr= isDark ? "rgba(163,195,164,0.55)" : "#6b8f6c";
    const nameClr= isDark ? "#f0f5f0" : "#1a2e1b";
    const hoverBg= isDark ? "rgba(90,171,90,0.12)" : "#eef5ee";

    dropdown = document.createElement("div");
    dropdown.style.cssText = `
      position:absolute;
      top:calc(100% + 10px);
      right:0;
      background:${bg};
      border:1.5px solid ${border};
      border-radius:16px;
      box-shadow:0 12px 40px rgba(0,0,0,${isDark ? "0.55" : "0.13"});
      padding:8px;
      min-width:220px;
      z-index:9999;
      font-family:'Plus Jakarta Sans','Poppins',sans-serif;
    `;

    dropdown.innerHTML = `
      <div style="
        padding:12px 14px 10px;
        border-bottom:1.5px solid ${divClr};
        margin-bottom:6px;
        display:flex;
        align-items:center;
        gap:10px;
      ">
        <div style="
          width:36px;height:36px;border-radius:50%;
          background:var(--sage-500);color:#fff;
          font-size:14px;font-weight:700;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          border:2px solid var(--sage-400);
        ">${initials}</div>
        <div>
          <div style="font-weight:700;font-size:0.9rem;color:${nameClr};line-height:1.2;">${sessao.nome}</div>
          <div style="font-size:0.72rem;color:${metaClr};margin-top:2px;">${sessao.email}</div>
        </div>
      </div>

      <a href="coleta.html" id="dd-coleta" style="${ddItemStyle()}">
        <span style="font-size:16px;">🌿</span> Minha Coleta
      </a>
      <a href="perfil.html" id="dd-perfil" style="${ddItemStyle()}">
        <span style="font-size:16px;">👤</span> Meu Perfil
      </a>

      <div style="height:1.5px;background:${divClr};margin:6px 0;"></div>

      <button id="eco-logout-btn" style="${ddItemStyle("var(--sage-500)")}">
        <span style="font-size:16px;">🚪</span> Sair da conta
      </button>
    `;

    iconBtn.appendChild(dropdown);

    /* Hover + stopPropagation nos itens */
    dropdown.querySelectorAll("a, button").forEach(el => {
      el.addEventListener("mouseenter", () => { el.style.background = hoverBg; });
      el.addEventListener("mouseleave", () => { el.style.background = "transparent"; });
      el.addEventListener("click", (e) => { e.stopPropagation(); });
    });

    document.getElementById("eco-logout-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      clearSession();
      window.location.href = "login.html";
    });

    /* Fecha ao clicar fora */
    setTimeout(() => {
      document.addEventListener("click", function closeDD(ev) {
        if (!iconBtn.contains(ev.target)) {
          dropdown?.remove();
          dropdown = null;
          document.removeEventListener("click", closeDD);
        }
      });
    }, 0);
  });

  /* Fecha e reaplica cores ao trocar tema */
  new MutationObserver(() => {
    if (dropdown) { dropdown.remove(); dropdown = null; }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeader);
} else {
  initHeader();
}

"use strict";

/* ══════════════════════════════════════════════════════════
   eco-admin.js — Perfis (master/comum), conta master local,
   log de autenticação e o pequeno atalho "Painel Admin".

   Conforme o PDF do projeto: "O usuário master é criado
   dentro do próprio banco de dados". Como o front-end aqui
   não tem acesso a um script SQL, a conta master é semeada
   uma única vez em localStorage (chave própria, não interfere
   em nada que já existia no projeto).
══════════════════════════════════════════════════════════ */

const MASTER_KEY = "ecotech_master_users";
const LOGS_KEY = "ecotech_auth_logs";

/* ── Semeia a conta master local (idempotente) ── */
function seedMaster() {
  try {
    let masters = JSON.parse(localStorage.getItem(MASTER_KEY) || "[]");
    if (masters.length === 0) {
      masters = [
        {
          id: "master-local-1",
          login: "MASTER",
          email: "master@ecotech.com",
          nome: "Administrador EcoTech",
          nomeMae: "Eco Mestra",
          nascimento: "1990-05-12",
          cep: "20040020",
          senha: "Master12",
          perfil: "master",
        },
      ];
      localStorage.setItem(MASTER_KEY, JSON.stringify(masters));
    }
  } catch (e) {
    console.error("Não foi possível preparar a conta master:", e);
  }
}
seedMaster();

function getMasterUsers() {
  try {
    return JSON.parse(localStorage.getItem(MASTER_KEY) || "[]");
  } catch (_) {
    return [];
  }
}

/* ── Autentica pela conta master local (login ou e-mail + senha) ── */
function autenticarMasterLocal(loginOuEmail, senha) {
  const valor = (loginOuEmail || "").trim().toLowerCase();
  return (
    getMasterUsers().find(
      (m) =>
        (m.login.toLowerCase() === valor || m.email.toLowerCase() === valor) &&
        m.senha === senha,
    ) || null
  );
}

function isMaster(session) {
  return !!(session && session.perfil === "master");
}

/* ── Log de autenticação (usado pela Tela LOG) ── */
function registrarLogAutenticacao({ nome, cpf, metodo2fa }) {
  try {
    const logs = JSON.parse(localStorage.getItem(LOGS_KEY) || "[]");
    logs.unshift({
      data: new Date().toISOString(),
      nome: nome || "—",
      cpf: cpf || "—",
      metodo2fa: metodo2fa || "—",
    });
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 300)));
  } catch (e) {
    console.error("Não foi possível registrar o log:", e);
  }
}

function getLogsAutenticacao() {
  try {
    return JSON.parse(localStorage.getItem(LOGS_KEY) || "[]");
  } catch (_) {
    return [];
  }
}

/* ══════════════════════════════════════════════════════════
   Atalho flutuante "Painel Admin" — some função ao carregar,
   e só aparece para quem está logado com perfil master.
   Não altera nenhum header já existente: apenas injeta um
   botão fixo novo no canto da tela.
══════════════════════════════════════════════════════════ */
function injectAdminShortcut() {
  if (typeof getSession !== "function") return; // eco-session.js não incluído nesta página
  const sessao = getSession();
  if (!isMaster(sessao)) return;
  if (document.getElementById("eco-admin-shortcut")) return;

  const wrap = document.createElement("div");
  wrap.id = "eco-admin-shortcut";
  wrap.style.cssText =
    "position:fixed;left:18px;bottom:18px;z-index:9998;font-family:'Plus Jakarta Sans','Poppins',sans-serif;";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.title = "Painel Admin";
  btn.setAttribute("aria-label", "Abrir painel administrativo");
  btn.style.cssText =
    "width:50px;height:50px;border-radius:50%;border:2px solid var(--sage-400,#5aab5a);" +
    "background:var(--sage-500,#3d9140);color:#fff;font-size:20px;cursor:pointer;" +
    "box-shadow:0 8px 24px rgba(30,82,32,0.28);display:grid;place-items:center;";
  btn.textContent = "🛡️";

  const menu = document.createElement("div");
  menu.style.cssText =
    "display:none;position:absolute;left:0;bottom:60px;background:var(--white,#fff);" +
    "border:1.5px solid var(--sage-100,#d6ebd6);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,0.15);" +
    "padding:8px;min-width:210px;";
  menu.innerHTML =
    '<div style="padding:8px 10px;font-size:0.72rem;font-weight:700;color:var(--ink-3,#6b8f6c);text-transform:uppercase;letter-spacing:.03em;">Perfil Master</div>' +
    '<a href="consulta_usuarios.html" style="display:flex;gap:8px;align-items:center;padding:9px 10px;border-radius:10px;text-decoration:none;color:var(--ink,#1a2e1b);font-size:0.85rem;font-weight:600;">🔎 Consulta de Usuários</a>' +
    '<a href="logs.html" style="display:flex;gap:8px;align-items:center;padding:9px 10px;border-radius:10px;text-decoration:none;color:var(--ink,#1a2e1b);font-size:0.85rem;font-weight:600;">🧾 Log de Autenticação</a>' +
    '<a href="modelo_bd.html" style="display:flex;gap:8px;align-items:center;padding:9px 10px;border-radius:10px;text-decoration:none;color:var(--ink,#1a2e1b);font-size:0.85rem;font-weight:600;">🗄️ Modelo do BD</a>';

  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("mouseenter", () => (a.style.background = "var(--sage-50,#eef5ee)"));
    a.addEventListener("mouseleave", () => (a.style.background = "transparent"));
  });

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  });
  document.addEventListener("click", () => (menu.style.display = "none"));

  wrap.appendChild(menu);
  wrap.appendChild(btn);
  document.body.appendChild(wrap);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectAdminShortcut);
} else {
  injectAdminShortcut();
}

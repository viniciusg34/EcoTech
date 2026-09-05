"use strict";

/* ══════════════════════════════
   CONFIG
══════════════════════════════ */
const API_EMPRESA =
  "https://6a386bef64a2d82692228142.mockapi.io/api/v1/empresa";
const SESSION_KEY = "ecotech_session";

/* ══════════════════════════════
   METADADOS ESTÁTICOS
══════════════════════════════ */
const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

const CATEGORY_META = {
  metal: { label: "Metal", color: "#f9a825" },
  papel: { label: "Papel", color: "#66bb6a" },
  vidro: { label: "Vidro", color: "#42a5f5" },
  plastico: { label: "Plástico", color: "#ef5350" },
  eletronicos: { label: "Eletrônicos", color: "#ab47bc" },
  madeira: { label: "Madeira", color: "#8d6e63" },
};

const STATUS_META = {
  ativo: { label: "Ativo", className: "status-ativo" },
  manutencao: { label: "Em manutenção", className: "status-manutencao" },
  inativo: { label: "Inativo", className: "status-inativo" },
};

/* ══════════════════════════════
   HELPERS
══════════════════════════════ */

/** Normaliza a string "cats" da API → array de chaves internas
 *  Ex: "Metal, Plástico" → ["metal", "plastico"]
 */
function parseCats(catsField) {
  if (!catsField || typeof catsField !== "string") return ["papel"];
  const MAP = {
    metal: "metal",
    papel: "papel",
    vidro: "vidro",
    plástico: "plastico",
    plastico: "plastico",
    eletrônicos: "eletronicos",
    eletronicos: "eletronicos",
    madeira: "madeira",
  };
  return catsField
    .split(",")
    .map((s) => MAP[s.trim().toLowerCase()] || "papel")
    .filter((v, i, a) => a.indexOf(v) === i); // dedup
}

/** Converte status boolean da API → chave interna */
function parseStatus(statusField) {
  if (statusField === true) return "ativo";
  if (statusField === false) return "inativo";
  return "inativo";
}

/** Gera série mensal fictícia baseada no kgColetado total da empresa
 *  (API não tem histórico mensal, então simulamos crescimento realista)
 */
function buildMonthlySeries(kgTotal) {
  const total = parseFloat(kgTotal) || 0;
  const base = total / 6;
  return [0.72, 0.83, 0.91, 1.0, 1.09, 1.18].map((f) => Math.round(base * f));
}

/** Gera lastActivity fictício baseado no id do ecoponto */
function fakeLastActivity(id) {
  const n = parseInt(id, 10) % 5;
  const opts = [
    "Hoje, 08h30",
    "Hoje, 11h15",
    "Ontem, 16h40",
    "Há 2 dias",
    "Há 4 dias",
  ];
  return opts[n] || "Hoje";
}

/** monthlyKg simulado por ecoponto baseado em coletado */
function pointMonthlyKg(coletado, id) {
  const total = parseFloat(coletado) || 0;
  const factor = [0.14, 0.17, 0.19, 0.16, 0.18][parseInt(id, 10) % 5];
  return Math.round(total * factor);
}

/* ══════════════════════════════
   SESSÃO
══════════════════════════════ */
function getSessao() {
  try {
    const raw =
      sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

/* ══════════════════════════════
   INICIALIZAÇÃO PRINCIPAL
   Busca dados na API e renderiza o painel.
   Chamada de empresa.html via: initEmpresaDashboard()
══════════════════════════════ */
async function initEmpresaDashboard() {
  const sessao = getSessao();

  /* ── Redireciona se não estiver logada como empresa ── */
  if (!sessao || sessao.tipo !== "empresa") {
    window.location.href = "login.html";
    return;
  }

  /* ── Busca os dados da empresa logada ── */
  let empresaData;
  try {
    const res = await fetch(`${API_EMPRESA}/${sessao.id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    empresaData = await res.json();
  } catch (err) {
    console.error("Erro ao carregar dados da empresa:", err);
    showToast("❌ Erro ao carregar dados da empresa.");
    return;
  }

  /* ── Monta objeto `company` compatível com o HTML ── */
  const company = {
    id: empresaData.id,
    name: empresaData.nome,
    icon: "🏢",
  };

  /* ── Converte array `sad` (ecopontos) → formato interno ── */
  const rawPoints = Array.isArray(empresaData.sad) ? empresaData.sad : [];
  const points = rawPoints.map((ep) => ({
    ecopontoId: ep.id, // ← id real do ecoponto na API
    code: ep.code || `ECO-${ep.id}`,
    name: ep.nome || "Ecoponto",
    cats: parseCats(ep.cats),
    address: ep.address
      ? `${ep.address}, ${ep.city || ""}`
      : "Endereço não informado",
    status: parseStatus(ep.status),
    monthlyKg: pointMonthlyKg(ep.coletado, ep.id),
    validations: Math.round(pointMonthlyKg(ep.coletado, ep.id) * 0.6),
    lastActivity: fakeLastActivity(ep.id),
  }));

  /* ── Série mensal baseada no kgColetado total da empresa ── */
  const monthly = buildMonthlySeries(empresaData.kgColetado);

  /* ── Renderiza o painel ── */
  renderDashboard({ company, points, monthly });
}

/* ══════════════════════════════
   RENDERIZAÇÃO
══════════════════════════════ */
function renderDashboard({ company, points, monthly }) {
  /* Cabeçalho */
  document.getElementById("dashCompanyBadge").textContent =
    `🏢 ${company.name}`;
  document.getElementById("dashCompanyName").textContent =
    `Painel de Acompanhamento — ${company.name}`;

  /* Stats */
  const totalKg = points.reduce((s, p) => s + p.monthlyKg, 0);
  const totalValidations = points.reduce((s, p) => s + p.validations, 0);
  const activeCount = points.filter((p) => p.status === "ativo").length;

  document.getElementById("statPoints").textContent = points.length;
  document.getElementById("statKg").textContent =
    totalKg.toLocaleString("pt-BR");
  document.getElementById("statValidations").textContent =
    totalValidations.toLocaleString("pt-BR");
  document.getElementById("statActive").textContent = activeCount;

  if (monthly.length >= 2) {
    const last = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    const pct = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;
    document.getElementById("statKgDelta").textContent =
      (pct >= 0 ? "↑ " : "↓ ") + Math.abs(pct) + "% vs mês anterior";
  }

  /* Gráfico de barras */
  const chartBars = document.getElementById("chartBars");
  const maxVal = Math.max(...monthly, 1);
  chartBars.innerHTML = monthly
    .map((val, i) => {
      const h = Math.max((val / maxVal) * 100, 6);
      return `
        <div class="dash-chart-col">
          <div class="dash-chart-bar" style="height:${h}%;">
            <span class="dash-chart-bar-value">${val.toLocaleString("pt-BR")}</span>
          </div>
          <div class="dash-chart-col-label">${MONTH_LABELS[i]}</div>
        </div>`;
    })
    .join("");

  document.getElementById("chartTotalLabel").textContent =
    "Total: " +
    monthly.reduce((a, b) => a + b, 0).toLocaleString("pt-BR") +
    " kg";

  /* Breakdown por material */
  const catTotals = {};
  points.forEach((p) => {
    const share = p.monthlyKg / (p.cats.length || 1);
    p.cats.forEach((c) => {
      catTotals[c] = (catTotals[c] || 0) + share;
    });
  });
  const catSum = Object.values(catTotals).reduce((a, b) => a + b, 0) || 1;

  document.getElementById("breakdownList").innerHTML = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([key, val]) => {
      const meta = CATEGORY_META[key] || { label: key, color: "#aaa" };
      const pct = Math.round((val / catSum) * 100);
      return `
        <div class="dash-breakdown-item">
          <div class="dash-breakdown-row">
            <span class="dash-breakdown-dot" style="background:${meta.color};"></span>
            <span class="dash-breakdown-label">${meta.label}</span>
            <span class="dash-breakdown-pct">${pct}%</span>
          </div>
          <div class="dash-breakdown-track">
            <div class="dash-breakdown-fill" style="width:${pct}%; background:${meta.color};"></div>
          </div>
        </div>`;
    })
    .join("");

  /* Tabela de ecopontos */
  document.getElementById("tableCount").textContent =
    points.length + (points.length === 1 ? " Ecoponto" : " Ecopontos");

  document.getElementById("pointsTableBody").innerHTML = points
    .map((p) => {
      const sm = STATUS_META[p.status] || STATUS_META.inativo;
      const catsHtml = p.cats
        .map((c) => {
          const meta = CATEGORY_META[c] || { label: c, color: "#aaa" };
          return `<span class="dash-cat-chip"><span style="background:${meta.color};"></span>${meta.label}</span>`;
        })
        .join("");
      return `
        <tr>
          <td>
            <span class="dash-point-name">${p.name}</span>
            <span class="dash-point-address">${p.address}</span>
          </td>
          <td><span class="dash-point-code">${p.code}</span></td>
          <td><div class="dash-cats">${catsHtml}</div></td>
          <td><span class="dash-status-pill ${sm.className}">${sm.label}</span></td>
          <td>${p.monthlyKg.toLocaleString("pt-BR")} kg</td>
          <td>${p.lastActivity}</td>
          <td><button class="dash-table-action" data-code="${p.code}">...</button></td>
        </tr>`;
    })
    .join("");

  /* Select do gerador de QR */
  const qrSelect = document.getElementById("qrPointSelect");
  qrSelect.innerHTML = `<option value="" disabled selected>Selecione um Ecoponto</option>`;
  points.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.code;
    opt.textContent = `${p.code} — ${p.name}`;
    qrSelect.appendChild(opt);
  });

  /* Expõe `points` globalmente para o script inline do empresa.html */
  window.__empresaPoints = points;

  /* Re-inicializa listeners de QR (empresa.html usa window.__empresaPoints) */
  if (typeof bindQrListeners === "function") bindQrListeners();
}

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

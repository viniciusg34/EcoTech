"use strict";

const API_EMPRESA = "https://6a386bef64a2d82692228142.mockapi.io/api/v1";

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

const CATEGORY_META = {
  metal:       { label: "Metal",       color: "#f9a825" },
  papel:       { label: "Papel",       color: "#66bb6a" },
  vidro:       { label: "Vidro",       color: "#42a5f5" },
  plastico:    { label: "Pl\u00e1stico",    color: "#ef5350" },
  eletronicos: { label: "Eletr\u00f4nicos", color: "#ab47bc" },
  madeira:     { label: "Madeira",     color: "#8d6e63" },
};

const STATUS_META = {
  ativo:      { label: "Ativo",         className: "status-ativo" },
  manutencao: { label: "Em manuten\u00e7\u00e3o", className: "status-manutencao" },
  inativo:    { label: "Inativo",       className: "status-inativo" },
};

function parseCats(catsField) {
  if (!catsField || typeof catsField !== "string") return ["papel"];
  const MAP = {
    "metal": "metal",
    "papel": "papel",
    "vidro": "vidro",
    "pl\u00e1stico": "plastico",
    "plastico": "plastico",
    "eletr\u00f4nicos": "eletronicos",
    "eletronicos": "eletronicos",
    "madeira": "madeira",
  };
  const result = catsField
    .split(",")
    .map(function(s) { return MAP[s.trim().toLowerCase()]; })
    .filter(Boolean)
    .filter(function(v, i, a) { return a.indexOf(v) === i; });
  return result.length ? result : ["papel"];
}

function parseStatus(s) { return s === true ? "ativo" : "inativo"; }

function buildMonthlySeries(kgTotal) {
  const total = parseFloat(kgTotal) || 0;
  const base  = total / 6;
  return [0.72, 0.83, 0.91, 1.00, 1.09, 1.18].map(function(f) { return Math.round(base * f); });
}

function pointMonthlyKg(coletado, id) {
  const total  = parseFloat(coletado) || 0;
  const factor = [0.14, 0.17, 0.19, 0.16, 0.18][parseInt(id, 10) % 5];
  return Math.round(total * factor);
}

function fakeLastActivity(id) {
  const opts = ["Hoje, 08h30", "Hoje, 11h15", "Ontem, 16h40", "Ha 2 dias", "Ha 4 dias"];
  return opts[parseInt(id, 10) % 5] || "Hoje";
}

function getSessao() {
  try {
    const raw = sessionStorage.getItem("ecotech_session") || localStorage.getItem("ecotech_session");
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(function() { t.classList.remove("show"); }, 2800);
}

async function initEmpresaDashboard() {
  const sessao = getSessao();

  console.log("[Empresa] sessao:", sessao);

  if (!sessao || !sessao.id) {
    console.warn("[Empresa] Sem sessao — redirecionando para login");
    window.location.href = "login.html";
    return;
  }

  if (sessao.tipo !== "empresa") {
    console.warn("[Empresa] Sessao nao e empresa:", sessao.tipo);
    window.location.href = "coleta.html";
    return;
  }

  /* 1. Dados da empresa */
  let empresaData;
  try {
    const url = API_EMPRESA + "/empresa/" + sessao.id;
    console.log("[Empresa] GET", url);
    const res = await fetch(url);
    console.log("[Empresa] status empresa:", res.status);
    if (!res.ok) throw new Error("HTTP " + res.status);
    empresaData = await res.json();
    console.log("[Empresa] dados:", empresaData);
  } catch (err) {
    console.error("[Empresa] Erro ao carregar empresa:", err);
    showToast("Erro ao carregar dados da empresa.");
    return;
  }

  /* 2. Ecopontos — GET /ecopontos filtrando por empresaId */
  let rawPoints = [];
  try {
    const url = API_EMPRESA + "/ecopontos";
    console.log("[Empresa] GET", url);
    const res = await fetch(url);
    console.log("[Empresa] status ecopontos:", res.status);
    if (res.ok) {
      const todos = await res.json();
      console.log("[Empresa] total ecopontos na API:", todos.length);
      console.log("[Empresa] amostra empresaId:", todos.slice(0,3).map(function(e){ return e.empresaId; }));
      rawPoints = todos.filter(function(ep) {
        return String(ep.empresaId) === String(sessao.id);
      });
      console.log("[Empresa] ecopontos desta empresa (id=" + sessao.id + "):", rawPoints.length);
    }
  } catch (err) {
    console.warn("[Empresa] Erro /ecopontos:", err);
  }

  if (rawPoints.length === 0) {
    console.warn("[Empresa] Nenhum ecoponto encontrado para empresa id=" + sessao.id);
  }

  /* 3. Normaliza */
  const points = rawPoints.map(function(ep) {
    return {
      ecopontoId:   ep.id,
      empresaId:    sessao.id,
      code:         ep.code  || "ECO-" + String(ep.id).padStart(3, "0"),
      name:         ep.nome  || "Ecoponto " + ep.id,
      cats:         parseCats(ep.cats),
      address:      [ep.address, ep.city, ep.state].filter(Boolean).join(", ") || "Endereco nao informado",
      status:       parseStatus(ep.status),
      monthlyKg:    pointMonthlyKg(ep.coletado, ep.id),
      validations:  Math.round(pointMonthlyKg(ep.coletado, ep.id) * 0.6),
      lastActivity: fakeLastActivity(ep.id),
      coletado:     ep.coletado,
    };
  });

  const company = { id: empresaData.id, name: empresaData.nome, icon: "\uD83C\uDFE2" };
  const monthly = buildMonthlySeries(empresaData.kgColetado);

  console.log("[Empresa] renderizando", points.length, "pontos");
  renderDashboard({ company: company, points: points, monthly: monthly });
}

function renderDashboard(opts) {
  const company = opts.company;
  const points  = opts.points;
  const monthly = opts.monthly;

  document.getElementById("dashCompanyBadge").textContent = "\uD83C\uDFE2 " + company.name;
  document.getElementById("dashCompanyName").textContent  = "Painel de Acompanhamento \u2014 " + company.name;

  const totalKg          = points.reduce(function(s,p){ return s + p.monthlyKg; }, 0);
  const totalValidations = points.reduce(function(s,p){ return s + p.validations; }, 0);
  const activeCount      = points.filter(function(p){ return p.status === "ativo"; }).length;

  document.getElementById("statPoints").textContent      = points.length;
  document.getElementById("statKg").textContent          = totalKg.toLocaleString("pt-BR");
  document.getElementById("statValidations").textContent = totalValidations.toLocaleString("pt-BR");
  document.getElementById("statActive").textContent      = activeCount;

  if (monthly.length >= 2) {
    const last = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    const pct  = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;
    document.getElementById("statKgDelta").textContent =
      (pct >= 0 ? "\u2191 " : "\u2193 ") + Math.abs(pct) + "% vs m\u00eas anterior";
  }

  const maxVal = Math.max.apply(null, monthly.concat([1]));
  document.getElementById("chartBars").innerHTML = monthly.map(function(val, i) {
    const h = Math.max((val / maxVal) * 100, 6);
    return "<div class='dash-chart-col'>" +
      "<div class='dash-chart-bar' style='height:" + h + "%;'>" +
      "<span class='dash-chart-bar-value'>" + val.toLocaleString("pt-BR") + "</span></div>" +
      "<div class='dash-chart-col-label'>" + MONTH_LABELS[i] + "</div></div>";
  }).join("");

  document.getElementById("chartTotalLabel").textContent =
    "Total: " + monthly.reduce(function(a,b){ return a+b; }, 0).toLocaleString("pt-BR") + " kg";

  const catTotals = {};
  points.forEach(function(p) {
    const share = p.monthlyKg / (p.cats.length || 1);
    p.cats.forEach(function(c) { catTotals[c] = (catTotals[c] || 0) + share; });
  });
  const catSum = Object.values(catTotals).reduce(function(a,b){ return a+b; }, 0) || 1;

  document.getElementById("breakdownList").innerHTML = Object.entries(catTotals)
    .sort(function(a,b){ return b[1]-a[1]; })
    .map(function(entry) {
      const key  = entry[0];
      const val  = entry[1];
      const meta = CATEGORY_META[key] || { label: key, color: "#aaa" };
      const pct  = Math.round((val / catSum) * 100);
      return "<div class='dash-breakdown-item'>" +
        "<div class='dash-breakdown-row'>" +
        "<span class='dash-breakdown-dot' style='background:" + meta.color + ";'></span>" +
        "<span class='dash-breakdown-label'>" + meta.label + "</span>" +
        "<span class='dash-breakdown-pct'>" + pct + "%</span></div>" +
        "<div class='dash-breakdown-track'>" +
        "<div class='dash-breakdown-fill' style='width:" + pct + "%;background:" + meta.color + ";'></div></div></div>";
    }).join("");

  document.getElementById("tableCount").textContent =
    points.length + (points.length === 1 ? " Ecoponto" : " Ecopontos");

  document.getElementById("pointsTableBody").innerHTML = points.map(function(p) {
    const sm       = STATUS_META[p.status] || STATUS_META.inativo;
    const catsHtml = p.cats.map(function(c) {
      const meta = CATEGORY_META[c] || { label: c, color: "#aaa" };
      return "<span class='dash-cat-chip'><span style='background:" + meta.color + ";'></span>" + meta.label + "</span>";
    }).join("");
    return "<tr>" +
      "<td><span class='dash-point-name'>" + p.name + "</span>" +
      "<span class='dash-point-address'>" + p.address + "</span></td>" +
      "<td><span class='dash-point-code'>" + p.code + "</span></td>" +
      "<td><div class='dash-cats'>" + catsHtml + "</div></td>" +
      "<td><span class='dash-status-pill " + sm.className + "'>" + sm.label + "</span></td>" +
      "<td>" + p.monthlyKg.toLocaleString("pt-BR") + " kg</td>" +
      "<td>" + p.lastActivity + "</td>" +
      "<td><button class='dash-table-action' data-code='" + p.code + "'>...</button></td></tr>";
  }).join("");

  const qrSelect = document.getElementById("qrPointSelect");
  qrSelect.innerHTML = "<option value='' disabled selected>Selecione um Ecoponto</option>";
  points.forEach(function(p) {
    const opt = document.createElement("option");
    opt.value       = p.code;
    opt.textContent = p.code + " \u2014 " + p.name;
    qrSelect.appendChild(opt);
  });

  window.__empresaPoints = points;
  if (typeof bindQrListeners === "function") bindQrListeners();
}
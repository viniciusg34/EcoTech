"use strict";

/* ══════════════════════════════
   BANCO DE PRODUTOS ESCANEÁVEIS
   Código de barras → material reciclável
══════════════════════════════ */
const productDB = {
  7896004004777: {
    name: "Garrafa PET 500ml",
    pts: 30,
    icon: "🧴",
    mat: "Plástico PET",
  },
  7891234567890: {
    name: "Lata de Alumínio 350ml",
    pts: 40,
    icon: "🥫",
    mat: "Alumínio",
  },
  7896666000014: {
    name: "Caixa de Papelão",
    pts: 20,
    icon: "📦",
    mat: "Papelão",
  },
  7899000001234: {
    name: "Vidro de Conserva",
    pts: 35,
    icon: "🫙",
    mat: "Vidro",
  },
  7891910000197: {
    name: "Pilha Alcalina AA",
    pts: 80,
    icon: "🔋",
    mat: "Pilha/Bateria",
  },
  7896000000001: {
    name: "Embalagem Tetra Pak",
    pts: 25,
    icon: "🧃",
    mat: "Tetra Pak",
  },
};

/* ══════════════════════════════
   HISTÓRICO INICIAL DE VALIDAÇÕES
   (estado mutável — populado pelo scanner em runtime)
══════════════════════════════ */
let scanHistory = [
  {
    code: "7896004004777",
    name: "Garrafa PET 500ml",
    pts: 30,
    icon: "🧴",
    time: "Há 2h",
  },
  {
    code: "7891234567890",
    name: "Lata de Alumínio",
    pts: 40,
    icon: "🥫",
    time: "Há 5h",
  },
  {
    code: "7896666000014",
    name: "Caixa de Papelão",
    pts: 20,
    icon: "📦",
    time: "Ontem",
  },
];

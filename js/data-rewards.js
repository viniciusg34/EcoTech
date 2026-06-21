"use strict";

/* ══════════════════════════════
   CATÁLOGO DE RECOMPENSAS
══════════════════════════════ */
const rewardsCatalog = [
  {
    cat: "food",
    icon: "🍔",
    name: "Cupom McDonald's",
    desc: "20% OFF em combos",
    cost: 200,
  },
  {
    cat: "food",
    icon: "☕",
    name: "Café Grátis",
    desc: "Starbucks ou cafeteria parceira",
    cost: 80,
  },
  {
    cat: "transport",
    icon: "🎫",
    name: "Passe Metrô Rio",
    desc: "1 viagem gratuita",
    cost: 150,
  },
  {
    cat: "food",
    icon: "🥤",
    name: "Eco Garrafa",
    desc: "Starbucks ou cafeteria parceira",
    cost: 120,
  },
  {
    cat: "health",
    icon: "🌱",
    name: "Kit Sementes",
    desc: "Sementes de Árvores Nativas",
    cost: 100,
  },
  {
    cat: "shop",
    icon: "🛍️",
    name: "bolsa Ecotech",
    desc: "Sacola Sustentável da Ecotech",
    cost: 180,
  },
  {
    cat: "transport",
    icon: "🚲",
    name: "Bike Itaú 1h",
    desc: "1 hora de uso grátis",
    cost: 90,
  },
  {
    cat: "shop",
    icon: "🛍️",
    name: "Vale Compras R$30",
    desc: "Lojas parceiras EcoTech",
    cost: 300,
  },
  {
    cat: "shop",
    icon: "👕",
    name: "Camiseta Sustentável",
    desc: "Algodão orgânico reciclado",
    cost: 220,
  },
  {
    cat: "health",
    icon: "💊",
    name: "Desconto Farmácia",
    desc: "15% OFF em medicamentos",
    cost: 120,
  },
  {
    cat: "leisure",
    icon: "🎭",
    name: "Ingresso de Cinema",
    desc: "Meia-entrada em qualquer sessão",
    cost: 250,
  },
];

/* ══════════════════════════════
   TIMELINE INICIAL DE PONTOS
   (estado mutável — populado pelo scanner/resgates em runtime)
══════════════════════════════ */
let timeline = [
  {
    type: "earn",
    icon: "📷",
    desc: "Garrafa PET escaneada",
    pts: "+30",
    time: "Hoje 14h22",
  },
  {
    type: "earn",
    icon: "📷",
    desc: "Lata de Alumínio escaneada",
    pts: "+40",
    time: "Hoje 09h15",
  },
  {
    type: "redeem",
    icon: "🎁",
    desc: "Cupom McDonald's usado",
    pts: "-200",
    time: "Ontem",
  },
  {
    type: "earn",
    icon: "📷",
    desc: "Caixa de Papelão",
    pts: "+20",
    time: "Ontem 11h00",
  },
  {
    type: "earn",
    icon: "🔋",
    desc: "Pilha AA descartada",
    pts: "+80",
    time: "Seg 16h30",
  },
  {
    type: "redeem",
    icon: "🎫",
    desc: "Metrô Rio - Passe usado",
    pts: "-150",
    time: "Sáb",
  },
  {
    type: "earn",
    icon: "💻",
    desc: "Celular antigo reciclado",
    pts: "+100",
    time: "Sex 10h00",
  },
];

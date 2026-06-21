"use strict";

/* ══════════════════════════════
   EMPRESAS PARCEIRAS (demo)
   Cada empresa "é dona" de um subconjunto dos
   Ecopontos cadastrados na rede EcoTech.
══════════════════════════════ */
const COMPANIES = [
  { id: "verde-rio", name: "Verde Rio Reciclagem", icon: "♻️" },
  { id: "costa-verde-amb", name: "Costa Verde Ambiental", icon: "🌊" },
  { id: "metro-eco", name: "Metropolitana EcoSoluções", icon: "🏙️" },
];

/* ══════════════════════════════
   ECOPONTOS POR EMPRESA
   Reaproveita os mesmos pontos/códigos do mapa
   em coleta.html, agora com status operacional
   e métricas simuladas de coleta.
══════════════════════════════ */
const COMPANY_POINTS = {
  "verde-rio": [
    {
      code: "ECO-05",
      name: "EcoCentro Metal",
      cats: ["metal", "madeira"],
      address: "Zona Central, Rio de Janeiro",
      status: "ativo",
      monthlyKg: 312,
      validations: 184,
      lastActivity: "Hoje, 09h40",
    },
    {
      code: "ECO-06",
      name: "Vidro Lapa",
      cats: ["vidro", "papel"],
      address: "Lapa, Rio de Janeiro",
      status: "ativo",
      monthlyKg: 198,
      validations: 121,
      lastActivity: "Hoje, 07h15",
    },
    {
      code: "ECO-07",
      name: "EcoPapel Botafogo",
      cats: ["papel", "madeira", "plastico"],
      address: "Botafogo, Zona Sul",
      status: "ativo",
      monthlyKg: 455,
      validations: 263,
      lastActivity: "Ontem, 18h22",
    },
    {
      code: "ECO-08",
      name: "TechRecicla Copacabana",
      cats: ["eletronicos", "metal"],
      address: "Copacabana, Zona Sul",
      status: "manutencao",
      monthlyKg: 87,
      validations: 42,
      lastActivity: "Há 4 dias",
    },
    {
      code: "ECO-11",
      name: "Méier Metais",
      cats: ["metal", "eletronicos"],
      address: "Méier, Zona Norte",
      status: "ativo",
      monthlyKg: 274,
      validations: 159,
      lastActivity: "Hoje, 11h02",
    },
  ],

  "costa-verde-amb": [
    {
      code: "ECO-01",
      name: "Centro Recicla Mangaratiba",
      cats: ["papel", "madeira"],
      address: "Centro, Mangaratiba",
      status: "ativo",
      monthlyKg: 142,
      validations: 76,
      lastActivity: "Hoje, 08h05",
    },
    {
      code: "ECO-02",
      name: "EcoPonto Vila Muriqui",
      cats: ["metal", "plastico"],
      address: "Vila Muriqui, Mangaratiba",
      status: "ativo",
      monthlyKg: 168,
      validations: 93,
      lastActivity: "Ontem, 16h48",
    },
    {
      code: "ECO-03",
      name: "Itacuruçá Plásticos",
      cats: ["plastico", "vidro"],
      address: "Itacuruçá, Mangaratiba",
      status: "inativo",
      monthlyKg: 0,
      validations: 0,
      lastActivity: "Há 22 dias",
    },
    {
      code: "ECO-04",
      name: "Jacareí Vidros",
      cats: ["vidro", "metal"],
      address: "Distrito de Jacareí, Mangaratiba",
      status: "ativo",
      monthlyKg: 121,
      validations: 58,
      lastActivity: "Hoje, 10h30",
    },
  ],

  "metro-eco": [
    {
      code: "ECO-14",
      name: "Barra PET Coleta",
      cats: ["plastico", "papel"],
      address: "Barra da Tijuca, Zona Oeste",
      status: "ativo",
      monthlyKg: 389,
      validations: 241,
      lastActivity: "Hoje, 13h12",
    },
    {
      code: "ECO-15",
      name: "Recreio Vidros",
      cats: ["vidro", "madeira"],
      address: "Recreio dos Bandeirantes",
      status: "ativo",
      monthlyKg: 156,
      validations: 88,
      lastActivity: "Ontem, 15h00",
    },
    {
      code: "ECO-16",
      name: "Bangu Eletrônicos",
      cats: ["eletronicos", "metal"],
      address: "Bangu, Zona Oeste",
      status: "manutencao",
      monthlyKg: 64,
      validations: 31,
      lastActivity: "Há 2 dias",
    },
    {
      code: "ECO-17",
      name: "Campo Grande Plast",
      cats: ["plastico", "vidro"],
      address: "Campo Grande, Zona Oeste",
      status: "ativo",
      monthlyKg: 233,
      validations: 140,
      lastActivity: "Hoje, 09h58",
    },
    {
      code: "ECO-18",
      name: "Jacarepaguá Papéis",
      cats: ["papel", "madeira", "metal"],
      address: "Jacarepaguá, Zona Oeste",
      status: "ativo",
      monthlyKg: 301,
      validations: 177,
      lastActivity: "Hoje, 12h20",
    },
    {
      code: "ECO-19",
      name: "Icaraí Metais (Niterói)",
      cats: ["metal", "vidro"],
      address: "Icaraí, Niterói",
      status: "ativo",
      monthlyKg: 209,
      validations: 112,
      lastActivity: "Ontem, 17h33",
    },
  ],
};

/* ══════════════════════════════
   SÉRIE MENSAL (últimos 6 meses)
   simplificada por empresa, em kg coletados.
══════════════════════════════ */
const COMPANY_MONTHLY_SERIES = {
  "verde-rio": [820, 901, 968, 1040, 1180, 1326],
  "costa-verde-amb": [310, 298, 355, 372, 401, 431],
  "metro-eco": [980, 1050, 1190, 1240, 1310, 1352],
};

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

function getCompanyById(id) {
  return COMPANIES.find((c) => c.id === id) || null;
}

function getCompanyPoints(id) {
  return COMPANY_POINTS[id] || [];
}

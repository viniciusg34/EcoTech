"use strict";

/* ══════════════════════════════
   CATEGORIAS DE MATERIAIS (mapa)
══════════════════════════════ */
const CATEGORIES = [
  { key: "metal", label: "Metal", color: "#f9a825" },
  { key: "papel", label: "Papel", color: "#66bb6a" },
  { key: "vidro", label: "Vidro", color: "#42a5f5" },
  { key: "plastico", label: "Plástico", color: "#ef5350" },
  { key: "eletronicos", label: "Eletrônicos", color: "#ab47bc" },
  { key: "madeira", label: "Madeira", color: "#8d6e63" },
];

const catByKey = (key) => CATEGORIES.find((c) => c.key === key);

/* ══════════════════════════════
   PONTOS DE COLETA
   Materiais mistos no Rio de Janeiro + Costa Verde
══════════════════════════════ */
const POINTS = [
  // Mangaratiba & Costa Verde
  {
    lat: -22.9597,
    lng: -44.0406,
    code: "ECO-01",
    name: "Centro Recicla Mangaratiba",
    cats: ["papel", "madeira"],
    desc: "Papelão, caixotes e restos de madeira",
  },
  {
    lat: -22.9245,
    lng: -43.9538,
    code: "ECO-02",
    name: "EcoPonto Vila Muriqui",
    cats: ["metal", "plastico"],
    desc: "Latinhas, ferragens e embalagens plásticas",
  },
  {
    lat: -22.9291,
    lng: -43.886,
    code: "ECO-03",
    name: "Itacuruçá Plásticos",
    cats: ["plastico", "vidro"],
    desc: "Garrafas PET, tampinhas e potes de vidro",
  },
  {
    lat: -23.0188,
    lng: -44.2081,
    code: "ECO-04",
    name: "Jacareí Vidros",
    cats: ["vidro", "metal"],
    desc: "Potes de vidro e sucata metálica",
  },

  // Zona Central
  {
    lat: -22.9068,
    lng: -43.1729,
    code: "ECO-05",
    name: "EcoCentro Metal",
    cats: ["metal", "madeira"],
    desc: "Sucata de metal e paletes de madeira",
  },
  {
    lat: -22.9122,
    lng: -43.1769,
    code: "ECO-06",
    name: "Vidro Lapa",
    cats: ["vidro", "papel"],
    desc: "Garrafas de vidro e papelão",
  },

  // Zona Sul
  {
    lat: -22.9519,
    lng: -43.2105,
    code: "ECO-07",
    name: "EcoPapel Botafogo",
    cats: ["papel", "madeira", "plastico"],
    desc: "Papel, móveis quebrados e embalagens plásticas",
  },
  {
    lat: -22.9711,
    lng: -43.1823,
    code: "ECO-08",
    name: "TechRecicla Copacabana",
    cats: ["eletronicos", "metal"],
    desc: "Eletrônicos, pilhas e sucata metálica",
  },
  {
    lat: -22.9836,
    lng: -43.2044,
    code: "ECO-09",
    name: "Ipanema Plásticos",
    cats: ["plastico", "vidro"],
    desc: "PET, sacolas e frascos de vidro",
  },

  // Zona Norte
  {
    lat: -22.9329,
    lng: -43.2372,
    code: "ECO-10",
    name: "Tijuca Sustentável",
    cats: ["papel", "madeira"],
    desc: "Jornais, caixas e restos de obra em madeira",
  },
  {
    lat: -22.9015,
    lng: -43.2801,
    code: "ECO-11",
    name: "Méier Metais",
    cats: ["metal", "eletronicos"],
    desc: "Latinhas, ferros e pequenos eletrônicos",
  },
  {
    lat: -22.876,
    lng: -43.3364,
    code: "ECO-12",
    name: "Madureira Vidros",
    cats: ["vidro", "plastico"],
    desc: "Cacos de vidro e plásticos diversos",
  },
  {
    lat: -22.8122,
    lng: -43.2144,
    code: "ECO-13",
    name: "Ilha Eco-Tech",
    cats: ["eletronicos", "metal", "plastico"],
    desc: "Eletroeletrônicos, metais e plásticos",
  },

  // Zona Oeste
  {
    lat: -23.0003,
    lng: -43.3658,
    code: "ECO-14",
    name: "Barra PET Coleta",
    cats: ["plastico", "papel"],
    desc: "Embalagens plásticas e papelão",
  },
  {
    lat: -23.0181,
    lng: -43.4682,
    code: "ECO-15",
    name: "Recreio Vidros",
    cats: ["vidro", "madeira"],
    desc: "Vidros, potes e madeira de móveis",
  },
  {
    lat: -22.8752,
    lng: -43.465,
    code: "ECO-16",
    name: "Bangu Eletrônicos",
    cats: ["eletronicos", "metal"],
    desc: "Cabos, pilhas, baterias e sucata",
  },
  {
    lat: -22.8986,
    lng: -43.5598,
    code: "ECO-17",
    name: "Campo Grande Plast",
    cats: ["plastico", "vidro"],
    desc: "Reciclagem de plásticos e vidros",
  },
  {
    lat: -22.9678,
    lng: -43.3888,
    code: "ECO-18",
    name: "Jacarepaguá Papéis",
    cats: ["papel", "madeira", "metal"],
    desc: "Papelão comercial, madeira e ferragens",
  },

  // Niterói e Baixada
  {
    lat: -22.9056,
    lng: -43.1065,
    code: "ECO-19",
    name: "Icaraí Metais (Niterói)",
    cats: ["metal", "vidro"],
    desc: "Alumínio, metais diversos e vidro",
  },
  {
    lat: -22.8269,
    lng: -43.0538,
    code: "ECO-20",
    name: "São Gonçalo Plásticos",
    cats: ["plastico", "papel"],
    desc: "PET e papelão",
  },
  {
    lat: -22.7562,
    lng: -43.4607,
    code: "ECO-21",
    name: "Nova Iguaçu Vidros",
    cats: ["vidro", "metal", "madeira"],
    desc: "Potes de vidro, sucata e madeira",
  },
  {
    lat: -22.7856,
    lng: -43.3117,
    code: "ECO-22",
    name: "Duque de Caxias Papel",
    cats: ["papel", "plastico"],
    desc: "Cooperativa de papelão e plásticos",
  },
];

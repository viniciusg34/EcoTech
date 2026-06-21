"use strict";

/* ══════════════════════════════
   MAPA — depende de: CATEGORIES, POINTS, catByKey
   (data-map-points.js) e showToast (ui-toast.js)
══════════════════════════════ */
function initMap() {
  const htmlEl = document.documentElement;

  // Centralizado para englobar Mangaratiba e Rio de Janeiro
  const map = L.map("eco-map").setView([-22.9, -43.6], 9);

  const TILE_LIGHT = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    { attribution: "© OpenStreetMap" },
  );
  const TILE_DARK = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    { attribution: "© OpenStreetMap" },
  );

  function updateMapTile() {
    if (htmlEl.getAttribute("data-theme") === "dark") {
      map.removeLayer(TILE_LIGHT);
      TILE_DARK.addTo(map);
    } else {
      map.removeLayer(TILE_DARK);
      TILE_LIGHT.addTo(map);
    }
  }
  updateMapTile();

  new MutationObserver(updateMapTile).observe(htmlEl, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  /* ── ÍCONE MULTI-MATERIAL ── */
  function buildIcon(cats) {
    const colors = cats.map((k) => catByKey(k).color);
    let bg;
    if (colors.length === 1) {
      bg = colors[0];
    } else {
      const step = 100 / colors.length;
      bg = `conic-gradient(${colors
        .map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`)
        .join(", ")})`;
    }
    return L.divIcon({
      html: `<div class="eco-marker" style="background:${bg};">${
        cats.length > 1 ? cats.length : catByKey(cats[0]).label[0]
      }</div>`,
      iconSize: [30, 30],
      className: "",
    });
  }

  /* ── MARCADORES (cada ponto pode ter vários materiais) ── */
  const markerRefs = [];

  POINTS.forEach((p) => {
    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
    const catBadges = p.cats
      .map((k) => {
        const c = catByKey(k);
        return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--ink-2);margin:0 8px 4px 0;"><span style="width:8px;height:8px;border-radius:50%;background:${c.color};display:inline-block;"></span>${c.label}</span>`;
      })
      .join("");
    const accentColor = catByKey(p.cats[0]).color;

    const popupContent = `
      <div style="min-width:200px; font-family:'Plus Jakarta Sans', sans-serif;">
        <p style="margin:0 0 2px; font-size:14px; font-weight:700; color:var(--ink);">${p.name}</p>
        <p style="margin:0 0 8px; font-size:11px; letter-spacing:0.5px; color:var(--ink-3);">CÓDIGO: ${p.code}</p>
        <p style="margin:0 0 8px; font-size:12px; color:var(--ink-3);">${p.desc}</p>
        <div style="margin-bottom:12px;">${catBadges}</div>
        <a
          href="${gmapsUrl}"
          target="_blank"
          rel="noopener"
          style="
            display:inline-flex;
            align-items:center;
            gap:6px;
            background:${accentColor};
            color:white;
            padding:7px 14px;
            border-radius:20px;
            text-decoration:none;
            font-size:12px;
            font-weight:600;
            transition: transform 0.2s;
          "
          onmouseover="this.style.transform='translateY(-2px)'"
          onmouseout="this.style.transform='translateY(0)'"
        >🗺️ Abrir Rota</a>
      </div>
    `;

    const marker = L.marker([p.lat, p.lng], {
      icon: buildIcon(p.cats),
    }).bindPopup(popupContent, { maxWidth: 260 });
    marker.addTo(map);
    markerRefs.push({ marker, point: p });
  });

  /* ── LEGENDA / FILTRO ── */
  const legendEl = document.getElementById("map-legend");
  let visibleCats = new Set(CATEGORIES.map((c) => c.key));

  function updateMarkerVisibility() {
    markerRefs.forEach(({ marker, point }) => {
      const visible = point.cats.some((k) => visibleCats.has(k));
      const onMap = map.hasLayer(marker);
      if (visible && !onMap) marker.addTo(map);
      if (!visible && onMap) map.removeLayer(marker);
    });
  }

  function goToPoint(point) {
    const ref = markerRefs.find((r) => r.point === point);
    if (!ref) return;
    map.flyTo([point.lat, point.lng], 15, { duration: 1.1 });
    if (!map.hasLayer(ref.marker)) ref.marker.addTo(map);
    setTimeout(() => ref.marker.openPopup(), 1100);
  }

  if (legendEl) {
    legendEl.innerHTML =
      "<strong style='font-family: Lora, serif; font-size: 1rem;'>🗑️ Filtro</strong><br>";

    CATEGORIES.forEach((cat) => {
      const item = document.createElement("div");
      item.style.cssText =
        "display:flex; align-items:center; gap:8px; margin-top:8px; cursor:pointer; font-size: 0.9rem; font-weight: 500; color: var(--ink-2); transition: opacity 0.2s;";
      item.innerHTML = `
        <span style="background:${cat.color}; width:14px; height:14px; border-radius:50%; display:inline-block;"></span>
        ${cat.label}
      `;
      item.onclick = () => {
        if (visibleCats.has(cat.key)) {
          visibleCats.delete(cat.key);
          item.style.opacity = "0.4";
        } else {
          visibleCats.add(cat.key);
          item.style.opacity = "1";
        }
        updateMarkerVisibility();
      };
      legendEl.appendChild(item);
    });
  }

  /* ── BALÃO DE DISTÂNCIA ── */
  const balloonEl = document.getElementById("distance-balloon");
  let userMarker = null;

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function renderBalloon(html) {
    if (balloonEl) balloonEl.innerHTML = html;
  }

  function locateUser() {
    if (!balloonEl) return;
    if (!navigator.geolocation) {
      renderBalloon(`<span>📍 Geolocalização não suportada</span>`);
      return;
    }
    renderBalloon(`<span>📡 Localizando você...</span>`);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let nearest = null;
        let nearestDist = Infinity;
        POINTS.forEach((p) => {
          const d = haversineKm(latitude, longitude, p.lat, p.lng);
          if (d < nearestDist) {
            nearestDist = d;
            nearest = p;
          }
        });

        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.marker([latitude, longitude], {
          icon: L.divIcon({
            html: `<div style="background:#2962ff;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(41,98,255,0.25);"></div>`,
            iconSize: [16, 16],
            className: "",
          }),
        })
          .addTo(map)
          .bindPopup("Você está aqui");

        renderBalloon(`
          <div class="balloon-text">
            <strong>${nearestDist.toFixed(1)} km</strong>
            <span>até ${nearest.name}</span>
          </div>
          <button class="balloon-refresh" id="refreshLocation" aria-label="Atualizar localização">🔄</button>
        `);
        document
          .getElementById("refreshLocation")
          .addEventListener("click", locateUser);
      },
      () => {
        renderBalloon(`
          <div class="balloon-text">
            <span>📍 Ative a localização para ver a distância</span>
          </div>
          <button class="balloon-refresh is-text" id="retryLocation">Tentar de novo</button>
        `);
        document
          .getElementById("retryLocation")
          .addEventListener("click", locateUser);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }
  locateUser();

  /* ── BUSCA POR CÓDIGO ── */
  function findPointByCode(code) {
    const norm = code.trim().toUpperCase();
    return POINTS.find((p) => p.code.toUpperCase() === norm);
  }

  const codeInput = document.getElementById("pointCodeInput");
  const searchCodeBtn = document.getElementById("searchCodeBtn");

  function runCodeSearch() {
    if (!codeInput) return;
    const p = findPointByCode(codeInput.value);
    if (p) {
      goToPoint(p);
      showToast(`📍 Ponto encontrado: ${p.name} (${p.code})`);
    } else {
      showToast("❌ Código não encontrado. Verifique e tente novamente.");
    }
  }

  if (searchCodeBtn && codeInput) {
    searchCodeBtn.addEventListener("click", runCodeSearch);
    codeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runCodeSearch();
    });
  }

  /* ── ESCANEAMENTO DE CÓDIGO (QR do Ecoponto) ── */
  const scanModal = document.getElementById("scanModal");
  const scanVideo = document.getElementById("scanVideo");
  const scanStatus = document.getElementById("scanStatus");
  const scanCodeBtn = document.getElementById("scanCodeBtn");
  const closeScanModalBtn = document.getElementById("closeScanModal");
  const supportsBarcodeDetector = "BarcodeDetector" in window;
  let scanStream = null;
  let scanLoopId = null;

  if (!supportsBarcodeDetector && scanCodeBtn) {
    scanCodeBtn.title =
      "Leitura automática não suportada neste navegador — digite o código manualmente";
  }

  function closeScanModal() {
    if (!scanModal) return;
    scanModal.hidden = true;
    if (scanLoopId) cancelAnimationFrame(scanLoopId);
    scanLoopId = null;
    if (scanStream) {
      scanStream.getTracks().forEach((t) => t.stop());
      scanStream = null;
    }
  }

  async function openScanModal() {
    if (!scanModal) return;
    scanModal.hidden = false;
    if (!supportsBarcodeDetector) {
      if (scanStatus)
        scanStatus.textContent =
          "Seu navegador não suporta leitura automática. Digite o código no campo de busca.";
      return;
    }
    if (scanStatus)
      scanStatus.textContent = "Aponte a câmera para o QR code do Ecoponto";
    try {
      scanStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (scanVideo) {
        scanVideo.srcObject = scanStream;
        await scanVideo.play();
      }
      const detector = new BarcodeDetector({ formats: ["qr_code"] });

      const loop = async () => {
        if (!scanStream) return;
        try {
          if (scanVideo) {
            const codes = await detector.detect(scanVideo);
            if (codes.length > 0) {
              const value = codes[0].rawValue;
              const p = findPointByCode(value);
              closeScanModal();
              if (p) {
                goToPoint(p);
                showToast(`📍 Ponto encontrado: ${p.name} (${p.code})`);
              } else {
                showToast("❌ Código lido não corresponde a nenhum ponto.");
              }
              return;
            }
          }
        } catch (err) {
          /* ignora erros de detecção por quadro */
        }
        scanLoopId = requestAnimationFrame(loop);
      };
      scanLoopId = requestAnimationFrame(loop);
    } catch (err) {
      if (scanStatus)
        scanStatus.textContent =
          "Não foi possível acessar a câmera. Digite o código manualmente.";
    }
  }

  if (scanCodeBtn) scanCodeBtn.addEventListener("click", openScanModal);
  if (closeScanModalBtn)
    closeScanModalBtn.addEventListener("click", closeScanModal);
  if (scanModal) {
    scanModal.addEventListener("click", (e) => {
      if (e.target === scanModal) closeScanModal();
    });
  }
}

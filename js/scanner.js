"use strict";

/* ══════════════════════════════
   SCANNER DE PRODUTOS
   depende de: productDB, scanHistory (data-scan-products.js),
   timeline (data-rewards.js), showToast (ui-toast.js)
══════════════════════════════ */

let scannerStream = null;

async function startScanner() {
  try {
    scannerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    const video = document.getElementById("video");
    video.srcObject = scannerStream;
    document.getElementById("video-container").style.display = "block";
    document.getElementById("scanner-placeholder").style.display = "none";
    document.getElementById("btn-start").style.display = "none";
    document.getElementById("btn-stop").style.display = "flex";
    if (window.ZXing) {
      const formats = [
        window.ZXing.BarcodeFormat.EAN_13,
        window.ZXing.BarcodeFormat.QR_CODE,
        window.ZXing.BarcodeFormat.CODE_128,
      ];
      const hints = new Map();
      hints.set(window.ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
      const reader = new window.ZXing.BrowserMultiFormatReader(hints);
      reader.decodeFromVideoDevice(null, "video", function (result) {
        if (result) {
          validateCode(result.getText());
          stopScanner();
        }
      });
    }
  } catch (e) {
    showToast("❌ Câmera não disponível. Use o campo manual.");
  }
}

function stopScanner() {
  if (scannerStream) scannerStream.getTracks().forEach((t) => t.stop());
  document.getElementById("video-container").style.display = "none";
  document.getElementById("scanner-placeholder").style.display = "block";
  document.getElementById("btn-start").style.display = "flex";
  document.getElementById("btn-stop").style.display = "none";
}

function validateCode(code) {
  if (!code || code.length < 8) {
    showToast("❌ Código inválido");
    return;
  }
  const product = productDB[code] || {
    name: "Embalagem Reciclável",
    pts: 30,
    icon: "♻️",
    mat: "Reciclável",
  };
  const result = document.getElementById("scan-result");
  document.getElementById("result-icon").textContent = product.icon;
  document.getElementById("result-title").textContent =
    product.name + " — Validado!";
  document.getElementById("result-points").textContent =
    "🪙 +" + product.pts + " EcoCoins ganhos!";
  document.getElementById("result-desc").textContent =
    "Material: " +
    product.mat +
    ". Descarte no ponto de coleta EcoTech mais próximo para confirmar e receber seus pontos.";
  result.classList.add("show");

  scanHistory.unshift({
    code,
    name: product.name,
    pts: product.pts,
    icon: product.icon,
    time: "Agora",
  });
  timeline.unshift({
    type: "earn",
    icon: "📷",
    desc: product.name + " escaneado",
    pts: "+" + product.pts,
    time: "Agora",
  });
  renderScanHistory();
  renderTimeline();
  document.getElementById("manual-code").value = "";
  stopScanner();
}

function clearScan() {
  document.getElementById("scan-result").classList.remove("show");
}

function renderScanHistory() {
  const el = document.getElementById("scan-history");
  if (!el) return;
  el.innerHTML = scanHistory
    .slice(0, 5)
    .map(
      (h) => `
    <div class="history-item">
      <div class="history-icon">${h.icon}</div>
      <div class="history-info"><strong>${h.name}</strong><small>${h.code} • ${h.time}</small></div>
      <div class="history-pts">+${h.pts}🪙</div>
    </div>`,
    )
    .join("");
}
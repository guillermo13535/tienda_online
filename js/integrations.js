/* =========================================================
   TecnoShop - Módulo de integraciones con servicios externos
   Todas las APIs son gratuitas y funcionan desde el navegador.
   - Georreferenciación: Geolocation API + Nominatim (OpenStreetMap)
   - Clima: Open-Meteo
   - Datos públicos: mindicador.cl (Banco Central de Chile)
   - Webhooks: POST a endpoint externo
   - SOAP: DataAccess NumberConversion
   ========================================================= */

window.Integrations = (function () {
  "use strict";

  /* ---------- 1. GEORREFERENCIACIÓN ---------- */
  // Geolocation API del navegador
  function getPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("Tu navegador no soporta geolocalización"));
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy }),
        (err) => reject(new Error(err.message || "No se pudo obtener la ubicación")),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  // Geocodificación inversa (coordenadas -> dirección) vía Nominatim REST
  async function reverseGeocode(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=es`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("Error al consultar Nominatim");
    return res.json();
  }

  /* ---------- 2. CLIMA (Open-Meteo REST) ---------- */
  const WMO = {
    0: ["Despejado", "☀️"], 1: ["Mayormente despejado", "🌤️"], 2: ["Parcialmente nublado", "⛅"],
    3: ["Nublado", "☁️"], 45: ["Niebla", "🌫️"], 48: ["Niebla con escarcha", "🌫️"],
    51: ["Llovizna ligera", "🌦️"], 53: ["Llovizna", "🌦️"], 55: ["Llovizna intensa", "🌧️"],
    61: ["Lluvia ligera", "🌧️"], 63: ["Lluvia", "🌧️"], 65: ["Lluvia fuerte", "🌧️"],
    71: ["Nieve ligera", "🌨️"], 73: ["Nieve", "🌨️"], 75: ["Nieve intensa", "❄️"],
    80: ["Chubascos", "🌦️"], 81: ["Chubascos fuertes", "🌧️"], 82: ["Chubascos violentos", "⛈️"],
    95: ["Tormenta eléctrica", "⛈️"], 96: ["Tormenta con granizo", "⛈️"], 99: ["Tormenta fuerte", "⛈️"]
  };
  function weatherText(code) { return WMO[code] || ["Desconocido", "🌡️"]; }

  async function getWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
                `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al consultar Open-Meteo");
    return res.json();
  }

  /* ---------- 3. DATOS PÚBLICOS (mindicador.cl REST) ---------- */
  // Indicadores económicos oficiales del Banco Central de Chile
  async function getIndicators() {
    const res = await fetch("https://mindicador.cl/api");
    if (!res.ok) throw new Error("Error al consultar mindicador.cl");
    return res.json();
  }

  /* ---------- 4. WEBHOOK (POST a endpoint externo) ---------- */
  async function sendWebhook(url, payload) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    let data;
    try { data = await res.json(); } catch { data = await res.text(); }
    return { status: res.status, ok: res.ok, data };
  }

  /* ---------- 5. SOAP (DataAccess NumberConversion) ---------- */
  // Demuestra el consumo de un servicio SOAP construyendo el sobre XML
  function buildSoapEnvelope(num) {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <NumberToWords xmlns="http://www.dataaccess.com/webservicesserver/">
      <ubiNum>${num}</ubiNum>
    </NumberToWords>
  </soap:Body>
</soap:Envelope>`;
  }

  async function soapNumberToWords(num) {
    const envelope = buildSoapEnvelope(num);
    const res = await fetch("https://www.dataaccess.com/webservicesserver/NumberConversion.wso", {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=utf-8" },
      body: envelope
    });
    const xml = await res.text();
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    const result = doc.getElementsByTagName("m:NumberToWordsResult")[0]
      || doc.getElementsByTagName("NumberToWordsResult")[0];
    return { envelope, raw: xml, words: result ? result.textContent.trim() : "(sin resultado)" };
  }

  /* ---------- 6. ENVÍO DE CORREO (EmailJS, sin backend) ---------- */
  // Para activar el envío real: crea una cuenta gratis en https://www.emailjs.com,
  // crea un "Email Service" y un "Email Template", y pega aquí tus claves.
  const EMAILJS_CONFIG = {
    publicKey: "TU_PUBLIC_KEY",   // <-- reemplazar
    serviceId: "TU_SERVICE_ID",   // <-- reemplazar
    templateId: "TU_TEMPLATE_ID"  // <-- reemplazar
  };
  function emailConfigured() {
    return EMAILJS_CONFIG.publicKey && !EMAILJS_CONFIG.publicKey.startsWith("TU_");
  }
  async function sendBoletaEmail(params) {
    if (!window.emailjs) throw new Error("El SDK de EmailJS no está cargado");
    if (!emailConfigured()) throw new Error("EmailJS no configurado");
    emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
    return emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, params);
  }

  return {
    getPosition, reverseGeocode,
    getWeather, weatherText,
    getIndicators,
    sendWebhook,
    buildSoapEnvelope, soapNumberToWords,
    emailConfigured, sendBoletaEmail
  };
})();

/* =========================================================
   TecnoShop - Iniciar sesión con Google (Google Identity Services)
   ---------------------------------------------------------
   CÓMO ACTIVARLO (gratis):
   1. Entra a https://console.cloud.google.com/ y crea un proyecto.
   2. "APIs y servicios" → "Credenciales" → "Crear credenciales" →
      "ID de cliente de OAuth" → tipo "Aplicación web".
   3. En "Orígenes autorizados de JavaScript" agrega tus dominios, por ej.:
        https://guillermo13535.github.io
        http://localhost:5500   (si pruebas en local)
   4. Copia el "Client ID" y pégalo abajo en GOOGLE_CLIENT_ID.
   ========================================================= */

(function () {
  "use strict";

  const GOOGLE_CLIENT_ID = "TU_CLIENT_ID.apps.googleusercontent.com"; // <-- reemplazar

  function configured() {
    return GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith("TU_");
  }

  // Decodifica el payload del JWT que devuelve Google
  function decodeJwt(token) {
    try {
      const base = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
      );
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  function handleCredential(response) {
    const data = decodeJwt(response.credential);
    if (!data || !data.email) {
      window.Store.showToast("No se pudo leer la cuenta de Google");
      return;
    }
    const user = window.Store.Auth.loginWithProfile({
      nombre: data.given_name || data.name || "Usuario",
      apellido: data.family_name || "",
      email: data.email
    });
    localStorage.setItem("tecnoshop_welcome", user.nombre);
    window.location.href = user.role === "admin" ? "admin.html" : "index.html";
  }

  function init() {
    const box = document.getElementById("googleBtn");
    if (!box) return;

    if (!configured()) {
      box.innerHTML = '<p class="muted" style="font-size:.8rem; text-align:center">Para activar “Iniciar con Google”, agrega tu Client ID en <code>js/google-auth.js</code></p>';
      return;
    }
    if (!(window.google && google.accounts && google.accounts.id)) {
      setTimeout(init, 300); // esperar a que cargue el SDK de Google
      return;
    }
    google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredential });
    google.accounts.id.renderButton(box, {
      theme: "filled_black", size: "large", width: 340,
      text: "continue_with", shape: "pill", logo_alignment: "center"
    });
  }

  window.addEventListener("load", init);
})();

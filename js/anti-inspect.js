// anti-inspect.js
// Lightweight deterrent — NOT foolproof. Use responsibly and consider accessibility.

(function () {
  // Config
  const WARN_ON_DETECT = true; // show overlay when devtools are detected
  const REDIRECT_ON_DETECT = false; // if true, page will redirect to homepage when detected
  const REDIRECT_URL = "/"; // modify if you want redirect

  /* ---------------------------
     1) Block common keyboard shortcuts
     --------------------------- */
  window.addEventListener("keydown", function (e) {
    // F12
    if (e.key === "F12") {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (inspect devtools)
    if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C" || e.key === "i" || e.key === "j" || e.key === "c")) {
      e.preventDefault();
      return false;
    }
    // Ctrl+U (view-source)
    if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
      e.preventDefault();
      return false;
    }
    // Ctrl+S / Ctrl+P (optional — do not block printing or saving usually)
    // Add other blocks carefully if needed.
  });

  /* ---------------------------
     2) Disable right-click context menu
     --------------------------- */
  document.addEventListener("contextmenu", function (e) {
    // Allow on inputs and textareas for accessibility
    const tag = e.target.tagName && e.target.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    e.preventDefault();
    // Optional small UX feedback:
    // showTemporaryToast("Right-click is disabled on this site.");
  });

  /* ---------------------------
     3) DevTools detection (heuristic)
     - checks differences between outer and inner window size
     - watches for debugger statement performance/timing
     --------------------------- */
  let devtoolsOpen = false;

  function checkDevToolsBySize() {
    const threshold = 160; // px — adjust if too sensitive
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if (widthDiff > threshold || heightDiff > threshold) {
      return true;
    }
    return false;
  }

  // Another heuristic: try to use toString hack with a getter
  // (works in some browsers / environments)
  function checkDevToolsByDebugger() {
    let detected = false;
    const start = performance.now();
    // eslint-disable-next-line no-constant-condition
    (function () {
      const obj = {};
      Object.defineProperty(obj, "devtools", {
        get() {
          detected = true;
        }
      });
      // Console logging the object - some DevTools will access getters
      // which triggers 'detected'
      // We do it quietly in a try/catch
      try {
        // eslint-disable-next-line no-console
        console.log(obj);
        console.clear && console.clear();
      } catch (e) {
        // ignore
      }
    })();
    const elapsed = performance.now() - start;
    // If the call took unusually long, DevTools/pausing might be happening
    if (elapsed > 100) detected = true;
    return detected;
  }

  function detectDevTools() {
    const bySize = checkDevToolsBySize();
    const byDebugger = checkDevToolsByDebugger();
    return bySize || byDebugger;
  }

  // Run detection at intervals
  setInterval(() => {
    const detected = detectDevTools();
    if (detected && !devtoolsOpen) {
      devtoolsOpen = true;
      onDevToolsOpen();
    } else if (!detected && devtoolsOpen) {
      devtoolsOpen = false;
      onDevToolsClose();
    }
  }, 1000);

  /* ---------------------------
     4) Response to detection
     --------------------------- */
  function onDevToolsOpen() {
    if (WARN_ON_DETECT) showDevtoolsOverlay();
    if (REDIRECT_ON_DETECT) {
      try {
        window.location.href = REDIRECT_URL;
      } catch (e) { /* ignore */ }
    }
    // Optionally: log event to server for auditing (not included)
  }

  function onDevToolsClose() {
    hideDevtoolsOverlay();
  }

  /* ---------------------------
     5) Small overlay to warn users (accessible fallback)
     --------------------------- */
  let overlayEl = null;
  function showDevtoolsOverlay() {
    if (overlayEl) return;
    overlayEl = document.createElement("div");
    overlayEl.setAttribute("aria-hidden", "false");
    overlayEl.style.position = "fixed";
    overlayEl.style.inset = "0";
    overlayEl.style.background = "rgba(0,0,0,0.6)";
    overlayEl.style.display = "flex";
    overlayEl.style.alignItems = "center";
    overlayEl.style.justifyContent = "center";
    overlayEl.style.zIndex = "999999";
    overlayEl.innerHTML = `
      <div role="dialog" aria-modal="true" style="
        max-width: 520px;
        background: white;
        color: #111;
        border-radius: 12px;
        padding: 24px;
        text-align:center;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
      ">
        <h2 style="margin:0 0 8px; font-size:1.25rem;">Inspection detected</h2>
        <p style="margin:0 0 16px; color:#374151;">
          We detected that developer tools or page inspection is open. Accessing or modifying
          the client-side code can break the application and void the usage policy.
        </p>
        <div style="display:flex;gap:8px;justify-content:center">
          <button id="devtools-close-btn" style="
            padding:8px 12px;
            background:#2563eb;
            color:white;
            border:none;
            border-radius:8px;
            cursor:pointer;
            font-weight:600;
          ">Close devtools</button>
          <button id="devtools-continue-btn" style="
            padding:8px 12px;
            background:#f3f4f6;
            border:1px solid #d1d5db;
            border-radius:8px;
            cursor:pointer;
          ">Continue anyway</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlayEl);
    const closeBtn = document.getElementById("devtools-close-btn");
    const contBtn = document.getElementById("devtools-continue-btn");
    closeBtn.addEventListener("click", () => {
      hideDevtoolsOverlay();
      try { window.focus(); } catch (e) {}
    });
    contBtn.addEventListener("click", () => {
      hideDevtoolsOverlay();
    });
  }

  function hideDevtoolsOverlay() {
    if (!overlayEl) return;
    overlayEl.remove();
    overlayEl = null;
  }

  /* ---------------------------
     6) Optional helper: temporary toast message
     --------------------------- */
  function showTemporaryToast(msg, ms = 2200) {
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "rgba(0,0,0,0.75)";
    toast.style.color = "white";
    toast.style.padding = "8px 12px";
    toast.style.borderRadius = "8px";
    toast.style.zIndex = 999999;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), ms);
  }

  /* ---------------------------
     7) Accessibility & developer note
     ---------------------------
     - Blocking right-click and shortcuts may reduce accessibility and frustrate power-users.
     - This code is only a deterrent for casual users. Do NOT rely on it for protecting secrets.
     --------------------------- */
})();

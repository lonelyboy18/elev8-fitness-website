/* =====================================================================
   ASCEND — 404 error page  (standalone)
   script.js  (vanilla, zero dependencies)
   ---------------------------------------------------------------------
   1. utils          — helpers + reduced-motion flag
   2. particleField  — ambient floating particles
   3. error404       — beat-by-beat muscle-up failure timeline
   4. parallax       — pointer / tilt depth motion
   5. magneticButton — CTA leans toward the cursor
   6. init           — wiring
   ===================================================================== */
(function () {
  "use strict";

  /* ---- 1. utils ---------------------------------------------------- */
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp  = function (a, b, t) { return a + (b - a) * t; };
  var rand  = function (a, b) { return a + Math.random() * (b - a); };

  /* ---- 2. particle field ------------------------------------------ */
  function buildParticles(container, count) {
    if (!container) return;
    container.innerHTML = "";
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      p.className = "particle";
      p.style.setProperty("--p-size", rand(1.5, 3.5).toFixed(1) + "px");
      p.style.left = rand(2, 98).toFixed(2) + "%";
      p.style.top  = rand(4, 96).toFixed(2) + "%";
      p.style.setProperty("--p-opacity", rand(0.18, 0.5).toFixed(2));
      p.style.setProperty("--p-color", Math.random() > 0.4 ? "var(--particle-color)" : "var(--particle-color-alt)");
      p.style.setProperty("--p-dx", rand(-22, 22).toFixed(0) + "px");
      p.style.setProperty("--p-dy", rand(-30, -8).toFixed(0) + "px");
      p.style.setProperty("--p-dur", rand(7, 14).toFixed(1) + "s");
      p.style.setProperty("--p-delay", rand(0, 6).toFixed(1) + "s");
      frag.appendChild(p);
    }
    container.appendChild(frag);
  }

  /* ---- 3. error 404 timeline -------------------------------------- */
  var error404 = (function () {
    var sceneEl = $("#scene404");
    var timers  = [];

    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function at(ms, fn)    { timers.push(window.setTimeout(fn, ms)); }

    function reset() {
      clearTimers();
      sceneEl.classList.remove("bar-gone", "glitching", "revealed", "idle");
      sceneEl.removeAttribute("data-stage");
      $$(".burst-piece", sceneEl).forEach(function (b) { b.remove(); });
      void sceneEl.offsetWidth; /* reflow restarts transitions */
    }

    function spawnBurst() {
      var n = 16;
      for (var i = 0; i < n; i++) {
        var piece = document.createElement("span");
        piece.className = "burst-piece";
        var ang  = (i / n) * Math.PI * 2 + rand(-0.2, 0.2);
        var dist = rand(40, 95);
        piece.style.setProperty("--bx", (Math.cos(ang) * dist).toFixed(0) + "px");
        piece.style.setProperty("--by", (Math.sin(ang) * dist - 10).toFixed(0) + "px");
        sceneEl.appendChild(piece);
        (function (el) { window.setTimeout(function () { el.remove(); }, 760); })(piece);
      }
    }

    function play() {
      reset();
      if (prefersReducedMotion) {
        sceneEl.setAttribute("data-stage", "settle");
        sceneEl.classList.add("bar-gone", "revealed");
        return;
      }
      at(60,   function () { sceneEl.setAttribute("data-stage", "grab"); });      /* jump & grab     */
      at(820,  function () { sceneEl.setAttribute("data-stage", "pull"); });      /* powerful pull   */
      at(1620, function () { sceneEl.classList.add("bar-gone", "glitching"); spawnBurst(); }); /* bar vanishes */
      at(2140, function () { sceneEl.classList.remove("glitching"); });
      at(1980, function () { sceneEl.setAttribute("data-stage", "confused"); });  /* confused float  */
      at(2900, function () { sceneEl.setAttribute("data-stage", "settle"); sceneEl.classList.add("revealed"); });
      at(3820, function () { sceneEl.classList.add("idle"); });                   /* ambient dangle  */
    }

    return { play: play, reset: reset };
  })();

  /* ---- 4. parallax ------------------------------------------------ */
  var parallax = (function () {
    var hostEl = $("#screen-404");
    var MAX = 18, tx = 0, ty = 0, cx = 0, cy = 0, rafId = null;

    function onPointer(e) {
      var nx = (e.clientX / window.innerWidth) * 2 - 1;
      var ny = (e.clientY / window.innerHeight) * 2 - 1;
      tx = -nx * MAX; ty = -ny * MAX;
    }
    function onTilt(e) {
      if (e.gamma == null) return;
      tx = clamp(-e.gamma / 45, -1, 1) * MAX;
      ty = clamp(-(e.beta - 45) / 45, -1, 1) * MAX;
    }
    function loop() {
      cx = lerp(cx, tx, 0.08); cy = lerp(cy, ty, 0.08);
      hostEl.style.setProperty("--px", cx.toFixed(2) + "px");
      hostEl.style.setProperty("--py", cy.toFixed(2) + "px");
      rafId = requestAnimationFrame(loop);
    }
    function enable() {
      if (prefersReducedMotion) return;
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("deviceorientation", onTilt, { passive: true });
      rafId = requestAnimationFrame(loop);
    }
    return { enable: enable };
  })();

  /* ---- 5. magnetic button ----------------------------------------- */
  function initMagnetic(btn) {
    if (!btn || prefersReducedMotion) return;
    var RADIUS = 120, PULL = 0.35;
    var tx = 0, ty = 0, cx = 0, cy = 0, running = false;

    function loop() {
      cx = lerp(cx, tx, 0.18); cy = lerp(cy, ty, 0.18);
      btn.style.setProperty("--mx", cx.toFixed(2) + "px");
      btn.style.setProperty("--my", cy.toFixed(2) + "px");
      if (Math.abs(cx - tx) < 0.1 && Math.abs(cy - ty) < 0.1 && tx === 0 && ty === 0) { running = false; return; }
      requestAnimationFrame(loop);
    }
    function ensure() { if (!running) { running = true; requestAnimationFrame(loop); } }

    window.addEventListener("pointermove", function (e) {
      var r = btn.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < RADIUS) { tx = dx * PULL; ty = dy * PULL; }
      else { tx = 0; ty = 0; }
      ensure();
    }, { passive: true });

    btn.addEventListener("pointerleave", function () { tx = 0; ty = 0; ensure(); });
  }

  /* ---- 6. init ---------------------------------------------------- */
  function init() {
    buildParticles($("#error-particles"), 30);
    initMagnetic($("#btnReturnHome"));
    error404.play();
    parallax.enable();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* Replay the sequence on demand: Ascend404.replay() */
  window.Ascend404 = { replay: error404.play };
})();

/* =====================================================================
   ELEV8 — Page loader overlay
   loader.js  (vanilla, zero dependencies)
   ---------------------------------------------------------------------
   1. utils          — helpers + reduced-motion flag
   2. particleField  — ambient floating particles
   3. loader         — rAF progress ring, pose/message/tracker, reveal
   4. init           — sessionStorage gate + public API

   PUBLIC API
     AscendLoader.set(0..1)  drive the ring from real asset progress
     AscendLoader.run()      replay the loader overlay
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
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

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

  /* ---- 3. loader -------------------------------------------------- */
  var loader = (function () {
    var RING_C = 615.752, CENTER = 150, RADIUS = 98;

    var overlay  = $("#loaderOverlay");
    var progEl   = $("#ringProg");
    var dotEl    = $("#ringDot");
    var pctEl    = $("#loaderPercent");
    var msgEl    = $("#loaderMessage");
    var msgInner = $(".msg-inner", msgEl);
    var poses    = $$(".pose");
    var steps    = $$(".track-step");

    var MESSAGES = ["Building Strength…", "Developing Control…", "Unlocking Skills…", "Ready to Train."];

    var rafId = null, startTime = 0, currentStage = -1;
    var externalTarget = null, shownP = 0;

    function setProgress(p) {
      p = clamp(p, 0, 1);
      progEl.style.strokeDashoffset = (RING_C * (1 - p)).toFixed(2);

      var ang = (-90 + p * 360) * Math.PI / 180;
      dotEl.setAttribute("cx", (CENTER + RADIUS * Math.cos(ang)).toFixed(2));
      dotEl.setAttribute("cy", (CENTER + RADIUS * Math.sin(ang)).toFixed(2));

      var pct = Math.round(p * 100);
      pctEl.textContent = pct + "%";
      overlay.setAttribute("aria-valuenow", String(pct));

      var stage = clamp(Math.floor(p * 4), 0, 3);
      if (stage !== currentStage) {
        currentStage = stage;
        poses.forEach(function (g) { g.classList.toggle("active", Number(g.dataset.pose) === stage); });
        swapMessage(stage);
        steps.forEach(function (s) {
          var i = Number(s.dataset.step);
          s.classList.toggle("done", i < stage);
          s.classList.toggle("active", i === stage);
        });
      }
    }

    function swapMessage(stage) {
      msgEl.classList.add("swapping");
      window.setTimeout(function () {
        msgInner.textContent = MESSAGES[stage];
        msgEl.classList.remove("swapping");
      }, prefersReducedMotion ? 0 : 200);
    }

    function tick(now) {
      if (!startTime) startTime = now;
      var duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--loader-duration")) || 4500;

      var p;
      if (externalTarget !== null) {
        /* Real-progress mode: ease the shown value toward the fed target. */
        shownP = lerp(shownP, externalTarget, 0.06);
        if (externalTarget - shownP < 0.002) shownP = externalTarget;
        p = shownP;
      } else {
        var t = clamp((now - startTime) / duration, 0, 1);
        p = easeInOutCubic(t);
        shownP = p;
      }

      setProgress(p);
      if (p >= 1) { window.setTimeout(reveal, 620); return; }
      rafId = requestAnimationFrame(tick);
    }

    function reveal() {
      overlay.classList.add("reveal");
      document.body.classList.remove("elev8-loading");
      var finish = function () {
        overlay.classList.add("gone");
        overlay.removeEventListener("transitionend", finish);
      };
      overlay.addEventListener("transitionend", finish);
      window.setTimeout(finish, 1000); /* fallback */
    }

    function start() {
      if (rafId) cancelAnimationFrame(rafId);
      startTime = 0; currentStage = -1; externalTarget = null; shownP = 0;
      overlay.classList.remove("reveal", "gone");
      document.body.classList.add("elev8-loading");
      if (prefersReducedMotion) { setProgress(1); window.setTimeout(reveal, 400); return; }
      rafId = requestAnimationFrame(tick);
    }

    function set(p) { externalTarget = clamp(p, 0, 1); }

    return { start: start, set: set };
  })();

  /* ---- 4. init ---------------------------------------------------- */
  function init() {
    /* Show on: first visit OR browser reload. Skip on: internal navigation. */
    var nav       = performance.getEntriesByType && performance.getEntriesByType("navigation");
    var isReload  = nav && nav.length && nav[0].type === "reload";
    var hasLoaded = sessionStorage.getItem("elev8LoaderShown");

    if (hasLoaded && !isReload) {
      /* Internal navigation — hide overlay immediately, no animation */
      var ov = $("#loaderOverlay");
      if (ov) { ov.classList.add("gone"); }
      return;
    }

    sessionStorage.setItem("elev8LoaderShown", "1");
    buildParticles($("#loader-particles"), 26);
    var replay = $("#btnReplay");
    if (replay) replay.addEventListener("click", loader.start);
    loader.start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.AscendLoader = { set: loader.set, run: loader.start };
})();

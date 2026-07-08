/* =====================================================================
   ELEV8 — Page loader overlay
   loader.js  (vanilla, zero dependencies)
   ---------------------------------------------------------------------
   1. utils          — helpers + reduced-motion flag
   2. particleField  — ambient floating particles
   3. loader         — rAF progress ring, message/tracker, reveal
   4. athleteAnim    — continuous 8-second calisthenics sequence loop
   5. init           — sessionStorage gate + public API

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
    var steps    = $$(".track-step");

    var MESSAGES = ["Building Strength…", "Developing Control…", "Unlocking Skills…"];

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

      var stage = clamp(Math.floor(p * 3), 0, 2);
      if (stage !== currentStage) {
        currentStage = stage;
        swapMessage(stage);
        steps.forEach(function (s) {
          var i = Number(s.dataset.step);
          s.classList.toggle("done",   i < stage);
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
        shownP = lerp(shownP, externalTarget, 0.06);
        if (externalTarget - shownP < 0.002) shownP = externalTarget;
        p = shownP;
      } else {
        var t = clamp((now - startTime) / duration, 0, 1);
        p = t;
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
      window.setTimeout(finish, 1000);
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

  /* ---- 4. athleteAnim -------------------------------------------- */
  /*
     Continuous 8-second calisthenics sequence:
       Muscle-Up Support → Controlled Descent → Dead Hang
       → Descent to Floor → Push-Up → Ground Front Lever
       → Hold → Return → Jump to Bar → (loop)

     Each keyframe defines joint positions. Between keyframes,
     all joints are smoothly interpolated with easeInOutCubic.
     The torso path is computed dynamically from shoulder/hip joints.
  */
  function initAthleteAnim() {
    var head  = document.getElementById("anim-head");
    var prop  = document.getElementById("anim-prop");
    var torso = document.getElementById("anim-torso");
    if (!head || !prop || !torso) return;

    var IDS = ["lau","lal","rau","ral","llu","lll","rlu","rll"];
    var limbs = {}, glows = {};
    IDS.forEach(function (id) {
      limbs[id] = document.getElementById("anim-" + id);
      glows[id] = document.getElementById("anim-g-" + id);
    });

    var f = function (v) { return v.toFixed(1); };

    /* Build torso filled-path from shoulder and hip joint pairs */
    function torsoPath(lsx, lsy, rsx, rsy, lhx, lhy, rhx, rhy) {
      var smx = (lsx + rsx) / 2, smy = (lsy + rsy) / 2;
      var hmx = (lhx + rhx) / 2, hmy = (lhy + rhy) / 2;
      var dx = hmx - smx, dy = hmy - smy;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      /* Perpendicular offset for body thickness / natural taper */
      var tx = (-dy / len) * 3.5, ty = (dx / len) * 3.5;
      var c1x = smx + dx * 0.3 + tx, c1y = smy + dy * 0.3 + ty;
      var c2x = hmx - dx * 0.3 + tx, c2y = hmy - dy * 0.3 + ty;
      var c3x = hmx - dx * 0.3 - tx, c3y = hmy - dy * 0.3 - ty;
      var c4x = smx + dx * 0.3 - tx, c4y = smy + dy * 0.3 - ty;
      return "M" + f(lsx) + " " + f(lsy) +
        " C" + f(c1x) + " " + f(c1y) + " " + f(c2x) + " " + f(c2y) +
        " "  + f(lhx) + " " + f(lhy) +
        " L" + f(rhx) + " " + f(rhy) +
        " C" + f(c3x) + " " + f(c3y) + " " + f(c4x) + " " + f(c4y) +
        " "  + f(rsx) + " " + f(rsy) + " Z";
    }

    function lp(x1, y1, x2, y2) {
      return "M" + f(x1) + " " + f(y1) + " L" + f(x2) + " " + f(y2);
    }

    function applyFrame(j) {
      head.setAttribute("cx", f(j.hx));
      head.setAttribute("cy", f(j.hy));

      var paths = {
        lau: lp(j.lsx, j.lsy, j.lex, j.ley),
        lal: lp(j.lex, j.ley, j.lhx, j.lhy),
        rau: lp(j.rsx, j.rsy, j.rex, j.rey),
        ral: lp(j.rex, j.rey, j.rhx, j.rhy),
        llu: lp(j.lhipx, j.lhipy, j.lkx, j.lky),
        lll: lp(j.lkx, j.lky, j.lfx, j.lfy),
        rlu: lp(j.rhipx, j.rhipy, j.rkx, j.rky),
        rll: lp(j.rkx, j.rky, j.rfx, j.rfy)
      };

      IDS.forEach(function (id) {
        var d = paths[id];
        if (limbs[id]) limbs[id].setAttribute("d", d);
        if (glows[id])  glows[id].setAttribute("d", d);
      });

      torso.setAttribute("d", torsoPath(
        j.lsx, j.lsy, j.rsx, j.rsy,
        j.lhipx, j.lhipy, j.rhipx, j.rhipy
      ));

      prop.setAttribute("x1", f(j.px1));
      prop.setAttribute("y1", f(j.py1));
      prop.setAttribute("x2", f(j.px2));
      prop.setAttribute("y2", f(j.py2));
      prop.style.opacity = j.pop;
    }

    /*
      Keyframes — each entry is a snapshot of all joint positions.
      t: normalized position in the 8-second loop [0..1].

      Anatomy (side view, athlete facing left):
        hx/hy          = head center
        lsx/lsy        = left shoulder   rsx/rsy  = right shoulder
        lex/ley        = left elbow      rex/rey  = right elbow
        lhx/lhy        = left hand       rhx/rhy  = right hand
        lhipx/lhipy    = left hip        rhipx/rhipy = right hip
        lkx/lky        = left knee       rkx/rky  = right knee
        lfx/lfy        = left foot       rfx/rfy  = right foot
        px1/py1/px2/py2 = prop line      pop      = prop opacity

      Bar is at y≈72 (top of ring).
      Ground is at y≈208 (bottom of ring).
    */
    var KFS = [
      /* 0 — Dead Hang */
      { t: 0.00,
        hx: 150, hy: 96,
        lsx: 140, lsy: 110, rsx: 160, rsy: 110,
        lex: 138, ley: 91,  rex: 162, rey: 91,
        lhx: 137, lhy: 72,  rhx: 163, rhy: 72,
        lhipx: 143, lhipy: 152, rhipx: 157, rhipy: 152,
        lkx: 141, lky: 178, rkx: 159, rky: 178,
        lfx: 141, lfy: 206, rfx: 159, rfy: 206,
        px1: 118, py1: 72, px2: 182, py2: 72, pop: 1.0 },

      /* 1 — Pull Phase */
      { t: 0.07,
        hx: 150, hy: 74,
        lsx: 140, lsy: 88,  rsx: 160, rsy: 88,
        lex: 136, ley: 80,  rex: 164, rey: 80,
        lhx: 135, lhy: 72,  rhx: 165, rhy: 72,
        lhipx: 143, lhipy: 128, rhipx: 157, rhipy: 128,
        lkx: 141, lky: 154, rkx: 159, rky: 154,
        lfx: 140, lfy: 180, rfx: 160, rfy: 180,
        px1: 118, py1: 72, px2: 182, py2: 72, pop: 1.0 },

      /* 2 — Kip: chin clears bar */
      { t: 0.14,
        hx: 150, hy: 62,
        lsx: 140, lsy: 74,  rsx: 160, rsy: 74,
        lex: 134, ley: 90,  rex: 166, rey: 90,
        lhx: 133, lhy: 72,  rhx: 167, rhy: 72,
        lhipx: 143, lhipy: 108, rhipx: 157, rhipy: 108,
        lkx: 141, lky: 132, rkx: 159, rky: 132,
        lfx: 140, lfy: 156, rfx: 160, rfy: 156,
        px1: 118, py1: 72, px2: 182, py2: 72, pop: 1.0 },

      /* 3 — Lockout: body above bar, arms straight */
      { t: 0.22,
        hx: 150, hy: 40,
        lsx: 140, lsy: 54,  rsx: 160, rsy: 54,
        lex: 137, ley: 64,  rex: 163, rey: 64,
        lhx: 135, lhy: 72,  rhx: 165, rhy: 72,
        lhipx: 143, lhipy: 94,  rhipx: 157, rhipy: 94,
        lkx: 141, lky: 122, rkx: 159, rky: 122,
        lfx: 140, lfy: 148, rfx: 160, rfy: 148,
        px1: 118, py1: 72, px2: 182, py2: 72, pop: 1.0 },

      /* 4 — Controlled Lower */
      { t: 0.30,
        hx: 150, hy: 58,
        lsx: 140, lsy: 72,  rsx: 160, rsy: 72,
        lex: 135, ley: 85,  rex: 165, rey: 85,
        lhx: 133, lhy: 72,  rhx: 167, rhy: 72,
        lhipx: 143, lhipy: 112, rhipx: 157, rhipy: 112,
        lkx: 141, lky: 138, rkx: 159, rky: 138,
        lfx: 140, lfy: 164, rfx: 160, rfy: 164,
        px1: 118, py1: 72, px2: 182, py2: 72, pop: 1.0 },

      /* 5 — Release: grip breaks, body pivots toward floor */
      { t: 0.38,
        hx: 146, hy: 122,
        lsx: 136, lsy: 136, rsx: 156, rsy: 136,
        lex: 128, ley: 152, rex: 164, rey: 152,
        lhx: 120, lhy: 168, rhx: 170, rhy: 168,
        lhipx: 142, lhipy: 164, rhipx: 156, rhipy: 164,
        lkx: 139, lky: 184, rkx: 157, rky: 184,
        lfx: 137, lfy: 204, rfx: 157, rfy: 204,
        px1: 118, py1: 72, px2: 182, py2: 72, pop: 0.10 },

      /* 6 — Front Lever Entry: body horizontal, arms going diagonal */
      { t: 0.48,
        hx: 88,  hy: 154,
        lsx: 108, lsy: 152, rsx: 114, rsy: 152,
        lex: 96,  ley: 168, rex: 102, rey: 168,
        lhx: 84,  lhy: 188, rhx: 90,  rhy: 188,
        lhipx: 165, lhipy: 156, rhipx: 171, rhipy: 156,
        lkx: 188, lky: 159, rkx: 194, rky: 159,
        lfx: 210, lfy: 162, rfx: 216, rfy: 162,
        px1: 68, py1: 208, px2: 222, py2: 208, pop: 0.28 },

      /* 7 — Ground Front Lever Full: arms at 60° (\), body rigid */
      { t: 0.55,
        hx: 82,  hy: 150,
        lsx: 112, lsy: 152, rsx: 118, rsy: 152,
        lex: 98,  ley: 176, rex: 104, rey: 176,
        lhx: 84,  lhy: 200, rhx: 90,  rhy: 200,
        lhipx: 165, lhipy: 154, rhipx: 171, rhipy: 154,
        lkx: 188, lky: 157, rkx: 194, rky: 157,
        lfx: 210, lfy: 160, rfx: 216, rfy: 160,
        px1: 65, py1: 208, px2: 225, py2: 208, pop: 0.35 },

      /* 7b — Hold lever: micro-pause so the skill registers visually */
      { t: 0.63,
        hx: 82,  hy: 150,
        lsx: 112, lsy: 152, rsx: 118, rsy: 152,
        lex: 98,  ley: 176, rex: 104, rey: 176,
        lhx: 84,  lhy: 200, rhx: 90,  rhy: 200,
        lhipx: 165, lhipy: 154, rhipx: 171, rhipy: 154,
        lkx: 188, lky: 157, rkx: 194, rky: 157,
        lfx: 210, lfy: 160, rfx: 216, rfy: 160,
        px1: 65, py1: 208, px2: 225, py2: 208, pop: 0.35 },

      /* 8 — Push-Up Top: plank, arms extended, hands AND feet planted on ground (y=208) */
      { t: 0.70,
        hx: 98,  hy: 156,
        lsx: 113, lsy: 155, rsx: 119, rsy: 155,
        lex: 108, ley: 178, rex: 114, rey: 178,
        lhx: 101, lhy: 205, rhx: 107, rhy: 205,
        lhipx: 165, lhipy: 183, rhipx: 171, rhipy: 183,
        lkx: 188, lky: 196, rkx: 194, rky: 196,
        lfx: 210, lfy: 208, rfx: 216, rfy: 208,
        px1: 78, py1: 208, px2: 222, py2: 208, pop: 0.42 },

      /* 9 — Push-Up Down: hands & feet stay fixed on the ground (same coords as 8/10/11).
         The rigid shoulder→hip→knee→foot line pivots about the planted foot as the shoulder
         drops toward the fixed hand and the elbow bends to ~90°. Hip/knee are recomputed
         along that line so the torso+legs stay one straight plank — no sagging, no floating feet. */
      { t: 0.82,
        hx: 89,  hy: 193,
        lsx: 104, lsy: 192, rsx: 110, rsy: 192,
        lex: 110, ley: 194, rex: 116, rey: 194,
        lhx: 101, lhy: 205, rhx: 107, rhy: 205,
        lhipx: 161, lhipy: 201, rhipx: 167, rhipy: 201,
        lkx: 186, lky: 204, rkx: 192, rky: 204,
        lfx: 210, lfy: 208, rfx: 216, rfy: 208,
        px1: 78, py1: 208, px2: 222, py2: 208, pop: 0.42 },

      /* 10 — Push-Up Back Up: mirrors keyframe 8 (arms drive through, body rises) */
      { t: 0.94,
        hx: 98,  hy: 156,
        lsx: 113, lsy: 155, rsx: 119, rsy: 155,
        lex: 108, ley: 178, rex: 114, rey: 178,
        lhx: 101, lhy: 205, rhx: 107, rhy: 205,
        lhipx: 165, lhipy: 183, rhipx: 171, rhipy: 183,
        lkx: 188, lky: 196, rkx: 194, rky: 196,
        lfx: 210, lfy: 208, rfx: 216, rfy: 208,
        px1: 78, py1: 208, px2: 222, py2: 208, pop: 0.42 },

      /* 11 — Hold at top — loader ends here (identical to 8/10) */
      { t: 1.00,
        hx: 98,  hy: 156,
        lsx: 113, lsy: 155, rsx: 119, rsy: 155,
        lex: 108, ley: 178, rex: 114, rey: 178,
        lhx: 101, lhy: 205, rhx: 107, rhy: 205,
        lhipx: 165, lhipy: 183, rhipx: 171, rhipy: 183,
        lkx: 188, lky: 196, rkx: 194, rky: 196,
        lfx: 210, lfy: 208, rfx: 216, rfy: 208,
        px1: 78, py1: 208, px2: 222, py2: 208, pop: 0.42 }
    ];

    var LOOP_MS = 7000;
    var animStart = null;

    function interpKF(kf1, kf2, alpha) {
      var e = easeInOutCubic(alpha);
      var KEYS = [
        "hx","hy",
        "lsx","lsy","rsx","rsy",
        "lex","ley","rex","rey",
        "lhx","lhy","rhx","rhy",
        "lhipx","lhipy","rhipx","rhipy",
        "lkx","lky","rkx","rky",
        "lfx","lfy","rfx","rfy",
        "px1","py1","px2","py2","pop"
      ];
      var r = {};
      for (var i = 0; i < KEYS.length; i++) {
        var k = KEYS[i];
        r[k] = lerp(kf1[k], kf2[k], e);
      }
      return r;
    }

    function tick(now) {
      if (!animStart) animStart = now;
      var t = Math.min((now - animStart) / LOOP_MS, 1.0);

      /* Past the last keyframe — hold final pose, stop */
      var last = KFS[KFS.length - 1];
      if (t >= last.t) { applyFrame(last); return; }

      /* Find the two keyframes bracketing t */
      var kf1 = KFS[0], kf2 = last;
      for (var i = 0; i < KFS.length - 1; i++) {
        if (KFS[i].t <= t && KFS[i + 1].t > t) {
          kf1 = KFS[i];
          kf2 = KFS[i + 1];
          break;
        }
      }
      var span = kf2.t - kf1.t;
      var alpha = span > 0 ? (t - kf1.t) / span : 0;

      applyFrame(interpKF(kf1, kf2, alpha));
      requestAnimationFrame(tick);
    }

    if (prefersReducedMotion) {
      applyFrame(KFS[0]); /* static support position for reduced-motion */
    } else {
      requestAnimationFrame(tick);
    }
  }

  /* ---- 5. init ---------------------------------------------------- */
  function init() {
    var nav       = performance.getEntriesByType && performance.getEntriesByType("navigation");
    var isReload  = nav && nav.length && nav[0].type === "reload";
    var hasLoaded = sessionStorage.getItem("elev8LoaderShown");

    if (hasLoaded && !isReload) {
      var ov = $("#loaderOverlay");
      if (ov) { ov.classList.add("gone"); }
      return;
    }

    sessionStorage.setItem("elev8LoaderShown", "1");
    buildParticles($("#loader-particles"), 26);
    initAthleteAnim();
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

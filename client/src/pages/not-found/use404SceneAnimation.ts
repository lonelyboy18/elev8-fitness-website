import { useEffect, type RefObject } from "react";

/**
 * Faithful port of `Elev8/404 error/error.js` scoped to a container ref instead of
 * `document` globals, so it can safely mount/unmount as the SPA route changes.
 * Preserves every timing constant, stage, and CSS custom property from the original.
 */

const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function rand(a: number, b: number): number {
  return a + Math.random() * (b - a);
}

function buildParticles(container: HTMLElement | null, count: number): void {
  if (!container) return;
  container.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "particle";
    p.style.setProperty("--p-size", rand(1.5, 3.5).toFixed(1) + "px");
    p.style.left = rand(2, 98).toFixed(2) + "%";
    p.style.top = rand(4, 96).toFixed(2) + "%";
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

export function use404SceneAnimation(containerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const screenEl = root.querySelector<HTMLElement>("#screen-404");
    const sceneEl = root.querySelector<HTMLElement>("#scene404");
    const particlesEl = root.querySelector<HTMLElement>("#error-particles");
    const ctaBtn = root.querySelector<HTMLElement>("#btnReturnHome");

    const timers: number[] = [];
    let rafId: number | null = null;
    let magneticRafId: number | null = null;

    function clearTimers() {
      timers.forEach((t) => window.clearTimeout(t));
      timers.length = 0;
    }
    function at(ms: number, fn: () => void) {
      timers.push(window.setTimeout(fn, ms));
    }

    function spawnBurst() {
      if (!sceneEl) return;
      const n = 16;
      for (let i = 0; i < n; i++) {
        const piece = document.createElement("span");
        piece.className = "burst-piece";
        const ang = (i / n) * Math.PI * 2 + rand(-0.2, 0.2);
        const dist = rand(40, 95);
        piece.style.setProperty("--bx", (Math.cos(ang) * dist).toFixed(0) + "px");
        piece.style.setProperty("--by", (Math.sin(ang) * dist - 10).toFixed(0) + "px");
        sceneEl.appendChild(piece);
        window.setTimeout(() => piece.remove(), 760);
      }
    }

    function resetScene() {
      if (!sceneEl) return;
      clearTimers();
      sceneEl.classList.remove("bar-gone", "glitching", "revealed", "idle");
      sceneEl.removeAttribute("data-stage");
      sceneEl.querySelectorAll(".burst-piece").forEach((b) => b.remove());
      void sceneEl.offsetWidth; /* reflow restarts transitions */
    }

    function playScene() {
      if (!sceneEl) return;
      resetScene();
      if (prefersReducedMotion) {
        sceneEl.setAttribute("data-stage", "settle");
        sceneEl.classList.add("bar-gone", "revealed");
        return;
      }
      at(60, () => sceneEl.setAttribute("data-stage", "grab")); /* jump & grab */
      at(820, () => sceneEl.setAttribute("data-stage", "pull")); /* powerful pull */
      at(1620, () => {
        sceneEl.classList.add("bar-gone", "glitching");
        spawnBurst();
      }); /* bar vanishes */
      at(2140, () => sceneEl.classList.remove("glitching"));
      at(1980, () => sceneEl.setAttribute("data-stage", "confused")); /* confused float */
      at(2900, () => {
        sceneEl.setAttribute("data-stage", "settle");
        sceneEl.classList.add("revealed");
      });
      at(3820, () => sceneEl.classList.add("idle")); /* ambient dangle */
    }

    // ---- parallax ----
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0;
    const MAX = 18;

    function onPointer(e: PointerEvent) {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      tx = -nx * MAX;
      ty = -ny * MAX;
    }
    function onTilt(e: DeviceOrientationEvent) {
      if (e.gamma == null || e.beta == null) return;
      tx = clamp(-e.gamma / 45, -1, 1) * MAX;
      ty = clamp(-(e.beta - 45) / 45, -1, 1) * MAX;
    }
    function parallaxLoop() {
      if (!screenEl) return;
      cx = lerp(cx, tx, 0.08);
      cy = lerp(cy, ty, 0.08);
      screenEl.style.setProperty("--px", cx.toFixed(2) + "px");
      screenEl.style.setProperty("--py", cy.toFixed(2) + "px");
      rafId = requestAnimationFrame(parallaxLoop);
    }

    // ---- magnetic button ----
    let mtx = 0,
      mty = 0,
      mcx = 0,
      mcy = 0,
      magneticRunning = false;
    const RADIUS = 120;
    const PULL = 0.35;

    function magneticLoop() {
      if (!ctaBtn) return;
      mcx = lerp(mcx, mtx, 0.18);
      mcy = lerp(mcy, mty, 0.18);
      ctaBtn.style.setProperty("--mx", mcx.toFixed(2) + "px");
      ctaBtn.style.setProperty("--my", mcy.toFixed(2) + "px");
      if (Math.abs(mcx - mtx) < 0.1 && Math.abs(mcy - mty) < 0.1 && mtx === 0 && mty === 0) {
        magneticRunning = false;
        return;
      }
      magneticRafId = requestAnimationFrame(magneticLoop);
    }
    function ensureMagneticLoop() {
      if (!magneticRunning) {
        magneticRunning = true;
        magneticRafId = requestAnimationFrame(magneticLoop);
      }
    }
    function onMagneticPointerMove(e: PointerEvent) {
      if (!ctaBtn) return;
      const r = ctaBtn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < RADIUS) {
        mtx = dx * PULL;
        mty = dy * PULL;
      } else {
        mtx = 0;
        mty = 0;
      }
      ensureMagneticLoop();
    }
    function onMagneticPointerLeave() {
      mtx = 0;
      mty = 0;
      ensureMagneticLoop();
    }

    // ---- init ----
    buildParticles(particlesEl, 30);
    playScene();

    if (!prefersReducedMotion) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("deviceorientation", onTilt, { passive: true });
      rafId = requestAnimationFrame(parallaxLoop);

      if (ctaBtn) {
        window.addEventListener("pointermove", onMagneticPointerMove, { passive: true });
        ctaBtn.addEventListener("pointerleave", onMagneticPointerLeave);
      }
    }

    return () => {
      clearTimers();
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (magneticRafId !== null) cancelAnimationFrame(magneticRafId);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onTilt);
      window.removeEventListener("pointermove", onMagneticPointerMove);
      ctaBtn?.removeEventListener("pointerleave", onMagneticPointerLeave);
    };
  }, [containerRef]);
}

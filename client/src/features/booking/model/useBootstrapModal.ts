import { useRef } from "react";

interface BootstrapModalInstance {
  hide(): void;
  show(): void;
}

interface BootstrapGlobal {
  Modal: {
    getInstance(el: Element): BootstrapModalInstance | null;
    getOrCreateInstance(el: Element): BootstrapModalInstance;
  };
}

function getBootstrap(): BootstrapGlobal | undefined {
  return (window as unknown as { bootstrap?: BootstrapGlobal }).bootstrap;
}

/** Thin wrapper around the global Bootstrap Modal JS API (loaded via bootstrap.bundle.min.js),
 *  used to programmatically close `data-bs-toggle="modal"` dialogs after a successful submit —
 *  mirrors the legacy `bootstrap.Modal.getInstance(...).hide()` calls in dashboard.js. */
export function useBootstrapModal(modalId: string) {
  const elRef = useRef<HTMLDivElement | null>(null);

  function hide() {
    const el = elRef.current ?? document.getElementById(modalId);
    if (!el) return;
    const bs = getBootstrap();
    bs?.Modal.getInstance(el)?.hide();
  }

  return { modalRef: elRef, hide };
}

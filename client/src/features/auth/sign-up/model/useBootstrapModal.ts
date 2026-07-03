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

/** Thin wrapper around the global Bootstrap Modal JS API (loaded via bootstrap.bundle.min.js) —
 *  same pattern as features/booking/model/useBootstrapModal.ts, kept local to this feature slice. */
export function useBootstrapModal(modalId: string) {
  const elRef = useRef<HTMLDivElement | null>(null);

  function show() {
    const el = elRef.current ?? document.getElementById(modalId);
    if (!el) return;
    getBootstrap()?.Modal.getOrCreateInstance(el).show();
  }

  function hide() {
    const el = elRef.current ?? document.getElementById(modalId);
    if (!el) return;
    getBootstrap()?.Modal.getInstance(el)?.hide();
  }

  return { modalRef: elRef, show, hide };
}

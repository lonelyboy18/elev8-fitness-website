import type { ReactNode } from "react";

interface SubmitButtonProps {
  id?: string;
  className: string;
  loading: boolean;
  children: ReactNode;
}

/** Mirrors js/core/core.js `setButtonLoading()` — spinner + "Please wait…" while a form submits. */
export function SubmitButton({ id, className, loading, children }: SubmitButtonProps) {
  return (
    <button type="submit" id={id} className={className} disabled={loading}>
      {loading ? (
        <>
          <span className="btn-spinner"></span>Please wait…
        </>
      ) : (
        children
      )}
    </button>
  );
}

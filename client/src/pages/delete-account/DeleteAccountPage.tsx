import { useDocumentTitle } from "@shared/hooks/useDocumentTitle";
import { DeleteAccountForm } from "@features/auth/delete-account/ui/DeleteAccountForm";

export function DeleteAccountPage() {
  useDocumentTitle("Delete Account — ELEV8");

  return (
    <div className="auth-card">
      <div className="glass-card glass-card--danger">
        <div className="auth-header">
          <div className="danger-icon" aria-hidden="true">
            ⚠️
          </div>
          <h1 className="auth-title" style={{ color: "#ef4444" }}>
            Delete Account
          </h1>
          <p className="auth-sub">This action is permanent and cannot be undone.</p>
        </div>

        <div className="danger-notice">
          <strong>What will be deleted:</strong>
          <ul>
            <li>Your profile and login credentials</li>
            <li>Your program enrollment history</li>
            <li>All personal data stored by ELEV8</li>
          </ul>
        </div>

        <DeleteAccountForm />
      </div>
    </div>
  );
}

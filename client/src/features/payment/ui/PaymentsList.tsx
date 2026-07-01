import type { Payment } from "@entities/payment/model/types";

const PLAN_NAMES: Record<string, string> = {
  bft: "BFT — Bodyweight Functional",
  cst: "CST — Calisthenics Skill",
};

interface PaymentsListProps {
  payments: Payment[];
  loading: boolean;
}

export function PaymentsList({ payments, loading }: PaymentsListProps) {
  if (loading) {
    return <div className="dash-empty">Loading payments…</div>;
  }

  if (!payments.length) {
    return (
      <div className="dash-empty">
        No payments yet. Hit <strong>+ Subscribe</strong> to activate your membership.
      </div>
    );
  }

  return (
    <div className="payments-list" aria-live="polite">
      {payments.map((p) => {
        const amtRs = "₹" + (parseInt(String(p.amount_paise), 10) / 100).toLocaleString("en-IN");
        const durStr = `${p.duration_months} month${p.duration_months > 1 ? "s" : ""}`;
        const dateStr = new Date(p.paid_at || p.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const txRef = p.razorpay_payment_id ? ` • ${p.razorpay_payment_id.slice(-8)}` : "";

        return (
          <div className="payment-item" key={p.id}>
            <div>
              <div className="pay-item-label">
                {amtRs} &bull; {durStr}
              </div>
              <div className="pay-item-meta">
                {PLAN_NAMES[p.plan] || p.plan.toUpperCase()} &bull; {dateStr}
                {txRef}
              </div>
            </div>
            <span className={`pay-badge ${p.status}`}>{p.status}</span>
          </div>
        );
      })}
    </div>
  );
}

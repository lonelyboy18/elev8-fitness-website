import { useState } from "react";
import type { Booking } from "@entities/booking/model/types";

const SLOT_LABELS: Record<string, string> = {
  "05:30": "5:30 AM",
  "06:30": "6:30 AM",
  "07:30": "7:30 AM",
  "17:00": "5:00 PM",
  "18:00": "6:00 PM",
  "19:00": "7:00 PM",
};

const TYPE_NAMES: Record<string, string> = {
  bft: "Bodyweight Functional Training",
  cst: "Calisthenics Skill Training",
};

interface BookingsListProps {
  bookings: Booking[];
  loading: boolean;
  onCancel: (id: number) => Promise<void>;
}

export function BookingsList({ bookings, loading, onCancel }: BookingsListProps) {
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  if (loading) {
    return <div className="dash-empty">Loading bookings…</div>;
  }

  if (!bookings.length) {
    return (
      <div className="dash-empty">
        No bookings yet. Hit <strong>+ Book a Class</strong> to get started!
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  async function handleCancel(id: number) {
    if (!window.confirm("Cancel this booking? This cannot be undone.")) return;
    setCancellingId(id);
    try {
      await onCancel(id);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="bookings-list" aria-live="polite">
      {bookings.map((b) => {
        const d = new Date(b.class_date + "T00:00:00");
        const dFmt = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
        const isUpcoming = b.class_date >= today && b.status === "confirmed";
        const isCancelling = cancellingId === b.id;

        return (
          <div className={`booking-item${b.status === "cancelled" ? " cancelled" : ""}`} key={b.id}>
            <div>
              <div className="bk-date-time">
                {dFmt} &bull; {SLOT_LABELS[b.time_slot] || b.time_slot}
              </div>
              <div className="bk-meta">{TYPE_NAMES[b.class_type] || b.class_type.toUpperCase()}</div>
            </div>
            <div className="bk-actions">
              <span className={`bk-badge ${b.status}`}>{b.status}</span>
              {isUpcoming && (
                <button
                  className="btn-cancel-bk"
                  aria-label="Cancel booking"
                  disabled={isCancelling}
                  onClick={() => handleCancel(b.id)}
                >
                  {isCancelling ? "…" : "Cancel"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

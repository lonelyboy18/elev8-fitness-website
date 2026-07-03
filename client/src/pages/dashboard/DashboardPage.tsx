import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDocumentTitle } from "@shared/hooks/useDocumentTitle";
import { useToast } from "@shared/hooks/useToast";
import { isApiSuccess } from "@shared/types/api";
import { ROUTES } from "@shared/constants/routes";
import { useInvalidateSession, useSession } from "@features/auth/session/useSession";
import { userApi } from "@entities/user/api/userApi";
import { bookingApi } from "@entities/booking/api/bookingApi";
import { BookingForm } from "@features/booking/ui/BookingForm";
import { BookingsList } from "@features/booking/ui/BookingsList";

const PLAN_LABELS: Record<string, string> = { bft: "BFT", cst: "CST" };

function greeting(): string {
  const h = new Date().getHours();
  return h < 12 ? "Good morning," : h < 17 ? "Good afternoon," : "Good evening,";
}

function thisMonthBookingCount(bookings: { class_date: string; status: string }[]): number {
  const now = new Date();
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return bookings.filter((b) => b.status === "confirmed" && b.class_date.startsWith(prefix)).length;
}

function formatExpiry(iso: string | null): string {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
}

/** Ports Elev8/html/dashboard.html + js/pages/dashboard.js's session/bookings wiring (the
 *  booking UI components already existed but were never composed into a page). The Payments
 *  tab is intentionally not shown — payments are temporarily disabled site-wide, see
 *  payments.service.ts's TODO(payments) comments and docs/security.md. */
export function DashboardPage() {
  useDocumentTitle("My Dashboard — ELEV8");
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const invalidateSession = useInvalidateSession();
  const { user, isLoading: sessionLoading, isAuthenticated } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      navigate(ROUTES.signIn, { replace: true });
    }
  }, [sessionLoading, isAuthenticated, navigate]);

  const bookingsQuery = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const result = await bookingApi.list();
      return isApiSuccess(result) ? result.data.data : [];
    },
    enabled: isAuthenticated,
  });

  async function handleCancelBooking(id: number) {
    const result = await bookingApi.cancel(id);
    if (isApiSuccess(result)) {
      showToast("Booking cancelled.", "info", 3000);
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
    } else {
      showToast(result.message || "Could not cancel booking.", "error");
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await userApi.logout();
    } finally {
      await invalidateSession();
      navigate(ROUTES.home, { replace: true });
    }
  }

  if (sessionLoading || !isAuthenticated || !user) {
    return (
      <div className="dash-container" style={{ paddingTop: 160 }}>
        <div className="auth-guard-overlay" aria-live="polite">
          <div className="auth-guard-inner">
            <div className="auth-guard-spinner"></div>
            <p className="auth-guard-text">Verifying session…</p>
          </div>
        </div>
      </div>
    );
  }

  const bookings = bookingsQuery.data ?? [];
  const initial = (user.name || "?").charAt(0).toUpperCase();

  return (
    <div className="dash-container" style={{ paddingTop: 140 }}>
      <div className="dash-hero">
        <div className="dash-hero-left">
          <div className="dash-avatar" aria-hidden="true">
            {initial}
          </div>
          <div className="dash-hero-text">
            <p className="dash-greeting">{greeting()}</p>
            <h1 className="dash-name">{user.name || "—"}</h1>
            <span className={`dash-plan-pill${user.subscriptionStatus === "active" ? " active-pill" : ""}`}>
              {PLAN_LABELS[user.plan] ?? user.plan.toUpperCase()}
            </span>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={handleSignOut} disabled={signingOut}>
          {signingOut ? "Signing out…" : "← Sign Out"}
        </button>
      </div>

      <div className="dash-stats" role="list">
        <div className="dash-stat" role="listitem">
          <span className="dash-stat-val">{thisMonthBookingCount(bookings)}</span>
          <span className="dash-stat-key">Bookings this month</span>
        </div>
        <div className="dash-stat" role="listitem">
          <span
            className="dash-stat-val"
            style={{ color: user.subscriptionStatus === "active" ? "#86efac" : "#fca5a5" }}
          >
            {user.subscriptionStatus === "active" ? "Active" : user.subscriptionStatus === "expired" ? "Expired" : "Inactive"}
          </span>
          <span className="dash-stat-key">Subscription</span>
        </div>
        <div className="dash-stat" role="listitem">
          <span className="dash-stat-val">{formatExpiry(user.subscriptionExpires)}</span>
          <span className="dash-stat-key">Expires</span>
        </div>
        <div className="dash-stat" role="listitem">
          <span className="dash-stat-val">{user.memberSince || "—"}</span>
          <span className="dash-stat-key">Member since</span>
        </div>
      </div>

      <div className="dash-tabs-wrap">
        <ul className="nav dash-tabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button className="dash-tab active" role="tab" aria-selected="true" type="button">
              Bookings
            </button>
          </li>
        </ul>
      </div>

      <div className="tab-content dash-tab-body">
        <div className="tab-pane fade show active" role="tabpanel">
          <div className="dash-panel-header">
            <h2 className="dash-panel-title">My Bookings</h2>
            <button className="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#bookModal">
              + Book a Class
            </button>
          </div>
          <BookingsList bookings={bookings} loading={bookingsQuery.isLoading} onCancel={handleCancelBooking} />
        </div>
      </div>

      <BookingForm
        defaultPlan={user.plan}
        onBooked={async () => {
          await queryClient.invalidateQueries({ queryKey: ["bookings"] });
        }}
      />
    </div>
  );
}

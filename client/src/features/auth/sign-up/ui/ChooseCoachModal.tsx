import { useEffect } from "react";
import { COACHES } from "@shared/config/coaches";
import { buildCoachWhatsAppUrl, type RegistrationDetails } from "@shared/lib/whatsapp";
import { useBootstrapModal } from "../model/useBootstrapModal";

const MODAL_ID = "chooseCoachModal";

interface ChooseCoachModalProps {
  /** Non-null once registration has succeeded — triggers the modal to open. */
  details: RegistrationDetails | null;
  /** Called once the modal has fully closed, however it was closed (coach chosen, X button, backdrop, Esc). */
  onClosed: () => void;
}

/** Shown right after a successful registration — hands the new member off to a coach on
 *  WhatsApp instead of a payment/checkout step. Reuses the exact modal chrome (`.modal.fade` +
 *  `.glass-modal`) and plan-card look already established by BookingForm's booking modal. */
export function ChooseCoachModal({ details, onClosed }: ChooseCoachModalProps) {
  const { modalRef, show } = useBootstrapModal(MODAL_ID);

  useEffect(() => {
    if (details) show();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details]);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const handleHidden = () => onClosed();
    el.addEventListener("hidden.bs.modal", handleHidden);
    return () => el.removeEventListener("hidden.bs.modal", handleHidden);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="modal fade" id={MODAL_ID} ref={modalRef} tabIndex={-1} aria-labelledby="chooseCoachModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content glass-modal">
          <div className="modal-header">
            <h5 className="modal-title" id="chooseCoachModalLabel">
              Choose Your Coach
            </h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="plan-grid">
              {COACHES.map((coach) => (
                <div className="plan-content" key={coach.id}>
                  <strong className="plan-abbr">{coach.name}</strong>
                  <a
                    className="btn btn-success w-100 mt-2"
                    href={details ? buildCoachWhatsAppUrl(coach, details) : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-bs-dismiss="modal"
                  >
                    Continue on WhatsApp
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

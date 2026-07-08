import { COACH_CONTACTS, type CoachContact } from "@shared/config/coachContacts";
import { buildWhatsAppLink } from "@shared/lib/whatsapp";

interface CoachSelectionModalProps {
  /** Unique on the page — used as the Bootstrap modal id. Trigger buttons open it via
   *  `data-bs-toggle="modal" data-bs-target="#<id>"`; no extra JS or React state required. */
  id: string;
  /** Builds the WhatsApp message for the chosen coach — lets each CTA supply its own copy. */
  buildMessage: (coach: CoachContact) => string;
  title?: string;
  subtitle?: string;
}

function PersonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="22"
      height="22"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

/** Generic "pick a coach to continue on WhatsApp" modal — reusable by any page/CTA that needs a
 *  coach handoff. Bootstrap's own modal JS handles open/close, backdrop click, Esc and the fade
 *  animation (same `.modal.fade` + `.glass-modal` chrome used elsewhere on the site); coach
 *  identity always comes from the shared config, only the message text is caller-supplied. */
export function CoachSelectionModal({
  id,
  buildMessage,
  title = "Choose Your Coach",
  subtitle = "Select a coach to continue your conversation on WhatsApp.",
}: CoachSelectionModalProps) {
  const labelId = `${id}Label`;

  return (
    <div className="modal fade" id={id} tabIndex={-1} aria-labelledby={labelId} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content glass-modal">
          <div className="modal-header">
            <h5 className="modal-title" id={labelId}>
              {title}
            </h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p className="text-muted mb-4">{subtitle}</p>
            <div className="plan-grid coach-select-grid">
              {COACH_CONTACTS.map((coach) => (
                <div className="coach-select-card" key={coach.id}>
                  <span className="coach-select-avatar">
                    <PersonIcon />
                  </span>
                  <h6 className="coach-select-name">{coach.name}</h6>
                  <p className="coach-select-role">{coach.role}</p>
                  <p className="coach-select-phone">{coach.phoneDisplay}</p>
                  <a
                    className="btn btn-success w-100"
                    href={buildWhatsAppLink(coach.whatsappNumber, buildMessage(coach))}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-bs-dismiss="modal"
                  >
                    Message {coach.name}
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

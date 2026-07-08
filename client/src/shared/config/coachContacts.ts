/** Single source of truth for the "Choose Your Coach" modal shown on Home page CTAs
 *  ("Book a Free Trial" / "Join the Community"). Update names, roles or numbers here —
 *  nothing else in the app hardcodes a coach or WhatsApp number for this flow. */

export interface CoachContact {
  id: string;
  name: string;
  role: string;
  /** Human-readable phone number shown on the card, e.g. "+91 70661 31474". */
  phoneDisplay: string;
  /** E.164 format, digits only (no "+", spaces, or dashes) — e.g. "917066131474". */
  whatsappNumber: string;
}

export const COACH_CONTACTS: CoachContact[] = [
  { id: "raj", name: "Raj", role: "Head Coach", phoneDisplay: "+91 70661 31474", whatsappNumber: "917066131474" },
  { id: "nimay", name: "Nimay", role: "Coach", phoneDisplay: "+91 91689 80624", whatsappNumber: "919168980624" },
];

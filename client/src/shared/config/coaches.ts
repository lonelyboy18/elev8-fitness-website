/** Single source of truth for the "Choose Your Coach" step shown after registration.
 *  Update names/numbers here — nothing else in the app hardcodes a coach or WhatsApp number. */

export interface Coach {
  id: string;
  name: string;
  /** E.164 format, digits only (no "+", spaces, or dashes) — e.g. "919876543210". */
  whatsappNumber: string;
}

export const COACHES: Coach[] = [
  { id: "coach-a", name: "Coach A", whatsappNumber: "911234567890" },
  { id: "coach-b", name: "Coach B", whatsappNumber: "919876543210" },
];

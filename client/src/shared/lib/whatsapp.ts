import type { Coach } from "@shared/config/coaches";

export interface RegistrationDetails {
  name: string;
  email: string;
  mobile: string;
  /** Already-uppercased program abbreviation, e.g. "BFT" or "CST". */
  program: string;
}

function buildMessage(details: RegistrationDetails): string {
  return [
    "Hello Coach,",
    "",
    "I have registered on Elev8.",
    "",
    `Name: ${details.name}`,
    `Email: ${details.email}`,
    `Phone: ${details.mobile}`,
    `Selected Program: ${details.program}`,
    "",
    "I would like to continue with my registration.",
    "",
    "Thank you.",
  ].join("\n");
}

/** Builds a wa.me link that opens WhatsApp with the registration handoff message prefilled. */
export function buildCoachWhatsAppUrl(coach: Coach, details: RegistrationDetails): string {
  const text = encodeURIComponent(buildMessage(details));
  return `https://wa.me/${coach.whatsappNumber}?text=${text}`;
}

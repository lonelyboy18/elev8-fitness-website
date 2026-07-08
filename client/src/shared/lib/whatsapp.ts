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

/** Generic wa.me deep link — the low-level building block every coach-contact CTA uses. */
export function buildWhatsAppLink(whatsappNumber: string, message: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Builds a wa.me link that opens WhatsApp with the registration handoff message prefilled. */
export function buildCoachWhatsAppUrl(coach: Coach, details: RegistrationDetails): string {
  return buildWhatsAppLink(coach.whatsappNumber, buildMessage(details));
}

/** Message for the Home page's "Book a Free Trial" CTA, used by the coach-selection modal. */
export function buildFreeTrialMessage(coachName: string): string {
  return `Hi ${coachName}!\n\nI'd like to book a free trial at ELEV8.\n\nWhen can I come for my free trial?`;
}

/** Message for the Home page's "Join the Community" CTA, used by the coach-selection modal. */
export function buildJoinCommunityMessage(coachName: string): string {
  return `Hi ${coachName}!\n\nI'd like to join ELEV8 Fitness.\n\nWhen can I join?`;
}

/** Message for a program's "Enroll" WhatsApp CTA (Programs page) — pass the full program name,
 *  e.g. "Bodyweight Functional Training (BFT)". */
export function buildProgramEnrollMessage(coachName: string, programName: string): string {
  return `Hi ${coachName}!\n\nI'd like to enroll in the ${programName} program at ELEV8.\n\nCan you tell me more about the program and how I can get started?`;
}

/** Message for the Programs page's "Not sure where to start?" CTA. */
export function buildProgramGuidanceMessage(coachName: string): string {
  return `Hi ${coachName}!\n\nI'm interested in joining ELEV8, but I'm not sure which program is right for me.\n\nCould you guide me and recommend the best program based on my goals?\n\nThank you!`;
}

/** Message for the Gallery page's "Book a Free Trial" CTA. */
export function buildGalleryTrialMessage(coachName: string): string {
  return `Hi ${coachName}!\n\nI was looking through the Elev8 gallery and I'd love to experience a session myself.\n\nI'd like to book a free trial.\n\nWhen can I come?`;
}

/** Message for the Contact page's general enquiry WhatsApp CTAs. */
export function buildEnquiryMessage(coachName: string): string {
  return `Hi ${coachName}!\n\nI have an enquiry regarding ELEV8 Fitness.\n\nI'd like to know more about your programs and memberships.\n\nCould you please help me?\n\nThank you!`;
}

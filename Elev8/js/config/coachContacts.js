// Single source of truth for the "Choose Your Coach" modal shown on Home page CTAs
// ("Book a Free Trial" / "Join the Community"). Update names, roles or numbers here —
// nothing else on the site hardcodes a coach or WhatsApp number for this flow.
// whatsappNumber is E.164 format, digits only (no "+", spaces, or dashes).
var ELEV8_COACH_CONTACTS = [
  { id: 'raj', name: 'Raj', role: 'Head Coach', phoneDisplay: '+91 70661 31474', whatsappNumber: '917066131474' },
  { id: 'nimay', name: 'Nimay', role: 'Coach', phoneDisplay: '+91 91689 80624', whatsappNumber: '919168980624' }
];

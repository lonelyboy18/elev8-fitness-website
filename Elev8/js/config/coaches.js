// Single source of truth for the "Choose Your Coach" step shown after registration.
// Update names/numbers here — nothing else in the site hardcodes a coach or WhatsApp number.
// whatsappNumber is E.164 format, digits only (no "+", spaces, or dashes) — e.g. "919876543210".
var ELEV8_COACHES = [
  { id: 'coach-a', name: 'Coach A', whatsappNumber: '911234567890' },
  { id: 'coach-b', name: 'Coach B', whatsappNumber: '919876543210' }
];

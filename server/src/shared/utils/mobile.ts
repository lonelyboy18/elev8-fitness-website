/** Ports helpers.php isValidMobile()/cleanMobile() — 10-digit Indian mobile, optional 91/+91 prefix. */
function stripToDigits(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  return digits;
}

export function isValidMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(stripToDigits(mobile));
}

export function cleanMobile(mobile: string): string {
  return stripToDigits(mobile);
}

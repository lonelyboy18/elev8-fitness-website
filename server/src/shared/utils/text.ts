/**
 * Trims and strips control characters. Unlike the legacy PHP `sanitize()` this does NOT
 * HTML-escape — responses are JSON consumed by React, which escapes on render, so
 * double-escaping would corrupt names like "O'Brien" into "O&#039;Brien" in the UI.
 */
export function cleanText(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

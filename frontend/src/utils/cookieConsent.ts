export type ConsentState = {
  essential: boolean;
  functional: boolean;
};

export const CONSENT_KEY = "luxurycars_cookie_consent";
export const CONSENT_VERSION = "1.0";

export function getCookieConsent(): (ConsentState & { version: string }) | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveCookieConsent(consent: ConsentState) {
  localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({ ...consent, version: CONSENT_VERSION }),
  );
}

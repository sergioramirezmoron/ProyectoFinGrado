/**
 * Format a vehicle price for display (no decimals, returns "Consultar" if falsy).
 */
export const formatPrice = (amount: number | string | undefined | null): string => {
  if (!amount) return "Consultar";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

/**
 * Format a monetary amount with full decimals (for totals, reservation prices, etc.)
 */
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);

/**
 * Format a date string to "day month year" in Spanish (e.g. "25 mar. 2026").
 */
export const formatDate = (d: string): string =>
  d
    ? new Date(d).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

/**
 * Format a date string to "day month hour:minute" in Spanish (e.g. "25 mar. 14:30").
 */
export const formatDateTime = (d: string): string =>
  d
    ? new Date(d).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

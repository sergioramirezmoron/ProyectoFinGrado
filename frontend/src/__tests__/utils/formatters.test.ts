import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "../../utils/formatters";

describe("formatPrice", () => {
  it("returns 'Consultar' for null", () => {
    expect(formatPrice(null)).toBe("Consultar");
  });

  it("returns 'Consultar' for undefined", () => {
    expect(formatPrice(undefined)).toBe("Consultar");
  });

  it("returns 'Consultar' for 0 (falsy)", () => {
    expect(formatPrice(0)).toBe("Consultar");
  });

  it("returns 'Consultar' for empty string", () => {
    expect(formatPrice("")).toBe("Consultar");
  });

  it("formats a numeric value as EUR currency without decimals", () => {
    const result = formatPrice(25000);
    expect(result).toContain("25");
    expect(result).toContain("€");
    expect(result).not.toContain(",");
  });

  it("formats a string numeric value", () => {
    const result = formatPrice("35000");
    expect(result).toContain("35");
    expect(result).toContain("€");
  });

  it("formats large amounts with thousands separator", () => {
    const result = formatPrice(1000000);
    expect(result).toContain("€");
    expect(result).toMatch(/1[.,\s]000[.,\s]000/);
  });

  it("formats small amounts correctly", () => {
    const result = formatPrice(500);
    expect(result).toContain("500");
    expect(result).toContain("€");
  });

  it("formats string '0' as a currency value (truthy string, not falsy)", () => {
    // "0" is a non-empty string → truthy → formatted as currency, not "Consultar"
    const result = formatPrice("0");
    expect(result).toContain("€");
  });

  it("formats decimal string value", () => {
    const result = formatPrice("21.50");
    expect(result).toContain("€");
    // 0 maximumFractionDigits → no decimals
    expect(result).not.toMatch(/\d+,\d+\s€/);
  });
});

describe("formatCurrency", () => {
  it("formats amount with full decimals", () => {
    const result = formatCurrency(105.5);
    expect(result).toContain("105");
    expect(result).toContain("€");
  });

  it("formats zero correctly", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
    expect(result).toContain("€");
  });

  it("formats integer as currency with 2 decimal places", () => {
    const result = formatCurrency(100);
    expect(result).toContain("100");
    expect(result).toContain("€");
  });

  it("formats amount with many decimal places rounded to 2", () => {
    const result = formatCurrency(99.999);
    expect(result).toContain("100");
    expect(result).toContain("€");
  });

  it("formats negative amounts", () => {
    const result = formatCurrency(-50);
    expect(result).toContain("50");
    expect(result).toContain("€");
  });
});

describe("formatDate", () => {
  it("returns empty string for empty input", () => {
    expect(formatDate("")).toBe("");
  });

  it("formats a valid ISO date string", () => {
    const result = formatDate("2026-03-19T15:30:00+01:00");
    expect(result).toContain("2026");
    expect(result).toContain("19");
    expect(result.length).toBeGreaterThan(4);
  });

  it("formats January date correctly", () => {
    const result = formatDate("2026-01-15T00:00:00+00:00");
    expect(result).toContain("2026");
    expect(result).toContain("15");
  });

  it("formats December date correctly", () => {
    const result = formatDate("2026-12-31T00:00:00+00:00");
    expect(result).toContain("2026");
    expect(result).toContain("31");
  });

  it("does not include time components in output", () => {
    const result = formatDate("2026-03-19T15:30:00+01:00");
    expect(result).not.toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("formatDateTime", () => {
  it("returns empty string for empty input", () => {
    expect(formatDateTime("")).toBe("");
  });

  it("formats a valid ISO datetime string", () => {
    const result = formatDateTime("2026-03-19T15:30:00+01:00");
    expect(result).toContain("19");
    expect(result.length).toBeGreaterThan(4);
  });

  it("includes time components in output", () => {
    const result = formatDateTime("2026-03-19T15:30:00+01:00");
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it("formats midnight correctly", () => {
    const result = formatDateTime("2026-03-19T00:00:00+00:00");
    expect(result).toContain("19");
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

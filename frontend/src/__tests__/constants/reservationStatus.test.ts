import { describe, it, expect } from "vitest";
import {
  RESERVATION_STATUS_CONFIG,
  RESERVATION_STATUS_OPTIONS,
  isReservationActiveToday,
  isReservationExpired,
} from "../../constants/reservationStatus";
import type { Reservation } from "../../types/reservation";

// Helper to build a reservation with dynamic dates
const makeReservation = (
  status: string,
  startDaysOffset: number,
  endDaysOffset: number
): Reservation => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + startDaysOffset);

  const end = new Date();
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + endDaysOffset);

  return {
    id: 1,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    totalPrice: 100,
    status,
  };
};

describe("RESERVATION_STATUS_CONFIG", () => {
  it("contains all four statuses", () => {
    expect(RESERVATION_STATUS_CONFIG).toHaveProperty("PENDING");
    expect(RESERVATION_STATUS_CONFIG).toHaveProperty("CONFIRMED");
    expect(RESERVATION_STATUS_CONFIG).toHaveProperty("REJECTED");
    expect(RESERVATION_STATUS_CONFIG).toHaveProperty("CANCELLED");
  });

  it("PENDING has correct label and longLabel", () => {
    expect(RESERVATION_STATUS_CONFIG.PENDING.label).toBe("Pendiente");
    expect(RESERVATION_STATUS_CONFIG.PENDING.longLabel).toBe(
      "Pendiente de confirmación"
    );
  });

  it("CONFIRMED has correct label and combined classes", () => {
    expect(RESERVATION_STATUS_CONFIG.CONFIRMED.label).toBe("Confirmada");
    expect(RESERVATION_STATUS_CONFIG.CONFIRMED.combined).toContain("green");
  });

  it("REJECTED has correct label and combined classes", () => {
    expect(RESERVATION_STATUS_CONFIG.REJECTED.label).toBe("Rechazada");
    expect(RESERVATION_STATUS_CONFIG.REJECTED.combined).toContain("red");
  });

  it("CANCELLED has correct label and combined classes", () => {
    expect(RESERVATION_STATUS_CONFIG.CANCELLED.label).toBe("Cancelada");
    expect(RESERVATION_STATUS_CONFIG.CANCELLED.combined).toContain("slate");
  });

  it("PENDING has yellow color", () => {
    expect(RESERVATION_STATUS_CONFIG.PENDING.combined).toContain("yellow");
  });

  it("each status has an icon defined", () => {
    Object.values(RESERVATION_STATUS_CONFIG).forEach((cfg) => {
      expect(cfg.icon).toBeDefined();
    });
  });
});

describe("RESERVATION_STATUS_OPTIONS", () => {
  it("has exactly 5 options", () => {
    expect(RESERVATION_STATUS_OPTIONS).toHaveLength(5);
  });

  it("first option is 'Todos' with empty value", () => {
    expect(RESERVATION_STATUS_OPTIONS[0]).toEqual({ value: "", label: "Todos" });
  });

  it("includes PENDING option", () => {
    expect(RESERVATION_STATUS_OPTIONS).toContainEqual({
      value: "PENDING",
      label: "Pendiente",
    });
  });

  it("includes CONFIRMED option", () => {
    expect(RESERVATION_STATUS_OPTIONS).toContainEqual({
      value: "CONFIRMED",
      label: "Confirmada",
    });
  });

  it("includes REJECTED option", () => {
    expect(RESERVATION_STATUS_OPTIONS).toContainEqual({
      value: "REJECTED",
      label: "Rechazada",
    });
  });

  it("includes CANCELLED option", () => {
    expect(RESERVATION_STATUS_OPTIONS).toContainEqual({
      value: "CANCELLED",
      label: "Cancelada",
    });
  });
});

describe("isReservationActiveToday", () => {
  it("returns false for PENDING status even if dates are current", () => {
    const r = makeReservation("PENDING", -1, 1);
    expect(isReservationActiveToday(r)).toBe(false);
  });

  it("returns false for REJECTED status", () => {
    const r = makeReservation("REJECTED", -1, 1);
    expect(isReservationActiveToday(r)).toBe(false);
  });

  it("returns false for CANCELLED status", () => {
    const r = makeReservation("CANCELLED", -1, 1);
    expect(isReservationActiveToday(r)).toBe(false);
  });

  it("returns true for CONFIRMED reservation active today (started yesterday, ends tomorrow)", () => {
    const r = makeReservation("CONFIRMED", -1, 1);
    expect(isReservationActiveToday(r)).toBe(true);
  });

  it("returns true for CONFIRMED reservation that starts and ends today", () => {
    const r = makeReservation("CONFIRMED", 0, 0);
    expect(isReservationActiveToday(r)).toBe(true);
  });

  it("returns false for CONFIRMED reservation entirely in the past", () => {
    const r = makeReservation("CONFIRMED", -10, -5);
    expect(isReservationActiveToday(r)).toBe(false);
  });

  it("returns false for CONFIRMED reservation entirely in the future", () => {
    const r = makeReservation("CONFIRMED", 5, 10);
    expect(isReservationActiveToday(r)).toBe(false);
  });

  it("returns true when reservation started today and ends in the future", () => {
    const r = makeReservation("CONFIRMED", 0, 5);
    expect(isReservationActiveToday(r)).toBe(true);
  });

  it("returns true when reservation started in the past and ends today", () => {
    const r = makeReservation("CONFIRMED", -5, 0);
    expect(isReservationActiveToday(r)).toBe(true);
  });
});

describe("isReservationExpired", () => {
  it("returns true when end date is before today", () => {
    const r = makeReservation("PENDING", -10, -5);

    expect(isReservationExpired(r)).toBe(true);
  });

  it("returns false when end date is today", () => {
    const r = makeReservation("PENDING", -2, 0);

    expect(isReservationExpired(r)).toBe(false);
  });

  it("returns false when end date is in the future", () => {
    const r = makeReservation("PENDING", 1, 5);

    expect(isReservationExpired(r)).toBe(false);
  });
});

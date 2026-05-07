import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "../../utils/apiErrors";

describe("getApiErrorMessage", () => {
  it("returns detail from API Platform errors", () => {
    expect(
      getApiErrorMessage(
        { response: { data: { detail: "No se puede confirmar." } } },
        "Fallback",
      ),
    ).toBe("No se puede confirmar.");
  });

  it("returns the first validation violation message", () => {
    expect(
      getApiErrorMessage(
        {
          response: {
            data: { violations: [{ message: "Fecha no valida" }] },
          },
        },
        "Fallback",
      ),
    ).toBe("Fecha no valida");
  });

  it("falls back when the error shape is unknown", () => {
    expect(getApiErrorMessage(new Error("Network"), "Fallback")).toBe("Fallback");
  });
});

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import api from "../../api/axios";

describe("api/axios instance", () => {
  it("has baseURL set to /api", () => {
    expect(api.defaults.baseURL).toBe("/api");
  });

  it("is an axios instance with get, post, patch, delete methods", () => {
    expect(typeof api.get).toBe("function");
    expect(typeof api.post).toBe("function");
    expect(typeof api.patch).toBe("function");
    expect(typeof api.delete).toBe("function");
  });

  it("has a request interceptor registered", () => {
    // Axios stores interceptors internally; verify at least one handler is registered
    const handlers = (api.interceptors.request as unknown as { handlers: unknown[] }).handlers;
    const active = handlers.filter((h) => h !== null);
    expect(active.length).toBeGreaterThanOrEqual(1);
  });
});

describe("request interceptor — Authorization header", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("adds Authorization header when token is in localStorage", () => {
    localStorage.setItem("token", "test-jwt-token");

    const handlers = (
      api.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (cfg: object) => object } | null>;
      }
    ).handlers;
    const handler = handlers.find((h) => h !== null)!;

    const config = { headers: {} as Record<string, string> };
    const result = handler.fulfilled(config) as { headers: Record<string, string> };

    expect(result.headers["Authorization"]).toBe("Bearer test-jwt-token");
  });

  it("does not add Authorization header when no token in localStorage", () => {
    const handlers = (
      api.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (cfg: object) => object } | null>;
      }
    ).handlers;
    const handler = handlers.find((h) => h !== null)!;

    const config = { headers: {} as Record<string, string> };
    const result = handler.fulfilled(config) as { headers: Record<string, string> };

    expect(result.headers["Authorization"]).toBeUndefined();
  });

  it("uses the token value exactly as stored", () => {
    const token = "eyJhbGciOiJSUzI1NiJ9.eyJ1c2VybmFtZSI6InRlc3QifQ.signature";
    localStorage.setItem("token", token);

    const handlers = (
      api.interceptors.request as unknown as {
        handlers: Array<{ fulfilled: (cfg: object) => object } | null>;
      }
    ).handlers;
    const handler = handlers.find((h) => h !== null)!;

    const config = { headers: {} as Record<string, string> };
    const result = handler.fulfilled(config) as { headers: Record<string, string> };

    expect(result.headers["Authorization"]).toBe(`Bearer ${token}`);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginUser, registerUser } from "../../services/authService";
import type { RegisterData } from "../../types/auth";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "../../api/axios";

describe("loginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls POST /login_check with email and password", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { token: "abc.def.ghi" } });

    await loginUser("user@example.com", "password123");

    expect(api.post).toHaveBeenCalledWith("/login_check", {
      email: "user@example.com",
      password: "password123",
    });
  });

  it("returns the server response", async () => {
    const mockToken = "header.payload.signature";
    vi.mocked(api.post).mockResolvedValueOnce({ data: { token: mockToken } });

    const res = await loginUser("admin@example.com", "admin123");

    expect((res as { data: { token: string } }).data.token).toBe(mockToken);
  });

  it("propagates errors from the API", async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error("Invalid credentials"));

    await expect(loginUser("wrong@example.com", "wrongpass")).rejects.toThrow(
      "Invalid credentials"
    );
  });

  it("calls POST exactly once per invocation", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { token: "tok" } });

    await loginUser("a@b.com", "p");

    expect(api.post).toHaveBeenCalledTimes(1);
  });
});

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const registerData: RegisterData = {
    email: "new@example.com",
    plainPassword: "secure123",
    name: "Ana",
    surname: "García",
    phone: "666111222",
    province: "/api/provinces/8",
  };

  it("calls POST /users with the registration data", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 1, email: "new@example.com" } });

    await registerUser(registerData);

    expect(api.post).toHaveBeenCalledWith("/users", registerData);
  });

  it("returns the created user response", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { id: 52, email: "new@example.com", roles: ["ROLE_USER"] },
    });

    const res = await registerUser(registerData);

    expect((res as { data: { id: number } }).data.id).toBe(52);
  });

  it("propagates API errors on registration", async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error("Email already exists"));

    await expect(registerUser(registerData)).rejects.toThrow("Email already exists");
  });
});

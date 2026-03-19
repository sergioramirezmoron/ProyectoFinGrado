import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useContext } from "react";
import { AuthProvider } from "../../context/AuthContext";
import AuthContext from "../../context/AuthContext";

// Helper: create a fake JWT (jwt-decode only decodes, doesn't verify signature)
const toBase64Url = (str: string) =>
  btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

const createFakeToken = (payload: object) => {
  const header = toBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = toBase64Url(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
};

const futureExp = () => Math.floor(Date.now() / 1000) + 3600;
const pastExp = () => Math.floor(Date.now() / 1000) - 3600;

const validToken = createFakeToken({
  username: "test@example.com",
  roles: ["ROLE_USER"],
  exp: futureExp(),
  iat: Math.floor(Date.now() / 1000),
  id: 1,
  name: "Test User",
  phone: "666000111",
});

const adminToken = createFakeToken({
  username: "admin@example.com",
  roles: ["ROLE_ADMIN"],
  exp: futureExp(),
  iat: Math.floor(Date.now() / 1000),
  id: 2,
  name: "Admin User",
});

const salesToken = createFakeToken({
  username: "sales@example.com",
  roles: ["ROLE_SALES"],
  exp: futureExp(),
  iat: Math.floor(Date.now() / 1000),
  id: 3,
  name: "Sales User",
});

const expiredToken = createFakeToken({
  username: "expired@example.com",
  roles: ["ROLE_USER"],
  exp: pastExp(),
  iat: pastExp() - 3600,
  id: 4,
});

// Consumer component that exposes context values
const ContextConsumer = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) return <div>no-context</div>;
  return (
    <div>
      <span data-testid="email">{ctx.user?.email ?? "null"}</span>
      <span data-testid="isAuthenticated">{String(ctx.isAuthenticated)}</span>
      <span data-testid="isAdmin">{String(ctx.isAdmin)}</span>
      <span data-testid="token">{ctx.token ?? "null"}</span>
      <span data-testid="name">{ctx.user?.name ?? "null"}</span>
      <button onClick={() => ctx.login(validToken)}>login</button>
      <button onClick={() => ctx.login(adminToken)}>login-admin</button>
      <button onClick={() => ctx.login(salesToken)}>login-sales</button>
      <button onClick={() => ctx.logout()}>logout</button>
      <button onClick={() => ctx.updateUser({ name: "Updated Name" })}>update</button>
    </div>
  );
};

describe("AuthContext — initial state", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("starts unauthenticated when localStorage is empty", () => {
    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("false");
    expect(screen.getByTestId("email").textContent).toBe("null");
    expect(screen.getByTestId("token").textContent).toBe("null");
  });

  it("reads valid token from localStorage on mount", () => {
    localStorage.setItem("token", validToken);
    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");
    expect(screen.getByTestId("email").textContent).toBe("test@example.com");
  });

  it("clears expired token from localStorage on mount", () => {
    localStorage.setItem("token", expiredToken);
    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("false");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("isAdmin is false for ROLE_USER", () => {
    localStorage.setItem("token", validToken);
    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("isAdmin").textContent).toBe("false");
  });

  it("exposes user name from decoded token", () => {
    localStorage.setItem("token", validToken);
    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("name").textContent).toBe("Test User");
  });
});

describe("AuthContext — login()", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("sets user and token after login", async () => {
    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("login").click();
    });

    expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");
    expect(screen.getByTestId("email").textContent).toBe("test@example.com");
  });

  it("persists token to localStorage after login", async () => {
    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("login").click();
    });

    expect(localStorage.getItem("token")).toBe(validToken);
  });

  it("sets isAdmin=true after admin login", async () => {
    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("login-admin").click();
    });

    expect(screen.getByTestId("isAdmin").textContent).toBe("true");
    expect(screen.getByTestId("email").textContent).toBe("admin@example.com");
  });

  it("sets isAdmin=true for ROLE_SALES", async () => {
    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("login-sales").click();
    });

    expect(screen.getByTestId("isAdmin").textContent).toBe("true");
  });
});

describe("AuthContext — logout()", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("clears user and token after logout", async () => {
    localStorage.setItem("token", validToken);
    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("logout").click();
    });

    expect(screen.getByTestId("isAuthenticated").textContent).toBe("false");
    expect(screen.getByTestId("email").textContent).toBe("null");
    expect(screen.getByTestId("token").textContent).toBe("null");
  });

  it("removes token from localStorage after logout", async () => {
    localStorage.setItem("token", validToken);
    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("logout").click();
    });

    expect(localStorage.getItem("token")).toBeNull();
  });
});

describe("AuthContext — updateUser()", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("updates user fields without re-login", async () => {
    localStorage.setItem("token", validToken);
    render(
      <AuthProvider>
        <ContextConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("update").click();
    });

    expect(screen.getByTestId("name").textContent).toBe("Updated Name");
    expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");
  });
});

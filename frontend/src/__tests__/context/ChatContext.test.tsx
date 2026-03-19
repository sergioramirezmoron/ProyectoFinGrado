import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import { ChatProvider } from "../../context/ChatContext";
import ChatContext from "../../context/ChatContext";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";

const baseAuthValue = {
  isAuthenticated: true,
  isAdmin: false,
  token: "fake-token",
  login: vi.fn(),
  logout: vi.fn(),
  updateUser: vi.fn(),
};

const ContextConsumer = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) return <div>no-context</div>;
  return (
    <div>
      <span data-testid="unread">{ctx.unreadCount}</span>
    </div>
  );
};

describe("ChatContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders children", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthValue,
      user: null,
    });

    render(
      <ChatProvider>
        <div>child</div>
      </ChatProvider>
    );

    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("sets unreadCount=0 when user is null (no API call)", async () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthValue,
      user: null,
    });

    render(
      <ChatProvider>
        <ContextConsumer />
      </ChatProvider>
    );

    // Should be 0 immediately since user is null
    expect(screen.getByTestId("unread").textContent).toBe("0");
    expect(api.get).not.toHaveBeenCalled();
  });

  it("fetches unread count using staff URL for admin user", async () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthValue,
      user: {
        id: 1,
        "@id": "/api/users/1",
        email: "admin@example.com",
        roles: ["ROLE_ADMIN"],
        name: "Admin",
      },
    });
    vi.mocked(api.get).mockResolvedValue({ data: { totalItems: 5 } });

    render(
      <ChatProvider>
        <ContextConsumer />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("NEW_FROM_CLIENT")
      );
    });
  });

  it("fetches unread count using user URL for regular user", async () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthValue,
      user: {
        id: 3,
        "@id": "/api/users/3",
        email: "user@example.com",
        roles: ["ROLE_USER"],
        name: "User",
      },
    });
    vi.mocked(api.get).mockResolvedValue({ data: { totalItems: 2 } });

    render(
      <ChatProvider>
        <ContextConsumer />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("NEW_FROM_ADMIN")
      );
    });
  });

  it("updates unreadCount from API totalItems", async () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthValue,
      user: {
        id: 1,
        "@id": "/api/users/1",
        email: "admin@example.com",
        roles: ["ROLE_ADMIN"],
        name: "Admin",
      },
    });
    vi.mocked(api.get).mockResolvedValue({ data: { totalItems: 7 } });

    render(
      <ChatProvider>
        <ContextConsumer />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("unread").textContent).toBe("7");
    });
  });

  it("includes contactEmail in URL for regular users", async () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthValue,
      user: {
        id: 3,
        "@id": "/api/users/3",
        email: "user@example.com",
        roles: ["ROLE_USER"],
        name: "User",
      },
    });
    vi.mocked(api.get).mockResolvedValue({ data: { totalItems: 0 } });

    render(
      <ChatProvider>
        <ContextConsumer />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("contactEmail=user@example.com")
      );
    });
  });

  it("polls every 10 seconds using setInterval", async () => {
    // Only fake setInterval/clearInterval so waitFor still works with real setTimeout
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });

    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthValue,
      user: {
        id: 1,
        "@id": "/api/users/1",
        email: "admin@example.com",
        roles: ["ROLE_ADMIN"],
        name: "Admin",
      },
    });
    vi.mocked(api.get).mockResolvedValue({ data: { totalItems: 3 } });

    render(
      <ChatProvider>
        <ContextConsumer />
      </ChatProvider>
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));

    await vi.advanceTimersByTimeAsync(10000);
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));

    await vi.advanceTimersByTimeAsync(10000);
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(3));
  });

  it("ROLE_SALES user uses staff URL", async () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthValue,
      user: {
        id: 5,
        "@id": "/api/users/5",
        email: "sales@example.com",
        roles: ["ROLE_SALES"],
        name: "Sales",
      },
    });
    vi.mocked(api.get).mockResolvedValue({ data: { totalItems: 2 } });

    render(
      <ChatProvider>
        <ContextConsumer />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("NEW_FROM_CLIENT")
      );
    });
  });
});

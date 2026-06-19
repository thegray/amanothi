import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("~/db/queries/auth", () => ({
  findOrCreateUser: vi.fn(),
  getUserById: vi.fn(),
}));

const TEST_SECRET = "test-secret-at-least-32-chars-for-hs256!!";
const TEST_CLIENT_ID = "test-client-id";
const TEST_CLIENT_SECRET = "test-client-secret";
const TEST_REDIRECT_URI = "http://localhost:5173/login/oauth";

beforeEach(() => {
  process.env.VITE_SESSION_SECRET = TEST_SECRET;
  process.env.VITE_GOOGLE_CLIENT_ID = TEST_CLIENT_ID;
  process.env.VITE_GOOGLE_CLIENT_SECRET = TEST_CLIENT_SECRET;
  process.env.VITE_GOOGLE_REDIRECT_URI = TEST_REDIRECT_URI;
});

afterEach(() => {
  delete process.env.VITE_SESSION_SECRET;
  delete process.env.VITE_GOOGLE_CLIENT_ID;
  delete process.env.VITE_GOOGLE_CLIENT_SECRET;
  delete process.env.VITE_GOOGLE_REDIRECT_URI;
  vi.restoreAllMocks();
});

const {
  getGoogleOAuthURL,
  getGoogleTokens,
  getGoogleUser,
  createSessionToken,
  getUserIdFromSession,
  findOrCreateUser,
  getUserById,
} = await import("./services");

describe("getGoogleOAuthURL", () => {
  it("returns a valid Google OAuth URL", () => {
    const url = getGoogleOAuthURL();

    expect(url).toContain("accounts.google.com");
    expect(url).toContain("client_id=" + TEST_CLIENT_ID);
    expect(url).toContain("redirect_uri=" + encodeURIComponent(TEST_REDIRECT_URI));
    expect(url).toContain("response_type=code");
    expect(url).toContain("scope=openid+email+profile");
  });
});

describe("getGoogleTokens", () => {
  it("returns tokens on success", async () => {
    const tokenResponse = {
      access_token: "access123",
      id_token: "id123",
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(tokenResponse), { status: 200 }),
    );

    const result = await getGoogleTokens("auth-code");

    expect(result.access_token).toBe("access123");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://oauth2.googleapis.com/token",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws on error response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("bad request", { status: 400 }),
    );

    await expect(getGoogleTokens("bad-code")).rejects.toThrow(
      "Google token exchange failed",
    );
  });
});

describe("getGoogleUser", () => {
  it("returns user info on success", async () => {
    const googleUser = {
      id: "123",
      email: "user@gmail.com",
      name: "Test User",
      picture: "https://example.com/pic.jpg",
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(googleUser), { status: 200 }),
    );

    const result = await getGoogleUser("access123");

    expect(result.email).toBe("user@gmail.com");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      expect.objectContaining({
        headers: { Authorization: "Bearer access123" },
      }),
    );
  });

  it("throws on error response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("unauthorized", { status: 401 }),
    );

    await expect(getGoogleUser("bad-token")).rejects.toThrow(
      "Failed to fetch Google user",
    );
  });
});

describe("createSessionToken", () => {
  it("returns a signed JWT string", async () => {
    const token = await createSessionToken(BigInt(42));

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });
});

describe("getUserIdFromSession", () => {
  it("returns userId from valid cookie", async () => {
    const token = await createSessionToken(BigInt(42));

    const mockCookie = { value: token };
    const mockEvent = {
      cookie: { get: vi.fn(() => mockCookie) },
    } as any;

    const userId = await getUserIdFromSession(mockEvent);

    expect(userId).toBe(BigInt(42));
  });

  it("returns null when no session cookie", async () => {
    const mockEvent = {
      cookie: { get: vi.fn(() => null) },
    } as any;

    const userId = await getUserIdFromSession(mockEvent);

    expect(userId).toBeNull();
  });

  it("returns null when cookie is invalid", async () => {
    const mockEvent = {
      cookie: { get: vi.fn(() => ({ value: "not-a-jwt" })) },
    } as any;

    const userId = await getUserIdFromSession(mockEvent);

    expect(userId).toBeNull();
  });

  it("throws when VITE_SESSION_SECRET is missing", async () => {
    delete process.env.VITE_SESSION_SECRET;

    await expect(createSessionToken(BigInt(1))).rejects.toThrow(
      "VITE_SESSION_SECRET",
    );
  });
});

describe("re-exports from queries", () => {
  it("re-exports findOrCreateUser and getUserById", () => {
    expect(findOrCreateUser).toBeDefined();
    expect(getUserById).toBeDefined();
  });
});

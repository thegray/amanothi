import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  user: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

vi.mock("~/lib/prisma", () => ({
  getPrismaClient: () => mockPrisma,
}));

const { findOrCreateUser, findUserByEmail, createUser, getUserById } = await import("./auth");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("findOrCreateUser", () => {
  it("creates a new user from Google data", async () => {
    mockPrisma.user.upsert.mockResolvedValue({ id: BigInt(1) });

    const result = await findOrCreateUser({
      id: "google1",
      email: "new@example.com",
      name: "New User",
      picture: "https://example.com/pic.jpg",
    });

    expect(result).toEqual({ id: BigInt(1) });
    expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
      where: { email: "new@example.com" },
      update: expect.objectContaining({
        displayName: "New User",
        tokenVersion: { increment: 1 },
      }),
      create: expect.objectContaining({
        email: "new@example.com",
        displayName: "New User",
        passwordHash: null,
        tokenVersion: 1,
      }),
    });
  });

  it("updates an existing user on re-login", async () => {
    mockPrisma.user.upsert.mockResolvedValue({ id: BigInt(42) });

    const result = await findOrCreateUser({
      id: "google1",
      email: "existing@example.com",
      name: "Updated Name",
      picture: "https://example.com/pic.jpg",
    });

    expect(result).toEqual({ id: BigInt(42) });
    expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
      where: { email: "existing@example.com" },
      update: expect.objectContaining({
        displayName: "Updated Name",
        tokenVersion: { increment: 1 },
      }),
      create: expect.objectContaining({ email: "existing@example.com" }),
    });
  });
});

describe("findUserByEmail", () => {
  it("returns user when found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: BigInt(1),
      email: "test@example.com",
      displayName: "Test User",
      passwordHash: "hashed_pw",
      tokenVersion: 3,
    });

    const result = await findUserByEmail("test@example.com");

    expect(result).toEqual({
      id: BigInt(1),
      email: "test@example.com",
      displayName: "Test User",
      passwordHash: "hashed_pw",
      tokenVersion: 3,
    });
  });

  it("returns null when not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const result = await findUserByEmail("missing@example.com");

    expect(result).toBeNull();
  });

  it("coalesces null passwordHash to empty string", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: BigInt(2),
      email: "oauth@example.com",
      displayName: "OAuth User",
      passwordHash: null,
      tokenVersion: 1,
    });

    const result = await findUserByEmail("oauth@example.com");

    expect(result?.passwordHash).toBe("");
  });
});

describe("createUser", () => {
  it("creates a user with all fields", async () => {
    mockPrisma.user.create.mockResolvedValue({ id: BigInt(5) });

    const result = await createUser({
      email: "new@example.com",
      displayName: "New User",
      passwordHash: "hashed_pw",
    });

    expect(result).toEqual({ id: BigInt(5) });
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "new@example.com",
        displayName: "New User",
        passwordHash: "hashed_pw",
        tokenVersion: 1,
      }),
    });
  });

  it("creates a user without displayName", async () => {
    mockPrisma.user.create.mockResolvedValue({ id: BigInt(6) });

    const result = await createUser({
      email: "bare@example.com",
      passwordHash: "hashed_pw",
    });

    expect(result).toEqual({ id: BigInt(6) });
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "bare@example.com",
        displayName: null,
        passwordHash: "hashed_pw",
      }),
    });
  });
});

describe("getUserById", () => {
  it("returns user when found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: BigInt(1),
      email: "test@example.com",
      displayName: "Test User",
    });

    const result = await getUserById(BigInt(1));

    expect(result).toEqual({
      id: BigInt(1),
      email: "test@example.com",
      displayName: "Test User",
    });
  });

  it("returns null when not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const result = await getUserById(BigInt(999));

    expect(result).toBeNull();
  });
});

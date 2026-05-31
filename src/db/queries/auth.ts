import { getPrismaClient } from "~/lib/prisma";
import type { AuthUser, GoogleUser } from "~/services/auth/types";

export const findOrCreateUser = async (googleUser: GoogleUser): Promise<{ id: bigint }> => {
  const prisma = getPrismaClient();
  const now = Math.floor(Date.now() / 1000);
  const user = await prisma.user.upsert({
    where: { email: googleUser.email },
    update: {
      displayName: googleUser.name,
      tokenVersion: { increment: 1 },
      updatedAt: now,
    },
    create: {
      email: googleUser.email,
      displayName: googleUser.name,
      passwordHash: null,
      tokenVersion: 1,
      createdAt: now,
      updatedAt: now,
    },
  });
  return { id: user.id };
};

export const findUserByEmail = async (
  email: string
): Promise<AuthUser & { passwordHash: string; tokenVersion: number } | null> => {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    passwordHash: user.passwordHash ?? "",
    tokenVersion: user.tokenVersion,
  };
};

export const createUser = async (data: {
  email: string;
  displayName?: string;
  passwordHash: string;
}): Promise<{ id: bigint }> => {
  const prisma = getPrismaClient();
  const now = Math.floor(Date.now() / 1000);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      displayName: data.displayName ?? null,
      passwordHash: data.passwordHash,
      tokenVersion: 1,
      createdAt: now,
      updatedAt: now,
    },
  });
  return { id: user.id };
};

export const getUserById = async (userId: bigint): Promise<AuthUser | null> => {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
};

import { getPrismaClient } from "~/lib/prisma";
import type { GoogleUser, AuthUser } from "~/services/auth/types";

export const findOrCreateUser = async (googleUser: GoogleUser): Promise<{ id: bigint }> => {
  const prisma = getPrismaClient();
  const user = await prisma.user.upsert({
    where: { email: googleUser.email },
    update: {
      name: googleUser.name,
      pictureUrl: googleUser.picture,
      tokenVersion: { increment: 1 },
    },
    create: {
      email: googleUser.email,
      name: googleUser.name,
      pictureUrl: googleUser.picture,
      provider: "google",
      tokenVersion: 1,
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
    name: user.name,
  };
};

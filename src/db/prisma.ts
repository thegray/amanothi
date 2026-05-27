import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrisma() {
  const url = process.env.DATABASE_URL || import.meta.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({
    adapter,
    log: import.meta.env.DEV ? ["query", "warn", "error"] : ["warn", "error"],
  });
}

export const prisma = globalForPrisma.prisma ?? getPrisma();

if (import.meta.env.DEV) globalForPrisma.prisma = prisma;

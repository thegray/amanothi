import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseUrl } from "./database-url";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrisma(): PrismaClient {
  const url = getDatabaseUrl();

  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development"
      ? ["query", "warn", "error"]
      : ["warn", "error"],
  });
}

export function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "development") {
    // Reuse in dev to avoid too many connections
    if (!global.__prisma) {
      global.__prisma = createPrisma();
    }
    return global.__prisma;
  }
  // In production, create a new instance per cold start
  return createPrisma();
}
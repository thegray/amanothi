import "dotenv/config";
import { defineConfig } from "prisma/config";
import { buildDatabaseUrl } from "./src/lib/database-url";

function getDatabaseUrl(): string {
  const host = process.env.DB_HOST;
  if (!host) {
    return "postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public";
  }
  try {
    return buildDatabaseUrl();
  } catch (e) {
    console.error("WARNING: Could not build database URL:", (e as Error).message);
    console.error("Prisma commands requiring DB access (migrate, push) will fail.");
    console.error("Check that DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME are all set.");
    return "postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public";
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: getDatabaseUrl(),
  },
});

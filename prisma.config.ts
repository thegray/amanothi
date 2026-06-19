import "dotenv/config";
import { defineConfig } from "prisma/config";
import { getDatabaseUrl } from "./src/lib/database-url";

function safeGetUrl(): string {
  try {
    return getDatabaseUrl();
  } catch {
    return "postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public";
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: safeGetUrl(),
  },
});

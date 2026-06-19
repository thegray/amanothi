import "dotenv/config";
import { defineConfig } from "prisma/config";
import { buildDatabaseUrl } from "./src/lib/database-url";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DB_HOST
      ? buildDatabaseUrl()
      : "postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public",
  },
});

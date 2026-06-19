export function buildDatabaseUrl(): string {
  const host = process.env.DB_HOST;
  if (!host) throw new Error("DB_HOST is not set");
  const port = process.env.DB_PORT;
  if (!port) throw new Error("DB_PORT is not set");
  const user = process.env.DB_USER;
  if (!user) throw new Error("DB_USER is not set");
  const password = process.env.DB_PASSWORD;
  if (!password) throw new Error("DB_PASSWORD is not set");
  const name = process.env.DB_NAME;
  if (!name) throw new Error("DB_NAME is not set");
  return `postgresql://${user}:${password}@${host}:${port}/${name}?schema=public`;
}

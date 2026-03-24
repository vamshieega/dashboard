import mysql from "mysql2/promise";

/**
 * Aurora MySQL / RDS via mysql2 (promise).
 * Lambda: reuse one connection per warm container (global).
 * RDS Proxy: set DB_HOST to the proxy endpoint (same code path; pooling is on the proxy side).
 */
type GlobalWithMysql = typeof globalThis & {
  __mysqlConnection?: mysql.Connection | null;
};

const g = globalThis as GlobalWithMysql;

/** First non-empty value, trimmed (avoids accidental spaces in .env). */
function envFirst(...names: string[]): string | undefined {
  for (const name of names) {
    const v = process.env[name];
    if (v !== undefined && v !== "") {
      return v.trim();
    }
  }
  return undefined;
}

function requiredEnvFirst(...names: string[]): string {
  const v = envFirst(...names);
  if (v === undefined) {
    throw new Error(
      `Missing required environment variable (set one of): ${names.join(", ")}`
    );
  }
  return v;
}

export async function getConnection(): Promise<mysql.Connection> {
  if (g.__mysqlConnection) {
    try {
      await g.__mysqlConnection.ping();
      return g.__mysqlConnection;
    } catch {
      try {
        await g.__mysqlConnection.end();
      } catch {
        /* ignore */
      }
      g.__mysqlConnection = null;
    }
  }

  const port = process.env.DB_PORT
    ? Number.parseInt(process.env.DB_PORT, 10)
    : 3306;

  const host = requiredEnvFirst("DB_HOST", "Aurora_DB_HOST", "AURORA_DB_HOST");
  const user = requiredEnvFirst("DB_USER", "Aurora_DB_USERNAME", "AURORA_DB_USERNAME");
  const password = requiredEnvFirst(
    "DB_PASSWORD",
    "Aurora_DB_PASSWORD",
    "AURORA_DB_PASSWORD"
  );
  // const database = requiredEnvFirst("DB_NAME", "Aurora_DB_NAME", "AURORA_DB_NAME");

  const resolvedPort = Number.isFinite(port) ? port : 3306;
  console.log("[mysql] Resolved connection settings:", {
    host,
    user,
    // database,
    port: resolvedPort,
  });

  g.__mysqlConnection = await mysql.createConnection({
    // Supports DB_* (Lambda/serverless) or Aurora_* (.env naming)
    host,
    user,
    password,
    // database,
    port: resolvedPort,
    // ssl: process.env.DB_SSL === "true" ? {} : undefined, // enable if Aurora requires TLS
  });

  return g.__mysqlConnection;
}

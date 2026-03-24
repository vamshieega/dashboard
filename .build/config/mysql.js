"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnection = getConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
const g = globalThis;
/** First non-empty value, trimmed (avoids accidental spaces in .env). */
function envFirst(...names) {
    for (const name of names) {
        const v = process.env[name];
        if (v !== undefined && v !== "") {
            return v.trim();
        }
    }
    return undefined;
}
function requiredEnvFirst(...names) {
    const v = envFirst(...names);
    if (v === undefined) {
        throw new Error(`Missing required environment variable (set one of): ${names.join(", ")}`);
    }
    return v;
}
async function getConnection() {
    if (g.__mysqlConnection) {
        try {
            await g.__mysqlConnection.ping();
            return g.__mysqlConnection;
        }
        catch {
            try {
                await g.__mysqlConnection.end();
            }
            catch {
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
    const password = requiredEnvFirst("DB_PASSWORD", "Aurora_DB_PASSWORD", "AURORA_DB_PASSWORD");
    // const database = requiredEnvFirst("DB_NAME", "Aurora_DB_NAME", "AURORA_DB_NAME");
    const resolvedPort = Number.isFinite(port) ? port : 3306;
    console.log("[mysql] Resolved connection settings:", {
        host,
        user,
        // database,
        port: resolvedPort,
    });
    g.__mysqlConnection = await promise_1.default.createConnection({
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
//# sourceMappingURL=mysql.js.map
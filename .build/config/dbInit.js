"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = void 0;
const mysql_1 = require("./mysql");
/**
 * Ensures Aurora MySQL tables exist. Safe on Lambda: uses the same pooled
 * connection as the rest of the app (see mysql.ts).
 * DDL matches dashboard/accessor.ts (notes INSERT/SELECT).
 */
const initializeDatabase = async () => {
    const conn = await (0, mysql_1.getConnection)();
    try {
        await conn.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        type VARCHAR(255),
        to_driver_ids JSON,
        cc_emails JSON,
        subject VARCHAR(255),
        message TEXT,
        gif_url VARCHAR(2048),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        console.log("Database initialized");
    }
    catch (err) {
        console.error("initializeDatabase error:", err);
        throw err;
    }
};
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=dbInit.js.map
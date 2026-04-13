import { getConnection } from "./mysql";

/**
 * Ensures Aurora MySQL tables exist. Safe on Lambda: uses the same pooled
 * connection as the rest of the app (see mysql.ts).
 * Recipients and CC are normalized (no JSON columns on notes).
 */
export const initializeDatabase = async (): Promise<void> => {
  const conn = await getConnection();

  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        type VARCHAR(255),
        subject VARCHAR(255),
        message TEXT,
        gif_url VARCHAR(2048),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS note_recipients (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        note_id INT NOT NULL,
        driver_id VARCHAR(255) NOT NULL,
        email VARCHAR(512) NOT NULL DEFAULT '',
        name VARCHAR(512) NOT NULL DEFAULT '',
        group_name VARCHAR(512) NOT NULL DEFAULT '',
        group_id VARCHAR(255) NOT NULL DEFAULT '',
        sort_order INT UNSIGNED NOT NULL DEFAULT 0,
        CONSTRAINT fk_note_recipients_note
          FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
        UNIQUE KEY uq_note_recipient_driver (note_id, driver_id),
        KEY idx_note_recipients_note (note_id),
        KEY idx_note_recipients_driver (driver_id),
        KEY idx_note_recipients_group (group_id)
      )
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS note_cc (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        note_id INT NOT NULL,
        cc_ref_id VARCHAR(255) NOT NULL DEFAULT '',
        email VARCHAR(512) NOT NULL DEFAULT '',
        name VARCHAR(512) NOT NULL DEFAULT '',
        sort_order INT UNSIGNED NOT NULL DEFAULT 0,
        CONSTRAINT fk_note_cc_note
          FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
        UNIQUE KEY uq_note_cc_order (note_id, sort_order),
        KEY idx_note_cc_note (note_id)
      )
    `);

    console.log("Database initialized");
  } catch (err) {
    console.error("initializeDatabase error:", err);
    throw err;
  }
};

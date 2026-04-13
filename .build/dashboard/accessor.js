"use strict";
// import mongoose, { Schema } from "mongoose";
// import type { CreateNotePayload } from "./types";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertNote = insertNote;
exports.findAllNotesSorted = findAllNotesSorted;
exports.deleteNoteById = deleteNoteById;
const mysql_1 = require("../config/mysql");
async function insertNote(payload) {
    const conn = await (0, mysql_1.getConnection)();
    const toDriverJson = JSON.stringify(payload.toDriverIds ?? []);
    const ccJson = JSON.stringify(payload.ccEmails ?? []);
    try {
        const [result] = await conn.execute(`INSERT INTO notes (
        title, description, type, to_driver_ids, cc_emails, subject, message, gif_url
      ) VALUES (?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), ?, ?, ?)`, [
            payload.title ?? null,
            payload.description ?? null,
            payload.type ?? null,
            toDriverJson,
            ccJson,
            payload.subject ?? null,
            payload.message ?? null,
            payload.gifUrl ?? null,
        ]);
        const insertId = result.insertId;
        const [rows] = await conn.execute(`SELECT id, title, description, type, to_driver_ids, cc_emails, subject, message, gif_url, created_at, updated_at
       FROM notes WHERE id = ?`, [insertId]);
        const row = rows[0];
        if (!row) {
            throw new Error("Insert succeeded but row not found");
        }
        return row;
    }
    catch (err) {
        console.error("insertNote:", err);
        throw err;
    }
}
async function findAllNotesSorted() {
    const conn = await (0, mysql_1.getConnection)();
    try {
        const [rows] = await conn.execute(`SELECT id, title, description, type, to_driver_ids, cc_emails, subject, message, gif_url, created_at, updated_at
       FROM notes ORDER BY created_at DESC`);
        return rows;
    }
    catch (err) {
        console.error("findAllNotesSorted:", err);
        throw err;
    }
}
/** Returns number of rows deleted (0 if id did not exist). */
async function deleteNoteById(id) {
    const conn = await (0, mysql_1.getConnection)();
    try {
        const [result] = await conn.execute(`DELETE FROM notes WHERE id = ?`, [id]);
        return result.affectedRows;
    }
    catch (err) {
        console.error("deleteNoteById:", err);
        throw err;
    }
}
//Database
//Query, create different file
//# sourceMappingURL=accessor.js.map
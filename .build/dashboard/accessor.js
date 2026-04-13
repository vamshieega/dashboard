"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertNote = insertNote;
exports.findAllNotesSorted = findAllNotesSorted;
exports.findRecipientsByNoteIds = findRecipientsByNoteIds;
exports.findCcByNoteIds = findCcByNoteIds;
exports.findNoteIdsByDriverId = findNoteIdsByDriverId;
exports.findNoteIdsByGroupId = findNoteIdsByGroupId;
exports.findNotesByIdsSorted = findNotesByIdsSorted;
exports.updateNoteRecipientByPk = updateNoteRecipientByPk;
exports.deleteNoteRecipientByPk = deleteNoteRecipientByPk;
exports.deleteNoteCcByPk = deleteNoteCcByPk;
exports.deleteNoteById = deleteNoteById;
const mysql_1 = require("../config/mysql");
function rowToNoteRow(r) {
    return {
        id: Number(r.id),
        title: r.title ?? null,
        description: r.description ?? null,
        type: r.type ?? null,
        subject: r.subject ?? null,
        message: r.message ?? null,
        gif_url: r.gif_url ?? null,
        created_at: r.created_at,
        updated_at: r.updated_at,
    };
}
function rowToRecipientRow(r) {
    return {
        id: Number(r.id),
        note_id: Number(r.note_id),
        driver_id: String(r.driver_id ?? ""),
        email: String(r.email ?? ""),
        name: String(r.name ?? ""),
        group_name: String(r.group_name ?? ""),
        group_id: String(r.group_id ?? ""),
        sort_order: Number(r.sort_order ?? 0),
    };
}
function rowToCcRow(r) {
    return {
        id: Number(r.id),
        note_id: Number(r.note_id),
        cc_ref_id: String(r.cc_ref_id ?? ""),
        email: String(r.email ?? ""),
        name: String(r.name ?? ""),
        sort_order: Number(r.sort_order ?? 0),
    };
}
async function insertNote(payload) {
    const conn = await (0, mysql_1.getConnection)();
    await conn.beginTransaction();
    try {
        const [result] = await conn.execute(`INSERT INTO notes (
        title, description, type, subject, message, gif_url
      ) VALUES (?, ?, ?, ?, ?, ?)`, [
            payload.title ?? null,
            payload.description ?? null,
            payload.type ?? null,
            payload.subject ?? null,
            payload.message ?? null,
            payload.gifUrl ?? null,
        ]);
        const insertId = result.insertId;
        const recipients = payload.toDriverIds ?? [];
        for (let i = 0; i < recipients.length; i++) {
            const d = recipients[i];
            await conn.execute(`INSERT INTO note_recipients (
          note_id, driver_id, email, name, group_name, group_id, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                insertId,
                d.driverId,
                d.email,
                d.name,
                d.groupName,
                d.groupId,
                i,
            ]);
        }
        const ccs = payload.ccEmails ?? [];
        for (let i = 0; i < ccs.length; i++) {
            const c = ccs[i];
            await conn.execute(`INSERT INTO note_cc (
          note_id, cc_ref_id, email, name, sort_order
        ) VALUES (?, ?, ?, ?, ?)`, [insertId, c.id, c.email, c.name, i]);
        }
        await conn.commit();
        const [rows] = await conn.execute(`SELECT id, title, description, type, subject, message, gif_url, created_at, updated_at
       FROM notes WHERE id = ?`, [insertId]);
        const row = rows[0];
        if (!row) {
            throw new Error("Insert succeeded but row not found");
        }
        return rowToNoteRow(row);
    }
    catch (err) {
        await conn.rollback();
        console.error("insertNote:", err);
        throw err;
    }
}
async function findAllNotesSorted() {
    const conn = await (0, mysql_1.getConnection)();
    try {
        const [rows] = await conn.execute(`SELECT id, title, description, type, subject, message, gif_url, created_at, updated_at
       FROM notes ORDER BY created_at DESC`);
        return rows.map(rowToNoteRow);
    }
    catch (err) {
        console.error("findAllNotesSorted:", err);
        throw err;
    }
}
async function findRecipientsByNoteIds(noteIds) {
    const out = new Map();
    if (noteIds.length === 0)
        return out;
    const conn = await (0, mysql_1.getConnection)();
    const placeholders = noteIds.map(() => "?").join(",");
    const [rows] = await conn.execute(`SELECT id, note_id, driver_id, email, name, group_name, group_id, sort_order
     FROM note_recipients
     WHERE note_id IN (${placeholders})
     ORDER BY note_id ASC, sort_order ASC`, noteIds);
    for (const r of rows) {
        const nr = rowToRecipientRow(r);
        const list = out.get(nr.note_id) ?? [];
        list.push(nr);
        out.set(nr.note_id, list);
    }
    return out;
}
async function findCcByNoteIds(noteIds) {
    const out = new Map();
    if (noteIds.length === 0)
        return out;
    const conn = await (0, mysql_1.getConnection)();
    const placeholders = noteIds.map(() => "?").join(",");
    const [rows] = await conn.execute(`SELECT id, note_id, cc_ref_id, email, name, sort_order
     FROM note_cc
     WHERE note_id IN (${placeholders})
     ORDER BY note_id ASC, sort_order ASC`, noteIds);
    for (const r of rows) {
        const nc = rowToCcRow(r);
        const list = out.get(nc.note_id) ?? [];
        list.push(nc);
        out.set(nc.note_id, list);
    }
    return out;
}
/** Notes where the driver appears as a primary recipient. */
async function findNoteIdsByDriverId(driverId) {
    const conn = await (0, mysql_1.getConnection)();
    const [rows] = await conn.execute(`SELECT DISTINCT note_id FROM note_recipients WHERE driver_id = ?`, [driverId]);
    return rows.map((r) => Number(r.note_id));
}
/** Notes that include a recipient in the given group. */
async function findNoteIdsByGroupId(groupId) {
    const conn = await (0, mysql_1.getConnection)();
    const [rows] = await conn.execute(`SELECT DISTINCT note_id FROM note_recipients WHERE group_id = ?`, [groupId]);
    return rows.map((r) => Number(r.note_id));
}
async function findNotesByIdsSorted(noteIds) {
    if (noteIds.length === 0)
        return [];
    const conn = await (0, mysql_1.getConnection)();
    const placeholders = noteIds.map(() => "?").join(",");
    const [rows] = await conn.execute(`SELECT id, title, description, type, subject, message, gif_url, created_at, updated_at
     FROM notes
     WHERE id IN (${placeholders})
     ORDER BY created_at DESC`, noteIds);
    return rows.map(rowToNoteRow);
}
/** Update fields for one recipient row (by primary key). */
async function updateNoteRecipientByPk(recipientPk, patch) {
    const sets = [];
    const vals = [];
    if (patch.email !== undefined) {
        sets.push("email = ?");
        vals.push(patch.email);
    }
    if (patch.name !== undefined) {
        sets.push("name = ?");
        vals.push(patch.name);
    }
    if (patch.groupName !== undefined) {
        sets.push("group_name = ?");
        vals.push(patch.groupName);
    }
    if (patch.groupId !== undefined) {
        sets.push("group_id = ?");
        vals.push(patch.groupId);
    }
    if (sets.length === 0)
        return 0;
    vals.push(recipientPk);
    const conn = await (0, mysql_1.getConnection)();
    const [result] = await conn.execute(`UPDATE note_recipients SET ${sets.join(", ")} WHERE id = ?`, vals);
    return result.affectedRows;
}
/** Delete one recipient row by primary key. */
async function deleteNoteRecipientByPk(recipientPk) {
    const conn = await (0, mysql_1.getConnection)();
    const [result] = await conn.execute(`DELETE FROM note_recipients WHERE id = ?`, [recipientPk]);
    return result.affectedRows;
}
/** Delete one CC row by primary key. */
async function deleteNoteCcByPk(ccPk) {
    const conn = await (0, mysql_1.getConnection)();
    const [result] = await conn.execute(`DELETE FROM note_cc WHERE id = ?`, [ccPk]);
    return result.affectedRows;
}
/** Returns number of rows deleted (0 if id did not exist). Child rows cascade. */
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
//# sourceMappingURL=accessor.js.map
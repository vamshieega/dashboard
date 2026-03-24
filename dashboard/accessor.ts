// import mongoose, { Schema } from "mongoose";
// import type { CreateNotePayload } from "./types";

// const noteSchema = new Schema(
//   {
//     title: { type: String },
//     description: { type: String },
//     type: { type: String },
//     toDriverIds: { type: [Schema.Types.Mixed], default: [] },
//     ccEmails: { type: [Schema.Types.Mixed], default: [] },
//     subject: { type: String },
//     message: { type: String },
//     gifUrl: { type: String },
//   },
//   { timestamps: true }
// );

// export type NoteDoc = mongoose.InferSchemaType<typeof noteSchema>;

// const Note =
//   (mongoose.models.Note as mongoose.Model<NoteDoc>) ||
//   mongoose.model<NoteDoc>("Note", noteSchema);

// export async function insertNote(payload: CreateNotePayload) {
//   return Note.create(payload);
// }

// export async function findAllNotesSorted() {
//   return Note.find().sort({ createdAt: -1 }).lean().exec();
// }

import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getConnection } from "../config/mysql";
import type { CreateNotePayload, NoteRow } from "./types";

export async function insertNote(payload: CreateNotePayload): Promise<NoteRow> {
  const conn = await getConnection();
  const toDriverJson = JSON.stringify(payload.toDriverIds ?? []);
  const ccJson = JSON.stringify(payload.ccEmails ?? []);

  try {
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO notes (
        title, description, type, to_driver_ids, cc_emails, subject, message, gif_url
      ) VALUES (?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), ?, ?, ?)`,
      [
        payload.title ?? null,
        payload.description ?? null,
        payload.type ?? null,
        toDriverJson,
        ccJson,
        payload.subject ?? null,
        payload.message ?? null,
        payload.gifUrl ?? null,
      ]
    );

    const insertId = result.insertId;
    const [rows] = await conn.execute<RowDataPacket[] & NoteRow[]>(
      `SELECT id, title, description, type, to_driver_ids, cc_emails, subject, message, gif_url, created_at, updated_at
       FROM notes WHERE id = ?`,
      [insertId]
    );

    const row = rows[0];
    if (!row) {
      throw new Error("Insert succeeded but row not found");
    }
    return row as NoteRow;
  } catch (err) {
    console.error("insertNote:", err);
    throw err;
  }
}

export async function findAllNotesSorted(): Promise<NoteRow[]> {
  const conn = await getConnection();

  try {
    const [rows] = await conn.execute<RowDataPacket[] & NoteRow[]>(
      `SELECT id, title, description, type, to_driver_ids, cc_emails, subject, message, gif_url, created_at, updated_at
       FROM notes ORDER BY created_at DESC`
    );
    return rows as NoteRow[];
  } catch (err) {
    console.error("findAllNotesSorted:", err);
    throw err;
  }
}

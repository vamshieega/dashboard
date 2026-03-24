import { connectDB } from "../config/db";
import { initializeDatabase } from "../config/dbInit";
import type { NoteLean, NoteRow } from "./types";
import {
  getDashboardData,
  listNotes,
  saveNote,
  toNoteResponse,
} from "./service";

export const getDashboard = async (req: any, res: any) => {
  const data = await getDashboardData();

  return res.status(200).json(data);
};

export const getUsers = async (req: any, res: any) => {
  try {
    await connectDB();
    return res.status(200).json({
      message: "Users fetched successfully Eegds/. ",
    });
  } catch (err) {
    console.error("getUsers error:", err);
    return res.status(500).json({
      message: "Database connection failed",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

export const createNote = async (req: any, res: any) => {
  const { title, description, type, toDriverIds, ccEmails, subject, message, gifUrl } =
    req.body ?? {};

  try {
    await connectDB();
    const note = await saveNote({
      title,
      description,
      type,
      toDriverIds,
      ccEmails,
      subject,
      message,
      gifUrl,
    });

    return res.status(201).json({
      message: "Note created successfully",
      note: toNoteResponse(note as NoteRow),
    });
  } catch (err) {
    console.error("createNote error:", err);
    return res.status(500).json({
      message: "Failed to create note",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

export const getNotes = async (req: any, res: any) => {
  try {
    console.log("[getNotes] start: connecting to DB");
    await connectDB();
    console.log("[getNotes] connectDB: ok");

    console.log("[getNotes] initializeDatabase: start (ensure tables)");
    await initializeDatabase();
    console.log("[getNotes] initializeDatabase: ok");

    console.log("[getNotes] listNotes: start");
    const rows = await listNotes();
    console.log("[getNotes] listNotes: ok", { rowCount: rows.length });

    const notes = rows.map((row) => toNoteResponse(row as NoteLean | NoteRow));
    console.log("[getNotes] mapped to response notes", { count: notes.length });

    return res.status(200).json({
      message: "Notes fetched successfully",
      count: notes.length,
      notes,
    });
  } catch (err) {
    console.error("getNotes error:", err);
    return res.status(500).json({
      message: "Failed to fetch notes",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

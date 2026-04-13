import { connectDB } from "../config/db";
import { initializeDatabase } from "../config/dbInit";
import {
  deleteNoteById,
  getDashboardData,
  listNotesWithRelations,
  saveNote,
  toNoteResponse,
} from "./service";

export const getDashboard = async (req: any, res: any) => {
  const data = await getDashboardData();

  return res.status(200).set({
    "Access-Control-Allow-Origin": "http://localhost:3000",
  }).json(data);
};

export const getUsers = async (req: any, res: any) => {
  try {
    await connectDB();
    return res.status(200).set({
      "Access-Control-Allow-Origin": "http://localhost:3000",
    }).json({
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

    return res.status(201).set({
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    }).json({
      message: "Note created successfully",
      note: toNoteResponse(note),
    });
  } catch (err) {
    console.error("createNote error:", err);
    return res.status(500)
    .set({
      "Access-Control-Allow-Origin": "http://localhost:3000",
    }).json({
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

    console.log("[getNotes] listNotesWithRelations: start");
    const bundles = await listNotesWithRelations();
    console.log("[getNotes] listNotesWithRelations: ok", { rowCount: bundles.length });

    const notes = bundles.map((b) => toNoteResponse(b));
    console.log("[getNotes] mapped to response notes", { count: notes.length });

    return res.status(200)
    .set({
      "Access-Control-Allow-Origin": "http://localhost:3000",
    }).json({
      message: "Notes fetched successfully",
      count: notes.length,
      notes,
    });
  } catch (err) {
    console.error("getNotes error:", err);
    return res.status(500)
    .set({
      "Access-Control-Allow-Origin": "http://localhost:3000",
    }).json({
      message: "Failed to fetch notes",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};


export const deleteNote = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    await connectDB();
    await initializeDatabase();
    const result = await deleteNoteById(id);
    if (result.invalidId) {
      return res.status(400).json({ message: "Invalid note id" });
    }
    if (!result.deleted) {
      return res.status(404).json({ message: "Note not found" });
    }
    return res.status(200).json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("deleteNote error:", err);
    return res.status(500).json({
      message: "Failed to delete note",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};
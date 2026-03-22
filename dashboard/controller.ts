import { connectDB } from "../config/db";
import type { NoteLean } from "./types";
import {
  getDashboardData,
  listNotes,
  saveNote,
  toNoteResponse,
} from "./service";

export const getDashboard = async (req:any, res:any) => {
  const data = await getDashboardData();

  return res.status(200).json(data);
};

export const getUsers = async (req:any, res:any) => {
  await connectDB();
  return res.status(200).json({
    message: "Users fetched successfully Eegds/. ",
  });
};

export const createNote = async (req:any, res:any) => {
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
      note: toNoteResponse(note.toObject() as NoteLean),
    });
  } catch (err) {
    console.error("createNote error:", err);
    return res.status(500).json({
      message: "Failed to create note",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

export const getNotes = async (req:any, res:any) => {
  try {
    await connectDB();
    const rows = await listNotes();
    const notes = rows.map((row) => toNoteResponse(row as NoteLean));

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

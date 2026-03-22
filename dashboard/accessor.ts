import mongoose, { Schema } from "mongoose";
import type { CreateNotePayload } from "./types";

const noteSchema = new Schema(
  {
    title: { type: String },
    description: { type: String },
    type: { type: String },
    toDriverIds: { type: [Schema.Types.Mixed], default: [] },
    ccEmails: { type: [Schema.Types.Mixed], default: [] },
    subject: { type: String },
    message: { type: String },
    gifUrl: { type: String },
  },
  { timestamps: true }
);

export type NoteDoc = mongoose.InferSchemaType<typeof noteSchema>;

const Note =
  (mongoose.models.Note as mongoose.Model<NoteDoc>) ||
  mongoose.model<NoteDoc>("Note", noteSchema);

export async function insertNote(payload: CreateNotePayload) {
  return Note.create(payload);
}

export async function findAllNotesSorted() {
  return Note.find().sort({ createdAt: -1 }).lean().exec();
}

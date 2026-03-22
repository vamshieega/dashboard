import { findAllNotesSorted, insertNote } from "./accessor";
import type {
  CreateNoteInput,
  CreateNotePayload,
  CcRecipient,
  DriverRecipient,
  NoteLean,
  NoteResponse,
} from "./types";

export const getDashboardData = async () => {
  return {
    message: "Dashboard service working Eega 🚀",
    time: new Date().toISOString(),
  };
};

export type { CcRecipient, CreateNoteInput, DriverRecipient, NoteResponse };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function normalizeToDriverIdsInput(raw: unknown): DriverRecipient[] {
  if (!Array.isArray(raw)) return [];
  const out: DriverRecipient[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      if (item) out.push({ driverId: item, email: "", name: "" });
      continue;
    }
    if (isRecord(item) && item.driverId != null) {
      out.push({
        driverId: String(item.driverId),
        email: item.email != null ? String(item.email) : "",
        name: item.name != null ? String(item.name) : "",
      });
    }
  }
  return out;
}

function normalizeCcEmailsInput(raw: unknown): CcRecipient[] {
  if (!Array.isArray(raw)) return [];
  const out: CcRecipient[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      if (item) out.push({ id: "", email: item, name: "" });
      continue;
    }
    if (isRecord(item)) {
      const id = item.id != null ? String(item.id) : "";
      const email = item.email != null ? String(item.email) : "";
      const name = item.name != null ? String(item.name) : "";
      if (id || email || name) out.push({ id, email, name });
    }
  }
  return out;
}

function driverRecipientFromStored(item: unknown): DriverRecipient {
  if (typeof item === "string") return { driverId: item, email: "", name: "" };
  if (isRecord(item) && item.driverId != null) {
    return {
      driverId: String(item.driverId),
      email: item.email != null ? String(item.email) : "",
      name: item.name != null ? String(item.name) : "",
    };
  }
  return { driverId: "", email: "", name: "" };
}

function ccRecipientFromStored(item: unknown): CcRecipient {
  if (typeof item === "string") return { id: "", email: item, name: "" };
  if (isRecord(item)) {
    return {
      id: item.id != null ? String(item.id) : "",
      email: item.email != null ? String(item.email) : "",
      name: item.name != null ? String(item.name) : "",
    };
  }
  return { id: "", email: "", name: "" };
}

function mapStoredToDriverRecipients(stored: unknown): DriverRecipient[] {
  if (!Array.isArray(stored)) return [];
  return stored
    .map(driverRecipientFromStored)
    .filter((d) => d.driverId || d.email || d.name);
}

function mapStoredToCcRecipients(stored: unknown): CcRecipient[] {
  if (!Array.isArray(stored)) return [];
  return stored.map(ccRecipientFromStored).filter((c) => c.id || c.email || c.name);
}

function toCreatePayload(input: CreateNoteInput): CreateNotePayload {
  return {
    title: input.title,
    description: input.description,
    type: input.type,
    toDriverIds: normalizeToDriverIdsInput(input.toDriverIds),
    ccEmails: normalizeCcEmailsInput(input.ccEmails),
    subject: input.subject,
    message: input.message,
    gifUrl: input.gifUrl,
  };
}

export function toNoteResponse(doc: NoteLean): NoteResponse {
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description,
    type: doc.type,
    toDriverIds: mapStoredToDriverRecipients(doc.toDriverIds),
    ccEmails: mapStoredToCcRecipients(doc.ccEmails),
    subject: doc.subject,
    message: doc.message,
    gifUrl: doc.gifUrl,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const saveNote = async (input: CreateNoteInput) => {
  return insertNote(toCreatePayload(input));
};

export const listNotes = async () => {
  return findAllNotesSorted();
};

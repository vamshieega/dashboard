import { findAllNotesSorted, insertNote } from "./accessor";
import type {
  CreateNoteInput,
  CreateNotePayload,
  CcRecipient,
  DriverRecipient,
  NoteLean,
  NoteResponse,
  NoteRow,
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
      if (item) out.push({ driverId: item, email: "", name: "", groupName: "", groupId: "" });
      continue;
    }
    if (isRecord(item) && item.driverId != null) {
      out.push({
        driverId: String(item.driverId),
        email: item.email != null ? String(item.email) : "",
        name: item.name != null ? String(item.name) : "",
        groupName: item.groupName != null ? String(item.groupName) : "",
        groupId: item.groupId != null ? String(item.groupId) : "",
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
  if (typeof item === "string") return { driverId: item, email: "", name: "", groupName: "", groupId: "" };
  if (isRecord(item) && item.driverId != null) {
    return {
      driverId: String(item.driverId),
      email: item.email != null ? String(item.email) : "",
      name: item.name != null ? String(item.name) : "",
      groupName: item.groupName != null ? String(item.groupName) : "",
      groupId: item.groupId != null ? String(item.groupId) : "",
    };
  }
  return { driverId: "", email: "", name: "", groupName: "", groupId: "" };
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

function parseJsonArrayField(raw: unknown): unknown[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapStoredToDriverRecipients(stored: unknown): DriverRecipient[] {
  const arr = parseJsonArrayField(stored);
  return arr
    .map(driverRecipientFromStored)
    .filter((d) => d.driverId || d.email || d.name);
}

function mapStoredToCcRecipients(stored: unknown): CcRecipient[] {
  const arr = parseJsonArrayField(stored);
  return arr.map(ccRecipientFromStored).filter((c) => c.id || c.email || c.name);
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

function noteRowToLean(row: NoteRow): NoteLean {
  return {
    _id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    toDriverIds: parseJsonArrayField(row.to_driver_ids),
    ccEmails: parseJsonArrayField(row.cc_emails),
    subject: row.subject,
    message: row.message,
    gifUrl: row.gif_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toNoteResponse(doc: NoteLean | NoteRow): NoteResponse {
  const lean: NoteLean = "id" in doc && typeof doc.id === "number" ? noteRowToLean(doc) : doc;

  return {
    id: lean._id,
    title: lean.title,
    description: lean.description,
    type: lean.type,
    toDriverIds: mapStoredToDriverRecipients(lean.toDriverIds),
    ccEmails: mapStoredToCcRecipients(lean.ccEmails),
    subject: lean.subject,
    message: lean.message,
    gifUrl: lean.gifUrl,
    createdAt: lean.createdAt,
    updatedAt: lean.updatedAt,
  };
}

export const saveNote = async (input: CreateNoteInput) => {
  return insertNote(toCreatePayload(input));
};

export const listNotes = async () => {
  return findAllNotesSorted();
};

//Business Logic

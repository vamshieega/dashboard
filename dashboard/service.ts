import {
  deleteNoteById as deleteNoteRowById,
  findAllNotesSorted,
  findCcByNoteIds,
  findNotesByIdsSorted,
  findNoteIdsByDriverId,
  findNoteIdsByGroupId,
  findRecipientsByNoteIds,
  insertNote,
} from "./accessor";
import type {
  CreateNoteInput,
  CreateNotePayload,
  CcRecipient,
  DriverRecipient,
  NoteCcRow,
  NoteLean,
  NoteRecipientRow,
  NoteResponse,
  NoteRow,
  NoteWithRelations,
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

/** Same driverId in one payload: keep last (stable for updates from clients). */
function dedupeDriverRecipientsLastWins(rows: DriverRecipient[]): DriverRecipient[] {
  const map = new Map<string, DriverRecipient>();
  for (const r of rows) {
    if (!r.driverId) continue;
    map.set(r.driverId, r);
  }
  return [...map.values()];
}

/** Avoid duplicate CC slots: same email (when non-empty) keeps last. */
function dedupeCcRecipientsLastWins(rows: CcRecipient[]): CcRecipient[] {
  const map = new Map<string, CcRecipient>();
  for (const r of rows) {
    const key = r.email.trim() !== "" ? r.email : `${r.id}|${r.name}`;
    map.set(key, r);
  }
  return [...map.values()];
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

function recipientRowToApi(r: NoteRecipientRow): DriverRecipient {
  return {
    driverId: r.driver_id,
    email: r.email,
    name: r.name,
    groupName: r.group_name,
    groupId: r.group_id,
  };
}

function ccRowToApi(r: NoteCcRow): CcRecipient {
  return {
    id: r.cc_ref_id,
    email: r.email,
    name: r.name,
  };
}

function isNoteWithRelations(doc: unknown): doc is NoteWithRelations {
  return (
    isRecord(doc) &&
    "note" in doc &&
    "recipients" in doc &&
    "cc" in doc &&
    isRecord((doc as NoteWithRelations).note) &&
    typeof (doc as NoteWithRelations).note.id === "number"
  );
}

function toCreatePayload(input: CreateNoteInput): CreateNotePayload {
  const toDriverIds = dedupeDriverRecipientsLastWins(normalizeToDriverIdsInput(input.toDriverIds));
  const ccEmails = dedupeCcRecipientsLastWins(normalizeCcEmailsInput(input.ccEmails));
  return {
    title: input.title,
    description: input.description,
    type: input.type,
    toDriverIds,
    ccEmails,
    subject: input.subject,
    message: input.message,
    gifUrl: input.gifUrl,
  };
}

function noteRowToLeanLegacy(row: NoteRow): NoteLean {
  return {
    _id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    toDriverIds: [],
    ccEmails: [],
    subject: row.subject,
    message: row.message,
    gifUrl: row.gif_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Maps DB rows or legacy lean docs to API shape. */
export function toNoteResponse(doc: NoteLean | NoteRow | NoteWithRelations): NoteResponse {
  if (isNoteWithRelations(doc)) {
    const { note, recipients, cc } = doc;
    return {
      id: note.id,
      title: note.title,
      description: note.description,
      type: note.type,
      toDriverIds: recipients,
      ccEmails: cc,
      subject: note.subject,
      message: note.message,
      gifUrl: note.gif_url,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    };
  }

  const lean: NoteLean =
    "id" in doc && typeof (doc as NoteRow).id === "number"
      ? noteRowToLeanLegacy(doc as NoteRow)
      : (doc as NoteLean);

  return {
    id: lean._id,
    title: lean.title,
    description: lean.description,
    type: lean.type,
    toDriverIds: mapStoredToDriverRecipients(lean.toDriverIds as unknown),
    ccEmails: mapStoredToCcRecipients(lean.ccEmails as unknown),
    subject: lean.subject,
    message: lean.message,
    gifUrl: lean.gifUrl,
    createdAt: lean.createdAt,
    updatedAt: lean.updatedAt,
  };
}

async function hydrateNoteRows(rows: NoteRow[]): Promise<NoteWithRelations[]> {
  const ids = rows.map((r) => r.id);
  const [recMap, ccMap] = await Promise.all([
    findRecipientsByNoteIds(ids),
    findCcByNoteIds(ids),
  ]);

  return rows.map((note) => {
    const recRows = recMap.get(note.id) ?? [];
    const ccRows = ccMap.get(note.id) ?? [];
    return {
      note,
      recipients: recRows.map(recipientRowToApi),
      cc: ccRows.map(ccRowToApi),
    };
  });
}

export const saveNote = async (input: CreateNoteInput) => {
  const row = await insertNote(toCreatePayload(input));
  const [recMap, ccMap] = await Promise.all([
    findRecipientsByNoteIds([row.id]),
    findCcByNoteIds([row.id]),
  ]);
  const recRows = recMap.get(row.id) ?? [];
  const ccRows = ccMap.get(row.id) ?? [];
  return {
    note: row,
    recipients: recRows.map(recipientRowToApi),
    cc: ccRows.map(ccRowToApi),
  } satisfies NoteWithRelations;
};

export const listNotes = async () => {
  return findAllNotesSorted();
};

/** Full API-shaped list with recipients and CC (relational). */
export const listNotesWithRelations = async (): Promise<NoteWithRelations[]> => {
  const rows = await findAllNotesSorted();
  return hydrateNoteRows(rows);
};

export async function getNotesByDriverId(driverId: string): Promise<NoteWithRelations[]> {
  const noteIds = await findNoteIdsByDriverId(driverId);
  const rows = await findNotesByIdsSorted(noteIds);
  return hydrateNoteRows(rows);
}

export async function getNotesByGroupId(groupId: string): Promise<NoteWithRelations[]> {
  const noteIds = await findNoteIdsByGroupId(groupId);
  const rows = await findNotesByIdsSorted(noteIds);
  return hydrateNoteRows(rows);
}

export async function deleteNoteById(
  id: string
): Promise<{ deleted: boolean; invalidId: boolean }> {
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1) {
    return { deleted: false, invalidId: true };
  }
  const affected = await deleteNoteRowById(n);
  return { deleted: affected > 0, invalidId: false };
}

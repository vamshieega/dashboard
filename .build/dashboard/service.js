"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotesWithRelations = exports.listNotes = exports.saveNote = exports.getDashboardData = void 0;
exports.toNoteResponse = toNoteResponse;
exports.getNotesByDriverId = getNotesByDriverId;
exports.getNotesByGroupId = getNotesByGroupId;
exports.deleteNoteById = deleteNoteById;
const accessor_1 = require("./accessor");
const getDashboardData = async () => {
    return {
        message: "Dashboard service working Eega 🚀",
        time: new Date().toISOString(),
    };
};
exports.getDashboardData = getDashboardData;
function isRecord(v) {
    return typeof v === "object" && v !== null;
}
function normalizeToDriverIdsInput(raw) {
    if (!Array.isArray(raw))
        return [];
    const out = [];
    for (const item of raw) {
        if (typeof item === "string") {
            if (item)
                out.push({ driverId: item, email: "", name: "", groupName: "", groupId: "" });
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
function normalizeCcEmailsInput(raw) {
    if (!Array.isArray(raw))
        return [];
    const out = [];
    for (const item of raw) {
        if (typeof item === "string") {
            if (item)
                out.push({ id: "", email: item, name: "" });
            continue;
        }
        if (isRecord(item)) {
            const id = item.id != null ? String(item.id) : "";
            const email = item.email != null ? String(item.email) : "";
            const name = item.name != null ? String(item.name) : "";
            if (id || email || name)
                out.push({ id, email, name });
        }
    }
    return out;
}
/** Same driverId in one payload: keep last (stable for updates from clients). */
function dedupeDriverRecipientsLastWins(rows) {
    const map = new Map();
    for (const r of rows) {
        if (!r.driverId)
            continue;
        map.set(r.driverId, r);
    }
    return [...map.values()];
}
/** Avoid duplicate CC slots: same email (when non-empty) keeps last. */
function dedupeCcRecipientsLastWins(rows) {
    const map = new Map();
    for (const r of rows) {
        const key = r.email.trim() !== "" ? r.email : `${r.id}|${r.name}`;
        map.set(key, r);
    }
    return [...map.values()];
}
function driverRecipientFromStored(item) {
    if (typeof item === "string")
        return { driverId: item, email: "", name: "", groupName: "", groupId: "" };
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
function ccRecipientFromStored(item) {
    if (typeof item === "string")
        return { id: "", email: item, name: "" };
    if (isRecord(item)) {
        return {
            id: item.id != null ? String(item.id) : "",
            email: item.email != null ? String(item.email) : "",
            name: item.name != null ? String(item.name) : "",
        };
    }
    return { id: "", email: "", name: "" };
}
function parseJsonArrayField(raw) {
    if (raw == null)
        return [];
    if (Array.isArray(raw))
        return raw;
    if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    }
    return [];
}
function mapStoredToDriverRecipients(stored) {
    const arr = parseJsonArrayField(stored);
    return arr
        .map(driverRecipientFromStored)
        .filter((d) => d.driverId || d.email || d.name);
}
function mapStoredToCcRecipients(stored) {
    const arr = parseJsonArrayField(stored);
    return arr.map(ccRecipientFromStored).filter((c) => c.id || c.email || c.name);
}
function recipientRowToApi(r) {
    return {
        driverId: r.driver_id,
        email: r.email,
        name: r.name,
        groupName: r.group_name,
        groupId: r.group_id,
    };
}
function ccRowToApi(r) {
    return {
        id: r.cc_ref_id,
        email: r.email,
        name: r.name,
    };
}
function isNoteWithRelations(doc) {
    return (isRecord(doc) &&
        "note" in doc &&
        "recipients" in doc &&
        "cc" in doc &&
        isRecord(doc.note) &&
        typeof doc.note.id === "number");
}
function toCreatePayload(input) {
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
function noteRowToLeanLegacy(row) {
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
function toNoteResponse(doc) {
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
    const lean = "id" in doc && typeof doc.id === "number"
        ? noteRowToLeanLegacy(doc)
        : doc;
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
async function hydrateNoteRows(rows) {
    const ids = rows.map((r) => r.id);
    const [recMap, ccMap] = await Promise.all([
        (0, accessor_1.findRecipientsByNoteIds)(ids),
        (0, accessor_1.findCcByNoteIds)(ids),
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
const saveNote = async (input) => {
    const row = await (0, accessor_1.insertNote)(toCreatePayload(input));
    const [recMap, ccMap] = await Promise.all([
        (0, accessor_1.findRecipientsByNoteIds)([row.id]),
        (0, accessor_1.findCcByNoteIds)([row.id]),
    ]);
    const recRows = recMap.get(row.id) ?? [];
    const ccRows = ccMap.get(row.id) ?? [];
    return {
        note: row,
        recipients: recRows.map(recipientRowToApi),
        cc: ccRows.map(ccRowToApi),
    };
};
exports.saveNote = saveNote;
const listNotes = async () => {
    return (0, accessor_1.findAllNotesSorted)();
};
exports.listNotes = listNotes;
/** Full API-shaped list with recipients and CC (relational). */
const listNotesWithRelations = async () => {
    const rows = await (0, accessor_1.findAllNotesSorted)();
    return hydrateNoteRows(rows);
};
exports.listNotesWithRelations = listNotesWithRelations;
async function getNotesByDriverId(driverId) {
    const noteIds = await (0, accessor_1.findNoteIdsByDriverId)(driverId);
    const rows = await (0, accessor_1.findNotesByIdsSorted)(noteIds);
    return hydrateNoteRows(rows);
}
async function getNotesByGroupId(groupId) {
    const noteIds = await (0, accessor_1.findNoteIdsByGroupId)(groupId);
    const rows = await (0, accessor_1.findNotesByIdsSorted)(noteIds);
    return hydrateNoteRows(rows);
}
async function deleteNoteById(id) {
    const n = Number(id);
    if (!Number.isInteger(n) || n < 1) {
        return { deleted: false, invalidId: true };
    }
    const affected = await (0, accessor_1.deleteNoteById)(n);
    return { deleted: affected > 0, invalidId: false };
}
//# sourceMappingURL=service.js.map
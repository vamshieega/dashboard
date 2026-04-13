"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotes = exports.saveNote = exports.getDashboardData = void 0;
exports.toNoteResponse = toNoteResponse;
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
function toCreatePayload(input) {
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
function noteRowToLean(row) {
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
function toNoteResponse(doc) {
    const lean = "id" in doc && typeof doc.id === "number" ? noteRowToLean(doc) : doc;
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
const saveNote = async (input) => {
    return (0, accessor_1.insertNote)(toCreatePayload(input));
};
exports.saveNote = saveNote;
const listNotes = async () => {
    return (0, accessor_1.findAllNotesSorted)();
};
exports.listNotes = listNotes;
async function deleteNoteById(id) {
    const n = Number(id);
    if (!Number.isInteger(n) || n < 1) {
        return { deleted: false, invalidId: true };
    }
    const affected = await (0, accessor_1.deleteNoteById)(n);
    return { deleted: affected > 0, invalidId: false };
}
//Business Logic
//# sourceMappingURL=service.js.map
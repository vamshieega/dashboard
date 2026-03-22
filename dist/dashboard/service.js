"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotes = exports.saveNote = exports.getDashboardData = void 0;
exports.toNoteResponse = toNoteResponse;
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
                out.push({ driverId: item, email: "", name: "" });
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
        return { driverId: item, email: "", name: "" };
    if (isRecord(item) && item.driverId != null) {
        return {
            driverId: String(item.driverId),
            email: item.email != null ? String(item.email) : "",
            name: item.name != null ? String(item.name) : "",
        };
    }
    return { driverId: "", email: "", name: "" };
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
function mapStoredToDriverRecipients(stored) {
    if (!Array.isArray(stored))
        return [];
    return stored
        .map(driverRecipientFromStored)
        .filter((d) => d.driverId || d.email || d.name);
}
function mapStoredToCcRecipients(stored) {
    if (!Array.isArray(stored))
        return [];
    return stored.map(ccRecipientFromStored).filter((c) => c.id || c.email || c.name);
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
function toNoteResponse(doc) {
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
const saveNote = async (input) => {
    return (0, accessor_1.insertNote)(toCreatePayload(input));
};
exports.saveNote = saveNote;
const listNotes = async () => {
    return (0, accessor_1.findAllNotesSorted)();
};
exports.listNotes = listNotes;
//# sourceMappingURL=service.js.map
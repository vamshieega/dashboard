"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotes = exports.createNote = exports.getUsers = exports.getDashboard = void 0;
const db_1 = require("../config/db");
const dbInit_1 = require("../config/dbInit");
const service_1 = require("./service");
const getDashboard = async (req, res) => {
    const data = await (0, service_1.getDashboardData)();
    return res.status(200).json(data);
};
exports.getDashboard = getDashboard;
const getUsers = async (req, res) => {
    try {
        await (0, db_1.connectDB)();
        return res.status(200).json({
            message: "Users fetched successfully Eegds/. ",
        });
    }
    catch (err) {
        console.error("getUsers error:", err);
        return res.status(500).json({
            message: "Database connection failed",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
};
exports.getUsers = getUsers;
const createNote = async (req, res) => {
    const { title, description, type, toDriverIds, ccEmails, subject, message, gifUrl } = req.body ?? {};
    try {
        await (0, db_1.connectDB)();
        const note = await (0, service_1.saveNote)({
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
            note: (0, service_1.toNoteResponse)(note),
        });
    }
    catch (err) {
        console.error("createNote error:", err);
        return res.status(500).json({
            message: "Failed to create note",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
};
exports.createNote = createNote;
const getNotes = async (req, res) => {
    try {
        console.log("[getNotes] start: connecting to DB");
        await (0, db_1.connectDB)();
        console.log("[getNotes] connectDB: ok");
        console.log("[getNotes] initializeDatabase: start (ensure tables)");
        await (0, dbInit_1.initializeDatabase)();
        console.log("[getNotes] initializeDatabase: ok");
        console.log("[getNotes] listNotes: start");
        const rows = await (0, service_1.listNotes)();
        console.log("[getNotes] listNotes: ok", { rowCount: rows.length });
        const notes = rows.map((row) => (0, service_1.toNoteResponse)(row));
        console.log("[getNotes] mapped to response notes", { count: notes.length });
        return res.status(200).json({
            message: "Notes fetched successfully",
            count: notes.length,
            notes,
        });
    }
    catch (err) {
        console.error("getNotes error:", err);
        return res.status(500).json({
            message: "Failed to fetch notes",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
};
exports.getNotes = getNotes;
//# sourceMappingURL=controller.js.map
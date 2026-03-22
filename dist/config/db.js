"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const globalAny = globalThis;
if (!globalAny.mongooseConn) {
    globalAny.mongooseConn = {
        conn: null,
        promise: null,
    };
}
//mongodb+srv://admin:dbUserPassword@cluster0.p0twtz1.mongodb.net/
//username: admin
//password: dbUserPassword
const connectDB = async () => {
    const cached = globalAny.mongooseConn;
    // 🔥 If already connected, return immediately
    if (cached.conn && mongoose_1.default.connection.readyState === 1) {
        console.log("📦 Using cached database connection");
        return cached.conn;
    }
    const MONGO_URI = "mongodb+srv://admin:dbUserPassword@cluster0.p0twtz1.mongodb.net/";
    // process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!MONGO_URI) {
        throw new Error("❌ MongoDB URI is not defined in environment variables");
    }
    // 🔥 If no connection promise, create one
    if (!cached.promise) {
        console.log("🔌 Connecting to MongoDB...");
        cached.promise = mongoose_1.default
            .connect(MONGO_URI, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
        })
            .then((mongooseInstance) => {
            console.log("✅ MongoDB connected successfully");
            return mongooseInstance;
        })
            .catch((error) => {
            console.error("❌ MongoDB connection error:", error);
            cached.promise = null; // reset promise
            throw error;
        });
    }
    // 🔥 Await the promise (important)
    cached.conn = await cached.promise;
    return cached.conn;
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map
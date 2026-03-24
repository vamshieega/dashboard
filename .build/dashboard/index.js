"use strict";
// export const dashboard = async () => {
//     return {
//       statusCode: 200,
//       body: JSON.stringify({
//         message: "Hello from dashboard API 🚀"
//       }),
//     };
//   };
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboard = void 0;
// import { getDashboard } from "./controller";
// export const dashboard = async () => {
//   return getDashboard({}, {});
// };
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env before any route/controller code runs (serverless-offline / local).
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env") });
// TODO: remove after verifying env loading in local dev
console.log("DB_HOST:", process.env.Aurora_DB_HOST || process.env.DB_HOST);
const express_1 = __importDefault(require("express"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const routesV4_1 = __importDefault(require("./routesV4"));
const app = (0, express_1.default)();
// JSON body only for methods that carry bodies. Global express.json() + serverless-http
// can throw "request size did not match content length" on GET because offline/Lambda
// may set Content-Length in a way that doesn't match the synthesized stream.
const jsonParser = express_1.default.json();
app.use((req, res, next) => {
    if (req.method === "GET" || req.method === "HEAD") {
        return next();
    }
    jsonParser(req, res, next);
});
// attach routes
app.use("/dashboard", (0, routesV4_1.default)());
// health check (optional but useful)
app.get("/", (req, res) => {
    res.json({ message: "API is running 🚀" });
});
// export handler
exports.dashboard = (0, serverless_http_1.default)(app);
//# sourceMappingURL=index.js.map
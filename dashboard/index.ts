// export const dashboard = async () => {
//     return {
//       statusCode: 200,
//       body: JSON.stringify({
//         message: "Hello from dashboard API 🚀"
//       }),
//     };
//   };


// import { getDashboard } from "./controller";

// export const dashboard = async () => {
//   return getDashboard({}, {});
// };

import dotenv from "dotenv";
import path from "path";

// Load .env before any route/controller code runs (serverless-offline / local).
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// TODO: remove after verifying env loading in local dev
console.log(
  "DB_HOST:",
  process.env.Aurora_DB_HOST || process.env.DB_HOST
);

import cors from "cors";
import express from "express";
import serverless from "serverless-http";
import routesV4 from "./routesV4";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// JSON body only for methods that carry bodies. Global express.json() + serverless-http
// can throw "request size did not match content length" on GET because offline/Lambda
// may set Content-Length in a way that doesn't match the synthesized stream.
const jsonParser = express.json();
app.use((req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD") {
    return next();
  }
  jsonParser(req, res, next);
});

// attach routes
app.use("/dashboard", routesV4());

// health check (optional but useful)
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

// export handler
export const dashboard = serverless(app);
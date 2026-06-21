import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import adminRouter from "./routes/adminRoute.js";
import employeeRouter from "./routes/employeeRoute.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ── Static: uploaded employee images ────────────────────────────────────────
app.use("/Images", express.static(path.join(__dirname, "Public/Images")));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/auth", adminRouter);
app.use("/employee", employeeRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (_req, res) => res.json({ message: "EMS API is running ✅" }));

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

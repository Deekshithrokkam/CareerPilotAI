import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { interviewsRouter } from "./routes/interviews.js";
import { profileRouter } from "./routes/profile.js";
import { progressRouter } from "./routes/progress.js";
import { studyPlansRouter } from "./routes/studyPlans.js";
import { errorHandler, notFound } from "./middleware/error.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "64kb" }));

const apiLimiter = rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false });
const aiLimiter = rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: true, legacyHeaders: false });

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", apiLimiter);
app.use("/api/profile", profileRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/interviews", aiLimiter, interviewsRouter);
app.use("/api/study-plans", aiLimiter, studyPlansRouter);
app.use("/api/progress", progressRouter);
app.use(notFound);
app.use(errorHandler);

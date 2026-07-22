import { Router } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const [{ data: sessions }, { data: progress }, { data: plans }] = await Promise.all([
      supabaseAdmin.from("interview_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabaseAdmin.from("progress").select("*").eq("user_id", userId).order("average_score", { ascending: false }),
      supabaseAdmin.from("study_plans").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1)
    ]);
    const completed = (sessions ?? []).filter((session) => session.status === "completed");
    const average = completed.length
      ? Math.round(completed.reduce((sum, session) => sum + Number(session.overall_score ?? 0), 0) / completed.length)
      : 0;
    res.json({
      metrics: {
        total_interviews: sessions?.length ?? 0,
        completed_interviews: completed.length,
        average_score: average,
        topics_practiced: progress?.length ?? 0
      },
      recent_sessions: sessions?.slice(0, 5) ?? [],
      progress: progress ?? [],
      latest_plan: plans?.[0] ?? null
    });
  } catch (error) {
    next(error);
  }
});

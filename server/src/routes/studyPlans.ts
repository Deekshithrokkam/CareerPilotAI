import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { generateStudyPlan } from "../services/gemini.js";
import { getProfile } from "../utils/db.js";

export const studyPlansRouter = Router();
studyPlansRouter.use(requireAuth);

const createStudyPlanSchema = z.object({
  session_id: z.string().uuid().optional().nullable()
});

studyPlansRouter.post("/", validateBody(createStudyPlanSchema), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const profile = await getProfile(userId);
    if (!profile) return res.status(409).json({ error: "Complete your profile before creating a study plan." });

    let weakAreas = profile.weak_technologies ?? [];
    if (req.body.session_id) {
      const { data: session } = await supabaseAdmin
        .from("interview_sessions")
        .select("weak_areas, topics_to_revise")
        .eq("id", req.body.session_id)
        .eq("user_id", userId)
        .single();
      weakAreas = [...new Set([...(session?.topics_to_revise ?? []), ...(session?.weak_areas ?? []), ...weakAreas])];
    }

    const plan = await generateStudyPlan({
      target_role: profile.target_role ?? "Full-Stack Developer",
      experience_level: profile.experience_level,
      weak_areas: weakAreas,
      daily_time: profile.daily_preparation_minutes ?? 60
    });

    const { data, error } = await supabaseAdmin
      .from("study_plans")
      .insert({
        user_id: userId,
        session_id: req.body.session_id ?? null,
        plan_title: plan.plan_title,
        plan_content: plan
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ plan: data });
  } catch (error) {
    next(error);
  }
});

studyPlansRouter.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("study_plans")
      .select("*")
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ plans: data });
  } catch (error) {
    next(error);
  }
});

studyPlansRouter.get("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("study_plans")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id)
      .single();
    if (error) return res.status(404).json({ error: "Study plan not found." });
    res.json({ plan: data });
  } catch (error) {
    next(error);
  }
});

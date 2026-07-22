import { Router } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { profileSchema } from "../validation/schemas.js";

export const profileRouter = Router();
profileRouter.use(requireAuth);

profileRouter.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", req.user!.id).single();
    if (error && error.code !== "PGRST116") throw error;
    res.json({ profile: data ?? null });
  } catch (error) {
    next(error);
  }
});

profileRouter.put("/", validateBody(profileSchema), async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      id: req.user!.id,
      email: req.user!.email,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabaseAdmin.from("profiles").upsert(payload).select().single();
    if (error) throw error;
    res.json({ profile: data });
  } catch (error) {
    next(error);
  }
});

import { Router } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";

export const progressRouter = Router();
progressRouter.use(requireAuth);

progressRouter.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from("progress").select("*").eq("user_id", req.user!.id).order("average_score", { ascending: false });
    if (error) throw error;
    res.json({ progress: data });
  } catch (error) {
    next(error);
  }
});

import type { NextFunction, Request, Response } from "express";
import { supabaseAuth } from "../config/supabase.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: "Please log in to continue." });
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: "Your session expired. Please log in again." });
  }

  req.user = { id: data.user.id, email: data.user.email ?? undefined };
  req.token = token;
  next();
}

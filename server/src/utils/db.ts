import { supabaseAdmin } from "../config/supabase.js";

export async function updateStatus(sessionId: string, userId: string, processing_status: string, status?: string) {
  await supabaseAdmin
    .from("interview_sessions")
    .update({ processing_status, ...(status ? { status } : {}), updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", userId);
}

export async function getProfile(userId: string) {
  const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

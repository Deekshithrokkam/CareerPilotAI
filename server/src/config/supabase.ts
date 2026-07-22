import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

const commonOptions = {
  auth: {
    persistSession: false,
  },
};

export const supabaseAuth = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey,
  commonOptions
);

export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  commonOptions
);
import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";
import WebSocket from "ws";

const commonOptions = {
  auth: {
    persistSession: false,
  },
  realtime: {
    transport: WebSocket,
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
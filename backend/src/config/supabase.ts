import { createClient } from "@supabase/supabase-js";
import { logger } from "../utils/logger";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

let supabase: any = null;

if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    logger.info("✅ Supabase Admin initialized");
  } catch (error: any) {
    logger.error(`❌ Supabase initialization failed: ${error.message}`);
  }
} else {
  logger.warn("⚠️ Supabase credentials missing. Supabase integration disabled.");
}

export default supabase;

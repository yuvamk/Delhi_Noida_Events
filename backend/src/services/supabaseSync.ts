import supabase from "../config/supabase";
import { logger } from "../utils/logger";

export async function syncUserToSupabase(user: any) {
  if (!supabase) return;

  try {
    const { id, email, name, role } = user;
    
    // 1. Sync to public.profiles table (metadata)
    const { error: dbError } = await supabase
      .from("profiles")
      .upsert({
        id: id.toString(),
        email,
        full_name: name,
        role: role,
        updated_at: new Date(),
      }, { onConflict: "id" });

    if (dbError) {
      logger.error(`❌ Supabase Sync Error (profiles): ${dbError.message}`);
      throw new Error(`DB Sync Error: ${dbError.message}`);
    }

    // 2. Note: We don't necessarily sync to Supabase Auth unless the user logs in via Supabase.
    // However, if we want to use Supabase for Bookmarks, we need the user in the database.
    
    logger.debug(`Synced user ${email} to Supabase`);
  } catch (err: any) {
    logger.error(`Supabase sync failed for ${user.email}: ${err.message}`);
  }
}

export async function syncBookmarkToSupabase(userId: string, eventId: string, action: "add" | "remove") {
  if (!supabase) return;

  try {
    if (action === "add") {
      await supabase.from("bookmarks").upsert({
        user_id: userId,
        event_id: eventId,
        created_at: new Date(),
      });
    } else {
      await supabase.from("bookmarks").delete().match({ user_id: userId, event_id: eventId });
    }
  } catch (err: any) {
    logger.error(`❌ Supabase bookmark sync failed: ${err.message}`);
  }
}

import { supabaseAdmin } from "../db/supabase.js";

export async function listMyNotifications(req, res) {
  const unreadOnly = String(req.query.unread || "false").toLowerCase() === "true";
  const limit = Math.min(Number(req.query.limit || 100), 300);

  let query = supabaseAdmin
    .from("notifications")
    .select("*")
    .eq("recipient_user_id", req.user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  return res.json(data ?? []);
}

export async function markAllNotificationsRead(req, res) {
  const { error } = await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_user_id", req.user.id)
    .eq("is_read", false);

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  return res.json({ success: true });
}

export async function markNotificationRead(req, res) {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("recipient_user_id", req.user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  if (!data) {
    return res.status(404).json({ message: "Notification not found" });
  }

  return res.json(data);
}

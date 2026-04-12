const STORAGE_KEY = "nba_notifications_cache";

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeRaw(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage write failures.
  }
}

function makeFallbackId(item) {
  return `local-${item.title || ""}-${item.message || ""}-${item.created_at || Date.now()}`;
}

function normalize(item) {
  const id = item?.id || makeFallbackId(item || {});
  return {
    id,
    title: String(item?.title || "Notification"),
    message: String(item?.message || ""),
    is_read: Boolean(item?.is_read),
    created_at: item?.created_at || new Date().toISOString(),
  };
}

function dedupeById(items) {
  const map = new Map();
  for (const item of items) {
    const normalized = normalize(item);
    map.set(normalized.id, normalized);
  }
  return Array.from(map.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getStoredNotifications(userId) {
  if (!userId) return [];
  const raw = readRaw();
  const bucket = Array.isArray(raw[userId]) ? raw[userId] : [];
  return dedupeById(bucket);
}

export function mergeStoredNotifications(userId, incoming = []) {
  if (!userId) return [];
  const raw = readRaw();
  const existing = Array.isArray(raw[userId]) ? raw[userId] : [];
  const merged = dedupeById([...(incoming || []), ...existing]).slice(0, 300);
  raw[userId] = merged;
  writeRaw(raw);
  return merged;
}

export function markStoredNotificationRead(userId, notificationId) {
  if (!userId || !notificationId) return;
  const raw = readRaw();
  const existing = Array.isArray(raw[userId]) ? raw[userId] : [];
  raw[userId] = existing.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item));
  writeRaw(raw);
}

export function markAllStoredNotificationsRead(userId) {
  if (!userId) return;
  const raw = readRaw();
  const existing = Array.isArray(raw[userId]) ? raw[userId] : [];
  raw[userId] = existing.map((item) => ({ ...item, is_read: true }));
  writeRaw(raw);
}

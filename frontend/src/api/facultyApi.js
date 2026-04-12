import { apiFetch } from "./client";

export const facultyApi = {
  list: (token) => apiFetch("/faculty", { token }),
  byId: (id, token) => apiFetch(`/faculty/${id}`, { token }),
  update: (id, body, token) => apiFetch(`/faculty/${id}`, { method: "PUT", body, token }),
  uploadPhoto: (id, body, token) => apiFetch(`/faculty/${id}/photo`, { method: "PUT", body, token }),
  create: (body, token) => apiFetch("/faculty", { method: "POST", body, token }),
};

export const entryApi = {
  list: (table, facultyId, token) => apiFetch(`/entries/${table}/${facultyId}`, { token }),
  create: (table, body, token) => apiFetch(`/entries/${table}`, { method: "POST", body, token }),
  update: (table, id, body, token) => apiFetch(`/entries/${table}/${id}`, { method: "PUT", body, token }),
  remove: (table, id, token) => apiFetch(`/entries/${table}/${id}`, { method: "DELETE", token }),
};

export const authApi = {
  login: (body) => apiFetch("/auth/login", { method: "POST", body }),
  register: (body) => apiFetch("/auth/register", { method: "POST", body }),
};

export const adminApi = {
  pending: (token) => apiFetch("/admin/pending", { token }),
  audit: (token, limit = 100) => apiFetch(`/admin/audit?limit=${limit}`, { token }),
  history: (token, limit = 200) => apiFetch(`/admin/history?limit=${limit}`, { token }),
  faculty: (token) => apiFetch("/admin/faculty", { token }),
  query: (token, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== "") query.set(k, String(v));
    });
    return apiFetch(`/admin/query?${query.toString()}`, { token });
  },
  approve: (table, id, token) => apiFetch(`/admin/approve/${table}/${id}`, { method: "PUT", token }),
  reject: (table, id, token, body) => apiFetch(`/admin/reject/${table}/${id}`, { method: "DELETE", token, body }),
  removeDetail: (table, id, token) => apiFetch(`/admin/remove/${table}/${id}`, { method: "DELETE", token }),
  removeFaculty: (id, token) => apiFetch(`/admin/faculty/${id}`, { method: "DELETE", token }),
};

export const reportApi = {
  summary: (facultyId, token) => apiFetch(`/reports/faculty/${facultyId}`, { token }),
  exportExcel: (facultyId, token) => apiFetch(`/reports/export/faculty/${facultyId}`, { token }),
};

export const notificationApi = {
  list: (token, params = {}) => {
    const query = new URLSearchParams();
    if (params.unreadOnly) query.set("unread", "true");
    if (params.limit) query.set("limit", String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiFetch(`/notifications${suffix}`, { token });
  },
  markRead: (id, token) => apiFetch(`/notifications/${id}/read`, { method: "PUT", token }),
  markAllRead: (token) => apiFetch("/notifications/read-all", { method: "PUT", token }),
};

export const achievementApi = {
  listPublic: () => apiFetch("/achievements/public"),
  listAdmin: (token) => apiFetch("/achievements/admin", { token }),
  create: (body, token) => apiFetch("/achievements/admin", { method: "POST", body, token }),
  update: (id, body, token) => apiFetch(`/achievements/admin/${id}`, { method: "PUT", body, token }),
  remove: (id, token) => apiFetch(`/achievements/admin/${id}`, { method: "DELETE", token }),
};

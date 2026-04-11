import { supabaseAdmin } from "../db/supabase.js";

const TABLES = ["faculty", "publications", "fdp", "projects", "patents", "books", "collaborations", "consultancy", "awards", "moocs", "qualifications", "research_proofs", "miscellaneous_items"];

function rowLabel(row) {
  return row.title || row.name || row.course || row.degree || "Untitled entry";
}

async function resolveRecipientUserId(table, record) {
  if (table === "faculty") {
    return record.user_id ?? null;
  }

  if (!record.faculty_id) return null;

  const { data } = await supabaseAdmin.from("faculty").select("user_id").eq("id", record.faculty_id).maybeSingle();
  return data?.user_id ?? null;
}

async function createNotification(recipientUserId, title, message) {
  if (!recipientUserId) return;
  await supabaseAdmin.from("notifications").insert({
    recipient_user_id: recipientUserId,
    title,
    message,
    is_read: false,
  });
}

async function restorePreviousApprovedSnapshot(table, id, adminUserId) {
  const { data: auditRows, error: auditError } = await supabaseAdmin
    .from("audit_log")
    .select("old_data,new_data,created_at")
    .eq("table_name", table)
    .eq("row_id", id)
    .eq("action", "UPDATE")
    .order("created_at", { ascending: false })
    .limit(10);

  if (auditError || !auditRows?.length) {
    return false;
  }

  const snapshot = auditRows.find((row) => row?.old_data?.is_approved === true && row?.new_data?.is_approved === false);
  if (!snapshot?.old_data) {
    return false;
  }

  const payload = { ...snapshot.old_data };
  delete payload.id;
  delete payload.created_at;
  delete payload.updated_at;

  const { error: restoreError } = await supabaseAdmin
    .from(table)
    .update({
      ...payload,
      is_approved: true,
      updated_by: adminUserId,
    })
    .eq("id", id);

  return !restoreError;
}

export async function getPendingEntries(_req, res) {
  const result = {};

  for (const table of TABLES) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select("*")
      .eq("is_approved", false)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    result[table] = data;
  }

  return res.json(result);
}

export async function approveEntry(req, res) {
  const { table, id } = req.params;
  if (!TABLES.includes(table)) {
    return res.status(400).json({ message: "Unsupported table" });
  }

  const { data: beforeRecord } = await supabaseAdmin.from(table).select("*").eq("id", id).maybeSingle();

  const { data, error } = await supabaseAdmin
    .from(table)
    .update({
      is_approved: true,
      approved_by: req.user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  const recipientUserId = await resolveRecipientUserId(table, beforeRecord || data);
  await createNotification(
    recipientUserId,
    "Entry Approved",
    `Your ${table} entry has been approved by admin and is now visible in viewer profile.`,
  );

  return res.json(data);
}

export async function rejectEntry(req, res) {
  const { table, id } = req.params;
  if (!TABLES.includes(table)) {
    return res.status(400).json({ message: "Unsupported table" });
  }

  const { data: beforeRecord } = await supabaseAdmin.from(table).select("*").eq("id", id).maybeSingle();

  const restored = await restorePreviousApprovedSnapshot(table, id, req.user.id);
  if (restored) {
    const recipientUserId = await resolveRecipientUserId(table, beforeRecord);
    await createNotification(
      recipientUserId,
      "Update Rejected",
      `Your ${table} update was rejected by admin. The previously approved record is still visible.`,
    );
    return res.json({ message: "Rejected and reverted to previously approved data" });
  }

  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) {
    return res.status(500).json({ message: error.message });
  }

  const recipientUserId = await resolveRecipientUserId(table, beforeRecord);
  await createNotification(recipientUserId, "Entry Rejected", `Your ${table} entry was rejected by admin.`);

  return res.status(204).send();
}

export async function getAuditTimeline(req, res) {
  const limit = Math.min(Number(req.query.limit || 100), 500);
  const { data, error } = await supabaseAdmin
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  return res.json(data ?? []);
}

export async function getFacultyDirectory(_req, res) {
  const { data, error } = await supabaseAdmin
    .from("faculty")
    .select("id,user_id,name,designation,department,email,photo_url,is_approved,created_at")
    .order("name", { ascending: true });

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  return res.json(data ?? []);
}

export async function getApprovalHistory(req, res) {
  const limit = Math.min(Number(req.query.limit || 200), 1000);

  const { data: facultyRows } = await supabaseAdmin
    .from("faculty")
    .select("id,name,designation,department,email,photo_url");

  const facultyMap = new Map((facultyRows ?? []).map((f) => [f.id, f]));
  const history = [];

  for (const table of TABLES) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select("*")
      .eq("is_approved", true)
      .not("approved_at", "is", null)
      .order("approved_at", { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    for (const row of data ?? []) {
      const faculty = row.faculty_id ? facultyMap.get(row.faculty_id) : facultyMap.get(row.id);
      history.push({
        table,
        id: row.id,
        faculty_id: row.faculty_id,
        approved_at: row.approved_at,
        approved_by: row.approved_by,
        created_at: row.created_at,
        label: rowLabel(row),
        faculty,
      });
    }
  }

  history.sort((a, b) => new Date(b.approved_at).getTime() - new Date(a.approved_at).getTime());

  return res.json(history.slice(0, limit));
}

export async function removeEntryByAdmin(req, res) {
  const { table, id } = req.params;
  if (!TABLES.includes(table)) {
    return res.status(400).json({ message: "Unsupported table" });
  }

  const { data: existing, error: readError } = await supabaseAdmin
    .from(table)
    .select("id,faculty_id")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    return res.status(500).json({ message: readError.message });
  }

  if (!existing) {
    return res.status(404).json({ message: "Entry not found" });
  }

  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) {
    return res.status(500).json({ message: error.message });
  }

  const recipientUserId = await resolveRecipientUserId(table, existing);
  await createNotification(recipientUserId, "Entry Removed", `An admin removed one ${table} record from your profile.`);

  return res.status(204).send();
}

export async function removeFacultyByAdmin(req, res) {
  const { id } = req.params;

  const { data: faculty, error: facultyError } = await supabaseAdmin
    .from("faculty")
    .select("id,user_id,name")
    .eq("id", id)
    .maybeSingle();

  if (facultyError) {
    return res.status(500).json({ message: facultyError.message });
  }

  if (!faculty) {
    return res.status(404).json({ message: "Faculty not found" });
  }

  const { error } = await supabaseAdmin.from("faculty").delete().eq("id", id);
  if (error) {
    return res.status(500).json({ message: error.message });
  }

  if (faculty.user_id) {
    await supabaseAdmin.from("users").delete().eq("auth_user_id", faculty.user_id);
    await createNotification(
      faculty.user_id,
      "Profile Removed",
      "Your faculty profile and attached records were removed by admin.",
    );
  }

  return res.status(204).send();
}

export async function queryFacultyKnowledge(req, res) {
  const q = String(req.query.q || "").trim().toLowerCase();
  const designation = String(req.query.designation || "").trim().toLowerCase();
  const department = String(req.query.department || "").trim().toLowerCase();
  const tableFilter = String(req.query.table || "all").trim().toLowerCase();
  const statusFilter = String(req.query.status || "all").trim().toLowerCase();
  const from = req.query.from ? new Date(String(req.query.from)) : null;
  const to = req.query.to ? new Date(String(req.query.to)) : null;
  const limit = Math.min(Number(req.query.limit || 300), 1000);

  const { data: facultyRows, error: facultyError } = await supabaseAdmin
    .from("faculty")
    .select("id,name,designation,department,email,research_area,bio,is_approved,created_at");

  if (facultyError) {
    return res.status(500).json({ message: facultyError.message });
  }

  const facultyMap = new Map((facultyRows ?? []).map((f) => [f.id, f]));
  const records = [];

  for (const table of TABLES) {
    if (tableFilter !== "all" && tableFilter !== table) continue;

    if (table === "faculty") {
      for (const f of facultyRows ?? []) {
        records.push({
          table: "faculty",
          id: f.id,
          faculty_id: f.id,
          created_at: f.created_at,
          is_approved: Boolean(f.is_approved),
          label: f.name,
          search_blob: [f.name, f.email, f.research_area, f.bio, f.department, f.designation].join(" "),
          faculty: f,
        });
      }
      continue;
    }

    const { data, error } = await supabaseAdmin
      .from(table)
      .select("*");

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    for (const row of data ?? []) {
      const faculty = facultyMap.get(row.faculty_id) || null;
      records.push({
        table,
        id: row.id,
        faculty_id: row.faculty_id,
        created_at: row.created_at,
        is_approved: Boolean(row.is_approved),
        label: rowLabel(row),
        search_blob: [
          row.title,
          row.name,
          row.course,
          row.degree,
          row.description,
          row.status,
          row.membership,
          row.honors,
          row.contributions,
          row.reference_url,
          row.pdf_url,
          faculty?.name,
          faculty?.designation,
          faculty?.department,
        ].join(" "),
        faculty,
      });
    }
  }

  const filtered = records.filter((item) => {
    const faculty = item.faculty;
    if (designation && !String(faculty?.designation || "").toLowerCase().includes(designation)) return false;
    if (department && !String(faculty?.department || "").toLowerCase().includes(department)) return false;

    if (statusFilter === "approved" && !item.is_approved) return false;
    if (statusFilter === "pending" && item.is_approved) return false;

    if (from && item.created_at && new Date(item.created_at) < from) return false;
    if (to && item.created_at && new Date(item.created_at) > to) return false;

    if (q && !String(item.search_blob || "").toLowerCase().includes(q)) return false;
    return true;
  });

  filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  return res.json(filtered.slice(0, limit));
}

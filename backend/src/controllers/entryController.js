import { z } from "zod";
import { supabaseAdmin } from "../db/supabase.js";
import { emitToUser } from "../realtime/wsHub.js";

const tableSchemas = {
  publications: z.object({
    faculty_id: z.string().uuid(),
    title: z.string().min(2),
    authors: z.string().optional().default(""),
    journal: z.string().optional().default(""),
    year: z.coerce.number().int(),
    doi: z.string().optional().default(""),
    type: z.string().optional().default("journal"),
    indexed: z.string().optional().default(""),
    reference_url: z.string().url().optional().or(z.literal("")),
    pdf_url: z.string().url().optional().or(z.literal("")),
    scopus: z.boolean().optional().default(false),
    wos: z.boolean().optional().default(false),
  }),
  fdp: z.object({
    faculty_id: z.string().uuid(),
    title: z.string().min(2),
    role: z.string().optional().default("participant"),
    duration: z.string().optional().default(""),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    organized_by: z.string().optional().default(""),
  }),
  projects: z.object({
    faculty_id: z.string().uuid(),
    title: z.string().min(2),
    funding_agency: z.string().optional().default(""),
    amount: z.coerce.number().optional().default(0),
    year: z.coerce.number().int().optional().default(new Date().getFullYear()),
    status: z.string().optional().default("ongoing"),
    reference_url: z.string().url().optional().or(z.literal("")),
    pdf_url: z.string().url().optional().or(z.literal("")),
  }),
  patents: z.object({
    faculty_id: z.string().uuid(),
    title: z.string().min(2),
    status: z.string().optional().default("filed"),
    year: z.coerce.number().int().optional().default(new Date().getFullYear()),
    number: z.string().optional().default(""),
    reference_url: z.string().url().optional().or(z.literal("")),
    pdf_url: z.string().url().optional().or(z.literal("")),
  }),
  books: z.object({
    faculty_id: z.string().uuid(),
    title: z.string().min(2),
    publisher: z.string().optional().default(""),
    isbn: z.string().optional().default(""),
    year: z.coerce.number().int().optional().default(new Date().getFullYear()),
    reference_url: z.string().url().optional().or(z.literal("")),
    pdf_url: z.string().url().optional().or(z.literal("")),
  }),
  collaborations: z.object({
    faculty_id: z.string().uuid(),
    title: z.string().min(2),
    organization: z.string().optional().default(""),
    country: z.string().optional().default(""),
    role: z.string().optional().default("collaborator"),
    start_year: z.coerce.number().int().optional().default(new Date().getFullYear()),
    end_year: z.coerce.number().int().optional().nullable(),
  }),
  consultancy: z.object({
    faculty_id: z.string().uuid(),
    title: z.string().min(2),
    company: z.string().optional().default(""),
    amount: z.coerce.number().optional().default(0),
    year: z.coerce.number().int().optional().default(new Date().getFullYear()),
  }),
  awards: z.object({
    faculty_id: z.string().uuid(),
    title: z.string().min(2),
    membership: z.string().optional().default(""),
    honors: z.string().optional().default(""),
    contributions: z.string().optional().default(""),
    year: z.coerce.number().int().optional().default(new Date().getFullYear()),
    description: z.string().optional().default(""),
  }),
  moocs: z.object({
    faculty_id: z.string().uuid(),
    course: z.string().min(2),
    platform: z.string().optional().default(""),
    grade: z.string().optional().default(""),
    year: z.coerce.number().int().optional().default(new Date().getFullYear()),
  }),
  research_proofs: z.object({
    faculty_id: z.string().uuid(),
    title: z.string().min(2),
    proof_url: z.string().url(),
    description: z.string().optional().default(""),
    year: z.coerce.number().int().optional().default(new Date().getFullYear()),
  }),
  miscellaneous_items: z.object({
    faculty_id: z.string().uuid(),
    title: z.string().min(2),
    description: z.string().optional().default(""),
    reference_url: z.string().url().optional().or(z.literal("")),
    pdf_url: z.string().url().optional().or(z.literal("")),
    custom_fields: z.record(z.string(), z.string()).optional().default({}),
  }),
  qualifications: z.object({
    faculty_id: z.string().uuid(),
    degree: z.string().min(2),
    specialization: z.string().optional().default(""),
    institute: z.string().min(2),
    year: z.coerce.number().int(),
  }),
};

function getTable(req) {
  const table = req.params.table;
  if (!tableSchemas[table]) {
    return null;
  }
  return table;
}

async function notifyAdmins(title, message) {
  const { data: admins } = await supabaseAdmin
    .from("users")
    .select("auth_user_id")
    .eq("role", "admin");

  for (const admin of admins ?? []) {
    const adminId = admin?.auth_user_id;
    if (!adminId) continue;

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({ recipient_user_id: adminId, title, message, is_read: false })
      .select("*")
      .single();

    if (error || !data) {
      emitToUser(adminId, "notification.created", {
        id: `ws-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        recipient_user_id: adminId,
        title,
        message,
        is_read: false,
        created_at: new Date().toISOString(),
      });
      continue;
    }

    emitToUser(adminId, "notification.created", data);
  }
}

async function validateFacultyAccess(user, facultyId) {
  if (user.role === "admin") return true;

  const { data } = await supabaseAdmin
    .from("faculty")
    .select("id")
    .eq("id", facultyId)
    .eq("user_id", user.id)
    .maybeSingle();

  return Boolean(data);
}

export async function listEntries(req, res) {
  const table = getTable(req);
  if (!table) {
    return res.status(400).json({ message: "Unsupported table" });
  }

  const { faculty_id } = req.params;
  const canViewPending = req.user?.role === "admin" || (req.user && (await validateFacultyAccess(req.user, faculty_id)));

  let query = supabaseAdmin.from(table).select("*").eq("faculty_id", faculty_id).order("created_at", { ascending: false });
  if (!canViewPending) {
    query = query.eq("is_approved", true);
  }

  const { data, error } = await query;
  if (error) {
    return res.status(500).json({ message: error.message });
  }

  return res.json(data);
}

export async function createEntry(req, res) {
  const table = getTable(req);
  if (!table) {
    return res.status(400).json({ message: "Unsupported table" });
  }

  const parsed = tableSchemas[table].safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const hasAccess = await validateFacultyAccess(req.user, parsed.data.faculty_id);
  if (!(req.user.role === "admin" || hasAccess)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const payload = {
    ...parsed.data,
    is_approved: req.user.role === "admin",
    created_by: req.user.id,
  };

  const { data, error } = await supabaseAdmin.from(table).insert(payload).select("*").single();
  if (error) {
    return res.status(500).json({ message: error.message });
  }

  if (req.user.role !== "admin") {
    await notifyAdmins(
      "New Entry Pending Review",
      `${table} entry submitted by faculty and is waiting for approval.`,
    );
  }

  return res.status(201).json(data);
}

export async function updateEntry(req, res) {
  const table = getTable(req);
  if (!table) {
    return res.status(400).json({ message: "Unsupported table" });
  }

  const schema = tableSchemas[table].partial();
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", errors: parsed.error.flatten() });
  }

  const { id } = req.params;
  const { data: existing, error: existingError } = await supabaseAdmin
    .from(table)
    .select("id,faculty_id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return res.status(500).json({ message: existingError.message });
  }

  if (!existing) {
    return res.status(404).json({ message: "Entry not found" });
  }

  const hasAccess = await validateFacultyAccess(req.user, existing.faculty_id);
  if (!(req.user.role === "admin" || hasAccess)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { data, error } = await supabaseAdmin
    .from(table)
    .update({
      ...parsed.data,
      is_approved: req.user.role === "admin",
      updated_by: req.user.id,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  if (req.user.role !== "admin") {
    await notifyAdmins(
      "Entry Update Pending Review",
      `${table} entry was updated by faculty and needs approval.`,
    );
  }

  return res.json(data);
}

export async function deleteEntry(req, res) {
  const table = getTable(req);
  if (!table) {
    return res.status(400).json({ message: "Unsupported table" });
  }

  const { id } = req.params;

  const { data: existing } = await supabaseAdmin
    .from(table)
    .select("id,faculty_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return res.status(404).json({ message: "Entry not found" });
  }

  const hasAccess = await validateFacultyAccess(req.user, existing.faculty_id);
  if (!(req.user.role === "admin" || hasAccess)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) {
    return res.status(500).json({ message: error.message });
  }

  return res.status(204).send();
}

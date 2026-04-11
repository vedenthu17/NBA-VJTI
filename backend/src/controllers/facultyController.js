import { z } from "zod";
import { supabaseAdmin } from "../db/supabase.js";

const facultySchema = z.object({
  name: z.string().min(2),
  designation: z.string().min(2),
  department: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  photo_url: z.string().url().optional().or(z.literal("")),
  cv_url: z.string().url().optional().or(z.literal("")),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  github_url: z.string().url().optional().or(z.literal("")),
  google_scholar_url: z.string().url().optional().or(z.literal("")),
  website_url: z.string().url().optional().or(z.literal("")),
  research_area: z.string().optional().default(""),
  bio: z.string().optional().default(""),
  experience_teaching: z.number().int().nonnegative().default(0),
  experience_industry: z.number().int().nonnegative().default(0),
});

const photoUploadSchema = z.object({
  image_base64: z.string().min(30),
  file_name: z.string().optional().default("faculty-photo.jpg"),
});

async function canReadUnapproved(req, facultyId) {
  if (!req.user) return false;
  if (req.user.role === "admin") return true;

  const { data } = await supabaseAdmin
    .from("faculty")
    .select("id")
    .eq("id", facultyId)
    .eq("user_id", req.user.id)
    .maybeSingle();

  return Boolean(data);
}

export async function listFaculty(req, res) {
  const includeAll = req.user?.role === "admin" && req.query.includePending === "true";

  const selectCols = "id,name,designation,department,email,phone,photo_url,research_area,bio,experience_teaching,experience_industry,is_approved,user_id";

  if (includeAll || req.user?.role === "viewer" || !req.user) {
    const { data, error } = await supabaseAdmin.from("faculty").select(selectCols).order("name", { ascending: true });
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    return res.json(data);
  }

  const { data: approved, error: approvedError } = await supabaseAdmin
    .from("faculty")
    .select(selectCols)
    .eq("is_approved", true)
    .order("name", { ascending: true });

  if (approvedError) {
    return res.status(500).json({ message: approvedError.message });
  }

  if (!(req.user?.role === "faculty" || req.user?.role === "admin")) {
    return res.json(approved ?? []);
  }

  const { data: own, error: ownError } = await supabaseAdmin
    .from("faculty")
    .select(selectCols)
    .eq("user_id", req.user.id)
    .order("name", { ascending: true });

  if (ownError) {
    return res.status(500).json({ message: ownError.message });
  }

  const merged = new Map();
  for (const row of approved ?? []) merged.set(row.id, row);
  for (const row of own ?? []) merged.set(row.id, row);

  return res.json(Array.from(merged.values()));
}

export async function getFacultyById(req, res) {
  const { id } = req.params;

  const { data: faculty, error } = await supabaseAdmin.from("faculty").select("*").eq("id", id).maybeSingle();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  if (!faculty) {
    return res.status(404).json({ message: "Faculty profile not found" });
  }

  const tables = [
    "qualifications",
    "publications",
    "fdp",
    "projects",
    "consultancy",
    "patents",
    "books",
    "collaborations",
    "awards",
    "moocs",
    "research_proofs",
    "miscellaneous_items",
  ];

  const canViewPending = req.user?.role === "admin" || req.user?.id === faculty.user_id;

  const related = {};
  for (const table of tables) {
    let query = supabaseAdmin.from(table).select("*").eq("faculty_id", id).order("created_at", { ascending: false });
    if (!canViewPending) {
      query = query.eq("is_approved", true);
    }
    const { data } = await query;
    related[table] = data ?? [];
  }

  return res.json({ faculty, ...related });
}

export async function createFaculty(req, res) {
  const parsed = facultySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid faculty payload", errors: parsed.error.flatten() });
  }

  const payload = {
    ...parsed.data,
    user_id: req.body.user_id ?? null,
    is_approved: req.user.role === "admin",
    created_by: req.user.id,
  };

  const { data, error } = await supabaseAdmin.from("faculty").insert(payload).select("*").single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  return res.status(201).json(data);
}

export async function updateFaculty(req, res) {
  const { id } = req.params;
  const parsed = facultySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid faculty update payload", errors: parsed.error.flatten() });
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("faculty")
    .select("id,user_id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return res.status(500).json({ message: existingError.message });
  }

  if (!existing) {
    return res.status(404).json({ message: "Faculty profile not found" });
  }

  const isOwner = existing.user_id === req.user.id;
  if (!(req.user.role === "admin" || isOwner)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const updatePayload = {
    ...parsed.data,
    updated_by: req.user.id,
    is_approved: req.user.role === "admin",
  };

  const { data, error } = await supabaseAdmin
    .from("faculty")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  return res.json(data);
}

export async function uploadFacultyPhoto(req, res) {
  const { id } = req.params;
  const parsed = photoUploadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid photo payload", errors: parsed.error.flatten() });
  }

  const { data: faculty, error: facultyError } = await supabaseAdmin
    .from("faculty")
    .select("id,user_id")
    .eq("id", id)
    .maybeSingle();

  if (facultyError) {
    return res.status(500).json({ message: facultyError.message });
  }

  if (!faculty) {
    return res.status(404).json({ message: "Faculty profile not found" });
  }

  const isOwner = faculty.user_id === req.user.id;
  if (!(req.user.role === "admin" || isOwner)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const dataUrl = parsed.data.image_base64;
  const matches = dataUrl.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
  if (!matches) {
    return res.status(400).json({ message: "Photo must be a valid base64 image data URL" });
  }

  const contentType = matches[1];
  const fileBase64 = matches[2];

  let fileBuffer;
  try {
    fileBuffer = Buffer.from(fileBase64, "base64");
  } catch {
    return res.status(400).json({ message: "Unable to decode image payload" });
  }

  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const sanitizedName = parsed.data.file_name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.[a-zA-Z0-9]+$/, "");
  const filePath = `${id}/${Date.now()}-${sanitizedName}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("faculty-photos")
    .upload(filePath, fileBuffer, { contentType, upsert: true });

  let photoUrl = dataUrl;
  if (!uploadError) {
    const { data: publicUrlData } = supabaseAdmin.storage.from("faculty-photos").getPublicUrl(filePath);
    photoUrl = publicUrlData.publicUrl;
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("faculty")
    .update({
      photo_url: photoUrl,
      updated_by: req.user.id,
      is_approved: req.user.role === "admin",
    })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError) {
    return res.status(500).json({ message: updateError.message });
  }

  return res.json({ photo_url: updated.photo_url, faculty: updated });
}

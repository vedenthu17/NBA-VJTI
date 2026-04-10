import * as XLSX from "xlsx";
import { supabaseAdmin } from "../db/supabase.js";

export async function getFacultySummary(req, res) {
  const { id } = req.params;

  const [
    publications,
    fdp,
    projects,
    consultancy,
    patents,
    awards,
    moocs,
  ] = await Promise.all([
    supabaseAdmin.from("publications").select("id", { count: "exact", head: true }).eq("faculty_id", id).eq("is_approved", true),
    supabaseAdmin.from("fdp").select("id", { count: "exact", head: true }).eq("faculty_id", id).eq("is_approved", true),
    supabaseAdmin.from("projects").select("id", { count: "exact", head: true }).eq("faculty_id", id).eq("is_approved", true),
    supabaseAdmin.from("consultancy").select("amount").eq("faculty_id", id).eq("is_approved", true),
    supabaseAdmin.from("patents").select("id", { count: "exact", head: true }).eq("faculty_id", id).eq("is_approved", true),
    supabaseAdmin.from("awards").select("id", { count: "exact", head: true }).eq("faculty_id", id).eq("is_approved", true),
    supabaseAdmin.from("moocs").select("id", { count: "exact", head: true }).eq("faculty_id", id).eq("is_approved", true),
  ]);

  const totalConsultancy = (consultancy.data ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  res.json({
    total_publications: publications.count ?? 0,
    total_fdp: fdp.count ?? 0,
    total_projects: projects.count ?? 0,
    total_patents: patents.count ?? 0,
    total_awards: awards.count ?? 0,
    total_moocs: moocs.count ?? 0,
    total_consultancy_amount: totalConsultancy,
  });
}

export async function exportFacultyExcel(req, res) {
  const { id } = req.params;

  const { data: faculty } = await supabaseAdmin.from("faculty").select("*").eq("id", id).maybeSingle();
  if (!faculty) {
    return res.status(404).json({ message: "Faculty profile not found" });
  }

  const tables = ["publications", "fdp", "projects", "consultancy", "patents", "books", "collaborations", "awards", "moocs", "qualifications", "research_proofs", "miscellaneous_items"];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([faculty]), "Faculty");

  for (const table of tables) {
    const { data } = await supabaseAdmin.from(table).select("*").eq("faculty_id", id).eq("is_approved", true);
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data ?? []), table.slice(0, 31));
  }

  const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Disposition", `attachment; filename=faculty-${id}.xlsx`);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

  return res.send(excelBuffer);
}

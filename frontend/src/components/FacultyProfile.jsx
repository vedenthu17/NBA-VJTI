import { useMemo, useRef, useState } from "react";
import PublicationTable from "./PublicationTable";
import FdpTable from "./FdpTable";
import ProjectTable from "./ProjectTable";
import vjtiLogo from "../assets/vjti-logo.svg";

function Section({ title, id, canManage, onAddClick, addLabel = "+ Add", children }) {
  return (
    <section id={id} className="space-y-3 scroll-mt-24">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-3xl font-black text-blue-700">{title}</h2>
        {canManage && (
          <button onClick={onAddClick} className="rounded border border-blue-700 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-700 hover:text-white">
            {addLabel}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function approvalBadge(approved) {
  return (
    <span className={`rounded px-2 py-1 text-xs font-semibold ${approved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
      {approved ? "Approved" : "Pending Approval"}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

function textInputClass() {
  return "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none";
}

function ItemActions({ canManage, isEditing, onEdit, onSave, onDelete, busy }) {
  if (!canManage) return null;
  return (
    <div className="flex items-center gap-2">
      <button onClick={onEdit} className="rounded border border-blue-700 px-2 py-1 text-xs font-bold text-blue-700">
        {isEditing ? "Cancel" : "Edit"}
      </button>
      <button onClick={onDelete} disabled={busy} className="rounded border border-rose-600 px-2 py-1 text-xs font-bold text-rose-700">
        Delete
      </button>
      {isEditing && (
        <button onClick={onSave} disabled={busy} className="gold-button rounded px-2 py-1 text-xs font-bold text-slate-900">
          Save
        </button>
      )}
    </div>
  );
}

function IconLink({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/10 text-white hover:bg-white/20"
    >
      {children}
    </a>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.49 6S0 4.88 0 3.5 1.11 1 2.49 1s2.49 1.12 2.49 2.5zM.5 8h4V23h-4V8zM8 8h3.8v2.1h.1c.53-1 1.84-2.1 3.8-2.1 4.06 0 4.8 2.67 4.8 6.14V23h-4v-6.9c0-1.64-.03-3.74-2.28-3.74-2.29 0-2.64 1.79-2.64 3.63V23H8V8z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.08 1.84 2.83 1.31 3.52 1 .11-.78.42-1.31.77-1.61-2.67-.31-5.47-1.33-5.47-5.92 0-1.31.47-2.38 1.24-3.23-.13-.31-.54-1.57.12-3.27 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.67 1.7.26 2.96.13 3.27.77.85 1.23 1.92 1.23 3.23 0 4.6-2.8 5.61-5.48 5.91.43.37.82 1.09.82 2.2v3.27c0 .32.22.7.83.58A12 12 0 0 0 12 .5z" />
    </svg>
  );
}

function ScholarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3zm0 14L5 13.27V17c0 2.76 3.13 5 7 5s7-2.24 7-5v-3.73L12 17z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export default function FacultyProfile({
  data,
  canManage = false,
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry,
  onUpdateFaculty,
  onUploadPhoto,
  message = "",
  requestUpdates = [],
  busy = false,
}) {
  const {
    faculty,
    qualifications = [],
    publications = [],
    fdp = [],
    projects = [],
    patents = [],
    books = [],
    collaborations = [],
    moocs = [],
    awards = [],
    research_proofs = [],
    miscellaneous_items = [],
  } = data;

  const [openForm, setOpenForm] = useState("");
  const [updatesTab, setUpdatesTab] = useState("all");
  const [editKey, setEditKey] = useState("");
  const [entryEdit, setEntryEdit] = useState({});
  const fileInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState(() => ({
    name: faculty.name || "",
    designation: faculty.designation || "",
    department: faculty.department || "",
    email: faculty.email || "",
    phone: faculty.phone || "",
    photo_url: faculty.photo_url || "",
    cv_url: faculty.cv_url || "",
    linkedin_url: faculty.linkedin_url || "",
    github_url: faculty.github_url || "",
    google_scholar_url: faculty.google_scholar_url || "",
    website_url: faculty.website_url || "",
    research_area: faculty.research_area || "",
    bio: faculty.bio || "",
    experience_teaching: faculty.experience_teaching ?? 0,
    experience_industry: faculty.experience_industry ?? 0,
  }));

  const [entryForm, setEntryForm] = useState({});
  const [miscFieldKey, setMiscFieldKey] = useState("");
  const [miscFieldValue, setMiscFieldValue] = useState("");

  const sectionFormTemplates = useMemo(
    () => ({
      qualifications: { degree: "", specialization: "", institute: "", year: new Date().getFullYear() },
      projects: { title: "", funding_agency: "", amount: 0, year: new Date().getFullYear(), status: "ongoing", reference_url: "", pdf_url: "" },
      fdp: { title: "", role: "participant", duration: "", organized_by: "", start_date: "", end_date: "" },
      publications: { title: "", authors: "", journal: "", year: new Date().getFullYear(), indexed: "", type: "journal", doi: "", reference_url: "", pdf_url: "", scopus: false, wos: false },
      conferences: { title: "", authors: "", journal: "", year: new Date().getFullYear(), indexed: "", type: "conference", doi: "", reference_url: "", pdf_url: "", scopus: false, wos: false },
      patents: { title: "", status: "filed", year: new Date().getFullYear(), number: "", reference_url: "", pdf_url: "" },
      books: { title: "", publisher: "", isbn: "", year: new Date().getFullYear(), reference_url: "", pdf_url: "" },
      collaborations: { title: "", organization: "", country: "", role: "collaborator", start_year: new Date().getFullYear(), end_year: "" },
      awards: { title: "", membership: "", honors: "", contributions: "", year: new Date().getFullYear(), description: "" },
      moocs: { course: "", platform: "", grade: "", year: new Date().getFullYear() },
      research_proofs: { title: "", proof_url: "", description: "", year: new Date().getFullYear() },
      miscellaneous_items: { title: "", description: "", reference_url: "", pdf_url: "", custom_fields: {} },
    }),
    [],
  );

  const openAddForm = (table) => {
    setOpenForm(table);
    setEntryForm(sectionFormTemplates[table] || {});
  };

  const submitEntry = async (table, payload = entryForm) => {
    if (!onCreateEntry) return;
    await onCreateEntry(table, payload);
    setOpenForm("");
    setEntryForm({});
    setMiscFieldKey("");
    setMiscFieldValue("");
  };

  const onBasicSave = async () => {
    if (!onUpdateFaculty) return;
    await onUpdateFaculty(profileForm);
    setOpenForm("");
  };

  const triggerPhotoPicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadPhoto) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = String(reader.result || "");
      await onUploadPhoto(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const loadImageDataUrl = async (src) => {
    const response = await fetch(src);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleResumeDownload = async () => {
    if (faculty.cv_url) {
      const anchor = document.createElement("a");
      anchor.href = faculty.cv_url;
      anchor.target = "_blank";
      anchor.rel = "noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      return;
    }

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

    let y = 40;
    try {
      const logoDataUrl = await loadImageDataUrl(vjtiLogo);
      doc.addImage(logoDataUrl, "PNG", 40, y - 10, 90, 90);
    } catch {
      // Continue PDF generation if logo data conversion fails.
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("VJTI NBA PORTAL", 150, y + 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Faculty Resume", 150, y + 40);
    y += 85;

    doc.setLineWidth(0.7);
    doc.line(40, y, 555, y);
    y += 22;

    const addLine = (label, value = "") => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 40, y);
      doc.setFont("helvetica", "normal");
      const text = value || "-";
      const wrapped = doc.splitTextToSize(String(text), 390);
      doc.text(wrapped, 165, y);
      y += Math.max(18, wrapped.length * 14);
    };

    addLine("Name", faculty.name);
    addLine("Designation", faculty.designation);
    addLine("Department", faculty.department);
    addLine("Email", faculty.email);
    addLine("Phone", faculty.phone);
    addLine("LinkedIn", faculty.linkedin_url);
    addLine("GitHub", faculty.github_url);
    addLine("Google Scholar", faculty.google_scholar_url);
    addLine("Website", faculty.website_url);
    addLine("Research Interests", faculty.research_area);
    addLine("Biosketch", faculty.bio);

    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Academic Summary", 40, y);
    y += 16;
    doc.setFont("helvetica", "normal");

    const summary = [
      `Qualifications: ${qualifications.length}`,
      `Publications: ${publications.length}`,
      `Teaching Engagements: ${fdp.length}`,
      `Projects: ${projects.length}`,
      `Patents: ${patents.length}`,
      `Books: ${books.length}`,
      `Collaborations: ${collaborations.length}`,
      `Awards: ${awards.length}`,
      `MOOCs: ${moocs.length}`,
      `Research Proofs: ${research_proofs.length}`,
      `Miscellaneous Items: ${miscellaneous_items.length}`,
    ];

    summary.forEach((line) => {
      doc.text(`- ${line}`, 45, y);
      y += 14;
    });

    const safeName = (faculty.name || "faculty-profile").replace(/[^a-zA-Z0-9._-]/g, "_");
    doc.save(`${safeName}-resume.pdf`);
  };

  const startEdit = (table, row) => {
    const key = `${table}:${row.id}`;
    if (editKey === key) {
      setEditKey("");
      setEntryEdit({});
      return;
    }
    setEditKey(key);
    setEntryEdit({ ...row });
  };

  const saveEdit = async (table, rowId) => {
    if (!onUpdateEntry) return;
    await onUpdateEntry(table, rowId, entryEdit);
    setEditKey("");
    setEntryEdit({});
  };

  const deleteRow = async (table, rowId) => {
    if (!onDeleteEntry) return;
    await onDeleteEntry(table, rowId);
    if (editKey === `${table}:${rowId}`) {
      setEditKey("");
      setEntryEdit({});
    }
  };

  const addMiscField = () => {
    const key = miscFieldKey.trim();
    if (!key) return;
    setEntryForm((s) => ({
      ...s,
      custom_fields: {
        ...(s.custom_fields || {}),
        [key]: miscFieldValue,
      },
    }));
    setMiscFieldKey("");
    setMiscFieldValue("");
  };

  const honorItems = awards.filter((a) => a.honors);
  const membershipItems = awards.filter((a) => a.membership);
  const contributionItems = awards.filter((a) => a.contributions);
  const awardItems = awards.filter((a) => !a.honors && !a.membership && !a.contributions);
  const conferenceItems = publications.filter((item) => String(item.type || "").toLowerCase() === "conference");
  const publicationItems = publications.filter((item) => String(item.type || "").toLowerCase() !== "conference");
  const filteredUpdates = requestUpdates.filter((item) => {
    if (updatesTab === "all") return true;
    if (updatesTab === "rejected") return item.status === "rejected";
    if (updatesTab === "approved") return item.status === "approved";
    return true;
  });

  return (
    <div className="space-y-8 smooth-fade">
      {message && <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-slate-700">{message}</p>}

      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white shadow-xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr_auto]">
          <img
            src={faculty.photo_url || "https://via.placeholder.com/180x180?text=Faculty"}
            alt={faculty.name}
            className="h-52 w-52 rounded border-2 border-white/80 object-cover"
          />
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold">{faculty.name}</h1>
            <p className="text-2xl font-light">{faculty.designation}</p>
            <p>{faculty.department}</p>
            <p>{faculty.email}</p>
            <p>{faculty.phone}</p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {faculty.linkedin_url && (
                <IconLink href={faculty.linkedin_url} label="LinkedIn">
                  <LinkedInIcon />
                </IconLink>
              )}
              {faculty.github_url && (
                <IconLink href={faculty.github_url} label="GitHub">
                  <GithubIcon />
                </IconLink>
              )}
              {faculty.google_scholar_url && (
                <IconLink href={faculty.google_scholar_url} label="Google Scholar">
                  <ScholarIcon />
                </IconLink>
              )}
              {faculty.website_url && (
                <IconLink href={faculty.website_url} label="Website">
                  <GlobeIcon />
                </IconLink>
              )}
            </div>
            {canManage && approvalBadge(Boolean(faculty.is_approved))}
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <button onClick={handleResumeDownload} className="rounded border border-white/80 px-3 py-2 text-sm font-semibold">
              Download Resume
            </button>
            {canManage && (
              <>
                <button onClick={triggerPhotoPicker} className="rounded border border-white/80 px-3 py-2 text-sm font-semibold">
                  Upload Photo
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                <button onClick={() => setOpenForm((v) => (v === "faculty" ? "" : "faculty"))} className="rounded border border-white/80 px-3 py-2 text-sm font-semibold">
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {canManage && (
        <section className="rounded border border-slate-300 bg-white px-4 py-3 text-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Request Updates</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUpdatesTab("all")}
                className={`rounded px-2 py-1 text-xs font-semibold ${updatesTab === "all" ? "bg-slate-800 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setUpdatesTab("rejected")}
                className={`rounded px-2 py-1 text-xs font-semibold ${updatesTab === "rejected" ? "bg-rose-700 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
              >
                Rejected
              </button>
              <button
                type="button"
                onClick={() => setUpdatesTab("approved")}
                className={`rounded px-2 py-1 text-xs font-semibold ${updatesTab === "approved" ? "bg-emerald-700 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
              >
                Approved
              </button>
            </div>
          </div>

          <div className="mt-3 max-h-64 space-y-2 overflow-auto">
            {filteredUpdates.slice(0, 30).map((item) => (
              <div
                key={item.id}
                className={`rounded border px-3 py-2 ${
                  item.status === "rejected"
                    ? "border-rose-200 bg-rose-50"
                    : item.status === "approved"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  {!item.isRead && <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">Unread</span>}
                </div>
                {item.remark ? (
                  <p className="mt-1 text-sm text-slate-700">Remark: {item.remark}</p>
                ) : (
                  <p className="mt-1 text-sm text-slate-700">{item.message}</p>
                )}
                {item.createdAt && <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>}
              </div>
            ))}
            {!filteredUpdates.length && <p className="text-sm text-slate-500">No updates in this tab yet.</p>}
          </div>
        </section>
      )}

      <div className="space-y-8">
      {canManage && openForm === "faculty" && (
        <section className="rounded border border-slate-300 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-bold text-slate-800">Update Basic Profile</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input className="rounded border px-3 py-2" value={profileForm.name} onChange={(e) => setProfileForm((s) => ({ ...s, name: e.target.value }))} placeholder="Name" />
            <input className="rounded border px-3 py-2" value={profileForm.designation} onChange={(e) => setProfileForm((s) => ({ ...s, designation: e.target.value }))} placeholder="Designation" />
            <input className="rounded border px-3 py-2" value={profileForm.department} onChange={(e) => setProfileForm((s) => ({ ...s, department: e.target.value }))} placeholder="Department" />
            <input className="rounded border px-3 py-2" value={profileForm.email} onChange={(e) => setProfileForm((s) => ({ ...s, email: e.target.value }))} placeholder="Email" />
            <input className="rounded border px-3 py-2" value={profileForm.phone} onChange={(e) => setProfileForm((s) => ({ ...s, phone: e.target.value }))} placeholder="Phone" />
            <input className="rounded border px-3 py-2" value={profileForm.photo_url} onChange={(e) => setProfileForm((s) => ({ ...s, photo_url: e.target.value }))} placeholder="Photo URL" />
            <input className="rounded border px-3 py-2" value={profileForm.cv_url} onChange={(e) => setProfileForm((s) => ({ ...s, cv_url: e.target.value }))} placeholder="Resume URL (PDF/Doc)" />
            <input className="rounded border px-3 py-2" value={profileForm.linkedin_url} onChange={(e) => setProfileForm((s) => ({ ...s, linkedin_url: e.target.value }))} placeholder="LinkedIn URL" />
            <input className="rounded border px-3 py-2" value={profileForm.github_url} onChange={(e) => setProfileForm((s) => ({ ...s, github_url: e.target.value }))} placeholder="GitHub URL" />
            <input className="rounded border px-3 py-2" value={profileForm.google_scholar_url} onChange={(e) => setProfileForm((s) => ({ ...s, google_scholar_url: e.target.value }))} placeholder="Google Scholar URL" />
            <input className="rounded border px-3 py-2" value={profileForm.website_url} onChange={(e) => setProfileForm((s) => ({ ...s, website_url: e.target.value }))} placeholder="Personal Website URL" />
            <input className="rounded border px-3 py-2" type="number" value={profileForm.experience_teaching} onChange={(e) => setProfileForm((s) => ({ ...s, experience_teaching: Number(e.target.value) }))} placeholder="Teaching Experience" />
            <input className="rounded border px-3 py-2" type="number" value={profileForm.experience_industry} onChange={(e) => setProfileForm((s) => ({ ...s, experience_industry: Number(e.target.value) }))} placeholder="Industry Experience" />
            <textarea className="rounded border px-3 py-2 md:col-span-2" rows={2} value={profileForm.research_area} onChange={(e) => setProfileForm((s) => ({ ...s, research_area: e.target.value }))} placeholder="Research Interests" />
            <textarea className="rounded border px-3 py-2 md:col-span-2" rows={3} value={profileForm.bio} onChange={(e) => setProfileForm((s) => ({ ...s, bio: e.target.value }))} placeholder="Biosketch" />
            <button onClick={onBasicSave} disabled={busy} className="gold-button rounded px-4 py-2 text-sm font-semibold text-slate-900 md:col-span-2">
              {busy ? "Saving..." : "Save Profile Change"}
            </button>
          </div>
        </section>
      )}

      <Section id="research" title="Research Interests" canManage={false}>
        <p className="leading-7 text-slate-700">{faculty.research_area || "Not available"}</p>
      </Section>

      <Section id="biosketch" title="Biosketch" canManage={false}>
        <p className="leading-7 text-slate-700">{faculty.bio || "No biography provided"}</p>
      </Section>

      <Section id="qualifications" title="Education" canManage={canManage} onAddClick={() => openAddForm("qualifications")}>
        {canManage && openForm === "qualifications" && (
          <div className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-blue-50 p-3 md:grid-cols-2">
            <Field label="Degree"><input className={textInputClass()} placeholder="Degree" onChange={(e) => setEntryForm((s) => ({ ...s, degree: e.target.value }))} /></Field>
            <Field label="Specialization"><input className={textInputClass()} placeholder="Specialization" onChange={(e) => setEntryForm((s) => ({ ...s, specialization: e.target.value }))} /></Field>
            <Field label="Institute"><input className={textInputClass()} placeholder="Institute" onChange={(e) => setEntryForm((s) => ({ ...s, institute: e.target.value }))} /></Field>
            <Field label="Year"><input className={textInputClass()} type="number" placeholder="Year" onChange={(e) => setEntryForm((s) => ({ ...s, year: Number(e.target.value) }))} /></Field>
            <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900" onClick={() => submitEntry("qualifications")}>Save</button>
          </div>
        )}
        <ul className="space-y-2">
          {qualifications.map((q) => (
            <li key={q.id} className="rounded border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <p><span className="font-semibold">{q.degree}</span> in {q.specialization}</p>
                  <p className="text-sm text-slate-600">{q.institute} ({q.year})</p>
                  {editKey === `qualifications:${q.id}` && (
                    <div className="grid gap-2 md:grid-cols-2">
                      <input className={textInputClass()} value={entryEdit.degree || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, degree: e.target.value }))} />
                      <input className={textInputClass()} value={entryEdit.specialization || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, specialization: e.target.value }))} />
                      <input className={textInputClass()} value={entryEdit.institute || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, institute: e.target.value }))} />
                      <input className={textInputClass()} type="number" value={entryEdit.year || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, year: Number(e.target.value) }))} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {canManage && approvalBadge(Boolean(q.is_approved))}
                  <ItemActions
                    canManage={canManage}
                    isEditing={editKey === `qualifications:${q.id}`}
                    onEdit={() => startEdit("qualifications", q)}
                    onSave={() => saveEdit("qualifications", q.id)}
                    onDelete={() => deleteRow("qualifications", q.id)}
                    busy={busy}
                  />
                </div>
              </div>
            </li>
          ))}
          {!qualifications.length && <li className="text-slate-500">No qualification entries.</li>}
        </ul>
      </Section>

      <Section id="publications" title="Publications" canManage={canManage} onAddClick={() => openAddForm("publications")}>
        {canManage && openForm === "publications" && (
          <div className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-blue-50 p-3 md:grid-cols-2">
            <input className="rounded border px-2 py-1 md:col-span-2" placeholder="Title" onChange={(e) => setEntryForm((s) => ({ ...s, title: e.target.value }))} />
            <input className="rounded border px-2 py-1" placeholder="Authors (optional)" onChange={(e) => setEntryForm((s) => ({ ...s, authors: e.target.value }))} />
            <input className="rounded border px-2 py-1" placeholder="Journal / Publisher (optional)" onChange={(e) => setEntryForm((s) => ({ ...s, journal: e.target.value }))} />
            <input className="rounded border px-2 py-1" type="number" placeholder="Year" onChange={(e) => setEntryForm((s) => ({ ...s, year: Number(e.target.value) }))} />
            <select className={textInputClass()} onChange={(e) => setEntryForm((s) => ({ ...s, type: e.target.value }))}>
              <option value="journal">Journal</option>
              <option value="book_chapter">Book Chapter</option>
            </select>
            <input className="rounded border px-2 py-1" placeholder="Indexed" onChange={(e) => setEntryForm((s) => ({ ...s, indexed: e.target.value }))} />
            <input className="rounded border px-2 py-1" placeholder="Reference URL (optional)" onChange={(e) => setEntryForm((s) => ({ ...s, reference_url: e.target.value }))} />
            <input className="rounded border px-2 py-1" placeholder="PDF URL (optional)" onChange={(e) => setEntryForm((s) => ({ ...s, pdf_url: e.target.value }))} />
            <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900" onClick={() => submitEntry("publications")}>Save</button>
          </div>
        )}
        <PublicationTable items={publicationItems} showApproval={canManage} />
        {canManage && (
          <div className="mt-3 space-y-2">
            {publicationItems.map((row) => (
              <div key={`pub-manage-${row.id}`} className="rounded border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">{row.title}</p>
                  <div className="flex items-center gap-2">
                    {approvalBadge(Boolean(row.is_approved))}
                    <ItemActions
                      canManage={canManage}
                      isEditing={editKey === `publications:${row.id}`}
                      onEdit={() => startEdit("publications", row)}
                      onSave={() => saveEdit("publications", row.id)}
                      onDelete={() => deleteRow("publications", row.id)}
                      busy={busy}
                    />
                  </div>
                </div>
                {editKey === `publications:${row.id}` && (
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <input className={`${textInputClass()} md:col-span-2`} value={entryEdit.title || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, title: e.target.value }))} />
                    <input className={textInputClass()} value={entryEdit.authors || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, authors: e.target.value }))} placeholder="Authors" />
                    <input className={textInputClass()} value={entryEdit.journal || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, journal: e.target.value }))} placeholder="Journal" />
                    <input className={textInputClass()} type="number" value={entryEdit.year || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, year: Number(e.target.value) }))} />
                    <input className={textInputClass()} value={entryEdit.indexed || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, indexed: e.target.value }))} placeholder="Indexed" />
                    <input className={textInputClass()} value={entryEdit.reference_url || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, reference_url: e.target.value }))} placeholder="Reference URL" />
                    <input className={textInputClass()} value={entryEdit.pdf_url || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, pdf_url: e.target.value }))} placeholder="PDF URL" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section id="conferences" title="Conferences" canManage={canManage} onAddClick={() => openAddForm("conferences")}>
        {canManage && openForm === "conferences" && (
          <div className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-blue-50 p-3 md:grid-cols-2">
            <input className="rounded border px-2 py-1 md:col-span-2" placeholder="Paper Title" onChange={(e) => setEntryForm((s) => ({ ...s, title: e.target.value }))} />
            <input className="rounded border px-2 py-1" placeholder="Authors (optional)" onChange={(e) => setEntryForm((s) => ({ ...s, authors: e.target.value }))} />
            <input className="rounded border px-2 py-1" placeholder="Conference Name" onChange={(e) => setEntryForm((s) => ({ ...s, journal: e.target.value }))} />
            <input className="rounded border px-2 py-1" type="number" placeholder="Year" onChange={(e) => setEntryForm((s) => ({ ...s, year: Number(e.target.value) }))} />
            <input className="rounded border px-2 py-1" placeholder="Indexed" onChange={(e) => setEntryForm((s) => ({ ...s, indexed: e.target.value }))} />
            <input className="rounded border px-2 py-1" placeholder="Reference URL (optional)" onChange={(e) => setEntryForm((s) => ({ ...s, reference_url: e.target.value }))} />
            <input className="rounded border px-2 py-1" placeholder="PDF URL (optional)" onChange={(e) => setEntryForm((s) => ({ ...s, pdf_url: e.target.value }))} />
            <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900" onClick={() => submitEntry("publications", { ...entryForm, type: "conference" })}>Save</button>
          </div>
        )}
        <PublicationTable items={conferenceItems} showApproval={canManage} />
        {canManage && (
          <div className="mt-3 space-y-2">
            {conferenceItems.map((row) => (
              <div key={`conf-manage-${row.id}`} className="rounded border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">{row.title}</p>
                  <div className="flex items-center gap-2">
                    {approvalBadge(Boolean(row.is_approved))}
                    <ItemActions
                      canManage={canManage}
                      isEditing={editKey === `publications:${row.id}`}
                      onEdit={() => startEdit("publications", row)}
                      onSave={() => saveEdit("publications", row.id)}
                      onDelete={() => deleteRow("publications", row.id)}
                      busy={busy}
                    />
                  </div>
                </div>
                {editKey === `publications:${row.id}` && (
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <input className={`${textInputClass()} md:col-span-2`} value={entryEdit.title || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, title: e.target.value }))} />
                    <input className={textInputClass()} value={entryEdit.authors || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, authors: e.target.value }))} placeholder="Authors" />
                    <input className={textInputClass()} value={entryEdit.journal || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, journal: e.target.value }))} placeholder="Conference Name" />
                    <input className={textInputClass()} type="number" value={entryEdit.year || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, year: Number(e.target.value) }))} />
                    <input className={textInputClass()} value={entryEdit.indexed || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, indexed: e.target.value }))} placeholder="Indexed" />
                    <input className={textInputClass()} value={entryEdit.reference_url || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, reference_url: e.target.value }))} placeholder="Reference URL" />
                    <input className={textInputClass()} value={entryEdit.pdf_url || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, pdf_url: e.target.value }))} placeholder="PDF URL" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section id="fdp" title="Teaching Engagements" canManage={canManage} onAddClick={() => openAddForm("fdp")}>
        {canManage && openForm === "fdp" && (
          <div className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-blue-50 p-3 md:grid-cols-2">
            <input className="rounded border px-2 py-1 md:col-span-2" placeholder="Title" onChange={(e) => setEntryForm((s) => ({ ...s, title: e.target.value }))} />
            <select className={textInputClass()} onChange={(e) => setEntryForm((s) => ({ ...s, role: e.target.value }))}>
              <option value="participant">Participant</option>
              <option value="resource_person">Resource Person</option>
              <option value="organizer">Organizer</option>
            </select>
            <input className="rounded border px-2 py-1" placeholder="Duration" onChange={(e) => setEntryForm((s) => ({ ...s, duration: e.target.value }))} />
            <input className="rounded border px-2 py-1 md:col-span-2" placeholder="Organized By" onChange={(e) => setEntryForm((s) => ({ ...s, organized_by: e.target.value }))} />
            <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900" onClick={() => submitEntry("fdp")}>Save</button>
          </div>
        )}
        <FdpTable items={fdp} showApproval={canManage} />
        {canManage && (
          <div className="mt-3 space-y-2">
            {fdp.map((row) => (
              <div key={`fdp-manage-${row.id}`} className="rounded border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">{row.title}</p>
                  <div className="flex items-center gap-2">
                    {approvalBadge(Boolean(row.is_approved))}
                    <ItemActions
                      canManage={canManage}
                      isEditing={editKey === `fdp:${row.id}`}
                      onEdit={() => startEdit("fdp", row)}
                      onSave={() => saveEdit("fdp", row.id)}
                      onDelete={() => deleteRow("fdp", row.id)}
                      busy={busy}
                    />
                  </div>
                </div>
                {editKey === `fdp:${row.id}` && (
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <input className={`${textInputClass()} md:col-span-2`} value={entryEdit.title || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, title: e.target.value }))} />
                    <input className={textInputClass()} value={entryEdit.role || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, role: e.target.value }))} placeholder="Role" />
                    <input className={textInputClass()} value={entryEdit.duration || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, duration: e.target.value }))} placeholder="Duration" />
                    <input className={`${textInputClass()} md:col-span-2`} value={entryEdit.organized_by || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, organized_by: e.target.value }))} placeholder="Organized By" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section id="projects" title="Projects" canManage={canManage} onAddClick={() => openAddForm("projects")}>
        {canManage && openForm === "projects" && (
          <div className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-blue-50 p-3 md:grid-cols-2">
            <input className="rounded border px-2 py-1 md:col-span-2" placeholder="Title" onChange={(e) => setEntryForm((s) => ({ ...s, title: e.target.value }))} />
            <input className="rounded border px-2 py-1" placeholder="Funding Agency" onChange={(e) => setEntryForm((s) => ({ ...s, funding_agency: e.target.value }))} />
            <input className="rounded border px-2 py-1" type="number" placeholder="Amount" onChange={(e) => setEntryForm((s) => ({ ...s, amount: Number(e.target.value) }))} />
            <input className="rounded border px-2 py-1" type="number" placeholder="Year" onChange={(e) => setEntryForm((s) => ({ ...s, year: Number(e.target.value) }))} />
            <select className={textInputClass()} onChange={(e) => setEntryForm((s) => ({ ...s, status: e.target.value }))}>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
            <input className="rounded border px-2 py-1" placeholder="Reference URL (optional)" onChange={(e) => setEntryForm((s) => ({ ...s, reference_url: e.target.value }))} />
            <input className="rounded border px-2 py-1" placeholder="PDF URL (optional)" onChange={(e) => setEntryForm((s) => ({ ...s, pdf_url: e.target.value }))} />
            <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900" onClick={() => submitEntry("projects")}>Save</button>
          </div>
        )}
        <ProjectTable items={projects} showApproval={canManage} />
        {canManage && (
          <div className="mt-3 space-y-2">
            {projects.map((row) => (
              <div key={`project-manage-${row.id}`} className="rounded border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">{row.title}</p>
                  <div className="flex items-center gap-2">
                    {approvalBadge(Boolean(row.is_approved))}
                    <ItemActions
                      canManage={canManage}
                      isEditing={editKey === `projects:${row.id}`}
                      onEdit={() => startEdit("projects", row)}
                      onSave={() => saveEdit("projects", row.id)}
                      onDelete={() => deleteRow("projects", row.id)}
                      busy={busy}
                    />
                  </div>
                </div>
                {editKey === `projects:${row.id}` && (
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <input className={`${textInputClass()} md:col-span-2`} value={entryEdit.title || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, title: e.target.value }))} />
                    <input className={textInputClass()} value={entryEdit.funding_agency || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, funding_agency: e.target.value }))} placeholder="Funding Agency" />
                    <input className={textInputClass()} type="number" value={entryEdit.amount || 0} onChange={(e) => setEntryEdit((s) => ({ ...s, amount: Number(e.target.value) }))} placeholder="Amount" />
                    <input className={textInputClass()} type="number" value={entryEdit.year || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, year: Number(e.target.value) }))} placeholder="Year" />
                    <input className={textInputClass()} value={entryEdit.status || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, status: e.target.value }))} placeholder="Status" />
                    <input className={textInputClass()} value={entryEdit.reference_url || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, reference_url: e.target.value }))} placeholder="Reference URL" />
                    <input className={textInputClass()} value={entryEdit.pdf_url || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, pdf_url: e.target.value }))} placeholder="PDF URL" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section id="patents" title="Patents" canManage={canManage} onAddClick={() => openAddForm("patents")}>
        {canManage && openForm === "patents" && (
          <div className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-blue-50 p-3 md:grid-cols-2">
            <input className="rounded border px-2 py-1 md:col-span-2" placeholder="Title" onChange={(e) => setEntryForm((s) => ({ ...s, title: e.target.value }))} />
            <select className={textInputClass()} onChange={(e) => setEntryForm((s) => ({ ...s, status: e.target.value }))}>
              <option value="filed">Filed</option>
              <option value="published">Published</option>
              <option value="granted">Granted</option>
            </select>
            <input className="rounded border px-2 py-1" type="number" placeholder="Year" onChange={(e) => setEntryForm((s) => ({ ...s, year: Number(e.target.value) }))} />
            <input className="rounded border px-2 py-1" placeholder="Patent Number" onChange={(e) => setEntryForm((s) => ({ ...s, number: e.target.value }))} />
            <input className="rounded border px-2 py-1" placeholder="Reference URL (optional)" onChange={(e) => setEntryForm((s) => ({ ...s, reference_url: e.target.value }))} />
            <input className="rounded border px-2 py-1" placeholder="PDF URL (optional)" onChange={(e) => setEntryForm((s) => ({ ...s, pdf_url: e.target.value }))} />
            <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900" onClick={() => submitEntry("patents")}>Save</button>
          </div>
        )}
        <ul className="space-y-2">
          {patents.map((p) => (
            <li key={p.id} className="rounded border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span><span className="font-semibold">{p.title}</span> | {p.status} | {p.year}</span>
                <div className="flex items-center gap-2">
                  {canManage && approvalBadge(Boolean(p.is_approved))}
                  <ItemActions
                    canManage={canManage}
                    isEditing={editKey === `patents:${p.id}`}
                    onEdit={() => startEdit("patents", p)}
                    onSave={() => saveEdit("patents", p.id)}
                    onDelete={() => deleteRow("patents", p.id)}
                    busy={busy}
                  />
                </div>
              </div>
              {editKey === `patents:${p.id}` && (
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <input className={textInputClass()} value={entryEdit.title || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, title: e.target.value }))} />
                  <select className={textInputClass()} value={entryEdit.status || "filed"} onChange={(e) => setEntryEdit((s) => ({ ...s, status: e.target.value }))}>
                    <option value="filed">Filed</option>
                    <option value="published">Published</option>
                    <option value="granted">Granted</option>
                  </select>
                  <input className={textInputClass()} type="number" value={entryEdit.year || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, year: Number(e.target.value) }))} />
                  <input className={textInputClass()} value={entryEdit.number || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, number: e.target.value }))} />
                  <input className={textInputClass()} value={entryEdit.reference_url || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, reference_url: e.target.value }))} placeholder="Reference URL" />
                  <input className={textInputClass()} value={entryEdit.pdf_url || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, pdf_url: e.target.value }))} placeholder="PDF URL" />
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {p.reference_url && <a href={p.reference_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-700 underline">Reference Link</a>}
                {p.pdf_url && <a href={p.pdf_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-700 underline">PDF Link</a>}
              </div>
            </li>
          ))}
          {!patents.length && <li className="text-slate-500">No patent entries.</li>}
        </ul>
      </Section>

      <Section id="books" title="Books" canManage={canManage} onAddClick={() => openAddForm("books")}>
        {canManage && openForm === "books" && (
          <div className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-blue-50 p-3 md:grid-cols-2">
            <input className={textInputClass()} placeholder="Book Title" onChange={(e) => setEntryForm((s) => ({ ...s, title: e.target.value }))} />
            <input className={textInputClass()} placeholder="Publisher" onChange={(e) => setEntryForm((s) => ({ ...s, publisher: e.target.value }))} />
            <input className={textInputClass()} placeholder="ISBN" onChange={(e) => setEntryForm((s) => ({ ...s, isbn: e.target.value }))} />
            <input className={textInputClass()} type="number" placeholder="Year" onChange={(e) => setEntryForm((s) => ({ ...s, year: Number(e.target.value) }))} />
            <input className={textInputClass()} placeholder="Reference URL (optional)" onChange={(e) => setEntryForm((s) => ({ ...s, reference_url: e.target.value }))} />
            <input className={textInputClass()} placeholder="PDF URL (optional)" onChange={(e) => setEntryForm((s) => ({ ...s, pdf_url: e.target.value }))} />
            <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900" onClick={() => submitEntry("books")}>Save</button>
          </div>
        )}
        <ul className="space-y-2">
          {books.map((book) => (
            <li key={book.id} className="rounded border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span><span className="font-semibold">{book.title}</span> | {book.publisher} | {book.year}</span>
                <div className="flex items-center gap-2">
                  {canManage && approvalBadge(Boolean(book.is_approved))}
                  <ItemActions
                    canManage={canManage}
                    isEditing={editKey === `books:${book.id}`}
                    onEdit={() => startEdit("books", book)}
                    onSave={() => saveEdit("books", book.id)}
                    onDelete={() => deleteRow("books", book.id)}
                    busy={busy}
                  />
                </div>
              </div>
              {editKey === `books:${book.id}` && (
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <input className={textInputClass()} value={entryEdit.title || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, title: e.target.value }))} />
                  <input className={textInputClass()} value={entryEdit.publisher || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, publisher: e.target.value }))} />
                  <input className={textInputClass()} value={entryEdit.isbn || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, isbn: e.target.value }))} />
                  <input className={textInputClass()} type="number" value={entryEdit.year || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, year: Number(e.target.value) }))} />
                  <input className={textInputClass()} value={entryEdit.reference_url || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, reference_url: e.target.value }))} placeholder="Reference URL" />
                  <input className={textInputClass()} value={entryEdit.pdf_url || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, pdf_url: e.target.value }))} placeholder="PDF URL" />
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {book.reference_url && <a href={book.reference_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-700 underline">Reference Link</a>}
                {book.pdf_url && <a href={book.pdf_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-700 underline">PDF Link</a>}
              </div>
            </li>
          ))}
          {!books.length && <li className="text-slate-500">No book entries.</li>}
        </ul>
      </Section>

      <Section id="collaborations" title="Collaborations" canManage={canManage} onAddClick={() => openAddForm("collaborations")}>
        {canManage && openForm === "collaborations" && (
          <div className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-blue-50 p-3 md:grid-cols-2">
            <input className={textInputClass()} placeholder="Collaboration Title" onChange={(e) => setEntryForm((s) => ({ ...s, title: e.target.value }))} />
            <input className={textInputClass()} placeholder="Organization" onChange={(e) => setEntryForm((s) => ({ ...s, organization: e.target.value }))} />
            <input className={textInputClass()} placeholder="Country" onChange={(e) => setEntryForm((s) => ({ ...s, country: e.target.value }))} />
            <select className={textInputClass()} onChange={(e) => setEntryForm((s) => ({ ...s, role: e.target.value }))}>
              <option value="collaborator">Collaborator</option>
              <option value="principal_investigator">Principal Investigator</option>
              <option value="coordinator">Coordinator</option>
            </select>
            <input className={textInputClass()} type="number" placeholder="Start Year" onChange={(e) => setEntryForm((s) => ({ ...s, start_year: Number(e.target.value) }))} />
            <input className={textInputClass()} type="number" placeholder="End Year" onChange={(e) => setEntryForm((s) => ({ ...s, end_year: Number(e.target.value) }))} />
            <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900" onClick={() => submitEntry("collaborations")}>Save</button>
          </div>
        )}
        <ul className="space-y-2">
          {collaborations.map((c) => (
            <li key={c.id} className="rounded border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span><span className="font-semibold">{c.title}</span> - {c.organization}, {c.country} ({c.start_year} - {c.end_year || "Present"})</span>
                <div className="flex items-center gap-2">
                  {canManage && approvalBadge(Boolean(c.is_approved))}
                  <ItemActions
                    canManage={canManage}
                    isEditing={editKey === `collaborations:${c.id}`}
                    onEdit={() => startEdit("collaborations", c)}
                    onSave={() => saveEdit("collaborations", c.id)}
                    onDelete={() => deleteRow("collaborations", c.id)}
                    busy={busy}
                  />
                </div>
              </div>
              {editKey === `collaborations:${c.id}` && (
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <input className={textInputClass()} value={entryEdit.title || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, title: e.target.value }))} />
                  <input className={textInputClass()} value={entryEdit.organization || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, organization: e.target.value }))} />
                  <input className={textInputClass()} value={entryEdit.country || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, country: e.target.value }))} />
                  <select className={textInputClass()} value={entryEdit.role || "collaborator"} onChange={(e) => setEntryEdit((s) => ({ ...s, role: e.target.value }))}>
                    <option value="collaborator">Collaborator</option>
                    <option value="principal_investigator">Principal Investigator</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                  <input className={textInputClass()} type="number" value={entryEdit.start_year || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, start_year: Number(e.target.value) }))} />
                  <input className={textInputClass()} type="number" value={entryEdit.end_year || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, end_year: Number(e.target.value) }))} />
                </div>
              )}
            </li>
          ))}
          {!collaborations.length && <li className="text-slate-500">No collaboration entries.</li>}
        </ul>
      </Section>

      <Section id="awards" title="Awards" canManage={canManage} onAddClick={() => openAddForm("awards")}>
        {canManage && openForm === "awards" && (
          <div className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-blue-50 p-3 md:grid-cols-2">
            <input className="rounded border px-2 py-1 md:col-span-2" placeholder="Title" onChange={(e) => setEntryForm((s) => ({ ...s, title: e.target.value }))} />
            <input className="rounded border px-2 py-1" type="number" placeholder="Year" onChange={(e) => setEntryForm((s) => ({ ...s, year: Number(e.target.value) }))} />
            <textarea className="rounded border px-2 py-1 md:col-span-2" rows={2} placeholder="Description" onChange={(e) => setEntryForm((s) => ({ ...s, description: e.target.value }))} />
            <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900" onClick={() => submitEntry("awards")}>Save</button>
          </div>
        )}
        <ul className="space-y-2">
          {awardItems.map((a) => (
            <li key={a.id} className="rounded border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span><span className="font-semibold">{a.title}</span> ({a.year}) - {a.description}</span>
                <div className="flex items-center gap-2">
                  {canManage && approvalBadge(Boolean(a.is_approved))}
                  <ItemActions
                    canManage={canManage}
                    isEditing={editKey === `awards:${a.id}`}
                    onEdit={() => startEdit("awards", a)}
                    onSave={() => saveEdit("awards", a.id)}
                    onDelete={() => deleteRow("awards", a.id)}
                    busy={busy}
                  />
                </div>
              </div>
              {editKey === `awards:${a.id}` && (
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input className={textInputClass()} value={entryEdit.title || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, title: e.target.value }))} />
                  <input className={textInputClass()} type="number" value={entryEdit.year || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, year: Number(e.target.value) }))} />
                  <textarea className="rounded border px-2 py-1 md:col-span-2" rows={2} value={entryEdit.description || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, description: e.target.value }))} />
                </div>
              )}
            </li>
          ))}
          {!awardItems.length && <li className="text-slate-500">No awards entries.</li>}
        </ul>
      </Section>

      <Section id="honors" title="Honors and Recognition" canManage={canManage} onAddClick={() => openAddForm("awards_honors")}>
        <div id="awards-honors" className="mt-4 space-y-2 scroll-mt-24 rounded border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-800">Honors</h3>
            {canManage && <button className="rounded border border-blue-700 px-2 py-1 text-xs font-semibold text-blue-700" onClick={() => openAddForm("awards_honors")}>+ Add</button>}
          </div>
          {canManage && openForm === "awards_honors" && (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <input className="rounded border px-2 py-1" placeholder="Title" onChange={(e) => setEntryForm((s) => ({ ...s, title: e.target.value }))} />
              <input className="rounded border px-2 py-1" type="number" placeholder="Year" onChange={(e) => setEntryForm((s) => ({ ...s, year: Number(e.target.value) }))} />
              <input className="rounded border px-2 py-1 md:col-span-2" placeholder="Honor" onChange={(e) => setEntryForm((s) => ({ ...s, honors: e.target.value }))} />
              <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900 md:col-span-2" onClick={() => submitEntry("awards")}>Save Honor</button>
            </div>
          )}
          {honorItems.map((item) => (
            <div key={`honor-${item.id}`} className="rounded border border-slate-200 bg-white p-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm"><span className="font-semibold">{item.title || "Honor"}</span> ({item.year || "-"}) - {item.honors}</p>
                <div className="flex items-center gap-2">
                  {canManage && approvalBadge(Boolean(item.is_approved))}
                  <ItemActions canManage={canManage} isEditing={editKey === `awards:${item.id}`} onEdit={() => startEdit("awards", item)} onSave={() => saveEdit("awards", item.id)} onDelete={() => deleteRow("awards", item.id)} busy={busy} />
                </div>
              </div>
              {editKey === `awards:${item.id}` && (
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input className={textInputClass()} value={entryEdit.title || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, title: e.target.value }))} />
                  <input className={textInputClass()} type="number" value={entryEdit.year || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, year: Number(e.target.value) }))} />
                  <input className={`${textInputClass()} md:col-span-2`} value={entryEdit.honors || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, honors: e.target.value }))} />
                </div>
              )}
            </div>
          ))}
          {!honorItems.length && <p className="text-sm text-slate-500">No honors added.</p>}
        </div>

        <div id="awards-membership" className="mt-4 space-y-2 scroll-mt-24 rounded border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-800">Membership</h3>
            {canManage && <button className="rounded border border-blue-700 px-2 py-1 text-xs font-semibold text-blue-700" onClick={() => openAddForm("awards_membership")}>+ Add</button>}
          </div>
          {canManage && openForm === "awards_membership" && (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <input className="rounded border px-2 py-1" placeholder="Title" onChange={(e) => setEntryForm((s) => ({ ...s, title: e.target.value }))} />
              <input className="rounded border px-2 py-1" type="number" placeholder="Year" onChange={(e) => setEntryForm((s) => ({ ...s, year: Number(e.target.value) }))} />
              <input className="rounded border px-2 py-1 md:col-span-2" placeholder="Membership" onChange={(e) => setEntryForm((s) => ({ ...s, membership: e.target.value }))} />
              <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900 md:col-span-2" onClick={() => submitEntry("awards")}>Save Membership</button>
            </div>
          )}
          {membershipItems.map((item) => (
            <div key={`membership-${item.id}`} className="rounded border border-slate-200 bg-white p-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm"><span className="font-semibold">{item.title || "Membership"}</span> ({item.year || "-"}) - {item.membership}</p>
                <div className="flex items-center gap-2">
                  {canManage && approvalBadge(Boolean(item.is_approved))}
                  <ItemActions canManage={canManage} isEditing={editKey === `awards:${item.id}`} onEdit={() => startEdit("awards", item)} onSave={() => saveEdit("awards", item.id)} onDelete={() => deleteRow("awards", item.id)} busy={busy} />
                </div>
              </div>
              {editKey === `awards:${item.id}` && (
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input className={textInputClass()} value={entryEdit.title || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, title: e.target.value }))} />
                  <input className={textInputClass()} type="number" value={entryEdit.year || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, year: Number(e.target.value) }))} />
                  <input className={`${textInputClass()} md:col-span-2`} value={entryEdit.membership || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, membership: e.target.value }))} />
                </div>
              )}
            </div>
          ))}
          {!membershipItems.length && <p className="text-sm text-slate-500">No membership entries added.</p>}
        </div>

        <div id="awards-contributions" className="mt-4 space-y-2 scroll-mt-24 rounded border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-800">Contributions</h3>
            {canManage && <button className="rounded border border-blue-700 px-2 py-1 text-xs font-semibold text-blue-700" onClick={() => openAddForm("awards_contributions")}>+ Add</button>}
          </div>
          {canManage && openForm === "awards_contributions" && (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <input className="rounded border px-2 py-1" placeholder="Title" onChange={(e) => setEntryForm((s) => ({ ...s, title: e.target.value }))} />
              <input className="rounded border px-2 py-1" type="number" placeholder="Year" onChange={(e) => setEntryForm((s) => ({ ...s, year: Number(e.target.value) }))} />
              <textarea className="rounded border px-2 py-1 md:col-span-2" rows={2} placeholder="Contributions" onChange={(e) => setEntryForm((s) => ({ ...s, contributions: e.target.value }))} />
              <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900 md:col-span-2" onClick={() => submitEntry("awards")}>Save Contribution</button>
            </div>
          )}
          {contributionItems.map((item) => (
            <div key={`contrib-${item.id}`} className="rounded border border-slate-200 bg-white p-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm"><span className="font-semibold">{item.title || "Contribution"}</span> ({item.year || "-"}) - {item.contributions}</p>
                <div className="flex items-center gap-2">
                  {canManage && approvalBadge(Boolean(item.is_approved))}
                  <ItemActions canManage={canManage} isEditing={editKey === `awards:${item.id}`} onEdit={() => startEdit("awards", item)} onSave={() => saveEdit("awards", item.id)} onDelete={() => deleteRow("awards", item.id)} busy={busy} />
                </div>
              </div>
              {editKey === `awards:${item.id}` && (
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input className={textInputClass()} value={entryEdit.title || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, title: e.target.value }))} />
                  <input className={textInputClass()} type="number" value={entryEdit.year || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, year: Number(e.target.value) }))} />
                  <textarea className="rounded border px-2 py-1 md:col-span-2" rows={2} value={entryEdit.contributions || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, contributions: e.target.value }))} />
                </div>
              )}
            </div>
          ))}
          {!contributionItems.length && <p className="text-sm text-slate-500">No contributions added.</p>}
        </div>
      </Section>

      <Section title="MOOCs" canManage={canManage} onAddClick={() => openAddForm("moocs")}>
        {canManage && openForm === "moocs" && (
          <div className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-blue-50 p-3 md:grid-cols-2">
            <input className="rounded border px-2 py-1 md:col-span-2" placeholder="Course" onChange={(e) => setEntryForm((s) => ({ ...s, course: e.target.value }))} />
            <input className="rounded border px-2 py-1" placeholder="Platform" onChange={(e) => setEntryForm((s) => ({ ...s, platform: e.target.value }))} />
            <input className="rounded border px-2 py-1" placeholder="Grade" onChange={(e) => setEntryForm((s) => ({ ...s, grade: e.target.value }))} />
            <input className="rounded border px-2 py-1" type="number" placeholder="Year" onChange={(e) => setEntryForm((s) => ({ ...s, year: Number(e.target.value) }))} />
            <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900" onClick={() => submitEntry("moocs")}>Save</button>
          </div>
        )}
        <ul className="space-y-2">
          {moocs.map((m) => (
            <li key={m.id} className="rounded border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span><span className="font-semibold">{m.course}</span> - {m.platform} ({m.year})</span>
                <div className="flex items-center gap-2">
                  {canManage && approvalBadge(Boolean(m.is_approved))}
                  <ItemActions
                    canManage={canManage}
                    isEditing={editKey === `moocs:${m.id}`}
                    onEdit={() => startEdit("moocs", m)}
                    onSave={() => saveEdit("moocs", m.id)}
                    onDelete={() => deleteRow("moocs", m.id)}
                    busy={busy}
                  />
                </div>
              </div>
              {editKey === `moocs:${m.id}` && (
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <input className={textInputClass()} value={entryEdit.course || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, course: e.target.value }))} />
                  <input className={textInputClass()} value={entryEdit.platform || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, platform: e.target.value }))} />
                  <input className={textInputClass()} value={entryEdit.grade || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, grade: e.target.value }))} />
                  <input className={textInputClass()} type="number" value={entryEdit.year || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, year: Number(e.target.value) }))} />
                </div>
              )}
            </li>
          ))}
          {!moocs.length && <li className="text-slate-500">No MOOC entries.</li>}
        </ul>
      </Section>

      <Section id="research-proofs" title="Research Proofs" canManage={canManage} onAddClick={() => openAddForm("research_proofs")}>
        {canManage && openForm === "research_proofs" && (
          <div className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-blue-50 p-3 md:grid-cols-2">
            <input className="rounded border px-2 py-1 md:col-span-2" placeholder="Title" onChange={(e) => setEntryForm((s) => ({ ...s, title: e.target.value }))} />
            <input className="rounded border px-2 py-1 md:col-span-2" placeholder="Proof URL" onChange={(e) => setEntryForm((s) => ({ ...s, proof_url: e.target.value }))} />
            <textarea className="rounded border px-2 py-1 md:col-span-2" rows={2} placeholder="Description" onChange={(e) => setEntryForm((s) => ({ ...s, description: e.target.value }))} />
            <input className="rounded border px-2 py-1" type="number" placeholder="Year" onChange={(e) => setEntryForm((s) => ({ ...s, year: Number(e.target.value) }))} />
            <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900" onClick={() => submitEntry("research_proofs")}>Save</button>
          </div>
        )}
        <ul className="space-y-2">
          {research_proofs.map((proof) => (
            <li key={proof.id} className="rounded border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <a href={proof.proof_url} target="_blank" rel="noreferrer" className="font-semibold text-slate-800 hover:text-amber-700">{proof.title}</a>
                <div className="flex items-center gap-2">
                  {canManage && approvalBadge(Boolean(proof.is_approved))}
                  <ItemActions
                    canManage={canManage}
                    isEditing={editKey === `research_proofs:${proof.id}`}
                    onEdit={() => startEdit("research_proofs", proof)}
                    onSave={() => saveEdit("research_proofs", proof.id)}
                    onDelete={() => deleteRow("research_proofs", proof.id)}
                    busy={busy}
                  />
                </div>
              </div>
              <p className="text-sm text-slate-600">{proof.description || "No description"}</p>
              {editKey === `research_proofs:${proof.id}` && (
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <input className={textInputClass()} value={entryEdit.title || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, title: e.target.value }))} />
                  <input className={textInputClass()} type="number" value={entryEdit.year || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, year: Number(e.target.value) }))} />
                  <input className={`${textInputClass()} md:col-span-2`} value={entryEdit.proof_url || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, proof_url: e.target.value }))} />
                  <textarea className="rounded border px-2 py-1 md:col-span-2" rows={2} value={entryEdit.description || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, description: e.target.value }))} />
                </div>
              )}
            </li>
          ))}
          {!research_proofs.length && <li className="text-slate-500">No research proofs available.</li>}
        </ul>
      </Section>

      <Section id="misc" title="Miscellaneous" canManage={canManage} onAddClick={() => openAddForm("miscellaneous_items")}>
        {canManage && (
          <div className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-blue-50 p-3 md:grid-cols-2">
            <input className={textInputClass()} placeholder="Title" onChange={(e) => setEntryForm((s) => ({ ...s, title: e.target.value }))} />
            <input className={textInputClass()} placeholder="Reference URL (optional)" onChange={(e) => setEntryForm((s) => ({ ...s, reference_url: e.target.value }))} />
            <textarea className="rounded border px-3 py-2 md:col-span-2" rows={2} placeholder="Description" onChange={(e) => setEntryForm((s) => ({ ...s, description: e.target.value }))} />
            <input className={textInputClass()} placeholder="PDF URL (optional)" onChange={(e) => setEntryForm((s) => ({ ...s, pdf_url: e.target.value }))} />

            <div className="md:col-span-2 rounded border border-dashed border-slate-300 p-2">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-600">Custom Fields (self-made form)</p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]">
                <input className={textInputClass()} placeholder="Field Name" value={miscFieldKey} onChange={(e) => setMiscFieldKey(e.target.value)} />
                <input className={textInputClass()} placeholder="Field Value" value={miscFieldValue} onChange={(e) => setMiscFieldValue(e.target.value)} />
                <button className="rounded border border-slate-400 px-3 py-2 text-sm font-semibold text-slate-700" onClick={addMiscField}>Add Field</button>
              </div>
              {!!Object.keys(entryForm.custom_fields || {}).length && (
                <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-700 md:grid-cols-2">
                  {Object.entries(entryForm.custom_fields || {}).map(([k, v]) => (
                    <div key={k} className="rounded bg-white px-2 py-1"><span className="font-semibold">{k}:</span> {String(v)}</div>
                  ))}
                </div>
              )}
            </div>

            <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900 md:col-span-2" onClick={() => submitEntry("miscellaneous_items")}>Save Miscellaneous</button>
          </div>
        )}

        <div className="mt-3 space-y-2">
          {miscellaneous_items.map((item) => (
            <div key={item.id} className="rounded border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-800">{item.title}</p>
                <div className="flex items-center gap-2">
                  {canManage && approvalBadge(Boolean(item.is_approved))}
                  <ItemActions
                    canManage={canManage}
                    isEditing={editKey === `miscellaneous_items:${item.id}`}
                    onEdit={() => startEdit("miscellaneous_items", item)}
                    onSave={() => saveEdit("miscellaneous_items", item.id)}
                    onDelete={() => deleteRow("miscellaneous_items", item.id)}
                    busy={busy}
                  />
                </div>
              </div>
              <p className="text-sm text-slate-600">{item.description || "No description"}</p>
              {editKey === `miscellaneous_items:${item.id}` && (
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input className={textInputClass()} value={entryEdit.title || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, title: e.target.value }))} />
                  <input className={textInputClass()} value={entryEdit.reference_url || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, reference_url: e.target.value }))} placeholder="Reference URL" />
                  <input className={textInputClass()} value={entryEdit.pdf_url || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, pdf_url: e.target.value }))} placeholder="PDF URL" />
                  <textarea className="rounded border px-2 py-1 md:col-span-2" rows={2} value={entryEdit.description || ""} onChange={(e) => setEntryEdit((s) => ({ ...s, description: e.target.value }))} />
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {item.reference_url && <a href={item.reference_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-700 underline">Reference Link</a>}
                {item.pdf_url && <a href={item.pdf_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-700 underline">PDF Link</a>}
              </div>
              {!!Object.keys(item.custom_fields || {}).length && (
                <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-700 md:grid-cols-2">
                  {Object.entries(item.custom_fields || {}).map(([k, v]) => (
                    <div key={k} className="rounded bg-white px-2 py-1"><span className="font-semibold">{k}:</span> {String(v)}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {!miscellaneous_items.length && <p className="text-slate-600">No miscellaneous entries yet.</p>}
        </div>
      </Section>
      </div>
    </div>
  );
}

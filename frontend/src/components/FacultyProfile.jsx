import { useMemo, useRef, useState } from "react";
import PublicationTable from "./PublicationTable";
import FdpTable from "./FdpTable";
import ProjectTable from "./ProjectTable";

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

function ItemActions({ canManage, isEditing, onEdit, onSave, busy }) {
  if (!canManage) return null;
  return (
    <div className="flex items-center gap-2">
      <button onClick={onEdit} className="rounded border border-blue-700 px-2 py-1 text-xs font-bold text-blue-700">
        {isEditing ? "Cancel" : "Edit"}
      </button>
      {isEditing && (
        <button onClick={onSave} disabled={busy} className="gold-button rounded px-2 py-1 text-xs font-bold text-slate-900">
          Save
        </button>
      )}
    </div>
  );
}

export default function FacultyProfile({
  data,
  canManage = false,
  onCreateEntry,
  onUpdateEntry,
  onUpdateFaculty,
  onUploadPhoto,
  message = "",
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
  } = data;

  const [openForm, setOpenForm] = useState("");
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
    research_area: faculty.research_area || "",
    bio: faculty.bio || "",
    experience_teaching: faculty.experience_teaching ?? 0,
    experience_industry: faculty.experience_industry ?? 0,
  }));

  const [entryForm, setEntryForm] = useState({});

  const sectionFormTemplates = useMemo(
    () => ({
      qualifications: { degree: "", specialization: "", institute: "", year: new Date().getFullYear() },
      projects: { title: "", funding_agency: "", amount: 0, year: new Date().getFullYear(), status: "ongoing" },
      fdp: { title: "", role: "participant", duration: "", organized_by: "", start_date: "", end_date: "" },
      publications: { title: "", authors: "", journal: "", year: new Date().getFullYear(), indexed: "", type: "journal", doi: "", scopus: false, wos: false },
      patents: { title: "", status: "filed", year: new Date().getFullYear(), number: "" },
      books: { title: "", publisher: "", isbn: "", year: new Date().getFullYear() },
      collaborations: { title: "", organization: "", country: "", role: "collaborator", start_year: new Date().getFullYear(), end_year: "" },
      awards: { title: "", year: new Date().getFullYear(), description: "" },
      moocs: { course: "", platform: "", grade: "", year: new Date().getFullYear() },
      research_proofs: { title: "", proof_url: "", description: "", year: new Date().getFullYear() },
    }),
    [],
  );

  const openAddForm = (table) => {
    setOpenForm(table);
    setEntryForm(sectionFormTemplates[table] || {});
  };

  const submitEntry = async (table) => {
    if (!onCreateEntry) return;
    await onCreateEntry(table, entryForm);
    setOpenForm("");
    setEntryForm({});
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
            {canManage && approvalBadge(Boolean(faculty.is_approved))}
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <a href={faculty.cv_url || "#"} className="rounded border border-white/80 px-3 py-2 text-sm font-semibold" onClick={(e) => !faculty.cv_url && e.preventDefault()}>
              Download Resume
            </a>
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
            <input className="rounded border px-2 py-1" placeholder="Authors" onChange={(e) => setEntryForm((s) => ({ ...s, authors: e.target.value }))} />
            <input className="rounded border px-2 py-1" placeholder="Journal" onChange={(e) => setEntryForm((s) => ({ ...s, journal: e.target.value }))} />
            <input className="rounded border px-2 py-1" type="number" placeholder="Year" onChange={(e) => setEntryForm((s) => ({ ...s, year: Number(e.target.value) }))} />
            <select className={textInputClass()} onChange={(e) => setEntryForm((s) => ({ ...s, type: e.target.value }))}>
              <option value="journal">Journal</option>
              <option value="conference">Conference</option>
              <option value="book_chapter">Book Chapter</option>
            </select>
            <input className="rounded border px-2 py-1" placeholder="Indexed" onChange={(e) => setEntryForm((s) => ({ ...s, indexed: e.target.value }))} />
            <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900" onClick={() => submitEntry("publications")}>Save</button>
          </div>
        )}
        <PublicationTable items={publications} showApproval={canManage} />
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
            <button className="gold-button rounded px-3 py-1 text-sm font-semibold text-slate-900" onClick={() => submitEntry("projects")}>Save</button>
          </div>
        )}
        <ProjectTable items={projects} showApproval={canManage} />
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
                </div>
              )}
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
                </div>
              )}
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
          {awards.map((a) => (
            <li key={a.id} className="rounded border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span><span className="font-semibold">{a.title}</span> ({a.year}) - {a.description}</span>
                {canManage && approvalBadge(Boolean(a.is_approved))}
              </div>
            </li>
          ))}
          {!awards.length && <li className="text-slate-500">No awards entries.</li>}
        </ul>
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
                {canManage && approvalBadge(Boolean(m.is_approved))}
              </div>
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
                {canManage && approvalBadge(Boolean(proof.is_approved))}
              </div>
              <p className="text-sm text-slate-600">{proof.description || "No description"}</p>
            </li>
          ))}
          {!research_proofs.length && <li className="text-slate-500">No research proofs available.</li>}
        </ul>
      </Section>

      <Section id="misc" title="Miscellaneous" canManage={false}>
        <p className="text-slate-600">Additional activities and records can be attached under the relevant sections.</p>
      </Section>
      </div>
    </div>
  );
}

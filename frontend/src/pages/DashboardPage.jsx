import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { entryApi, facultyApi, reportApi } from "../api/facultyApi";
import { useAuth } from "../context/AuthContext";
import PublicationTable from "../components/PublicationTable";
import FdpTable from "../components/FdpTable";
import ProjectTable from "../components/ProjectTable";

const publicationSchema = z.object({
  faculty_id: z.string().uuid("Select a valid faculty"),
  title: z.string().min(2),
  authors: z.string().optional(),
  journal: z.string().optional(),
  year: z.coerce.number().int(),
  indexed: z.string().optional(),
});

const fdpSchema = z.object({
  faculty_id: z.string().uuid("Select a valid faculty"),
  title: z.string().min(2),
  role: z.string().min(2),
  duration: z.string().min(1),
  organized_by: z.string().min(2),
});

const projectSchema = z.object({
  faculty_id: z.string().uuid("Select a valid faculty"),
  title: z.string().min(2),
  funding_agency: z.string().min(2),
  amount: z.coerce.number().nonnegative(),
  year: z.coerce.number().int(),
  status: z.string().min(2),
});

const proofSchema = z.object({
  faculty_id: z.string().uuid("Select a valid faculty"),
  title: z.string().min(2),
  proof_url: z.string().url(),
  description: z.string().optional(),
  year: z.coerce.number().int(),
});

const profileSchema = z.object({
  name: z.string().min(2),
  designation: z.string().min(2),
  department: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  photo_url: z.string().url().or(z.literal("")),
  research_area: z.string().optional(),
  bio: z.string().optional(),
  experience_teaching: z.coerce.number().int().nonnegative(),
  experience_industry: z.coerce.number().int().nonnegative(),
});

function toCvText(profileData, summary) {
  const f = profileData.faculty;
  return [
    "CURRICULUM VITAE",
    `Name: ${f.name}`,
    `Designation: ${f.designation}`,
    `Department: ${f.department}`,
    `Email: ${f.email}`,
    `Phone: ${f.phone}`,
    "",
    `Research Area: ${f.research_area || "-"}`,
    `Bio: ${f.bio || "-"}`,
    "",
    "NBA Summary",
    `Publications: ${summary.total_publications}`,
    `FDP: ${summary.total_fdp}`,
    `Projects: ${summary.total_projects}`,
    `Consultancy Amount: ${summary.total_consultancy_amount}`,
  ].join("\n");
}

export default function DashboardPage() {
  const { token, role, user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const { data: facultyList = [] } = useQuery({
    queryKey: ["faculty", "dashboard"],
    queryFn: () => facultyApi.list(token),
  });

  const selectedFaculty = useMemo(() => {
    return facultyList.find((f) => f.user_id === user?.id) || facultyList.find((f) => f.email === user?.email) || facultyList[0] || null;
  }, [facultyList, user?.email, user?.id]);

  const facultyId = selectedFaculty?.id;

  const { data: profileData } = useQuery({
    queryKey: ["faculty", facultyId, "dashboard-full"],
    queryFn: () => facultyApi.byId(facultyId, token),
    enabled: Boolean(facultyId),
  });

  const { data: summary } = useQuery({
    queryKey: ["summary", facultyId],
    queryFn: () => reportApi.summary(facultyId, token),
    enabled: Boolean(facultyId),
  });

  const publicationForm = useForm({
    resolver: zodResolver(publicationSchema),
    defaultValues: { faculty_id: "", title: "", authors: "", journal: "", year: new Date().getFullYear(), indexed: "" },
  });

  const fdpForm = useForm({
    resolver: zodResolver(fdpSchema),
    defaultValues: { faculty_id: "", title: "", role: "Participant", duration: "", organized_by: "" },
  });

  const projectForm = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: { faculty_id: "", title: "", funding_agency: "", amount: 0, year: new Date().getFullYear(), status: "Ongoing" },
  });

  const proofForm = useForm({
    resolver: zodResolver(proofSchema),
    defaultValues: { faculty_id: "", title: "", proof_url: "", description: "", year: new Date().getFullYear() },
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      designation: "",
      department: "",
      email: "",
      phone: "",
      photo_url: "",
      research_area: "",
      bio: "",
      experience_teaching: 0,
      experience_industry: 0,
    },
  });

  useEffect(() => {
    if (!facultyId) return;
    publicationForm.setValue("faculty_id", facultyId);
    fdpForm.setValue("faculty_id", facultyId);
    projectForm.setValue("faculty_id", facultyId);
    proofForm.setValue("faculty_id", facultyId);
  }, [facultyId, publicationForm, fdpForm, projectForm, proofForm]);

  useEffect(() => {
    if (!profileData?.faculty) return;
    const f = profileData.faculty;
    profileForm.reset({
      name: f.name || "",
      designation: f.designation || "",
      department: f.department || "",
      email: f.email || "",
      phone: f.phone || "",
      photo_url: f.photo_url || "",
      research_area: f.research_area || "",
      bio: f.bio || "",
      experience_teaching: f.experience_teaching ?? 0,
      experience_industry: f.experience_industry ?? 0,
    });
  }, [profileData, profileForm]);

  const mutationConfig = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty", facultyId, "dashboard-full"] });
      queryClient.invalidateQueries({ queryKey: ["summary", facultyId] });
      setMessage("Saved successfully. Entry is pending admin approval.");
    },
    onError: (error) => {
      setMessage(error.message || "Operation failed.");
    },
  };

  const createPublication = useMutation({
    mutationFn: (body) => entryApi.create("publications", body, token),
    ...mutationConfig,
  });

  const createFdp = useMutation({
    mutationFn: (body) => entryApi.create("fdp", body, token),
    ...mutationConfig,
  });

  const createProject = useMutation({
    mutationFn: (body) => entryApi.create("projects", body, token),
    ...mutationConfig,
  });

  const createProof = useMutation({
    mutationFn: (body) => entryApi.create("research_proofs", body, token),
    ...mutationConfig,
  });

  const updatePublication = useMutation({
    mutationFn: ({ id, body }) => entryApi.update("publications", id, body, token),
    ...mutationConfig,
  });

  const updateProfile = useMutation({
    mutationFn: (body) => facultyApi.update(facultyId, body, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty", facultyId, "dashboard-full"] });
      queryClient.invalidateQueries({ queryKey: ["faculty", "dashboard"] });
      setMessage("Profile updated. It will be visible in viewer mode after admin approval.");
    },
    onError: (error) => setMessage(error.message || "Profile update failed."),
  });

  if (!facultyId) {
    return <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">No faculty profile mapped for this account yet.</section>;
  }

  const downloadCv = () => {
    if (!profileData || !summary) return;
    const blob = new Blob([toCvText(profileData, summary)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${profileData.faculty.name.replace(/\s+/g, "_")}_CV.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = async () => {
    try {
      const blob = await reportApi.exportExcel(facultyId, token);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${selectedFaculty.name.replace(/\s+/g, "_")}_NBA.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error.message || "Export failed.");
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
      <header className="rounded-md border border-amber-300 bg-gradient-to-r from-amber-500 to-amber-400 p-5 text-slate-900">
        <h1 className="text-3xl font-black">Faculty Dashboard</h1>
        <p className="mt-1 text-slate-800">Role: {role}. New and edited entries require admin approval before public visibility.</p>
      </header>

      <section className="rounded-md border border-slate-300 bg-white p-5">
        <h2 className="mb-3 text-xl font-bold">Current Signed-in Faculty Profile</h2>
        <form onSubmit={profileForm.handleSubmit((values) => updateProfile.mutate(values))} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input className="rounded border px-3 py-2" placeholder="Name" {...profileForm.register("name")} />
          <input className="rounded border px-3 py-2" placeholder="Designation" {...profileForm.register("designation")} />
          <input className="rounded border px-3 py-2" placeholder="Department" {...profileForm.register("department")} />
          <input className="rounded border px-3 py-2" placeholder="Email" {...profileForm.register("email")} />
          <input className="rounded border px-3 py-2" placeholder="Phone" {...profileForm.register("phone")} />
          <input className="rounded border px-3 py-2" placeholder="Photo URL" {...profileForm.register("photo_url")} />
          <input className="rounded border px-3 py-2" placeholder="Teaching Experience (Years)" type="number" {...profileForm.register("experience_teaching")} />
          <input className="rounded border px-3 py-2" placeholder="Industry Experience (Years)" type="number" {...profileForm.register("experience_industry")} />
          <textarea className="rounded border px-3 py-2 md:col-span-2" placeholder="Research Areas" rows={2} {...profileForm.register("research_area")} />
          <textarea className="rounded border px-3 py-2 md:col-span-2" placeholder="Biosketch" rows={3} {...profileForm.register("bio")} />
          <button className="gold-button rounded px-4 py-2 text-sm font-semibold text-slate-900 md:col-span-2">
            {updateProfile.isPending ? "Saving..." : "Save Full Profile"}
          </button>
        </form>
      </section>

      {message && <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-slate-700">{message}</p>}

      <div className="grid gap-4 rounded-md border border-slate-300 bg-white p-4 md:grid-cols-4">
        <div><p className="text-xs uppercase text-slate-500">Publications</p><p className="text-2xl font-bold">{summary?.total_publications ?? 0}</p></div>
        <div><p className="text-xs uppercase text-slate-500">FDP</p><p className="text-2xl font-bold">{summary?.total_fdp ?? 0}</p></div>
        <div><p className="text-xs uppercase text-slate-500">Projects</p><p className="text-2xl font-bold">{summary?.total_projects ?? 0}</p></div>
        <div><p className="text-xs uppercase text-slate-500">Consultancy</p><p className="text-2xl font-bold">INR {Number(summary?.total_consultancy_amount ?? 0).toLocaleString()}</p></div>
        <div className="md:col-span-4 flex flex-wrap gap-2 pt-2">
          <button onClick={downloadCv} className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:-translate-y-0.5">Auto Generate CV</button>
          <button onClick={exportExcel} className="rounded bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:-translate-y-0.5">Export Excel</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <form onSubmit={publicationForm.handleSubmit((v) => createPublication.mutate(v))} className="space-y-3 rounded border border-slate-300 bg-white p-4">
          <h2 className="text-lg font-bold">Add Publication</h2>
          <input type="hidden" {...publicationForm.register("faculty_id")} />
          <input placeholder="Title" className="w-full rounded border px-3 py-2" {...publicationForm.register("title")} />
          <input placeholder="Authors" className="w-full rounded border px-3 py-2" {...publicationForm.register("authors")} />
          <input placeholder="Journal" className="w-full rounded border px-3 py-2" {...publicationForm.register("journal")} />
          <input placeholder="Year" type="number" className="w-full rounded border px-3 py-2" {...publicationForm.register("year")} />
          <input placeholder="Indexed" className="w-full rounded border px-3 py-2" {...publicationForm.register("indexed")} />
          <button className="rounded bg-amber-400 px-3 py-2 font-semibold text-slate-900 hover:-translate-y-0.5">Save</button>
        </form>

        <form onSubmit={fdpForm.handleSubmit((v) => createFdp.mutate(v))} className="space-y-3 rounded border border-slate-300 bg-white p-4">
          <h2 className="text-lg font-bold">Add FDP</h2>
          <input type="hidden" {...fdpForm.register("faculty_id")} />
          <input placeholder="Title" className="w-full rounded border px-3 py-2" {...fdpForm.register("title")} />
          <input placeholder="Role" className="w-full rounded border px-3 py-2" {...fdpForm.register("role")} />
          <input placeholder="Duration" className="w-full rounded border px-3 py-2" {...fdpForm.register("duration")} />
          <input placeholder="Organized By" className="w-full rounded border px-3 py-2" {...fdpForm.register("organized_by")} />
          <button className="rounded bg-amber-400 px-3 py-2 font-semibold text-slate-900 hover:-translate-y-0.5">Save</button>
        </form>

        <form onSubmit={projectForm.handleSubmit((v) => createProject.mutate(v))} className="space-y-3 rounded border border-slate-300 bg-white p-4">
          <h2 className="text-lg font-bold">Add Project</h2>
          <input type="hidden" {...projectForm.register("faculty_id")} />
          <input placeholder="Title" className="w-full rounded border px-3 py-2" {...projectForm.register("title")} />
          <input placeholder="Funding Agency" className="w-full rounded border px-3 py-2" {...projectForm.register("funding_agency")} />
          <input placeholder="Amount" type="number" className="w-full rounded border px-3 py-2" {...projectForm.register("amount")} />
          <input placeholder="Year" type="number" className="w-full rounded border px-3 py-2" {...projectForm.register("year")} />
          <input placeholder="Status" className="w-full rounded border px-3 py-2" {...projectForm.register("status")} />
          <button className="rounded bg-amber-400 px-3 py-2 font-semibold text-slate-900 hover:-translate-y-0.5">Save</button>
        </form>

        <form onSubmit={proofForm.handleSubmit((v) => createProof.mutate(v))} className="space-y-3 rounded border border-slate-300 bg-white p-4">
          <h2 className="text-lg font-bold">Add Research Proof (Optional)</h2>
          <input type="hidden" {...proofForm.register("faculty_id")} />
          <input placeholder="Proof Title" className="w-full rounded border px-3 py-2" {...proofForm.register("title")} />
          <input placeholder="Proof URL (Drive/GitHub/DOI)" className="w-full rounded border px-3 py-2" {...proofForm.register("proof_url")} />
          <input placeholder="Description" className="w-full rounded border px-3 py-2" {...proofForm.register("description")} />
          <input placeholder="Year" type="number" className="w-full rounded border px-3 py-2" {...proofForm.register("year")} />
          <button className="rounded bg-amber-400 px-3 py-2 font-semibold text-slate-900 hover:-translate-y-0.5">Save</button>
        </form>
      </div>

      <section className="space-y-3 rounded border border-slate-300 bg-white p-4">
        <h2 className="text-xl font-bold">Edit Previous Publications</h2>
        {(profileData?.publications || []).map((row) => (
          <div key={row.id} className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_1fr_120px_auto]">
            <input defaultValue={row.title} onBlur={(e) => updatePublication.mutate({ id: row.id, body: { title: e.target.value } })} className="rounded border px-2 py-1" />
            <input defaultValue={row.journal} onBlur={(e) => updatePublication.mutate({ id: row.id, body: { journal: e.target.value } })} className="rounded border px-2 py-1" />
            <input defaultValue={row.year} type="number" onBlur={(e) => updatePublication.mutate({ id: row.id, body: { year: Number(e.target.value) } })} className="rounded border px-2 py-1" />
            <span className={`self-center text-xs font-semibold ${row.is_approved ? "text-emerald-700" : "text-amber-700"}`}>
              {row.is_approved ? "Approved" : "Pending"}
            </span>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-2 rounded border border-slate-300 bg-white p-4">
          <h2 className="text-lg font-bold">Publications</h2>
          <PublicationTable items={profileData?.publications || []} />
        </div>
        <div className="space-y-2 rounded border border-slate-300 bg-white p-4">
          <h2 className="text-lg font-bold">FDP</h2>
          <FdpTable items={profileData?.fdp || []} />
        </div>
        <div className="space-y-2 rounded border border-slate-300 bg-white p-4">
          <h2 className="text-lg font-bold">Projects</h2>
          <ProjectTable items={profileData?.projects || []} />
        </div>
      </section>

      <section className="rounded border border-slate-300 bg-white p-4">
        <h2 className="mb-3 text-lg font-bold">Research Proofs</h2>
        <div className="space-y-2">
          {(profileData?.research_proofs || []).map((proof) => (
            <a key={proof.id} href={proof.proof_url} target="_blank" rel="noreferrer" className="block rounded border border-slate-200 bg-slate-50 p-3 hover:bg-amber-50">
              <p className="font-semibold text-slate-800">{proof.title} ({proof.year})</p>
              <p className="text-sm text-slate-600">{proof.description || "No description"}</p>
              <p className="text-xs text-slate-500">{proof.proof_url}</p>
            </a>
          ))}
          {!profileData?.research_proofs?.length && <p className="text-sm text-slate-500">No research proofs added.</p>}
        </div>
      </section>
    </section>
  );
}

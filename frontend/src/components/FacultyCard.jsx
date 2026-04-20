import { Link } from "react-router-dom";

export default function FacultyCard({ faculty }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#9d2235]/15 bg-gradient-to-br from-white via-[#fff7f8] to-[#fff5f7] p-5 shadow-[0_14px_34px_rgba(127,16,34,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(127,16,34,0.2)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#9d2235] via-[#9d2235] to-[#9d2235]" />
      <div className="flex items-start gap-4">
        <img
          src={faculty.photo_url || "https://via.placeholder.com/120x120?text=Faculty"}
          alt={faculty.name}
          className="h-24 w-24 rounded-xl object-cover ring-2 ring-[#9d2235]/30"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xl font-extrabold text-[#7f1022]">{faculty.name}</h3>
          <p className="mt-0.5 font-semibold text-slate-700">{faculty.designation || "Faculty"}</p>
          <p className="mt-2 inline-flex rounded-full border border-[#9d2235]/45 bg-[#9d2235]/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#5f4310]">
            {faculty.department || "Department"}
          </p>
          <p className="mt-2 truncate text-sm text-slate-600">{faculty.email || "No email available"}</p>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
        {faculty.research_area || "Research interests will be updated soon."}
      </p>
      <Link
        to={`/faculty/${faculty.id}`}
        className="mt-5 inline-flex w-fit items-center rounded-lg border border-[#9d2235]/30 bg-[#9d2235] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(127,16,34,0.28)] transition group-hover:bg-[#ae152d]"
      >
        View Profile
      </Link>
    </article>
  );
}

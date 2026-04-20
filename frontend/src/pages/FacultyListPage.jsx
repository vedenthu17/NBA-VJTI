import FacultyList from "../components/FacultyList";
import { useFacultyList } from "../hooks/useFaculty";
import { useAuth } from "../context/AuthContext";

export default function FacultyListPage() {
  const { token } = useAuth();
  const { data, isLoading, error } = useFacultyList(token);
  const faculty = data || [];
  const departmentCount = new Set(faculty.map((item) => item.department).filter(Boolean)).size;

  return (
    <section className="pb-10">
      <div className="campus-hero relative overflow-hidden px-4 py-14 md:px-8 md:py-16">
        <div className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-[#c3475b]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="campus-kicker">People</p>
          <h1 className="mt-3 text-4xl font-bold text-white md:text-5xl">Faculty Members</h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-100">
            Browse approved faculty profiles curated for institutional visibility and NBA accreditation documentation.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-white/25 bg-white/15 px-4 py-1.5 font-semibold text-white backdrop-blur-sm">
              {isLoading ? "Loading..." : `${faculty.length} Profiles`}
            </span>
            <span className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 font-semibold text-slate-100 backdrop-blur-sm">
              {isLoading ? "Departments" : `${departmentCount || 0} Departments`}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {isLoading && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-2xl border border-[#9d2235]/10 bg-gradient-to-br from-white to-[#fff5f7]"
              />
            ))}
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/90 px-5 py-4 text-rose-700 shadow-sm">
            {error.message}
          </div>
        )}
        {!isLoading && !error && <FacultyList faculty={faculty} />}
      </div>
    </section>
  );
}

import FacultyCard from "./FacultyCard";

export default function FacultyList({ faculty = [] }) {
  if (!faculty.length) {
    return (
      <section className="rounded-2xl border border-[#9d2235]/15 bg-gradient-to-br from-white to-[#fff6f8] px-6 py-12 text-center shadow-sm">
        <h2 className="text-xl font-bold text-[#9d2235]">No Faculty Profiles Found</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
          Profiles will appear here once faculty records are approved and available in the directory.
        </p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {faculty.map((f) => (
        <FacultyCard key={f.id} faculty={f} />
      ))}
    </section>
  );
}

import { Link } from "react-router-dom";
import AdminPanel from "../components/AdminPanel";

export default function AdminFacultyPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-4 flex flex-wrap gap-2">
        <Link to="/admin" className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Pending</Link>
        <Link to="/admin/history" className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Past Approvals</Link>
        <Link to="/admin/faculty" className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Faculty Directory</Link>
        <Link to="/admin/query" className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Query Search</Link>
      </div>
      <AdminPanel initialTab="faculty" />
    </section>
  );
}

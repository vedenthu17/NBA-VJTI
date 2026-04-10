import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api/facultyApi";
import { useAuth } from "../context/AuthContext";

export default function AdminQueryPage() {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    q: "",
    designation: "",
    department: "",
    table: "all",
    status: "all",
    from: "",
    to: "",
  });

  const queryParams = useMemo(() => ({ ...filters, limit: 300 }), [filters]);

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin-query", queryParams],
    queryFn: () => adminApi.query(token, queryParams),
    enabled: Boolean(token),
  });

  return (
    <section className="mx-auto max-w-7xl space-y-5 px-4 py-10 md:px-8">
      <div className="mb-2 flex flex-wrap gap-2">
        <Link to="/admin" className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Pending</Link>
        <Link to="/admin/history" className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Past Approvals</Link>
        <Link to="/admin/faculty" className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Faculty Directory</Link>
        <Link to="/admin/query" className="rounded border border-amber-400 bg-amber-200 px-4 py-2 text-sm font-semibold text-slate-900">Query Search</Link>
      </div>

      <div className="rounded-xl border border-amber-300/40 bg-gradient-to-r from-amber-50 to-white p-5 shadow-sm">
        <h1 className="text-3xl font-black text-slate-800">Faculty Query Search</h1>
        <p className="mt-1 text-sm text-slate-600">Search achievements and any faculty information across all sections.</p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={filters.q}
            onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))}
            className="rounded border px-3 py-2"
            placeholder="Search keyword"
          />
          <input
            value={filters.designation}
            onChange={(e) => setFilters((s) => ({ ...s, designation: e.target.value }))}
            className="rounded border px-3 py-2"
            placeholder="Designation"
          />
          <input
            value={filters.department}
            onChange={(e) => setFilters((s) => ({ ...s, department: e.target.value }))}
            className="rounded border px-3 py-2"
            placeholder="Department"
          />
          <select value={filters.table} onChange={(e) => setFilters((s) => ({ ...s, table: e.target.value }))} className="rounded border px-3 py-2">
            <option value="all">All Tables</option>
            <option value="faculty">Faculty</option>
            <option value="publications">Publications</option>
            <option value="projects">Projects</option>
            <option value="patents">Patents</option>
            <option value="books">Books</option>
            <option value="awards">Awards</option>
            <option value="miscellaneous_items">Miscellaneous</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))} className="rounded border px-3 py-2">
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
          <input type="date" value={filters.from} onChange={(e) => setFilters((s) => ({ ...s, from: e.target.value }))} className="rounded border px-3 py-2" />
          <input type="date" value={filters.to} onChange={(e) => setFilters((s) => ({ ...s, to: e.target.value }))} className="rounded border px-3 py-2" />
          <button
            onClick={() => setFilters({ q: "", designation: "", department: "", table: "all", status: "all", from: "", to: "" })}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Reset
          </button>
        </div>
      </div>

      {isLoading && <p>Searching...</p>}
      {error && <p className="text-rose-600">{error.message}</p>}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {data.map((row) => (
          <article key={`${row.table}-${row.id}`} className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-600">{row.table}</span>
              <span className={`rounded px-2 py-1 text-xs font-semibold ${row.is_approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {row.is_approved ? "Approved" : "Pending"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{row.label}</h3>
            <p className="text-sm text-slate-600">Faculty: {row.faculty?.name || "Unknown"}</p>
            <p className="text-xs text-slate-500">{row.faculty?.designation || "-"} | {row.faculty?.department || "-"}</p>
            <p className="mt-2 text-xs text-slate-500">Created: {row.created_at ? new Date(row.created_at).toLocaleString() : "-"}</p>
            {row.faculty_id && (
              <Link to={`/faculty/${row.faculty_id}?preview=viewer`} className="mt-3 inline-block rounded border border-blue-700 px-3 py-1 text-xs font-semibold text-blue-700">
                Open Faculty Profile
              </Link>
            )}
          </article>
        ))}
        {!isLoading && !error && !data.length && <p className="text-sm text-slate-500">No results found for your query filters.</p>}
      </div>
    </section>
  );
}

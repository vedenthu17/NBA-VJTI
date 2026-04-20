export default function PublicationTable({ items = [], showApproval = false }) {
  return (
    <div className="overflow-x-auto rounded border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-amber-100 text-slate-800">
          <tr>
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">Journal</th>
            <th className="px-3 py-2">Year</th>
            <th className="px-3 py-2">Indexed</th>
            <th className="px-3 py-2">Links</th>
            {showApproval && <th className="px-3 py-2">Approval</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id} className="border-t border-slate-200">
              <td className="px-3 py-2">{row.title}</td>
              <td className="px-3 py-2">{row.journal}</td>
              <td className="px-3 py-2">{row.year}</td>
              <td className="px-3 py-2">{row.indexed || "-"}</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-2 text-sm">
                  {row.reference_url && <a href={row.reference_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-700 underline">URL</a>}
                  {row.pdf_url && <a href={row.pdf_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-700 underline">PDF</a>}
                  {!row.reference_url && !row.pdf_url && "-"}
                </div>
              </td>
              {showApproval && (
                <td className="px-3 py-2">
                  <span className={`rounded px-2 py-1 text-xs font-semibold ${row.is_approved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                    {row.is_approved ? "Approved" : "Pending"}
                  </span>
                </td>
              )}
            </tr>
          ))}
          {!items.length && (
            <tr>
              <td colSpan={showApproval ? 6 : 5} className="px-3 py-4 text-center text-slate-500">
                No publications available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

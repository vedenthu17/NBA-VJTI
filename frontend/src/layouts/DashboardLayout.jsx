import { Link, Outlet } from "react-router-dom";

const sideSections = [
  {
    key: "Research Interests",
    to: "#research",
  },
  {
    key: "Biosketch",
    to: "#biosketch",
    children: [
      { key: "Educational Details", to: "#qualifications" },
      { key: "Professional Background", to: "#projects" },
    ],
  },
  {
    key: "Research",
    to: "#research-block",
    children: [
      { key: "Projects", to: "#projects" },
      { key: "Publications", to: "#research-block" },
      { key: "Patents", to: "#patents" },
      { key: "Proofs", to: "#research-proofs" },
    ],
  },
  {
    key: "Honours and Awards",
    to: "#awards",
  },
  {
    key: "Teaching Engagements",
    to: "#teaching",
  },
  {
    key: "Students",
    to: "#students",
  },
  {
    key: "Miscellaneous",
    to: "#misc",
  },
];

function SideMenuItem({ item }) {
  return (
    <div className="border-b border-slate-200 py-2">
      <Link to={item.to} className="block text-4xl font-light text-slate-800 transition hover:pl-2 hover:text-blue-700">
        {item.key}
      </Link>
      {item.children && (
        <div className="mt-2 space-y-1 pl-1">
          {item.children.map((sub) => (
            <Link key={sub.key} to={sub.to} className="block text-2xl font-light text-slate-500 transition hover:text-blue-700">
              {sub.key}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 md:grid-cols-[280px_1fr] md:px-8">
      <aside className="h-fit p-2 md:sticky md:top-24">
        <h2 className="mb-4 border-b border-slate-300 pb-3 text-4xl font-light text-slate-800">Profile Sections</h2>
        <nav className="space-y-2">
          {sideSections.map((item) => (
            <SideMenuItem key={item.key} item={item} />
          ))}
        </nav>
      </aside>
      <div className="min-w-0 border-l border-slate-300 pl-6 md:pl-10">{children ?? <Outlet />}</div>
    </section>
  );
}

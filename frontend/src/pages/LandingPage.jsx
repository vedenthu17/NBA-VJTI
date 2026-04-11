import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { achievementApi } from "../api/facultyApi";

function getYoutubeEmbedUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
  } catch {
    return "";
  }
  return "";
}

function AchievementMedia({ item }) {
  if (item.media_type === "image") {
    return <img src={item.media_url} alt={item.title} className="h-44 w-full rounded object-cover" />;
  }

  if (item.media_type === "youtube") {
    const embedUrl = getYoutubeEmbedUrl(item.media_url);
    if (!embedUrl) return <p className="text-sm text-slate-600">Invalid YouTube URL</p>;
    return (
      <iframe
  title={item.title}
  src={embedUrl}
  className="w-full rounded aspect-video"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowFullScreen
/>
    );
  }

  if (item.media_type === "pdf") {
    return (
      <div className="flex h-44 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50">
        <a href={item.media_url} target="_blank" rel="noreferrer" className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Open PDF
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-44 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50">
      <a href={item.media_url} target="_blank" rel="noreferrer" className="rounded border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900">
        Open Link
      </a>
    </div>
  );
}

export default function LandingPage() {
  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements", "public"],
    queryFn: () => achievementApi.listPublic(),
  });

  const [filter, setFilter] = useState("all");

  const filteredAchievements = useMemo(() => {
    if (filter === "all") return achievements;
    return achievements.filter((item) => item.media_type === filter);
  }, [achievements, filter]);

  const featured = filteredAchievements[0];
  const remaining = filteredAchievements.slice(1);

  return (
  <div className="bg-gradient-to-br from-[#fdfaf3] via-[#f5ecd7] to-[#efe3c2] min-h-screen">

    {/* HERO */}
    <section className="px-4 py-16 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_1fr] items-center">

        {/* LEFT */}
        <div className="rounded-3xl bg-white/60 backdrop-blur-xl shadow-xl p-8 border border-white/40">
          <p className="mb-3 inline-block rounded-full bg-amber-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-800">
            NBA Accreditation Portal
          </p>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
            Faculty Information 
          </h1>

          <p className="mt-5 text-lg text-slate-700 leading-relaxed">
            Manage faculty profiles, publications, projects, approvals, and generate NBA-ready reports —
            all in one unified system.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/faculty" className="rounded-xl bg-slate-900 px-6 py-3 text-white font-semibold shadow hover:scale-105 transition">
              Browse Faculty
            </Link>

            <Link to="/viewer" className="rounded-xl border border-slate-900 px-6 py-3 font-semibold text-slate-900 hover:bg-slate-100 transition">
              Viewer Mode
            </Link>

            <Link to="/login" className="rounded-xl border border-slate-900 px-6 py-3 font-semibold text-slate-900 hover:bg-slate-100 transition">
              Login
            </Link>
          </div>
        </div>

        {/* RIGHT */}
        <div className="rounded-3xl bg-white/70 backdrop-blur-xl shadow-lg p-6 border border-white/40">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">System Highlights</h2>
          <ul className="space-y-3 text-slate-700 text-sm">
            <li>✔ Role-based access (Faculty/Admin/Viewer)</li>
            <li>✔ Admin approval workflow</li>
            <li>✔ Audit logs & data history</li>
            <li>✔ NBA dashboards & reports</li>
            <li>✔ Excel export & CV generation</li>
          </ul>
        </div>

      </div>
    </section>

    {/* SHOWCASE */}
    <section className="px-4 py-14 md:px-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Public Showcase
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Faculty Achievements
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Verified and published by administration
            </p>
          </div>

          <Link
            to="/faculty"
            className="rounded-xl px-4 py-2 text-sm font-semibold border border-slate-900 hover:bg-slate-900 hover:text-white transition"
          >
            Explore Faculty
          </Link>
        </div>

        {/* FILTERS */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            ["all", "All"],
            ["image", "Images"],
            ["youtube", "YouTube"],
            ["pdf", "PDF"],
            ["link", "Links"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                filter === value
                  ? "bg-slate-900 text-white shadow"
                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* EMPTY */}
        {!filteredAchievements.length && (
          <div className="rounded-xl bg-white p-6 text-center text-slate-500 shadow">
            No achievements published yet.
          </div>
        )}

        {/* CONTENT */}
        {!!filteredAchievements.length && (
          <div className="space-y-6">

            {/* FEATURED */}
            {featured && (
              <div className="rounded-3xl bg-white shadow-lg p-6 hover:shadow-xl transition">
                <div className="grid md:grid-cols-[1.1fr_1fr] gap-6 items-center">

                  <div className="overflow-hidden rounded-xl">
                    <AchievementMedia item={featured} />
                  </div>

                  <div>
                    <span className="inline-block text-xs font-bold text-amber-700 mb-2">
                      FEATURED
                    </span>

                    <h3 className="text-2xl font-bold text-slate-900">
                      {featured.title}
                    </h3>

                    <p className="text-sm text-slate-600 mt-2">
                      {featured.summary || "No summary provided."}
                    </p>

                    {featured.faculty?.name && (
                      <p className="mt-3 text-xs font-semibold text-amber-800 uppercase tracking-wide">
                        {featured.faculty.name}
                      </p>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* GRID */}
            {!!remaining.length && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {remaining.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-white shadow-md hover:shadow-xl transition transform hover:-translate-y-1 p-4"
                  >
                    <div className="overflow-hidden rounded-lg">
                      <AchievementMedia item={item} />
                    </div>

                    <div className="mt-3">
                      <h3 className="text-lg font-bold text-slate-900">
                        {item.title}
                      </h3>

                      <p className="text-sm text-slate-600 mt-1">
                        {item.summary || "No summary provided."}
                      </p>

                      {item.faculty?.name && (
                        <p className="text-xs text-amber-700 font-semibold mt-2 uppercase">
                          {item.faculty.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  </div>
);
}

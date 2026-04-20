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
    return <img src={item.media_url} alt={item.title} className="h-52 w-full rounded-lg object-cover" />;
  }

  if (item.media_type === "youtube") {
    const embedUrl = getYoutubeEmbedUrl(item.media_url);
    if (!embedUrl) return <p className="text-sm text-slate-600">Invalid YouTube URL</p>;
    return (
      <iframe
        title={item.title}
        src={embedUrl}
        className="aspect-video w-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  if (item.media_type === "pdf") {
    return (
      <div className="flex h-52 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
        <a href={item.media_url} target="_blank" rel="noreferrer" className="liquid-button rounded-lg px-4 py-2 text-sm font-semibold text-white">
          Open PDF
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-52 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
      <a href={item.media_url} target="_blank" rel="noreferrer" className="liquid-control rounded-lg px-4 py-2 text-sm font-semibold text-slate-900">
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
  const publishedCount = achievements.length;
  const imageCount = achievements.filter((item) => item.media_type === "image").length;
  const videoCount = achievements.filter((item) => item.media_type === "youtube").length;

  const heroBackdrop = "https://vjti.ac.in/wp-content/uploads/2025/09/Orientation-1200-X-800px.png";

  return (
    <div className="smooth-fade pb-14">
      <section className="relative min-h-[62vh] overflow-hidden md:min-h-[68vh]">
        <img
          src={heroBackdrop}
          alt="VJTI Campus"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="vjti-hero-overlay absolute inset-0" />
        <div className="relative mx-auto flex min-h-[62vh] max-w-7xl items-center px-4 py-12 md:min-h-[68vh] md:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/85">VJTI Mumbai</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-white md:text-6xl">
              Celebrating Leadership in Engineering Education
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
              Faculty Information and Accreditation Portal aligned with institutional reporting and NBA documentation workflows.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/faculty" className="rounded bg-[#9d2235] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#ae152d]">
                Faculty Directory
              </Link>
              <Link to="/viewer" className="rounded border border-white/70 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-white/10">
                Public Viewer
              </Link>
              <Link to="/login" className="rounded border border-white/70 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-white/10">
                Faculty Login
              </Link>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-2 sm:max-w-md">
              <div className="rounded border border-white/35 bg-black/20 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">Published</p>
                <p className="mt-1 text-xl font-extrabold text-white">{publishedCount}</p>
              </div>
              <div className="rounded border border-white/35 bg-black/20 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">Images</p>
                <p className="mt-1 text-xl font-extrabold text-white">{imageCount}</p>
              </div>
              <div className="rounded border border-white/35 bg-black/20 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">Videos</p>
                <p className="mt-1 text-xl font-extrabold text-white">{videoCount}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <article className="glass-card rounded-2xl p-5">
              <p className="campus-kicker">Directory</p>
              <h3 className="mt-2 text-xl font-bold">Faculty Profiles</h3>
              <p className="mt-2 text-sm campus-muted">Explore approved records by department, designation, and research focus.</p>
            </article>
            <article className="glass-card rounded-2xl p-5">
              <p className="campus-kicker">Review</p>
              <h3 className="mt-2 text-xl font-bold">Admin Workflow</h3>
              <p className="mt-2 text-sm campus-muted">Transparent approvals and history tracking for all submitted records.</p>
            </article>
            <article className="glass-card rounded-2xl p-5">
              <p className="campus-kicker">Reporting</p>
              <h3 className="mt-2 text-xl font-bold">NBA Reports</h3>
              <p className="mt-2 text-sm campus-muted">Generate formatted outputs aligned with accreditation evidence needs.</p>
            </article>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="campus-kicker">Public Showcase</p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">Faculty Achievements</h2>
              <p className="mt-1 text-sm campus-muted">Verified and published by the administration.</p>
            </div>
            <Link to="/faculty" className="liquid-control rounded-lg px-4 py-2 text-sm font-semibold text-slate-800">
              Explore Faculty
            </Link>
          </div>

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
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                  filter === value
                    ? "bg-[#9d2235] text-white"
                    : "liquid-control text-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {!filteredAchievements.length && (
            <div className="glass-card rounded-2xl px-6 py-8 text-center text-slate-600">
              No achievements published yet.
            </div>
          )}

          {!!filteredAchievements.length && (
            <div className="space-y-6">
              {featured && (
                <article className="glass-card rounded-2xl p-5 md:p-7">
                  <div className="grid items-center gap-6 md:grid-cols-[1.1fr_1fr]">
                    <div className="overflow-hidden rounded-xl border border-slate-200/80">
                      <AchievementMedia item={featured} />
                    </div>
                    <div>
                      <p className="campus-kicker">Featured Update</p>
                      <h3 className="mt-2 text-2xl font-bold">{featured.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{featured.summary || "No summary provided."}</p>
                      {featured.faculty?.name && (
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#9d2235]">
                          {featured.faculty.name}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              )}

              {!!remaining.length && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {remaining.map((item) => (
                    <article key={item.id} className="glass-card rounded-2xl p-4 transition hover:-translate-y-1 hover:shadow-[0_20px_32px_rgba(127,16,34,0.18)]">
                      <div className="overflow-hidden rounded-lg border border-slate-200/80">
                        <AchievementMedia item={item} />
                      </div>
                      <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{item.summary || "No summary provided."}</p>
                      {item.faculty?.name && (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9d2235]">
                          {item.faculty.name}
                        </p>
                      )}
                    </article>
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

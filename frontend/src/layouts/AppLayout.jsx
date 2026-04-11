import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { facultyApi, notificationApi } from "../api/facultyApi";
import { useState } from "react";
import vjtiLogo from "../assets/vjti-logo.svg";

export default function AppLayout() {
  const { isAuthenticated, role, logout, token, user } = useAuth();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const queryClient = useQueryClient();

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Viewer", to: "/viewer" },
    ...(isAuthenticated && role === "faculty" ? [{ label: "Dashboard", to: "/dashboard" }] : []),
    ...(isAuthenticated && role === "admin" ? [{ label: "Requests", to: "/admin" }] : []),
  ];

  const { data: facultyList = [] } = useQuery({
    queryKey: ["faculty", "topbar"],
    queryFn: () => facultyApi.list(token),
    enabled: Boolean(isAuthenticated && token && (role === "faculty" || role === "admin")),
  });

  const ownFaculty =
    facultyList.find((f) => f.user_id === user?.id) ||
    facultyList.find((f) => f.email?.toLowerCase() === user?.email?.toLowerCase()) ||
    null;

  const adminName = user?.email ? user.email.split("@")[0] : "Admin";
  const adminPhoto = ownFaculty?.photo_url || "https://via.placeholder.com/40x40?text=A";

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.list(token),
    enabled: Boolean(isAuthenticated && token),
    refetchInterval: 10000,
  });

  const markRead = useMutation({
    mutationFn: (id) => notificationApi.markRead(id, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-amber-200 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-slate-900">
            <img src={vjtiLogo} alt="VJTI" className="h-10 w-auto" />
            <span>VJTI NBA PORTAL</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-sm px-3 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-amber-400 text-slate-900" : "text-slate-700 hover:bg-amber-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {isAuthenticated && (
              <div className="relative">
                <button onClick={() => setOpenNotifications((v) => !v)} className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-slate-800">
                  Notifications {unreadCount ? `(${unreadCount})` : ""}
                </button>
                {openNotifications && (
                  <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-amber-200 bg-white/95 p-3 shadow-xl backdrop-blur">
                    <h3 className="mb-2 text-sm font-bold text-slate-700">Recent Notifications</h3>
                    <div className="max-h-64 space-y-2 overflow-auto">
                      {notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => markRead.mutate(n.id)}
                          className={`w-full rounded border px-2 py-2 text-left text-xs ${n.is_read ? "border-slate-200 bg-slate-50" : "border-amber-300 bg-amber-50"}`}
                        >
                          <p className="font-semibold text-slate-700">{n.title}</p>
                          <p className="text-slate-600">{n.message}</p>
                        </button>
                      ))}
                      {!notifications.length && <p className="text-xs text-slate-500">No notifications yet.</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAuthenticated && role === "faculty" && ownFaculty && (
              <div className="relative">
                <button
                  onClick={() => setOpenProfileMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-2 py-1 hover:bg-slate-50"
                >
                  <img
                    src={ownFaculty.photo_url || "https://via.placeholder.com/40x40?text=F"}
                    alt={ownFaculty.name || "Profile"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="max-w-40 truncate text-xs font-semibold text-slate-800">{ownFaculty.name}</span>
                </button>
                {openProfileMenu && (
                  <div className="absolute right-0 z-20 mt-2 w-52 rounded border border-slate-200 bg-white p-2 shadow-lg">
                    <Link
                      to={`/faculty/${ownFaculty.id}`}
                      onClick={() => setOpenProfileMenu(false)}
                      className="block rounded px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      My Profile
                    </Link>
                  </div>
                )}
              </div>
            )}

            {isAuthenticated && role === "admin" && (
              <div className="relative">
                <button
                  onClick={() => setOpenProfileMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-2 py-1 hover:bg-slate-50"
                >
                  <img src={adminPhoto} alt="Admin" className="h-8 w-8 rounded-full object-cover" />
                  <span className="max-w-40 truncate text-xs font-semibold text-slate-800">{adminName}</span>
                </button>
                {openProfileMenu && (
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded border border-slate-200 bg-white p-2 shadow-lg">
                    <Link
                      to="/admin"
                      onClick={() => setOpenProfileMenu(false)}
                      className="block rounded px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Approval Requests
                    </Link>
                    <Link
                      to="/admin/history"
                      onClick={() => setOpenProfileMenu(false)}
                      className="block rounded px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Past Approvals
                    </Link>
                    <Link
                      to="/admin/faculty"
                      onClick={() => setOpenProfileMenu(false)}
                      className="block rounded px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Faculty Directory
                    </Link>
                    <Link
                      to="/admin/query"
                      onClick={() => setOpenProfileMenu(false)}
                      className="block rounded px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Query Search
                    </Link>
                  </div>
                )}
              </div>
            )}

            <span className="rounded-full bg-slate-900 px-3 py-1 font-semibold text-white">
              {isAuthenticated ? role.toUpperCase() : "GUEST"}
            </span>
            {isAuthenticated ? (
              <button className="rounded border border-slate-300 px-3 py-2 hover:bg-slate-100" onClick={logout}>
                Logout
              </button>
            ) : (
              <Link to="/login" className="rounded bg-amber-400 px-3 py-2 font-semibold hover:bg-amber-300">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

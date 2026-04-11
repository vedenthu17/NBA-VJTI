import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { facultyApi, notificationApi } from "../api/facultyApi";
import { useState, useEffect, useRef } from "react";
import RotatingLogo from "../components/RotatingLogo";
import Toast from "../components/Toast";
import { WS_BASE_URL } from "../api/client";

export default function AppLayout() {
  const { isAuthenticated, role, logout, token, user } = useAuth();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [toasts, setToasts] = useState([]);
  const previousNotificationsRef = useRef(null);
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

  // Show toast for new notifications
  useEffect(() => {
    if (previousNotificationsRef.current === null) {
      previousNotificationsRef.current = notifications;
      return;
    }

    const newNotifications = notifications.filter(
      (n) => !previousNotificationsRef.current.find((prev) => prev.id === n.id)
    );

    newNotifications.forEach((notification) => {
      const toastId = Math.random();
      setToasts((prev) => [
        ...prev,
        {
          id: toastId,
          title: notification.title,
          message: notification.message,
        },
      ]);
    });

    previousNotificationsRef.current = notifications;
  }, [notifications]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return undefined;
    }

    const wsUrl = `${WS_BASE_URL}/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const packet = JSON.parse(event.data);
        if (packet?.event !== "notification.created" || !packet?.payload?.id) {
          return;
        }

        const incoming = packet.payload;
        queryClient.setQueryData(["notifications"], (current = []) => {
          if (current.some((item) => item.id === incoming.id)) {
            return current;
          }
          return [incoming, ...current];
        });
      } catch {
        // Ignore malformed websocket payloads.
      }
    };

    return () => {
      ws.close();
    };
  }, [isAuthenticated, token, queryClient]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="liquid-skin min-h-screen text-slate-900">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          message={toast.message}
          onClose={removeToast}
          duration={5000}
        />
      ))}
      <header className="border-b border-amber-200/60 liquid-glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link
            to="/"
            className="flex items-center gap-3 text-xl font-extrabold tracking-tight text-slate-900"
            style={{ transform: "translateX(-28px)" }}
          >
            <RotatingLogo />
            <span>VJTI NBA PORTAL</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive ? "liquid-button" : "liquid-control text-slate-700 hover:bg-amber-100/80"
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
                <button onClick={() => setOpenNotifications((v) => !v)} className="liquid-chip rounded-xl px-3 py-2 text-xs font-semibold text-slate-800">
                  Notifications {unreadCount ? `(${unreadCount})` : ""}
                </button>
                {openNotifications && (
                  <div className="liquid-glass absolute right-0 z-20 mt-2 w-80 rounded-xl p-3">
                    <h3 className="mb-2 text-sm font-bold text-slate-700">Recent Notifications</h3>
                    <div className="max-h-64 space-y-2 overflow-auto">
                      {notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => markRead.mutate(n.id)}
                          className={`w-full rounded-xl border px-2 py-2 text-left text-xs ${n.is_read ? "liquid-control" : "liquid-chip"}`}
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
                  className="liquid-control flex items-center gap-2 rounded-full px-2 py-1 hover:bg-slate-50"
                >
                  <img
                    src={ownFaculty.photo_url || "https://via.placeholder.com/40x40?text=F"}
                    alt={ownFaculty.name || "Profile"}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="max-w-40 truncate text-xs font-semibold text-slate-800">{ownFaculty.name}</span>
                </button>
                {openProfileMenu && (
                  <div className="liquid-glass absolute right-0 z-20 mt-2 w-52 rounded-xl p-2">
                    <Link
                      to={`/faculty/${ownFaculty.id}`}
                      onClick={() => setOpenProfileMenu(false)}
                      className="liquid-control block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
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
                  className="liquid-control flex items-center gap-2 rounded-full px-2 py-1 hover:bg-slate-50"
                >
                  <img src={adminPhoto} alt="Admin" className="h-8 w-8 rounded-full object-cover" />
                  <span className="max-w-40 truncate text-xs font-semibold text-slate-800">{adminName}</span>
                </button>
                {openProfileMenu && (
                  <div className="liquid-glass absolute right-0 z-20 mt-2 w-56 rounded-xl p-2">
                    <Link
                      to="/admin"
                      onClick={() => setOpenProfileMenu(false)}
                      className="liquid-control block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Approval Requests
                    </Link>
                    <Link
                      to="/admin/history"
                      onClick={() => setOpenProfileMenu(false)}
                      className="liquid-control block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Past Approvals
                    </Link>
                    <Link
                      to="/admin/faculty"
                      onClick={() => setOpenProfileMenu(false)}
                      className="liquid-control block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Faculty Directory
                    </Link>
                    <Link
                      to="/admin/query"
                      onClick={() => setOpenProfileMenu(false)}
                      className="liquid-control block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Query Search
                    </Link>
                  </div>
                )}
              </div>
            )}

            <span className="liquid-chip rounded-full px-3 py-1 font-semibold">
              {isAuthenticated ? role.toUpperCase() : "GUEST"}
            </span>
            {isAuthenticated ? (
              <button className="liquid-control rounded-xl px-3 py-2 hover:bg-slate-100" onClick={logout}>
                Logout
              </button>
            ) : (
              <Link to="/login" className="liquid-button rounded-xl px-3 py-2 font-semibold">
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

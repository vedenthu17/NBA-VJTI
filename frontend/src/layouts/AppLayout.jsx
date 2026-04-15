import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { facultyApi, notificationApi } from "../api/facultyApi";
import { useState, useEffect, useRef } from "react";
import RotatingLogo from "../components/RotatingLogo";
import Toast from "../components/Toast";
import { WS_BASE_URL } from "../api/client";
import {
  getStoredNotifications,
  mergeStoredNotifications,
  markAllStoredNotificationsRead,
  markStoredNotificationRead,
} from "../utils/notificationStore";

export default function AppLayout() {
  const { isAuthenticated, role, logout, token, user } = useAuth();
  const canUseNotifications = isAuthenticated && (role === "faculty" || role === "admin");
  const canUseProfileMenu = isAuthenticated && (role === "faculty" || role === "admin");
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [toasts, setToasts] = useState([]);
  const [cachedNotifications, setCachedNotifications] = useState([]);
  const previousNotificationsRef = useRef(null);
  const queryClient = useQueryClient();
  const storageUserId = user?.id || "";

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

  const {
    data: notificationsData = [],
    isLoading: notificationsLoading,
    isError: notificationsError,
    error: notificationsErrorObject,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ["notifications", notificationFilter],
    queryFn: () => notificationApi.list(token, { unreadOnly: notificationFilter === "unread", limit: 150 }),
    enabled: Boolean(canUseNotifications && token),
    refetchInterval: 10000,
  });

  const notificationsFromApi = Array.isArray(notificationsData) ? notificationsData : [];
  const notifications = (() => {
    const merged = [...notificationsFromApi, ...cachedNotifications];
    const map = new Map();
    for (const item of merged) {
      map.set(item.id, item);
    }
    return Array.from(map.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  })();

  useEffect(() => {
    if (!storageUserId) return;
    setCachedNotifications(getStoredNotifications(storageUserId));
  }, [storageUserId]);

  useEffect(() => {
    if (!storageUserId || !notificationsFromApi.length) return;
    const merged = mergeStoredNotifications(storageUserId, notificationsFromApi);
    setCachedNotifications(merged);
  }, [storageUserId, notificationsFromApi]);

  const markRead = useMutation({
    mutationFn: (id) => notificationApi.markRead(id, token),
    onSuccess: (_data, id) => {
      markStoredNotificationRead(storageUserId, id);
      setCachedNotifications(getStoredNotifications(storageUserId));
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationApi.markAllRead(token),
    onSuccess: () => {
      markAllStoredNotificationsRead(storageUserId);
      setCachedNotifications(getStoredNotifications(storageUserId));
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
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
    if (!canUseNotifications || !token) {
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
        if (storageUserId) {
          const merged = mergeStoredNotifications(storageUserId, [incoming]);
          setCachedNotifications(merged);
        }
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
  }, [canUseNotifications, token, queryClient, storageUserId]);

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
            {canUseNotifications && (
              <div className="relative">
                <button
                  onClick={() => {
                    setOpenNotifications((v) => {
                      const next = !v;
                      if (next) {
                        refetchNotifications();
                      }
                      return next;
                    });
                  }}
                  className="liquid-chip rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  Notifications {unreadCount ? `(${unreadCount})` : ""}
                </button>
                {openNotifications && (
                  <div className="liquid-glass absolute right-0 z-20 mt-2 w-80 rounded-xl p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-800">Recent Notifications</h3>
                      <button
                        type="button"
                        onClick={() => markAllRead.mutate()}
                        disabled={markAllRead.isPending || !notifications.length}
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 disabled:opacity-50"
                      >
                        {markAllRead.isPending ? "Marking..." : "Mark all read"}
                      </button>
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNotificationFilter("all")}
                        className={`rounded px-2 py-1 text-[11px] font-semibold ${notificationFilter === "all" ? "bg-slate-800 text-white" : "bg-white text-slate-700 border border-slate-300"}`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotificationFilter("unread")}
                        className={`rounded px-2 py-1 text-[11px] font-semibold ${notificationFilter === "unread" ? "bg-slate-800 text-white" : "bg-white text-slate-700 border border-slate-300"}`}
                      >
                        Unread
                      </button>
                    </div>
                    <div className="max-h-64 space-y-2 overflow-auto">
                      {notificationsLoading && <p className="rounded-lg bg-white/90 px-2 py-2 text-xs text-slate-600">Loading notifications...</p>}

                      {notificationsError && (
                        <div className="rounded-lg border border-rose-300 bg-rose-50 px-2 py-2 text-xs text-rose-700">
                          <p>{notificationsErrorObject?.message || "Unable to load notifications."}</p>
                          <button
                            type="button"
                            onClick={() => refetchNotifications()}
                            className="mt-2 rounded border border-rose-300 bg-white px-2 py-1 font-semibold text-rose-700"
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {!notificationsLoading && !notificationsError && notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => markRead.mutate(n.id)}
                          className={`w-full rounded-xl border px-2 py-2 text-left text-xs ${n.is_read ? "bg-white/90 text-slate-700" : "bg-amber-50 text-slate-800 border-amber-300"}`}
                        >
                          <p className="font-semibold text-slate-800">{n.title || "Notification"}</p>
                          <p className="text-slate-700">{n.message || "No details available."}</p>
                          {n.created_at && <p className="mt-1 text-[11px] text-slate-500">{new Date(n.created_at).toLocaleString()}</p>}
                        </button>
                      ))}

                      {!notificationsLoading && !notificationsError && !notifications.length && (
                        <p className="rounded-lg bg-white/90 px-2 py-2 text-xs text-slate-600">
                          {role === "admin"
                            ? "No admin notifications yet. New faculty submissions and updates will appear here."
                            : notificationFilter === "unread"
                              ? "No unread notifications."
                              : "No notifications yet."}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {canUseProfileMenu && role === "faculty" && ownFaculty && (
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

            {canUseProfileMenu && role === "admin" && (
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

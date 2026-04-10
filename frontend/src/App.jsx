import { Navigate, Route, Routes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "./layouts/AppLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import FacultyListPage from "./pages/FacultyListPage";
import FacultyProfilePage from "./pages/FacultyProfilePage";
import AdminPage from "./pages/AdminPage";
import AdminHistoryPage from "./pages/AdminHistoryPage";
import AdminFacultyPage from "./pages/AdminFacultyPage";
import AdminQueryPage from "./pages/AdminQueryPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { facultyApi } from "./api/facultyApi";

function NotFoundPage() {
  return <div className="mx-auto max-w-7xl px-4 py-16 text-center text-xl font-semibold">Page not found</div>;
}

function DashboardHomePage() {
  const { role, token, user } = useAuth();

  const { data: facultyList = [], isLoading } = useQuery({
    queryKey: ["faculty", "dashboard-home"],
    queryFn: () => facultyApi.list(token),
    enabled: Boolean(token && role === "faculty"),
  });

  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (role !== "faculty") {
    return <Navigate to="/viewer" replace />;
  }

  if (isLoading) {
    return <p className="px-4 py-10">Loading profile...</p>;
  }

  const own = facultyList.find((f) => f.user_id === user?.id) || facultyList.find((f) => f.email === user?.email);

  if (!own) {
    return <Navigate to="/faculty" replace />;
  }

  return <Navigate to={`/faculty/${own.id}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/viewer" element={<FacultyListPage />} />
        <Route path="/faculty" element={<FacultyListPage />} />
        <Route path="/faculty/:id" element={<FacultyProfilePage />} />

        <Route element={<ProtectedRoute roles={["faculty", "admin"]} />}>
          <Route path="/dashboard" element={<DashboardHomePage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/history" element={<AdminHistoryPage />} />
          <Route path="/admin/faculty" element={<AdminFacultyPage />} />
          <Route path="/admin/query" element={<AdminQueryPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/home" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

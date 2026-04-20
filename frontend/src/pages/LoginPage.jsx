import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["faculty", "admin"]),
  designation: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, registerAccount } = useAuth();
  const [mode, setMode] = useState("login");

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "faculty",
      designation: "Assistant Professor",
      department: "Computer Engineering and IT",
      phone: "+91 0000000000",
      admin_signup_code: "",
    },
  });

  const onLogin = async (values) => {
    try {
      const payload = await login(values.email, values.password);
      if (payload.role === "admin") navigate("/admin");
      else if (payload.role === "faculty") navigate("/dashboard");
      else navigate("/faculty");
    } catch (error) {
      loginForm.setError("root", { message: error.message || "Login failed" });
    }
  };

  const onSignup = async (values) => {
    try {
      const payload = await registerAccount(values);
      if (payload.role === "admin") navigate("/admin");
      else navigate("/dashboard");
    } catch (error) {
      signupForm.setError("root", { message: error.message || "Signup failed" });
    }
  };

  return (
    <section className="px-4 py-12 md:px-8 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1.25fr]">
        <aside className="campus-hero rounded-2xl p-7 md:p-8">
          <p className="campus-kicker">Institution Access</p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-white md:text-4xl">Login and Account Management</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-100 md:text-base">
            Use this secure portal to maintain faculty records, submit updates, and monitor NBA data approval workflows.
          </p>
          <div className="mt-6 space-y-3 text-sm text-slate-100">
            <p>1. Faculty can manage profile, publications, projects, and achievements.</p>
            <p>2. Admin can review requests and publish verified information.</p>
            <p>3. Viewers can access approved profiles and public updates.</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/faculty" className="rounded-lg border border-white/60 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-white/10">
              Open Faculty Directory
            </Link>
            <Link to="/" className="rounded-lg bg-[#9d2235] px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-900 hover:bg-[#c3475b]">
              Back to Home
            </Link>
          </div>
        </aside>

        <div className="glass-card rounded-2xl p-6 md:p-8">
          <p className="campus-kicker">Portal Authentication</p>
          <h2 className="mt-2 text-3xl font-bold">Login or Create Account</h2>
          <p className="mt-2 text-sm text-slate-600">Choose your mode and continue with your faculty or admin credentials.</p>

          <div className="mt-6 flex gap-2 rounded-xl border border-slate-300/70 bg-white/70 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === "login" ? "bg-[#9d2235] text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === "signup" ? "bg-[#9d2235] text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Create Account
            </button>
          </div>

          {mode === "login" ? (
            <form className="mt-6 space-y-4" onSubmit={loginForm.handleSubmit(onLogin)}>
              <label className="block text-sm font-semibold text-slate-800">
                Email
                <input className="liquid-control mt-1 w-full rounded-lg px-3 py-2" {...loginForm.register("email")} />
                {loginForm.formState.errors.email && <span className="text-xs text-rose-700">{loginForm.formState.errors.email.message}</span>}
              </label>
              <label className="block text-sm font-semibold text-slate-800">
                Password
                <input type="password" className="liquid-control mt-1 w-full rounded-lg px-3 py-2" {...loginForm.register("password")} />
                {loginForm.formState.errors.password && <span className="text-xs text-rose-700">{loginForm.formState.errors.password.message}</span>}
              </label>
              {loginForm.formState.errors.root && <p className="text-sm text-rose-700">{loginForm.formState.errors.root.message}</p>}
              <button
                disabled={loginForm.formState.isSubmitting}
                className="liquid-button w-full rounded-lg px-4 py-2 font-semibold text-white"
              >
                {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={signupForm.handleSubmit(onSignup)}>
              <label className="text-sm font-semibold text-slate-800 md:col-span-2">
                Full Name
                <input className="liquid-control mt-1 w-full rounded-lg px-3 py-2" {...signupForm.register("name")} />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Email
                <input className="liquid-control mt-1 w-full rounded-lg px-3 py-2" {...signupForm.register("email")} />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Password
                <input type="password" className="liquid-control mt-1 w-full rounded-lg px-3 py-2" {...signupForm.register("password")} />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Account Type
                <select className="liquid-control mt-1 w-full rounded-lg px-3 py-2" {...signupForm.register("role")}>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Department
                <input className="liquid-control mt-1 w-full rounded-lg px-3 py-2" {...signupForm.register("department")} />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Designation
                <input className="liquid-control mt-1 w-full rounded-lg px-3 py-2" {...signupForm.register("designation")} />
              </label>
              <label className="text-sm font-semibold text-slate-800">
                Phone
                <input className="liquid-control mt-1 w-full rounded-lg px-3 py-2" {...signupForm.register("phone")} />
              </label>
              {signupForm.watch("role") === "admin" && (
                <label className="text-sm font-semibold text-slate-800 md:col-span-2">
                  Admin Signup Code
                  <input
                    className="liquid-control mt-1 w-full rounded-lg px-3 py-2"
                    {...signupForm.register("admin_signup_code")}
                  />
                  <span className="mt-1 block text-xs font-normal text-slate-600">
                    Must match ADMIN_SIGNUP_CODE configured in backend/.env.
                  </span>
                </label>
              )}
              {signupForm.formState.errors.root && <p className="text-sm text-rose-700 md:col-span-2">{signupForm.formState.errors.root.message}</p>}
              <button
                disabled={signupForm.formState.isSubmitting}
                className="md:col-span-2 liquid-button w-full rounded-lg px-4 py-2 font-semibold text-white"
              >
                {signupForm.formState.isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/faculty" className="liquid-control rounded-lg px-4 py-2 text-sm font-semibold text-slate-800">
              View Faculties as Viewer
            </Link>
            <Link to="/" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Go to Landing Page
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

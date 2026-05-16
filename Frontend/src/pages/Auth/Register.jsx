import { registerUser } from "../../services/authService";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Mail,
  Sparkles,
  UserRound,
  BadgeCheck,
  Globe2,
  Layers3,
} from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "citizen",
    // agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError("");
      return;
    }

    try {
      setLoading(true);
      setSubmitError("");

      await registerUser(formData);

      setLoading(false);
      navigate("/login");

    } catch (error) {
      setLoading(false);
      const backendMessage = error.response?.data?.message || error.message || "Registration failed";
      if (/already exists/i.test(backendMessage)) {
        setSubmitError("User Already Exists");
        return;
      }

      setSubmitError(backendMessage);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f9fc] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.10),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(250,204,21,0.12),_transparent_22%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-600 uppercase shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
            ReliefConnect
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              aria-label="Home"
              className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-cyan-700"
            >
              Home
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-900"
            >
              <ArrowLeft className="h-4 w-4" />
              login
            </Link>
          </div>
        </div>

        <header className="mb-6 max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Create your account and get started fast.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            A simpler sign-up experience for citizens and NGO users, with a brighter layout than the login screen.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-8">
            {submitError ? (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submitError}
              </div>
            ) : null}

            {errors.name || errors.email || errors.password || errors.confirmPassword ? (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                Please fix the highlighted fields and try again.
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={`w-full rounded-2xl border ${errors.name ? "border-rose-300" : "border-slate-200"} bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100 placeholder:text-slate-400`}
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className={`w-full rounded-2xl border ${errors.email ? "border-rose-300" : "border-slate-200"} bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100 placeholder:text-slate-400`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create password"
                      className={`w-full rounded-2xl border ${errors.password ? "border-rose-300" : "border-slate-200"} bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100 placeholder:text-slate-400`}
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-rose-600">{errors.password}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      className={`w-full rounded-2xl border ${errors.confirmPassword ? "border-rose-300" : "border-slate-200"} bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100 placeholder:text-slate-400`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-rose-600">{errors.confirmPassword}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Account Type</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="ngo">NGO</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:-translate-y-0.5 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing up...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-800">Already have an account?</p>
                <p className="mt-1 text-sm text-slate-600">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 font-semibold text-cyan-700 transition hover:text-cyan-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Log in now
                  </Link>
                </p>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Why register here</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                Built for quick access and less friction.
              </h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Simple onboarding</p>
                    <p className="mt-1 text-sm text-slate-600">Create the account with only the details you need.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Globe2 className="mt-0.5 h-5 w-5 text-cyan-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Designed for multiple roles</p>
                    <p className="mt-1 text-sm text-slate-600">Citizen and NGO users can pick the correct route at signup.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Layers3 className="mt-0.5 h-5 w-5 text-violet-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Built for disaster response</p>
                    <p className="mt-1 text-sm text-slate-600">Create a role-based account so you can report incidents, track updates, and coordinate relief faster.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-cyan-100 bg-cyan-50 p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">Tip</p>
              <p className="mt-2 text-sm leading-6 text-cyan-900">
                Keep your name, email, and role accurate so your dashboard and disaster response access are set correctly from the start.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const redirectPaths = {
  citizen: "/citizen",
  ngo: "/ngo",
  government: "/govt",
  admin: "/admin/dashboard",
};

const resolveRedirectPath = (role) => {
  const normalizedRole = role === "govt" ? "government" : role;
  return redirectPaths[normalizedRole] || "/";
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

useEffect(() => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (token && user) {

    navigate(resolveRedirectPath(user.role));
  }
}, [navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      login(data.user, data.token, rememberMe);

      navigate(resolveRedirectPath(data.user.role));

    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message ||
        "Login failed. Please check your credentials and try again.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.08),_transparent_26%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)] lg:grid-cols-[1.05fr_0.95fr]">
          <aside className="relative hidden overflow-hidden border-b border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-8 lg:flex lg:min-h-[760px] lg:border-b-0 lg:border-r">
            <div className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-600 uppercase shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                  ReliefConnect
                </div>
                <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-slate-900 xl:text-5xl">
                  A cleaner way to access disaster response tools.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                  One sign-in for citizens, NGOs, and government teams, designed with clarity and calm in mind.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <ShieldCheck className="h-5 w-5 text-cyan-600" />
                    <h3 className="mt-3 text-sm font-semibold text-slate-900">Secure access</h3>
                    <p className="mt-1 text-sm text-slate-600">Role-based entry for every dashboard.</p>
                  </article>
                  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <h3 className="mt-3 text-sm font-semibold text-slate-900">Faster routing</h3>
                    <p className="mt-1 text-sm text-slate-600">Users land on the right workspace instantly.</p>
                  </article>
                </div>
              </div>

              <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-cyan-50 p-2 text-cyan-700">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Simple entry, cleaner handoff</p>
                    <p className="mt-1 text-sm text-slate-600">The account role decides where you go next.</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="bg-white px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-600 uppercase shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                ReliefConnect
              </div>
              <Link
                to="/"
                aria-label="Home"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-cyan-700"
              >
                Home
              </Link>
            </div>

            <div className="mx-auto flex h-full w-full max-w-md flex-col justify-center">
              <div className="mb-8 lg:hidden">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-600 uppercase shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                  ReliefConnect
                </div>
                <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
                  Sign in to your workspace
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Access your citizen, NGO, or government dashboard from one secure place.
                </p>
              </div>

              <div className="hidden lg:block mb-8">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome back</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Sign in to continue coordinating relief work.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[11px] font-bold text-rose-600">
                      !
                    </span>
                    <p className="font-medium leading-6">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    Remember me
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">or</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-cyan-50 p-2 text-cyan-700">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">New here?</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Create your account to report incidents or manage relief operations.
                      </p>
                      <Link
                        to="/register"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 transition hover:text-cyan-900"
                      >
                        Create an account
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Citizen</p>
                    <p className="mt-2 text-xs text-slate-500">danish543@gmail.com</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">danish8090</p>
                  </article>

                  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">NGO</p>
                    <p className="mt-2 text-xs text-slate-500">contact@helpinghands.org</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">Helping8090</p>
                  </article>

                  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Government</p>
                    <p className="mt-2 text-xs text-slate-500">govt@demo.com</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">demo123</p>
                  </article>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
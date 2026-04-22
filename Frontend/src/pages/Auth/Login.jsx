import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

// Import background image (you'll need to add this to your project)
// Or use a placeholder/online image
import logo from "../../assets/image.jpg";

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

    const redirectPaths = {
      citizen: "/citizen",
      ngo: "/ngo",
      govt: "/govt",
    };

    navigate(redirectPaths[user.role] || "/");
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

      const redirectPaths = {
        "citizen": "/citizen",
        "ngo": "/ngo",
        "govt": "/govt",
      };

      navigate(redirectPaths[data.user.role] || "/");

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src={logo}
          alt="Disaster Relief Team"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-40"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Side - Information */}
          <div className="lg:w-1/2 bg-gradient-to-br from-blue-900 to-blue-700 text-white p-8 lg:p-12">
            <div className="h-full flex flex-col justify-center">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h1 className="text-3xl font-bold">ReliefConnect</h1>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Disaster Management & Relief System
              </h2>

              <p className="text-lg text-blue-100 mb-10">
                A unified platform for emergency responders, NGOs, and government agencies
                to coordinate disaster relief efforts efficiently and save lives.
              </p>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🚨</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Real-time Emergency Alerts</h3>
                    <p className="text-blue-100">Instant notifications for critical situations</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🤝</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Resource Coordination</h3>
                    <p className="text-blue-100">Efficient allocation of aid and volunteers</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Impact Analytics</h3>
                    <p className="text-blue-100">Data-driven insights for better decisions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-600 mt-2">
                  Login to continue helping people in need
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <span className="text-red-500 mr-2">⚠️</span>
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <span className="inline-block mr-2">📧</span>
                    <b>Email Address</b>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all bg-white text-black hover:border-sky-400 placeholder:text-gray-500"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <span className="inline-block mr-2">🔒</span>
                    <b>Password</b>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all bg-white text-black hover:border-sky-400 placeholder:text-gray-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-sky-600 p-1 hover:bg-sky-50 rounded-lg transition-colors"
                    >
                      {showPassword ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 border-gray-300"
                    />
                    <span className="text-gray-700">Remember me</span>
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sky-600 hover:text-sky-800 font-medium hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white py-3 rounded-xl font-semibold hover:from-sky-600 hover:to-sky-700 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Authenticating...
                    </div>
                  ) : (
                    "Login to Dashboard"
                  )}
                </button>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                {/* Signup Link */}
                <div className="text-center">
                  <span className="text-gray-600">
                    New to ReliefConnect?
                  </span>
                  <Link 
                    to="/register" 
                    className="ml-2 text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Create an Account
                  </Link>
                </div>
              </form>

              {/* Demo Credentials */}
              <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/90 p-5 sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl border border-slate-300 bg-white flex items-center justify-center">
                      <span className="text-slate-700">🔐</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Demo Credentials</h3>
                      <p className="text-xs text-slate-500">Use these test accounts to log in quickly</p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                    Test Only
                  </span>
                </div>

                <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
                  <article className="rounded-xl border border-cyan-200 bg-white p-4 shadow-sm">
                    <p className="mb-2 inline-flex rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700">Citizen</p>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-mono text-[13px] text-slate-700 break-all">danish543@gmail.com</p>
                    <p className="mt-2 text-xs text-slate-500">Password</p>
                    <p className="font-mono text-[13px] text-slate-700">danish8090</p>
                  </article>

                  <article className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
                    <p className="mb-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">NGO Staff</p>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-mono text-[13px] text-slate-700 break-all">contact@helpinghands.org</p>
                    <p className="mt-2 text-xs text-slate-500">Password</p>
                    <p className="font-mono text-[13px] text-slate-700">Helping8090</p>
                  </article>

                  <article className="rounded-xl border border-violet-200 bg-white p-4 shadow-sm">
                    <p className="mb-2 inline-flex rounded-full bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">Government</p>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-mono text-[13px] text-slate-700 break-all">govt@demo.com</p>
                    <p className="mt-2 text-xs text-slate-500">Password</p>
                    <p className="font-mono text-[13px] text-slate-700">demo123</p>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
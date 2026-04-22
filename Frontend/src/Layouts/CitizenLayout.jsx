import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CitizenLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/citizen", label: "Dashboard", icon: "📊", end: true },
    { to: "/citizen/report-incident", label: "Report Incident", icon: "⚠️" },
    { to: "/citizen/my-reports", label: "My Reports", icon: "🗂️" },
    { to: "/citizen/profile", label: "Profile", icon: "👤" }
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-white text-[#1f4f4d] shadow"
        : "text-white/90 hover:bg-white/20 hover:text-white"
    }`;

  const SidebarContent = ({ mobile = false }) => (
    <>
      <div className="p-5 border-b border-white/20">
        <div className="flex items-center justify-between gap-3">
          {(!collapsed || mobile) && (
            <div>
              <h2 className="text-xl font-bold tracking-tight">ReliefConnect</h2>
              <p className="text-xs text-teal-100/80 mt-0.5">Citizen Dashboard</p>
            </div>
          )}

          <button
            onClick={() => (mobile ? setMobileOpen(false) : setCollapsed((prev) => !prev))}
            className="h-9 w-9 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={mobile ? "Close menu" : "Toggle sidebar"}
          >
            {mobile ? "✕" : "☰"}
          </button>
        </div>
      </div>

      <nav className="p-3 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={getNavClass}
            onClick={() => mobile && setMobileOpen(false)}
          >
            <span className="text-lg">{item.icon}</span>
            {(!collapsed || mobile) && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 border-t border-white/20 space-y-3">
        <div className={`flex items-center ${collapsed && !mobile ? "justify-center" : "gap-3"}`}>
          <div className="h-10 w-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-semibold">
            {user?.name?.charAt(0) || "U"}
          </div>

          {(!collapsed || mobile) && (
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || "Citizen"}</p>
              <p className="text-xs text-white/70">Citizen</p>
            </div>
          )}
        </div>

        {(!collapsed || mobile) && (
          <button
            onClick={handleLogout}
            className="w-full rounded-xl bg-rose-500/90 px-3 py-2 text-sm font-semibold hover:bg-rose-500 transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="h-screen overflow-hidden bg-slate-100">
      <div className="flex h-full">
        <aside
          className={`hidden md:sticky md:top-0 md:flex md:h-screen md:flex-col ${collapsed ? "md:w-20" : "md:w-72"} bg-gradient-to-b from-[#284B52] via-[#3A6464] to-[#4A6A74] text-white transition-all duration-300 shadow-2xl`}
        >
          <SidebarContent />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/45"
              aria-label="Close sidebar overlay"
            />
            <aside className="relative h-full w-[86%] max-w-xs bg-gradient-to-b from-[#284B52] via-[#3A6464] to-[#4A6A74] text-white shadow-2xl flex flex-col">
              <SidebarContent mobile />
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0 h-screen overflow-y-auto">
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="md:hidden h-10 w-10 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                  aria-label="Open menu"
                >
                  ☰
                </button>

                <div className="min-w-0">
                  <p className="text-sm text-slate-500">Welcome back</p>
                  <p className="text-base font-semibold text-slate-800 truncate">{user?.name || "Citizen"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => navigate("/citizen/profile")}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-2 hover:bg-slate-50 transition-colors"
                >
                  <span className="h-7 w-7 rounded-full bg-cyan-600 text-white text-xs font-semibold flex items-center justify-center">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">Profile</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="rounded-xl bg-rose-500 px-3 sm:px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
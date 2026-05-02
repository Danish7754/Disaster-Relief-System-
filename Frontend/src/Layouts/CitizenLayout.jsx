import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, AlertCircle, FileText, User, Menu, X, LogOut } from "lucide-react";

export default function CitizenLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/citizen", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/citizen/report-incident", label: "Report Incident", icon: AlertCircle },
    { to: "/citizen/my-reports", label: "My Reports", icon: FileText },
    { to: "/citizen/profile", label: "Profile", icon: User }
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 transform ${
      isActive
        ? "bg-white text-cyan-700 shadow-md scale-[1.02]"
        : "text-white/80 hover:bg-cyan-500/15 hover:text-white hover:scale-[1.02]"
    }`;

  const sidebarShellClass = "relative isolate overflow-hidden text-white shadow-2xl border-r border-slate-700/60 bg-[linear-gradient(180deg,#071a24_0%,#0f3347_52%,#12314a_100%)]";

  const SidebarContent = ({ mobile = false }) => (
    <>
      <div className="p-5 border-b border-white/15 bg-white/5">
        <div className="flex items-center justify-between gap-3">
          {(!collapsed || mobile) && (
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">ReliefConnect</h2>
              <p className="text-xs text-cyan-100/70 mt-0.5">Citizen Dashboard</p>
            </div>
          )}

          <button
            onClick={() => (mobile ? setMobileOpen(false) : setCollapsed((prev) => !prev))}
            className="h-9 w-9 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
            aria-label={mobile ? "Close menu" : "Toggle sidebar"}
          >
            {mobile ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <nav className="p-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={getNavClass}
              onClick={() => mobile && setMobileOpen(false)}
            >
              <Icon size={20} className="flex-shrink-0" />
              {(!collapsed || mobile) && <span className="font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-white/15 bg-white/5">
        <div className={`flex items-center ${collapsed && !mobile ? "justify-center" : "gap-3"}`}>
          <div className="h-10 w-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center font-semibold text-white">
            {user?.name?.charAt(0) || "U"}
          </div>

          {(!collapsed || mobile) && (
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user?.name || "Citizen"}</p>
              <p className="text-xs text-white/70">{user?.city || "Citizen"}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen overflow-hidden bg-slate-100">
      <div className="flex h-full">
        <aside
          className={`hidden md:sticky md:top-0 md:flex md:h-screen md:flex-col ${collapsed ? "md:w-20" : "md:w-72"} ${sidebarShellClass} transition-all duration-300`}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0" />
          <div className="relative z-10 flex h-full flex-col">
            <SidebarContent />
          </div>
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/45"
              aria-label="Close sidebar overlay"
            />
            <aside className={`relative h-full w-[86%] max-w-xs ${sidebarShellClass} flex flex-col`}>
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.12),transparent_42%),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:100%_100%,100%_28px] opacity-25" />
              <div className="relative z-10 flex h-full flex-col">
                <SidebarContent mobile />
              </div>
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0 h-screen overflow-y-auto">
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="md:hidden h-10 w-10 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors"
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>

                <div className="min-w-0">
                  <p className="text-sm text-slate-500">Welcome back</p>
                  <p className="text-base font-semibold text-slate-800 truncate">{user?.name || "Citizen"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => navigate("/citizen/profile")}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-2 hover:bg-slate-50 transition-all duration-200 hover:shadow-sm"
                >
                  <span className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-white text-xs font-bold flex items-center justify-center border border-cyan-300/50">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">Profile</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-rose-500 px-3 sm:px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition-all duration-200 hover:shadow-md"
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
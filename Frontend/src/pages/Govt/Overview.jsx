import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useGovtDashboardData } from "../../hooks/useGovtDashboardData";
import { FileText, Clock, Cpu, CheckCircle } from "lucide-react";

const Card = ({ title, value, hint, tone, icon: Icon }) => (
  <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <p className={`mt-3 text-3xl font-bold ${tone}`}>{value}</p>
        <p className="mt-2 text-xs text-slate-500">{hint}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
        <Icon size={22} />
      </div>
    </div>
  </div>
);

export default function Overview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { overview, loading, error } = useGovtDashboardData();

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-900 via-blue-900 to-teal-800 p-6 sm:p-8 text-white shadow-lg hover:shadow-xl transition-shadow">
        <p className="text-xs uppercase tracking-[0.3em] text-teal-200">Government Overview</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-black">Command summary for {user?.state || "your region"}</h1>
        <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-100">
          Review live incident volume, pending work, and response status. Use the sidebar to jump into reports, NGOs, analytics, or assignments.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={() => navigate("/govt/reports")} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-900 hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
            Open Reports
          </button>
          <button onClick={() => navigate("/govt/assignments")} className="rounded-xl border border-white/30 bg-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/25 hover:border-white/40 transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm">
            Open Assignments
          </button>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Total Reports" value={loading ? "..." : overview.totalReports} hint="All incidents tracked" tone="text-slate-900" icon={FileText} />
        <Card title="Pending" value={loading ? "..." : overview.pending} hint="Needs attention" tone="text-amber-700" icon={Clock} />
        <Card title="In Progress" value={loading ? "..." : overview.inProgress} hint="Active operations" tone="text-blue-700" icon={Cpu} />
        <Card title="Resolved" value={loading ? "..." : overview.resolved} hint="Closed incidents" tone="text-emerald-700" icon={CheckCircle} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
        <h2 className="text-xl font-bold text-slate-900">Quick Navigation</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button onClick={() => navigate("/govt/reports")} className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 text-left hover:border-indigo-300 hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-50">
            <p className="font-semibold text-slate-900 group-hover:text-indigo-900 transition-colors">📄 Reports</p>
            <p className="mt-1 text-sm text-slate-500 group-hover:text-slate-600">View, filter, and auto assign reports.</p>
          </button>
          <button onClick={() => navigate("/govt/ngos")} className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 text-left hover:border-teal-300 hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-teal-50">
            <p className="font-semibold text-slate-900 group-hover:text-teal-900 transition-colors">🤝 NGOs</p>
            <p className="mt-1 text-sm text-slate-500 group-hover:text-slate-600">Check available partners and workload.</p>
          </button>
          <button onClick={() => navigate("/govt/analytics")} className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 text-left hover:border-blue-300 hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50">
            <p className="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors">📈 Analytics</p>
            <p className="mt-1 text-sm text-slate-500 group-hover:text-slate-600">Monitor status and severity trends.</p>
          </button>
          <button onClick={() => navigate("/govt/assignments")} className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 text-left hover:border-emerald-300 hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-50">
            <p className="font-semibold text-slate-900 group-hover:text-emerald-900 transition-colors">🧭 Assignments</p>
            <p className="mt-1 text-sm text-slate-500 group-hover:text-slate-600">Manual assignments and NGO selection.</p>
          </button>
        </div>
      </section>
    </div>
  );
}
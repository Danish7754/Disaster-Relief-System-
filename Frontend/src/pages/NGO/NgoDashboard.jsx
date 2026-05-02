import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getNgoAssignedReports } from "../../services/reportService";

export default function NgoDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNgoReports = async () => {
      if (!token) return;

      setLoading(true);
      setError("");

      try {
        const response = await getNgoAssignedReports(token);
        setReports(response.reports || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load operations data.");
      } finally {
        setLoading(false);
      }
    };

    fetchNgoReports();
  }, [token]);

  const stats = useMemo(() => {
    const pending = reports.filter((report) => report.status === "pending").length;
    const inProgress = reports.filter((report) => report.status === "in-progress").length;
    const resolved = reports.filter((report) => report.status === "resolved").length;
    const critical = reports.filter((report) => report.priority === "critical").length;

    return {
      total: reports.length,
      pending,
      inProgress,
      resolved,
      critical,
      completionRate: reports.length ? Math.round((resolved / reports.length) * 100) : 0,
    };
  }, [reports]);

  const recentReports = useMemo(
    () => [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    [reports]
  );

  const categoryBreakdown = useMemo(() => {
    const map = reports.reduce((acc, report) => {
      const key = report.category || "uncategorized";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(map)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [reports]);

  const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusBadge = (status) => {
    if (status === "resolved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "in-progress") return "bg-sky-50 text-sky-700 border-sky-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const getPriorityBadge = (priority) => {
    if (priority === "critical") return "bg-rose-50 text-rose-700 border-rose-200";
    if (priority === "high") return "bg-orange-50 text-orange-700 border-orange-200";
    if (priority === "medium") return "bg-violet-50 text-violet-700 border-violet-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/80 font-semibold">NGO Command Board</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">Field Operations</h1>
            <p className="mt-3 text-slate-200 max-w-2xl">
              Live snapshot of incidents and priorities for {user?.name || "your NGO"}. Optimize deployments with real-time data.
            </p>
            <button
              onClick={() => navigate("/ngo/reports")}
              className="mt-5 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 transition-colors"
            >
              Open Assigned Reports
            </button>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 sm:p-5 w-full lg:w-auto">
            <p className="text-xs uppercase tracking-wide text-emerald-200/90">Resolution Efficiency</p>
            <p className="mt-1 text-3xl font-bold">{stats.completionRate}%</p>
            <div className="mt-3 h-2.5 w-full lg:w-56 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${stats.completionRate}%` }} />
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <p className="text-sm text-slate-500">Total Incidents</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">{loading ? "..." : stats.total}</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
          <p className="text-sm text-amber-700">Pending</p>
          <p className="mt-2 text-3xl font-bold text-amber-900">{loading ? "..." : stats.pending}</p>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-5 shadow-sm">
          <p className="text-sm text-sky-700">In Progress</p>
          <p className="mt-2 text-3xl font-bold text-sky-900">{loading ? "..." : stats.inProgress}</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 shadow-sm">
          <p className="text-sm text-rose-700">Critical Priority</p>
          <p className="mt-2 text-3xl font-bold text-rose-900">{loading ? "..." : stats.critical}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Incident Queue</h3>
            <span className="text-xs text-slate-500">Latest 6 incidents</span>
          </div>

          <div className="divide-y divide-slate-100">
            {!loading && recentReports.length > 0 ? (
              recentReports.map((report) => (
                <article key={report._id} className="px-5 sm:px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{report.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {report.location?.city || "N/A"} • {formatDateTime(report.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs border rounded-full font-semibold ${getPriorityBadge(report.priority)}`}>
                        {report.priority || "medium"}
                      </span>
                      <span className={`px-2.5 py-1 text-xs border rounded-full font-semibold ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="px-5 sm:px-6 py-12 text-center text-slate-500">
                {loading ? "Loading incidents..." : "No incidents available yet."}
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Category Distribution</h3>
          <p className="text-sm text-slate-500 mt-1">Top categories by incident count</p>

          <div className="mt-5 space-y-3">
            {!loading && categoryBreakdown.length > 0 ? (
              categoryBreakdown.map((item) => {
                const percentage = stats.total ? Math.round((item.count / stats.total) * 100) : 0;
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="capitalize font-medium text-slate-700">{item.category}</span>
                      <span className="text-slate-500">{item.count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">{loading ? "Loading categories..." : "No category data yet."}</p>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Team Signal</p>
            <p className="mt-1 text-sm text-slate-700">
              {stats.critical > 0
                ? `${stats.critical} critical incidents need immediate team coordination.`
                : "No critical incident right now. Keep monitoring active queue."}
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

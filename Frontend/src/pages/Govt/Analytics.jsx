import { useGovtDashboardData } from "../../hooks/useGovtDashboardData";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS_STATUS = ["#2563eb", "#0891b2", "#10b981", "#f59e0b", "#ef4444"];
const COLORS_SEVERITY = ["#f97316", "#2c8567", "#c96977", "#e92323"];
const COLORS_WORKLOAD = ["#0ea5e9", "#06b6d4", "#14b8a6", "#22c55e", "#84cc16"];

function toPieData(arr) {
  return arr.map((it) => ({ name: it._id || "unknown", value: it.count }));
}

export default function Analytics() {
  const { overview, statusStats, severityStats, workloadStats, loading, error } = useGovtDashboardData();
  const total = overview.totalReports || 1;

  const statusData = toPieData(statusStats || []);
  const severityData = toPieData(severityStats || []);
  const workloadData = (workloadStats || []).map((w) => ({ name: w.name || "NGO", value: w.assignedCount }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Analytics</h1>
        <p className="mt-2 text-sm text-slate-500">Review response trends, severity mix, and NGO workload.</p>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group rounded-2xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1">
          <p className="text-sm font-medium text-slate-600">Total Reports</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{loading ? "..." : overview.totalReports}</p>
        </div>
        <div className="group rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-md hover:shadow-lg border border-amber-200 hover:border-amber-300 transition-all duration-300 hover:-translate-y-1">
          <p className="text-sm font-medium text-amber-700">Pending</p>
          <p className="mt-3 text-3xl font-bold text-amber-700">{loading ? "..." : overview.pending}</p>
        </div>
        <div className="group rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-5 shadow-md hover:shadow-lg border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
          <p className="text-sm font-medium text-blue-700">In Progress</p>
          <p className="mt-3 text-3xl font-bold text-blue-700">{loading ? "..." : overview.inProgress}</p>
        </div>
        <div className="group rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-md hover:shadow-lg border border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1">
          <p className="text-sm font-medium text-emerald-700">Resolved</p>
          <p className="mt-3 text-3xl font-bold text-emerald-700">{loading ? "..." : overview.resolved}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-bold text-slate-900">Status Breakdown</h2>
          <div className="mt-6 h-56">
            {statusData.length === 0 && !loading ? (
              <p className="text-sm text-slate-500">No status data available.</p>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} paddingAngle={3}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} reports`} />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-bold text-slate-900">Severity Breakdown</h2>
          <div className="mt-6 h-56">
            {severityData.length === 0 && !loading ? (
              <p className="text-sm text-slate-500">No severity data available.</p>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={severityData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={78} paddingAngle={3}>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-s-${index}`} fill={COLORS_SEVERITY[index % COLORS_SEVERITY.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} reports`} />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-bold text-slate-900">NGO Workload</h2>
        <div className="mt-6 h-72">
          {workloadData.length === 0 && !loading ? (
            <p className="text-sm text-slate-500">No workload data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={140} />
                <Tooltip formatter={(value) => `${value} assigned`} />
                <Bar dataKey="value" fill="#0ea5e9">
                  {workloadData.map((entry, index) => (
                    <Cell key={`cell-w-${index}`} fill={COLORS_WORKLOAD[index % COLORS_WORKLOAD.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
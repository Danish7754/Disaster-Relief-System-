import { useGovtDashboardData } from "../../hooks/useGovtDashboardData";
import { useNavigate } from "react-router-dom";
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
import { useState } from "react";

const COLORS_STATUS = ["#2563eb", "#0891b2", "#10b981", "#f59e0b", "#ef4444"];
const COLORS_SEVERITY = ["#f97316", "#2c8567", "#c96977", "#e92323"];
const COLORS_WORKLOAD = ["#0ea5e9", "#06b6d4", "#14b8a6", "#22c55e", "#84cc16"];

function toPieData(arr) {
  return arr.map((it) => ({ name: it._id || "unknown", value: it.count }));
}

export default function Analytics() {
  const { overview, statusStats, severityStats, workloadStats, loading, error } = useGovtDashboardData();
  const navigate = useNavigate();
  const [hoveredStatus, setHoveredStatus] = useState(null);
  const [hoveredSeverity, setHoveredSeverity] = useState(null);
  
  const total = overview.totalReports || 1;

  const statusData = toPieData(statusStats || []);
  const severityData = toPieData(severityStats || []);
  const workloadData = (workloadStats || []).map((w) => ({ name: w.name || "NGO", value: w.assignedCount }));
  const totalAssignedReports = workloadData.reduce((sum, item) => sum + item.value, 0);
  const topWorkloadItem = workloadData.reduce(
    (top, item) => (item.value > (top?.value || 0) ? item : top),
    workloadData[0] || null
  );
  const sortedWorkloadData = [...workloadData].sort((a, b) => b.value - a.value);
  const workloadHighlights = sortedWorkloadData.slice(0, 5);
  const workloadMax = sortedWorkloadData[0]?.value || 1;

  const handleStatusClick = (data) => {
    navigate(`/govt/reports?status=${data.name.toLowerCase()}`);
  };

  const handleSeverityClick = (data) => {
    navigate(`/reports/${data.name.toLowerCase()}`);
  };

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
        <div className="group rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-blue-50/20 to-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Status Breakdown</h2>
              <p className="text-xs text-slate-500 mt-1">Click on any status to filter reports</p>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              {statusData.length} categories
            </div>
          </div>
          
          {statusData.length === 0 && !loading ? (
            <p className="text-sm text-slate-500 text-center py-8">No status data available.</p>
          ) : (
            <div className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={95}
                      paddingAngle={2}
                      onClick={(entry) => handleStatusClick(entry.payload)}
                      onMouseEnter={(entry) => setHoveredStatus(entry.payload.name)}
                      onMouseLeave={() => setHoveredStatus(null)}
                      style={{ cursor: "pointer" }}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS_STATUS[index % COLORS_STATUS.length]}
                          opacity={hoveredStatus === null || hoveredStatus === entry.name ? 1 : 0.5}
                          className="transition-opacity duration-200"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        color: "#ffffff",
                      }}
                      formatter={(value) => [`${value} reports`, "Count"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {statusData.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleStatusClick(item)}
                    onMouseEnter={() => setHoveredStatus(item.name)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    className="group/btn px-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS_STATUS[index % COLORS_STATUS.length] }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 capitalize">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.value} reports</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="group rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-orange-50/20 to-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-orange-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Priority Breakdown</h2>
              <p className="text-xs text-slate-500 mt-1">Click on any priority level to filter reports</p>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
              {severityData.length} levels
            </div>
          </div>
          
          {severityData.length === 0 && !loading ? (
            <p className="text-sm text-slate-500 text-center py-8">No priority data available.</p>
          ) : (
            <div className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={95}
                      paddingAngle={2}
                      onClick={(entry) => handleSeverityClick(entry.payload)}
                      onMouseEnter={(entry) => setHoveredSeverity(entry.payload.name)}
                      onMouseLeave={() => setHoveredSeverity(null)}
                      style={{ cursor: "pointer" }}
                    >
                      {severityData.map((entry, index) => (
                        <Cell
                          key={`cell-s-${index}`}
                          fill={COLORS_SEVERITY[index % COLORS_SEVERITY.length]}
                          opacity={hoveredSeverity === null || hoveredSeverity === entry.name ? 1 : 0.5}
                          className="transition-opacity duration-200"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        color: "#ffffff",
                      }}
                      formatter={(value) => [`${value} reports`, "Count"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {severityData.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSeverityClick(item)}
                    onMouseEnter={() => setHoveredSeverity(item.name)}
                    onMouseLeave={() => setHoveredSeverity(null)}
                    className="group/btn px-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS_SEVERITY[index % COLORS_SEVERITY.length] }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 capitalize">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.value} reports</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-cyan-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,253,250,0.95),rgba(239,246,255,0.98))] p-8 shadow-[0_24px_70px_rgba(8,145,178,0.12)] transition-all duration-300 hover:border-cyan-300 hover:shadow-[0_30px_90px_rgba(8,145,178,0.16)]">
        <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/85 px-3 py-1 text-xs font-semibold text-cyan-700 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              Live Capacity Snapshot
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">NGO Workload Distribution</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                A ranked view of assigned reports across NGOs, designed to quickly surface load imbalance and the busiest response teams.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
            <div className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">NGOs</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{workloadData.length}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Assigned</p>
              <p className="mt-1 text-2xl font-black text-cyan-700">{totalAssignedReports}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Most Loaded</p>
              <p className="mt-1 truncate text-lg font-black text-slate-700">{topWorkloadItem?.name || "-"}</p>
            </div>
          </div>
        </div>

        {workloadData.length === 0 && !loading ? (
          <div className="rounded-3xl border border-dashed border-cyan-200 bg-white/80 py-14 text-center shadow-inner">
            <p className="text-sm font-medium text-slate-500">No workload data available.</p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
            <div className="rounded-[1.75rem] border border-cyan-100 bg-white/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">Assigned reports</p>
                  <p className="mt-1 text-sm text-slate-500">Higher bars indicate heavier NGO load.</p>
                </div>
                <div className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                  Peak: {workloadMax}
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedWorkloadData} layout="vertical" margin={{ top: 8, right: 20, left:-20, bottom: 8 }}>
                    <defs>
                      <linearGradient id="workloadBarGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.11)" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="rgba(100, 116, 139, 0.72)"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={112}
                      stroke="rgba(100, 116, 139, 0.72)"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#334155", fontSize: 12, fontWeight: 700 }}
                      tickMargin={8}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(14, 165, 233, 0.06)" }}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "18px",
                        color: "#ffffff",
                        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.25)",
                      }}
                      formatter={(value) => [`${value} assigned`, "Reports"]}
                    />
                    <Bar dataKey="value" fill="url(#workloadBarGradient)" radius={[0, 16, 16, 0]} barSize={18}>
                      {sortedWorkloadData.map((entry, index) => (
                        <Cell
                          key={`cell-w-${index}`}
                          fill={COLORS_WORKLOAD[index % COLORS_WORKLOAD.length]}
                          opacity={index === 0 ? 1 : 0.92}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <aside className="flex max-h-[27rem] flex-col rounded-[1.75rem] border border-white/70 bg-white/88 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Top NGOs</p>
                  <h3 className="mt-1 text-lg font-black text-slate-900">Load leaderboard</h3>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {sortedWorkloadData.length} total
                </div>
              </div>

              <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {workloadHighlights.map((item, index) => {
                  const percent = Math.max(8, Math.round((item.value / workloadMax) * 100));
                  return (
                    <div key={item.name} className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white shadow-sm" style={{ backgroundColor: COLORS_WORKLOAD[index % COLORS_WORKLOAD.length] }}>
                              {index + 1}
                            </span>
                            <p className="truncate text-sm font-bold text-slate-900">{item.name}</p>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">Assigned workload balance</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-900">{item.value}</p>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">reports</p>
                        </div>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: COLORS_WORKLOAD[index % COLORS_WORKLOAD.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
                {sortedWorkloadData.length > workloadHighlights.length && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-3 text-center text-xs font-medium text-slate-500">
                    {sortedWorkloadData.length - workloadHighlights.length} more NGOs are shown in the chart on the left
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}
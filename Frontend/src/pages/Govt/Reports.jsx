import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import * as govtService from "../../services/govtService";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";

const StatusDot = ({ status }) => {
  const map = { pending: "bg-amber-500", "in-progress": "bg-blue-500", resolved: "bg-emerald-500" };
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${map[status] || "bg-slate-400"}`} />;
};

const AssignmentStatusBadge = ({ assignmentState, assignedNgo }) => {
  if (assignmentState === "waiting") {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
        <Clock className="w-4 h-4 text-blue-600 animate-spin" />
        <span className="text-xs font-semibold text-blue-700">Waiting for NGO response</span>
      </div>
    );
  }
  if (assignmentState === "accepted") {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
        <CheckCircle className="w-4 h-4 text-emerald-600" />
        <span className="text-xs font-semibold text-emerald-700">NGO Accepted</span>
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const { severity = "" } = useParams();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [showNgoModal, setShowNgoModal] = useState(false);
  const [page, setPage] = useState(1);
  const reportsPerPage = 6;

  const normalize = (value) => String(value || "").trim().toLowerCase();

  // Read URL path/query params and apply filters
  useEffect(() => {
    const statusParam = searchParams.get("status") || "";
    const priorityParam = severity || searchParams.get("priority") || "";
    setFilters({ status: normalize(statusParam), priority: normalize(priorityParam) });
    setPage(1);
  }, [searchParams, severity]);

  const fetchReports = useCallback(async (statusFilter, priorityFilter) => {
    setLoading(true);
    setError("");
    try {
      const res = await govtService.getReports({ status: statusFilter, priority: priorityFilter, page: 1, limit: 1000 });
      const sortedReports = (res.reports || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllReports(sortedReports);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(filters.status, filters.priority);
  }, [filters.status, filters.priority, fetchReports]);

  const filteredReports = useMemo(() => {
    return allReports.filter((report) => {
      const statusMatch = !filters.status || normalize(report.status) === filters.status;
      const priorityMatch = !filters.priority || normalize(report.priority) === filters.priority;
      return statusMatch && priorityMatch;
    });
  }, [allReports, filters.status, filters.priority]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / reportsPerPage));
  const reports = filteredReports.slice((page - 1) * reportsPerPage, page * reportsPerPage);

  const handleAutoAssign = async (reportId) => {
    setActionLoading(true);
    setMessage("");
    try {
      const result = await govtService.autoAllocateReports(reportId);
      setMessage(result.message || "Report auto-assigned successfully");
      await fetchReports(filters.status, filters.priority);
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to auto-assign report");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleReassign = (reportId) => {
    setSelectedReportId(reportId);
    setShowNgoModal(true);
  };

  const getActionButtonConfig = (report) => {
    if (report.status === "resolved") {
      return { label: "Completed", disabled: true, variant: "completed" };
    }
    if (report.status === "in-progress") {
      return { label: "In Progress", disabled: true, variant: "inprogress" };
    }
    if (report.assignedNgo && report.ngoAssignmentState === "waiting") {
      return { label: "Waiting...", disabled: true, variant: "waiting" };
    }
    if (!report.assignedNgo && report.rejectionHistory?.length > 0) {
      return { label: "Reassign NGO", disabled: false, variant: "reassign", onClick: () => handleReassign(report._id) };
    }
    if (!report.assignedNgo) {
      return { label: "Auto Assign", disabled: false, variant: "auto", onClick: () => handleAutoAssign(report._id) };
    }
    return { label: "Pending", disabled: true, variant: "pending" };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Reports</h1>
        <p className="mt-2 text-sm text-slate-500">Filter report queue and trigger single-report assignments.</p>
      </div>

      {(error || message) && (
        <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${error ? "border border-red-200 bg-red-50 text-red-800" : "border border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {error || message}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
        <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-300">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filters.priority} onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-300">
          <option value="">All Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-4 py-3 flex items-center gap-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-900">Most Recent Reports First</p>
          <p className="text-xs text-blue-700 mt-0.5">Reports are automatically sorted by date, with the latest entries displayed at the top of each page.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg">
        <div className="w-full overflow-x-auto">
          <table className="w-full divide-y divide-slate-200">
            <thead className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Report</th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="hidden md:table-cell px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Assigned NGO</th>
                <th className="hidden md:table-cell px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Priority</th>
                <th className="hidden lg:table-cell px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Location</th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td className="px-6 py-12 text-center text-sm text-slate-500" colSpan={6}><span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></span>Loading reports...</span></td></tr>
              ) : reports.length === 0 ? (
                <tr><td className="px-6 py-12 text-center text-sm text-slate-500" colSpan={6}>No reports found. Try adjusting your filters.</td></tr>
              ) : reports.map((report) => {
                const buttonConfig = getActionButtonConfig(report);
                const isRejected = report.rejectionHistory?.length > 0;
                return (
                  <tr key={report._id} className={`transition-colors duration-200 ${isRejected ? "bg-red-50/60" : "hover:bg-indigo-50/50"}`}>
                    <td className="px-6 py-5 align-top">
                      <p className="font-semibold text-slate-900">{report.title}</p>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">{report.description || "No description provided."}</p>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <StatusDot status={report.status} />
                          <span className="capitalize">{report.status || "unknown"}</span>
                        </div>
                        {report.ngoAssignmentState && (
                          <AssignmentStatusBadge assignmentState={report.ngoAssignmentState} assignedNgo={report.assignedNgo} />
                        )}
                        {isRejected && (
                          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-100 border border-red-300">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                            <span className="text-xs font-semibold text-red-700">NGO Rejected</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-5 align-top text-sm text-slate-700">
                      {report.assignedNgo?.name ? (
                        <span className="inline-block px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-semibold text-xs">
                          {report.assignedNgo.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="hidden md:table-cell px-6 py-5 align-top text-sm capitalize text-slate-700">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">{report.priority || "N/A"}</span>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-5 align-top text-sm text-slate-700">
                      <div className="font-medium">{report.city || report.location?.city || "—"}</div>
                      <div className="text-xs text-slate-500">{report.state || "State not set"}</div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <button
                        onClick={buttonConfig.onClick}
                        disabled={buttonConfig.disabled || actionLoading}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold text-white transition-all duration-300 hover:shadow-lg ${
                          buttonConfig.variant === "waiting"
                            ? "bg-blue-400 text-blue-100 cursor-not-allowed"
                            : buttonConfig.variant === "reassign"
                            ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 hover:-translate-y-0.5"
                            : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-blue-300 disabled:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-50 hover:-translate-y-0.5"
                        }`}
                      >
                        {buttonConfig.label}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-5 border-t border-slate-200 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 flex flex-col gap-4 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Recent Reports</p>
            <p className="text-sm font-medium text-slate-700">Page <span className="font-bold text-indigo-600">{page}</span> of <span className="font-bold text-indigo-600">{totalPages}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handlePageChange(page - 1)} 
              disabled={page <= 1} 
              className="px-4 py-2.5 rounded-lg border-2 border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200"
            >
              ← Previous
            </button>
            <button 
              onClick={() => handlePageChange(page + 1)} 
              disabled={page >= totalPages} 
              className="px-4 py-2.5 rounded-lg border-2 border-indigo-400 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:border-slate-300 disabled:text-slate-600 transition-all duration-200 hover:-translate-y-0.5"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
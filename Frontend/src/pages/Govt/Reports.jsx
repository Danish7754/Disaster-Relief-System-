import { useState, useEffect, useCallback } from "react";
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
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [showNgoModal, setShowNgoModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReports = useCallback(async (pageToFetch = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await govtService.getReports({ status: filters.status, priority: filters.priority, page: pageToFetch, limit });
      setReports(res.reports || []);
      setTotalPages(res.totalPages || 1);
      setPage(res.currentPage || pageToFetch);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.priority, limit]);

  useEffect(() => {
    fetchReports(1);
  }, [fetchReports]);

  const handleAutoAssign = async (reportId) => {
    setActionLoading(true);
    setMessage("");
    try {
      const result = await govtService.autoAllocateReports(reportId);
      setMessage(result.message || "Report auto-assigned successfully");
      await fetchReports(page);
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to auto-assign report");
    } finally {
      setActionLoading(false);
    }
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

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchReports(newPage);
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="sticky top-0 bg-gradient-to-r from-indigo-50 to-teal-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Report</th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Status</th>
                <th className="hidden md:table-cell px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Assigned NGO</th>
                <th className="hidden md:table-cell px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Priority</th>
                <th className="hidden lg:table-cell px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Location</th>
                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td className="px-4 py-8 text-sm text-slate-500" colSpan={6}>Loading reports...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td className="px-4 py-8 text-sm text-slate-500" colSpan={6}>No reports found.</td></tr>
              ) : reports.map((report) => {
                const buttonConfig = getActionButtonConfig(report);
                const isRejected = report.rejectionHistory?.length > 0;
                return (
                  <tr key={report._id} className={`hover:bg-indigo-50 transition-colors duration-200 ${isRejected ? "bg-red-50" : ""}`}>
                    <td className="px-4 py-4 align-top">
                      <p className="font-semibold text-slate-900">{report.title}</p>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{report.description || "No description provided."}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <StatusDot status={report.status} />
                          <span className="capitalize">{report.status || "unknown"}</span>
                        </div>
                        {report.ngoAssignmentState && (
                          <AssignmentStatusBadge assignmentState={report.ngoAssignmentState} assignedNgo={report.assignedNgo} />
                        )}
                        {isRejected && (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-semibold text-red-700">NGO Rejected</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 align-top text-sm text-slate-700">
                      {report.assignedNgo?.name ? (
                        <span className="inline-block px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 font-medium">
                          {report.assignedNgo.name}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 align-top text-sm capitalize text-slate-700">{report.priority || "N/A"}</td>
                    <td className="hidden lg:table-cell px-4 py-4 align-top text-sm text-slate-700">
                      <div>{report.city || report.location?.city || "—"}</div>
                      <div className="text-xs text-slate-500">{report.state || "State not set"}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <button
                        onClick={buttonConfig.onClick}
                        disabled={buttonConfig.disabled || actionLoading}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold text-white transition-all duration-300 hover:shadow-md ${
                          buttonConfig.variant === "waiting"
                            ? "bg-blue-400 text-blue-100 cursor-not-allowed"
                            : buttonConfig.variant === "reassign"
                            ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                            : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-blue-300 disabled:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-600">Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="px-3 py-1 rounded border bg-white">Previous</button>
            <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} className="px-3 py-1 rounded border bg-white">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
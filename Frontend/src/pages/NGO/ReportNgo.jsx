import { useEffect, useMemo, useState } from "react";
import {
  acceptNgoReport,
  completeNgoReport,
  getNgoAssignedReports,
  rejectNgoReport,
} from "../../services/reportService";
import { useAuth } from "../../context/AuthContext";

export default function ReportNgo() {
  const { token } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const reportsPerPage = 5;

  const fetchAssignedReports = async () => {
    if (!token) {
      setReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getNgoAssignedReports(token);
      setReports(response.reports || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch assigned reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedReports();
  }, [token]);

  const totalPages = Math.max(1, Math.ceil(reports.length / reportsPerPage));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const stats = useMemo(() => { 
    const pending = reports.filter((report) => report.status === "pending").length;
    const inProgress = reports.filter((report) => report.status === "in-progress").length;
    const resolved = reports.filter((report) => report.status === "resolved").length;

    return {
      total: reports.length,
      pending,
      inProgress,
      resolved,
    };
  }, [reports]);

  const visibleReports = useMemo(() => {
    const startIndex = (currentPage - 1) * reportsPerPage;
    return reports.slice(startIndex, startIndex + reportsPerPage);
  }, [currentPage, reports]);

  const showingStart = reports.length === 0 ? 0 : (currentPage - 1) * reportsPerPage + 1;
  const showingEnd = Math.min(currentPage * reportsPerPage, reports.length);

  const formatDate = (dateValue) =>
    new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatDateTime = (dateValue) =>
    new Date(dateValue).toLocaleString("en-IN", {
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

  const handleAccept = async (reportId) => {
    setActionLoadingId(reportId);
    try {
      await acceptNgoReport(reportId, token);
      await fetchAssignedReports();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to accept this report.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleReject = async (reportId) => {
    setActionLoadingId(reportId);
    try {
      await rejectNgoReport(reportId, token);
      await fetchAssignedReports();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reject this report.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleComplete = async (reportId) => {
    setActionLoadingId(reportId);
    try {
      await completeNgoReport(reportId, token);
      await fetchAssignedReports();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to complete this report.");
    } finally {
      setActionLoadingId("");
    }
  };

  const openDetails = (report) => {
    setSelectedReport(report);
  };

  const closeDetails = () => {
    setSelectedReport(null);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">NGO Reports</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Assigned Reports Queue</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Only reports assigned by Government to your NGO are visible here. Accept requests to move them in-progress, then complete once work is finished.
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Assigned</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "..." : stats.total}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
          <p className="text-sm text-amber-700">Waiting Acceptance</p>
          <p className="mt-2 text-3xl font-bold text-amber-900">{loading ? "..." : stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-5 shadow-sm">
          <p className="text-sm text-sky-700">In Progress</p>
          <p className="mt-2 text-3xl font-bold text-sky-900">{loading ? "..." : stats.inProgress}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-sm">
          <p className="text-sm text-emerald-700">Completed</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900">{loading ? "..." : stats.resolved}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">All Assigned Reports</h3>
          <button
            onClick={fetchAssignedReports}
            className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
          >
            Refresh
          </button>
        </div>

        {!loading && reports.length > 0 ? (
          <>
            <div className="divide-y divide-slate-100">
              {visibleReports.map((report) => {
                const isBusy = actionLoadingId === report._id;
                const statusLabel =
                  report.status === "resolved"
                    ? "Resolved"
                    : report.status === "in-progress"
                      ? "In Progress"
                      : "Pending";

                return (
                  <article key={report._id} className="px-5 sm:px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{report.title}</p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {report.location?.city || "N/A"} • {formatDate(report.createdAt)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          By: {report.createdBy?.name || "Unknown User"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => openDetails(report)}
                          className="rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold px-3 py-1.5 hover:bg-slate-50"
                        >
                          View
                        </button>

                        <span className={`px-2.5 py-1 text-xs border rounded-full font-semibold ${getPriorityBadge(report.priority)}`}>
                          {report.priority || "medium"}
                        </span>
                        <span className={`px-2.5 py-1 text-xs border rounded-full font-semibold ${getStatusBadge(report.status)}`}>
                          {statusLabel}
                        </span>

                        {report.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleAccept(report._id)}
                              disabled={isBusy}
                              className="rounded-lg bg-sky-600 text-white text-sm font-semibold px-3 py-1.5 hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isBusy ? "Please wait..." : "Accept"}
                            </button>

                            <button
                              onClick={() => handleReject(report._id)}
                              disabled={isBusy}
                              className="rounded-lg bg-rose-600 text-white text-sm font-semibold px-3 py-1.5 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isBusy ? "Please wait..." : "Reject"}
                            </button>
                          </>
                        )}

                        {report.status === "in-progress" && (
                          <button
                            onClick={() => handleComplete(report._id)}
                            disabled={isBusy}
                            className="rounded-lg bg-emerald-600 text-white text-sm font-semibold px-3 py-1.5 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isBusy ? "Please wait..." : "Resolve"}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-slate-600">
                Showing {showingStart} to {showingEnd} of {reports.length} reports
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="px-5 sm:px-6 py-12 text-center text-slate-500">
            {loading ? "Loading assigned reports..." : "No assigned reports for your NGO."}
          </div>
        )}
      </section>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Report Details</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedReport.title || "Untitled report"}</h3>
              </div>
              <button
                onClick={closeDetails}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Description</p>
                <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{selectedReport.description || "No description provided."}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Reporter Name</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{selectedReport.createdBy?.name || "Unknown User"}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Phone Number</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{selectedReport.createdBy?.phone || "N/A"}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Location</p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {selectedReport.location?.city || "N/A"}
                  {selectedReport.state ? `, ${selectedReport.state}` : ""}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Reported On</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{formatDateTime(selectedReport.createdAt)}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Priority</p>
                <p className="mt-2 text-sm font-medium text-slate-900 capitalize">{selectedReport.priority || "N/A"}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</p>
                <p className="mt-2 text-sm font-medium text-slate-900 capitalize">{selectedReport.status || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

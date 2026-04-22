import { useEffect, useMemo, useState } from "react";
import {
  acceptNgoReport,
  completeNgoReport,
  getNgoAssignedReports,
} from "../../services/reportService";
import { useAuth } from "../../context/AuthContext";

export default function ReportNgo() {
  const { token } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  const fetchAssignedReports = async () => {
    if (!token) return;

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

  const formatDate = (dateValue) =>
    new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
          <div className="divide-y divide-slate-100">
            {reports.map((report) => {
              const isBusy = actionLoadingId === report._id;
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
                      <span className={`px-2.5 py-1 text-xs border rounded-full font-semibold ${getPriorityBadge(report.priority)}`}>
                        {report.priority || "medium"}
                      </span>
                      <span className={`px-2.5 py-1 text-xs border rounded-full font-semibold ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>

                      {report.status === "pending" && (
                        <button
                          onClick={() => handleAccept(report._id)}
                          disabled={isBusy}
                          className="rounded-lg bg-sky-600 text-white text-sm font-semibold px-3 py-1.5 hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isBusy ? "Please wait..." : "Accept"}
                        </button>
                      )}

                      {report.status === "in-progress" && (
                        <button
                          onClick={() => handleComplete(report._id)}
                          disabled={isBusy}
                          className="rounded-lg bg-emerald-600 text-white text-sm font-semibold px-3 py-1.5 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isBusy ? "Please wait..." : "Complete"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="px-5 sm:px-6 py-12 text-center text-slate-500">
            {loading ? "Loading assigned reports..." : "No assigned reports for your NGO."}
          </div>
        )}
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { deleteReport, getMyReports } from "../../services/reportService";
import { useNavigate } from "react-router-dom";

export default function MyReports() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;

  const fetchReports = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getMyReports(token);
      setReports(data);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to load reports.");
      console.log(error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

  const filteredReports = reports.filter((report) => {
    const city = report.location?.city || "";
    const matchesSearch =
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = useMemo(() => {
    const countByStatus = reports.reduce(
      (acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      },
      { pending: 0, "in-progress": 0, resolved: 0 }
    );

    return {
      total: reports.length,
      pending: countByStatus.pending || 0,
      inProgress: countByStatus["in-progress"] || 0,
      resolved: countByStatus.resolved || 0,
    };
  }, [reports]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / reportsPerPage));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const visibleReports = useMemo(() => {
    const startIndex = (currentPage - 1) * reportsPerPage;
    return filteredReports.slice(startIndex, startIndex + reportsPerPage);
  }, [currentPage, filteredReports]);

  const showingStart = filteredReports.length === 0 ? 0 : (currentPage - 1) * reportsPerPage + 1;
  const showingEnd = Math.min(currentPage * reportsPerPage, filteredReports.length);

  const handleDelete = async (id) => {
    const shouldDelete = window.confirm("Delete this report permanently?");
    if (!shouldDelete) return;

    try {
      await deleteReport(id, token);
      setReports((prevReports) => prevReports.filter((report) => report._id !== id));
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "in-progress":
        return "bg-sky-50 text-sky-700 border border-sky-200";
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="min-h-[calc(100vh-110px)] bg-gradient-to-b from-slate-50 via-white to-cyan-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 rounded-3xl border border-slate-200/70 bg-white/90 p-6 sm:p-8 shadow-xl shadow-slate-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">My Reports</h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Track your submitted incidents, monitor status updates, and manage pending items.
              </p>
            </div>
            <span className="self-start sm:self-auto px-4 py-2 bg-cyan-50 text-cyan-800 rounded-full text-sm font-semibold border border-cyan-100">
              Showing {filteredReports.length} of {reports.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-amber-700">Pending</p>
            <p className="mt-2 text-2xl font-semibold text-amber-800">{stats.pending}</p>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-sky-700">In Progress</p>
            <p className="mt-2 text-2xl font-semibold text-sky-800">{stats.inProgress}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-emerald-700">Resolved</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-800">{stats.resolved}</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by incident title or city"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 pl-11 bg-white focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="relative min-w-[180px]">
              <select
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 transition-all outline-none appearance-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>pending</option>
                <option>in-progress</option>
                <option>resolved</option>
              </select>
              <svg className="absolute right-3 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-600 font-medium">Loading your reports...</p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Incident</th>
                      <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                      <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visibleReports.length > 0 ? (
                      visibleReports.map((report) => (
                        <tr key={report._id} className="hover:bg-slate-50 transition-colors duration-150">
                          <td className="py-4 px-6">
                            <div className="font-medium text-slate-800">{report.title}</div>
                          </td>

                          <td className="py-4 px-6 text-slate-600">{report.location?.city || "N/A"}</td>

                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(report.status)}`}>
                              {report.status}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-slate-500">{formatDate(report.createdAt)}</td>

                          <td className="py-4 px-6">
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <button
                                onClick={() => navigate(`/citizen/report/${report._id}`)}
                                className="font-medium text-cyan-700 hover:text-cyan-900 transition-colors"
                              >
                                View
                              </button>
                              {report.status === "pending" && !report.assignedNgo && (
                                <>
                                  <button
                                    className="font-medium text-amber-700 hover:text-amber-900 transition-colors"
                                    onClick={() => navigate(`/citizen/edit-report/${report._id}`)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="font-medium text-rose-700 hover:text-rose-900 transition-colors"
                                    onClick={() => handleDelete(report._id)}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-12 px-6 text-center">
                          <p className="text-slate-500 text-lg">No reports found</p>
                          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid lg:hidden gap-4">
              {visibleReports.length > 0 ? (
                visibleReports.map((report) => (
                  <article
                    key={report._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900 leading-tight">{report.title}</h3>
                      <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <p>
                        <span className="font-medium text-slate-700">City:</span> {report.location?.city || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium text-slate-700">Created:</span> {formatDate(report.createdAt)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/citizen/report/${report._id}`)}
                        className="rounded-lg bg-cyan-50 border border-cyan-200 px-3 py-1.5 text-sm font-medium text-cyan-800 hover:bg-cyan-100 transition-colors"
                      >
                        View
                      </button>

                      {report.status === "pending" && !report.assignedNgo && (
                        <>
                          <button
                            className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
                            onClick={() => navigate(`/citizen/edit-report/${report._id}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-800 hover:bg-rose-100 transition-colors"
                            onClick={() => handleDelete(report._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <p className="text-slate-500 text-lg">No reports found</p>
                  <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 shadow-sm">
              <p className="text-sm text-slate-600">
                Showing {showingStart} to {showingEnd} of {filteredReports.length} reports
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
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createReport, getMyReports } from "../../services/reportService";

export default function CitizenDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reports, setReports] = useState([]);

  const [reportData, setReportData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    urgency: "medium",
  });

  const fetchReports = async () => {
    try {
      const data = await getMyReports(token);
      setReports(data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token]);

  const activeReports = reports.filter((report) => report.status !== "resolved").length;
  const resolvedReports = reports.filter((report) => report.status === "resolved").length;
  const pendingReports = reports.filter((report) => report.status === "pending").length;
  const inProgressReports = reports.filter((report) => report.status === "in-progress").length;
  const recentReports = reports.slice(0, 3);

  const completionRate = reports.length ? Math.round((resolvedReports / reports.length) * 100) : 0;

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateValue) =>
    new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleReportChange = (e) => {
    setReportData({
      ...reportData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await createReport(reportData, token);
      await fetchReports();

      setSuccessMessage("Report submitted successfully.");
      setReportData({
        title: "",
        description: "",
        category: "",
        location: "",
        urgency: "medium",
      });
      setShowModal(false);

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to submit report.");
      console.log(error.response?.data || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
        <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-cyan-100/70 blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-100/70 blur-3xl"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Citizen Command Center</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              Welcome, {user?.name || "Citizen"}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Quickly create an incident report and monitor progress from submission to resolution.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50/80 p-4 sm:p-5 w-full lg:w-auto">
            <p className="text-sm text-cyan-700 font-medium">Resolution Rate</p>
            <p className="mt-1 text-3xl font-bold text-cyan-900">{completionRate}%</p>
            <div className="mt-3 h-2.5 w-full rounded-full bg-cyan-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          onClick={() => setShowModal(true)}
          className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:shadow-md hover:border-cyan-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Quick Action</p>
            <span className="text-cyan-600 text-lg transition-transform group-hover:translate-x-0.5">+</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-slate-900">Report New Incident</p>
          <p className="mt-1 text-xs text-slate-500">Submit details in less than a minute</p>
        </button>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
          <p className="text-sm text-amber-700 font-medium">Pending</p>
          <p className="mt-2 text-3xl font-bold text-amber-900">{pendingReports}</p>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-5 shadow-sm">
          <p className="text-sm text-sky-700 font-medium">In Progress</p>
          <p className="mt-2 text-3xl font-bold text-sky-900">{inProgressReports}</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-sm">
          <p className="text-sm text-emerald-700 font-medium">Resolved</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900">{resolvedReports}</p>
        </div>
      </section>

      <section className="grid xl:grid-cols-[1.35fr_0.65fr] gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Latest Activity</h3>
            <button
              onClick={() => navigate("/citizen/my-reports")}
              className="text-sm font-medium text-cyan-700 hover:text-cyan-900"
            >
              Open My Reports
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <article key={report._id} className="px-5 sm:px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{report.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{report.location?.city || "N/A"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-semibold ${getStatusStyle(report.status)}`}
                      >
                        {report.status}
                      </span>
                      <span className="text-xs text-slate-500">{formatDate(report.createdAt)}</span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="px-5 sm:px-6 py-12 text-center">
                <p className="text-slate-600 font-medium">No reports yet</p>
                <p className="text-sm text-slate-500 mt-1">Create your first incident report to start tracking updates.</p>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Response Snapshot</h3>
          <p className="text-sm text-slate-500 mt-1">Current overview of your submitted incidents</p>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Reports</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{reports.length}</p>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Active Cases</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{activeReports}</p>
            </div>

            <button
              onClick={() => navigate("/citizen/report-incident")}
              className="w-full rounded-xl bg-slate-900 text-white text-sm font-semibold py-2.5 hover:bg-slate-800 transition-colors"
            >
              Go To Full Report Form
            </button>
          </div>
        </aside>
      </section>

      {showModal && (
        <div
          className="fixed inset-0 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center z-50 px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Report New Incident</h2>
                <p className="text-sm text-slate-500 mt-1">Provide accurate details to speed up response.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="h-9 w-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                aria-label="Close report modal"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Incident title"
                  value={reportData.title}
                  onChange={handleReportChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select
                    name="category"
                    value={reportData.category}
                    onChange={handleReportChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="flood">Flood</option>
                    <option value="fire">Fire</option>
                    <option value="earthquake">Earthquake</option>
                    <option value="medical">Medical Emergency</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Urgency</label>
                  <select
                    name="urgency"
                    value={reportData.urgency}
                    onChange={handleReportChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="City or nearest landmark"
                  value={reportData.location}
                  onChange={handleReportChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  name="description"
                  placeholder="Describe the incident and what support is needed"
                  value={reportData.description}
                  onChange={handleReportChange}
                  rows="4"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                  required
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-cyan-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

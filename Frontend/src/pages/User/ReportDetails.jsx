import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyReports } from "../../services/reportService";
import { useAuth } from "../../context/AuthContext";

export default function ReportDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getMyReports(token);
        const selected = data.find((r) => r._id === id);

        if (!selected) {
          setError("Report not found.");
          setReport(null);
          return;
        }

        setReport(selected);
      } catch {
        setError("Unable to load report details right now.");
        setReport(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [token, id]);

  const getStatusBadge = (status) => {
    if (status === "resolved") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "in-progress") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getPriorityBadge = (priority) => {
    if (priority === "critical") return "bg-rose-100 text-rose-700 border-rose-200";
    if (priority === "high") return "bg-orange-100 text-orange-700 border-orange-200";
    if (priority === "medium") return "bg-sky-100 text-sky-700 border-sky-200";
    return "bg-lime-100 text-lime-700 border-lime-200";
  };

  const ngoPhone = report?.assignedNgo?.contactInfo?.phone || "Not available yet";

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-white p-6 md:p-10 shadow-sm">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-100/60 blur-3xl" />
        <div className="space-y-3 animate-pulse">
          <div className="h-6 w-52 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-5/6 rounded bg-slate-100" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="h-24 rounded-xl bg-slate-100" />
            <div className="h-24 rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <h2 className="text-lg font-semibold">Could not load report</h2>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 md:p-8 shadow-sm">
      <div className="pointer-events-none absolute -left-16 top-16 h-40 w-40 rounded-full bg-cyan-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -top-14 h-52 w-52 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusBadge(report.status)}`}>
            {report.status || "pending"}
          </span>
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getPriorityBadge(report.priority)}`}>
            {report.priority || "medium"} Priority
          </span>
        </div>

        <h1 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          {report.title}
        </h1>

        <p className="mt-3 max-w-3xl text-sm md:text-base leading-relaxed text-slate-600">
          {report.description || "No description provided."}
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Location</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {report.location?.city || "Not specified"}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Created On</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "N/A"}
            </p>
          </article>

          <article className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4">
            <p className="text-xs uppercase tracking-wide text-cyan-700">Allotted NGO</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {report.assignedNgo?.name || "NGO not assigned yet"}
            </p>
          </article>

          <article className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4">
            <p className="text-xs uppercase tracking-wide text-cyan-700">Allotted NGO Mobile Number</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{ngoPhone}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
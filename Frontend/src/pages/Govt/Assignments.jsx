import { useState } from "react";
import { useGovtDashboardData } from "../../hooks/useGovtDashboardData";
import * as govtService from "../../services/govtService";

export default function Assignments() {
  const { ngos, pendingReports, loading, error, refresh } = useGovtDashboardData();
  const [manualForm, setManualForm] = useState({ reportId: "", ngoId: "" });
  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // bulk allocation removed - manual-only workflow maintained

  const handleManualAssign = async (e) => {
    e.preventDefault();
    if (!manualForm.reportId || !manualForm.ngoId) {
      setMessage("Select both a report and an NGO");
      return;
    }

    setActionLoading(true);
    setMessage("");
    try {
      const result = await govtService.manualAssignReport(manualForm.reportId, manualForm.ngoId);
      setMessage(result.message || "Report assigned successfully");
      setManualForm({ reportId: "", ngoId: "" });
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || "Manual assignment failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Assignments</h1>
        <p className="mt-2 text-sm text-slate-500"> Automatic Allocation of Pending Reports on the basis of availability and capacity </p>
      </div>

      {(error || message) && (
        <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${error ? "border border-red-200 bg-red-50 text-red-800" : "border border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {error || message}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-1">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-slate-900">Manual Assignment</h2>
          <p className="mt-2 text-sm text-slate-600">Select a pending report and assign a partner NGO. Bulk allocation has been disabled to ensure manual review.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <select value={manualForm.reportId} onChange={(e) => setManualForm((prev) => ({ ...prev, reportId: e.target.value }))} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm">
              <option value="">Select report</option>
              {pendingReports.map((report) => <option key={report._id} value={report._id}>{report.title}</option>)}
            </select>

            <select value={manualForm.ngoId} onChange={(e) => setManualForm((prev) => ({ ...prev, ngoId: e.target.value }))} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm">
              <option value="">Select NGO</option>
              {ngos.map((ngo) => <option key={ngo._id} value={ngo._id}>{ngo.name} — {ngo.state}</option>)}
            </select>

            <button onClick={handleManualAssign} disabled={actionLoading} className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white">
              {actionLoading ? "Assigning..." : "Assign report"}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-500">Only pending reports are shown here.</p>
            <button onClick={() => refresh()} className="text-sm text-indigo-600">Refresh lists</button>
          </div>
        </div>
      </section>
    </div>
  );
}
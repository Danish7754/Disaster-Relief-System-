import { useCallback, useEffect, useMemo, useState } from "react";
import * as govtService from "../services/govtService";

export function useGovtDashboardData(filters = { status: "", priority: "" }) {
  const [reports, setReports] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [overview, setOverview] = useState({ totalReports: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [statusStats, setStatusStats] = useState([]);
  const [severityStats, setSeverityStats] = useState([]);
  const [workloadStats, setWorkloadStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [reportsRes, ngosRes, overviewRes, statusRes, severityRes, workloadRes] = await Promise.all([
        govtService.getReports({ ...filters, limit: 100 }),
        govtService.getNgos(),
        govtService.getOverviewAnalytics(),
        govtService.getStatusAnalytics(),
        govtService.getSeverityAnalytics(),
        govtService.getNgoWorkloadAnalytics(),
      ]);

      setReports(reportsRes.reports || []);
      setNgos(ngosRes.ngos || []);
      setOverview(overviewRes.data || { totalReports: 0, pending: 0, inProgress: 0, resolved: 0 });
      setStatusStats(statusRes.data || []);
      setSeverityStats(severityRes.data || []);
      setWorkloadStats(workloadRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load government data");
    } finally {
      setLoading(false);
    }
  }, [filters.priority, filters.status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pendingReports = useMemo(
    () => reports.filter((report) => report.status === "pending"),
    [reports]
  );

  return {
    reports,
    ngos,
    overview,
    statusStats,
    severityStats,
    workloadStats,
    loading,
    error,
    setError,
    refresh,
    pendingReports,
  };
}
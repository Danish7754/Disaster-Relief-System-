import axiosInstance from "../utils/axiosInstance";

export const getReports = async (params = {}) => {
  const response = await axiosInstance.get("/api/govt/reports", { params });
  return response.data;
};

export const getNgos = async () => {
  const response = await axiosInstance.get("/api/govt/ngos");
  return response.data;
};

export const getOverviewAnalytics = async () => {
  const response = await axiosInstance.get("/api/govt/analytics/overview");
  return response.data;
};

export const getStatusAnalytics = async () => {
  const response = await axiosInstance.get("/api/govt/analytics/by-status");
  return response.data;
};

export const getSeverityAnalytics = async () => {
  const response = await axiosInstance.get("/api/govt/analytics/by-severity");
  return response.data;
};

export const getNgoWorkloadAnalytics = async () => {
  const response = await axiosInstance.get("/api/govt/analytics/ngo-workload");
  return response.data;
};

export const autoAllocateReports = async (reportId = null) => {
  // If reportId provided: allocate single report
  // If no reportId: bulk allocate all pending reports
  const payload = reportId ? { reportId } : {};
  const response = await axiosInstance.post("/api/govt/reports/auto-allocate", payload);
  return response.data;
};

export const manualAssignReport = async (reportId, ngoId) => {
  const response = await axiosInstance.post("/api/govt/manual-assign", { reportId, ngoId });
  return response.data;
};
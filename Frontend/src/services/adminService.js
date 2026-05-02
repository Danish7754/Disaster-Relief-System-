import axiosInstance from "../utils/axiosInstance";

export const createGovtUser = async (data) => {
  const res = await axiosInstance.post('/admin/create-govt', data);
  return res.data;
};

export const getGovernmentUsers = async () => {
  const res = await axiosInstance.get('/admin/government-users');
  return res.data;
};

export const getAllUsers = async () => {
  const res = await axiosInstance.get('/admin/citizens');
  return res.data;
};

export const getAllReports = async () => {
  const res = await axiosInstance.get('/admin/reports');
  return res.data;
};

export const getAllNgos = async () => {
  const res = await axiosInstance.get('/admin/ngos');
  return res.data;
};

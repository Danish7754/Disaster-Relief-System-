import axiosInstance from "../utils/axiosInstance";

export const loginUser = async (data) => {
  const res = await axiosInstance.post("/api/auth/login", data);
  return res.data;
};

export const registerUser = async (formData) => {
  const response = await axiosInstance.post("/api/auth/register",formData);
  return response.data;
};
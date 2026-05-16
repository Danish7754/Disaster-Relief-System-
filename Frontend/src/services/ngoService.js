import axiosInstance from "../utils/axiosInstance";

export const getMyNgoProfile = async () => {
  const response = await axiosInstance.get("/api/ngos/profile");
  return response.data;
};

export const createNgoProfile = async (profileData) => {
  const response = await axiosInstance.post("/api/ngos", profileData);
  return response.data;
};

export const updateMyNgoProfile = async (profileData) => {
  const response = await axiosInstance.put("/api/ngos/profile", profileData);
  return response.data;
};

export const deleteMyNgoProfile = async () => {
  const response = await axiosInstance.delete("/api/ngos/profile");
  return response.data;
};

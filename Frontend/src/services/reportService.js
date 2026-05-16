import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/reports`;

export const createReport = async (reportData, token) => {
  const response = await axios.post(API_URL, reportData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getMyReports = async (token) => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/reports/my-reports`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const deleteReport = async (id, token) => {

  const response = await axios.delete(
    `${import.meta.env.VITE_API_URL}/api/reports/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const updateReport = async (id, updatedData, token) => {

    const payload = {
    ...updatedData,
    location: {
      city: updatedData.location
    },
    state: updatedData.state
  };

  const response = await axios.put(
    `${import.meta.env.VITE_API_URL}/api/reports/${id}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;

};

export const getAuthorityReports = async (token) => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/reports/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getNgoAssignedReports = async (token) => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/reports/ngo/assigned`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const acceptNgoReport = async (reportId, token) => {
  const response = await axios.patch(
    `${import.meta.env.VITE_API_URL}/api/reports/ngo/${reportId}/accept`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const rejectNgoReport = async (reportId, token) => {
  const response = await axios.patch(
    `${import.meta.env.VITE_API_URL}/api/reports/ngo/${reportId}/reject`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const completeNgoReport = async (reportId, token) => {
  const response = await axios.patch(
    `${import.meta.env.VITE_API_URL}/api/reports/ngo/${reportId}/complete`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


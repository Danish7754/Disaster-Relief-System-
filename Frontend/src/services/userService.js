import axios from "axios";

export const updateProfile = async (profileData, token) => {

  const response = await axios.put(
    `http://localhost:5000/api/users/profile`,
    profileData,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;

};
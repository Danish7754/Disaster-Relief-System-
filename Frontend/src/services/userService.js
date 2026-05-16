import axios from "axios";

export const updateProfile = async (profileData, token) => {

  const response = await axios.put(
    `${process.env.REACT_APP_API_URL}/api/users/profile`,
    profileData,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;

};
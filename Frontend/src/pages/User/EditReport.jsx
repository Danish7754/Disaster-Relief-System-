import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyReports, updateReport } from "../../services/reportService";
import { useAuth } from "../../context/AuthContext";

export default function EditReport() {

  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    priority: ""
  });

  useEffect(() => {

    const fetchReport = async () => {

      const data = await getMyReports(token);

      const report = data.find(r => r._id === id);

      if (report) {

        setFormData({
          title: report.title,
          description: report.description,
          location: report.location?.city,
          priority: report.priority
        });

      }

    };

    fetchReport();

  }, [token, id]);


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await updateReport(id, formData, token);

      setSuccessMessage(true);
       

      setTimeout(() => {
        navigate("/citizen/my-reports");
      }, 3000);

    } catch (error) {

      console.log(error.response?.data);

    }
  

  };


  return (

    <div className="max-w-2xl mx-auto">

      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6" >
        Edit Report
      </h1>

      {!successMessage ? (
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Incident Title"
            className="border p-2 w-full"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="border p-2 w-full"
          />

          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="border p-2 w-full"
          />

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="border p-2 w-full"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <div className="flex gap-3">

  <button
    type="submit"
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    Update Report
  </button>

  <button
    type="button"
    onClick={() => navigate("/citizen/my-reports")}
    className="border px-4 py-2 rounded hover:bg-gray-50"
  >
    Cancel
  </button>

</div>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center mt-12 text-center">

          <div className="w-16 h-16 bg-green-100 text-green-600 flex items-center justify-center rounded-full text-3xl mb-4">
            ✔
          </div>

          <h2 className="text-xl font-semibold text-gray-800">
            Report Updated Successfully!
          </h2>

          <p className="text-gray-500 mt-2">
            Thank you for reporting. Our team will respond shortly.
          </p>

        </div>

      )}
    </div>

  );

}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createReport } from "../../services/reportService";
import { useAuth } from "../../context/AuthContext";

export default function ReportIncident() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    location: "",
    urgency: "medium",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await createReport(formData, token);
      setIsSubmitted(true);
      setTimeout(() => {
        navigate("/citizen/my-reports");
      }, 5000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to submit report. Please try again.");
      console.log(error.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
        <div className="absolute -top-20 -right-16 h-52 w-52 rounded-full bg-cyan-100/70 blur-3xl"></div>
        <div className="absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-emerald-100/70 blur-3xl"></div>

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Report an Incident</h1>
            <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-2xl">
              Submit clear details so nearby response teams can prioritize and act quickly.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50/80 p-4 sm:p-5 w-full sm:w-auto">
            <p className="text-xs uppercase tracking-wide text-cyan-700">Reporter</p>
            <p className="mt-1 font-semibold text-cyan-900">{user?.name || "Citizen"}</p>
            <p className="text-xs text-cyan-700/80 mt-1">Emergency reporting channel</p>
          </div>
        </div>
      </section>

      {!isSubmitted ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
          {errorMessage && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Incident Title</label>
              <input
                type="text"
                name="title"
                placeholder="Short summary of the incident"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 bg-white"
                  required
                >
                  <option value="">Select category</option>
                  <option value="flood">Flood</option>
                  <option value="fire">Fire</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="medical">Medical Emergency</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Urgency</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
              <input
                type="text"
                name="location"
                placeholder="City or nearest landmark"
                value={formData.location}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                name="description"
                placeholder="Describe what happened, people affected, and immediate risks"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 resize-none"
                required
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-10 text-center shadow-sm">
          <div className="h-14 w-14 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded-full text-2xl mx-auto mb-4 font-bold">
            ✓
          </div>
          <h2 className="text-xl font-semibold text-emerald-900 mb-2">Report Submitted Successfully</h2>
          <p className="text-sm text-emerald-800/80">
            Thank you for reporting. You will be redirected to My Reports shortly.
          </p>
        </section>
      )}
    </div>
  );
}
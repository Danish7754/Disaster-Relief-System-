import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createNgoProfile,
  deleteMyNgoProfile,
  getMyNgoProfile,
  updateMyNgoProfile,
} from "../../services/ngoService";

const emptyForm = {
  name: "",
  location: "",
  state: "",
  category: "",
  specializations: "",
  contactInfo: {
    email: "",
    phone: "",
    website: "",
    address: "",
  },
  capacity: {
    volunteers: "",
    vehicles: "",
    supplies: "",
  },
  performanceMetrics: {
    totalReportsHandled: 0,
    successRate: 0,
    avgResponseTime: 0,
  },
  rating: 2.5,
  activeStatus: true,
};

const asCommaString = (value) => (Array.isArray(value) ? value.join(", ") : value || "");

const toNumberOrEmpty = (value) => (value === null || value === undefined || value === "" ? "" : value);

export default function NgoProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ngo, setNgo] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const canEdit = !ngo || isEditMode;

  const resolveErrorMessage = (err, fallback) => {
    const apiMessage = err?.response?.data?.message;
    const apiError = err?.response?.data?.error;

    if (apiMessage && apiMessage.toLowerCase() !== "server error") {
      return apiMessage;
    }

    return apiError || apiMessage || err?.message || fallback;
  };

  const applyAccountPrefill = () => {
    setForm((prev) => ({
      ...prev,
      name: prev.name || user?.name || "",
      location: prev.location || user?.city || "",
      state: prev.state || user?.state || "",
      contactInfo: {
        ...prev.contactInfo,
        email: prev.contactInfo.email || user?.email || "",
        phone: prev.contactInfo.phone || user?.phone || "",
      },
    }));
  };

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyNgoProfile();
      const profile = response.ngo;
      setNgo(profile);
      setIsEditMode(false);
      setForm({
        name: profile?.name || "",
        location: asCommaString(profile?.location),
        state: profile?.state || "",
        category: profile?.category || "",
        specializations: asCommaString(profile?.specializations),
        contactInfo: {
          email: profile?.contactInfo?.email || "",
          phone: profile?.contactInfo?.phone || "",
          website: profile?.contactInfo?.website || "",
          address: profile?.contactInfo?.address || "",
        },
        capacity: {
          volunteers: toNumberOrEmpty(profile?.capacity?.volunteers),
          vehicles: toNumberOrEmpty(profile?.capacity?.vehicles),
          supplies: toNumberOrEmpty(profile?.capacity?.supplies),
        },
        performanceMetrics: {
          totalReportsHandled: profile?.performanceMetrics?.totalReportsHandled ?? 0,
          successRate: profile?.performanceMetrics?.successRate ?? 0,
          avgResponseTime: profile?.performanceMetrics?.avgResponseTime ?? 0,
        },
        rating: profile?.rating ?? 2.5,
        activeStatus: profile?.activeStatus ?? true,
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setNgo(null);
        setIsEditMode(true);
        setError("");
        applyAccountPrefill();
      } else {
        setError(resolveErrorMessage(err, "Unable to load NGO profile."));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const summaryCards = useMemo(() => {
    if (!ngo) return [];

    return [
      { label: "Joined", value: ngo.joinedAt ? new Date(ngo.joinedAt).toLocaleDateString("en-IN") : "N/A" },
      { label: "Rating", value: ngo.rating ?? "N/A" },
      { label: "Active", value: ngo.activeStatus ? "Yes" : "No" },
      { label: "Assigned Reports", value: ngo.assignedReports?.length ?? 0 },
    ];
  }, [ngo]);

  const handleChange = (section, key, value) => {
    if (!section) {
      setForm((prev) => ({ ...prev, [key]: value }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const buildPayload = () => ({
    name: form.name,
    state: form.state,
    location: form.location
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    category: form.category,
    specializations: form.specializations
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    contactInfo: form.contactInfo,
    capacity: {
      volunteers: Number(form.capacity.volunteers) || 0,
      vehicles: Number(form.capacity.vehicles) || 0,
      supplies: Number(form.capacity.supplies) || 0,
    },
    activeStatus: Boolean(form.activeStatus),
  });

  const validatePayload = (payload) => {
    if (!payload.name?.trim()) return "NGO name is required.";
    if (!payload.category?.trim()) return "NGO category is required.";
    if (!Array.isArray(payload.location) || payload.location.length === 0) {
      return "At least one region served is required.";
    }
    if (!Array.isArray(payload.specializations) || payload.specializations.length === 0) {
      return "At least one specialization is required.";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (ngo) {
      setSaving(true);
    } else {
      setCreating(true);
    }
    setError("");
    setSuccess("");

    try {
      const payload = buildPayload();
      const validationMessage = validatePayload(payload);
      if (validationMessage) {
        setError(validationMessage);
        return;
      }

      if (ngo) {
        await updateMyNgoProfile(payload);
        setSuccess("NGO profile updated successfully.");
        setIsEditMode(false);
      } else {
        await createNgoProfile(payload);
        setSuccess("NGO profile created successfully.");
        setIsEditMode(false);
      }
      await loadProfile();
    } catch (err) {
      setError(resolveErrorMessage(err, ngo ? "Unable to update NGO profile." : "Unable to create NGO profile."));
    } finally {
      setSaving(false);
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this NGO profile permanently? Assigned reports will be released back to pending status."
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      await deleteMyNgoProfile();
      logout();
      navigate("/login");
    } catch (err) {
      setError(resolveErrorMessage(err, "Unable to delete NGO profile."));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-600">
        Loading NGO profile...
      </div>
    );
  }

  const handleEditStart = () => {
    setError("");
    setSuccess("");
    setIsEditMode(true);
  };

  const handleCancelEdit = async () => {
    setError("");
    setSuccess("");
    await loadProfile();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-950 via-slate-900 to-teal-900 p-6 sm:p-8 shadow-lg shadow-slate-200/60">
        <p className="text-xs uppercase tracking-[0.2em] text-teal-100/80 font-semibold">NGO Profile</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          {ngo ? "Organization Profile" : "Create Organization Profile"}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-200/85">
          {ngo
            ? "Profile data is stored in database. Click Edit Profile to update it."
            : "No NGO profile is linked to this account yet. Fill details below and create it now."}
        </p>

        {!ngo && (
          <button
            type="button"
            onClick={applyAccountPrefill}
            className="mt-4 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
          >
            Use Account Info
          </button>
        )}
      </section>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      {ngo && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-100 hover:shadow-md transition-shadow">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>
      )}

      <div className={`grid gap-6 ${ngo ? "xl:grid-cols-[1.1fr_0.9fr]" : "xl:grid-cols-1"}`}>
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-100 p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Organization Details</h2>
            <p className="mt-1 text-sm text-slate-500">Edit the main NGO information, contact information, and operating areas.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">NGO Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
            </label>

            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">Regions Served</span>
              <input
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="City 1, City 2, City 3"
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">State</span>
              <input
                value={form.state}
                onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                placeholder="State or Province"
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Category</span>
              <input
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Specializations</span>
              <input
                value={form.specializations}
                onChange={(e) => setForm((prev) => ({ ...prev, specializations: e.target.value }))}
                placeholder="Health, Food, Rescue"
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                value={form.contactInfo.email}
                onChange={(e) => handleChange("contactInfo", "email", e.target.value)}
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Phone</span>
              <input
                value={form.contactInfo.phone}
                onChange={(e) => handleChange("contactInfo", "phone", e.target.value)}
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Website</span>
              <input
                value={form.contactInfo.website}
                onChange={(e) => handleChange("contactInfo", "website", e.target.value)}
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Address</span>
              <input
                value={form.contactInfo.address}
                onChange={(e) => handleChange("contactInfo", "address", e.target.value)}
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Volunteers</span>
              <input
                type="number"
                value={form.capacity.volunteers}
                onChange={(e) => handleChange("capacity", "volunteers", e.target.value)}
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Vehicles</span>
              <input
                type="number"
                value={form.capacity.vehicles}
                onChange={(e) => handleChange("capacity", "vehicles", e.target.value)}
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Supplies</span>
              <input
                type="number"
                value={form.capacity.supplies}
                onChange={(e) => handleChange("capacity", "supplies", e.target.value)}
                disabled={!canEdit}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 self-end">
              <input
                type="checkbox"
                checked={form.activeStatus}
                onChange={(e) => setForm((prev) => ({ ...prev, activeStatus: e.target.checked }))}
                disabled={!canEdit}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-slate-700">Active organization</span>
            </label>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-emerald-700">Auto Rating</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">{form.rating}</p>
              <p className="text-xs text-emerald-700 mt-1">Calculated from resolved vs taken reports.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Auto Calculated Performance</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <p className="text-slate-500">Resolved Reports</p>
                <p className="text-lg font-semibold text-slate-900">{form.performanceMetrics.totalReportsHandled}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <p className="text-slate-500">Success Rate</p>
                <p className="text-lg font-semibold text-slate-900">{form.performanceMetrics.successRate}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <p className="text-slate-500">Avg Response Time</p>
                <p className="text-lg font-semibold text-slate-900">{form.performanceMetrics.avgResponseTime} hrs</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!ngo && (
              <button
                type="submit"
                disabled={saving || creating}
                className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-3 text-sm font-semibold text-white hover:from-teal-700 hover:to-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {creating ? "Creating..." : "Create NGO Profile"}
              </button>
            )}

            {ngo && !isEditMode && (
              <button
                type="button"
                onClick={handleEditStart}
                className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-3 text-sm font-semibold text-white hover:from-teal-700 hover:to-cyan-700 shadow-sm"
              >
                Edit Profile
              </button>
            )}

            {ngo && isEditMode && (
              <>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-3 text-sm font-semibold text-white hover:from-teal-700 hover:to-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </>
            )}

            <button
              type="button"
              onClick={loadProfile}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reload Profile
            </button>
          </div>

          {ngo && (
            <div className="pt-6 border-t border-slate-200">
              <p className="text-sm text-rose-700 mb-3">Delete NGO permanently from database.</p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {deleting ? "Deleting..." : "Delete NGO"}
              </button>
            </div>
          )}
        </form>

        {ngo && (
          <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-100">
            <h2 className="text-xl font-semibold text-slate-900">Read Only Overview</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <div>
                <p className="text-slate-500">Created By</p>
                <p className="font-medium text-slate-900">{ngo.createdBy?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{ngo.contactInfo?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500">State</p>
                <p className="font-medium text-slate-900">{ngo.state || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500">Joined At</p>
                <p className="font-medium text-slate-900">
                  {ngo.joinedAt ? new Date(ngo.joinedAt).toLocaleString("en-IN") : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Locations</p>
                <p className="font-medium text-slate-900">
                  {Array.isArray(ngo.location) ? ngo.location.join(", ") : ngo.location || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Specializations</p>
                <p className="font-medium text-slate-900">
                  {Array.isArray(ngo.specializations) ? ngo.specializations.join(", ") : ngo.specializations || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Active Status</p>
                <p className="font-medium text-slate-900">{ngo.activeStatus ? "Active" : "Inactive"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-100">
            <h2 className="text-xl font-semibold text-slate-900">Assigned Reports</h2>
            <p className="mt-1 text-sm text-slate-500">Reports currently linked to this NGO profile</p>

            <div className="mt-5 space-y-3">
              {Array.isArray(ngo.assignedReports) && ngo.assignedReports.length > 0 ? (
                ngo.assignedReports.slice(0, 6).map((report) => (
                  <div key={report._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{report.title || "Untitled report"}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {report.location?.city || "N/A"} • {report.priority || "medium"}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 capitalize">
                        {report.status || "pending"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No assigned reports linked to this NGO.</p>
              )}
            </div>
          </div>

          </aside>
        )}
      </div>
    </div>
  );
}

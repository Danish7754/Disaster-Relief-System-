import { useGovtDashboardData } from "../../hooks/useGovtDashboardData";
import { Users, MapPin, Package, Truck, Mail, Phone, Globe, Award, Star } from "lucide-react";

const CapacityBadge = ({ label, value, icon: Icon, color }) => (
  <div className={`flex items-center gap-3 rounded-xl p-4 border ${color}`}>
    <div className={`p-2 rounded-lg ${color.replace("border", "bg")}`}>
      <Icon size={20} className={color.includes("blue") ? "text-blue-600" : color.includes("teal") ? "text-teal-600" : color.includes("amber") ? "text-amber-600" : "text-indigo-600"} />
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value ?? "N/A"}</p>
    </div>
  </div>
);

export default function Ngos() {
  const { ngos, loading, error } = useGovtDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">NGO Partners</h1>
        <p className="mt-2 text-sm text-slate-500">Manage and monitor registered disaster relief partners and their support capacity.</p>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md text-center text-slate-500">
          <p>Loading NGO partners...</p>
        </div>
      ) : ngos.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md text-center text-slate-500">
          <p>No NGO partners registered yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {ngos.map((ngo) => (
            <article
              key={ngo._id}
              className="group rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-xl hover:border-indigo-300 transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >
              {/* Header Section */}
              <div className="bg-gradient-to-r from-indigo-600 to-teal-600 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-lg font-bold backdrop-blur-sm shadow-lg">
                      {ngo.name?.charAt(0) || "N"}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{ngo.name}</h2>
                      <p className="text-sm text-white/80">{ngo.category || "General Relief"}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-6 space-y-6">
                {/* Location Info */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-6">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1">
                      <MapPin size={16} className="text-indigo-600" />
                      State
                    </div>
                    <p className="font-semibold text-slate-900">{ngo.state || "N/A"}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1">
                      <Package size={16} className="text-teal-600" />
                      Location
                    </div>
                    <p className="font-semibold text-slate-900">{ngo.location || "N/A"}</p>
                  </div>
                </div>

                {/* Capacity Section */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Award size={18} className="text-indigo-600" />
                    Capacity & Resources
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <CapacityBadge
                      label="Active Volunteers"
                      value={ngo.capacity?.volunteers}
                      icon={Users}
                      color="border-blue-200 bg-blue-50"
                    />
                    <CapacityBadge
                      label="Available Vehicles"
                      value={ngo.capacity?.vehicles}
                      icon={Truck}
                      color="border-teal-200 bg-teal-50"
                    />
                  </div>
                </div>

                {/* Contact Section */}
                {(ngo.contactInfo?.email || ngo.contactInfo?.phone || ngo.contactInfo?.website) && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Globe size={18} className="text-amber-600" />
                      Contact Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      {ngo.contactInfo?.email && (
                        <div className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors">
                          <Mail size={16} className="text-slate-400" />
                          <span>{ngo.contactInfo.email}</span>
                        </div>
                      )}
                      {ngo.contactInfo?.phone && (
                        <div className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors">
                          <Phone size={16} className="text-slate-400" />
                          <span>{ngo.contactInfo.phone}</span>
                        </div>
                      )}
                      {ngo.contactInfo?.website && (
                        <div className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors">
                          <Globe size={16} className="text-slate-400" />
                          <span className="truncate">{ngo.contactInfo.website}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats Footer */}
                <div className="rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-left">
                      <p className="text-xs font-medium text-slate-600">Reports Handled</p>
                      <p className="text-lg font-bold text-indigo-600">{ngo.performanceMetrics?.totalReportsHandled ?? 0}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-slate-600">Response Time</p>
                      <p className="text-lg font-bold text-teal-600">{ngo.performanceMetrics?.avgResponseTime ?? "N/A"} hrs</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-slate-600">Rating</p>
                      <div className="flex items-center gap-2">
                        <Star size={16} className="text-amber-500" />
                        <span className="text-lg font-bold text-slate-900">{(ngo.rating ?? 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-2">Success Rate</p>
                    <div className="h-2 w-full rounded-full bg-white/60 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${ngo.successRate ?? 0}%` }} />
                    </div>
                    <div className="mt-2 text-xs text-slate-500">{ngo.successRate ?? 0}% success</div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}